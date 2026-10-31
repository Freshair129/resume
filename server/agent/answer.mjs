import { answerLanguage, canDescribeDesign, sameEvidence, scopeEvidence, validateSummary } from './grounding.mjs';
const noEvidence=lang=>({answer:lang==='th'?'ยังไม่มีข้อมูลที่ยืนยันได้ กรุณาดูโครงการที่เผยแพร่หรือหน้าติดต่อ':'I do not have verified evidence for this question. Browse the published projects or contact page.',citations:[],confidence:'none',suggested_questions:['/projects','/contact']});
function sourceExcerpt(text){
 let end=900;
 // The UI linkifies source text. Never turn a clipped URL into a different link.
 for(const match of text.matchAll(/https?:\/\/\S+/g)){
  if(match.index<end&&match.index+match[0].length>end){end=match.index;break;}
 }
 return text.slice(0,end).trimEnd();
}
export class AnswerService {
 constructor(store,search,llm){Object.assign(this,{store,search,llm});this.proofs=new WeakMap();}
 withProof(result,rows){this.proofs.set(result,structuredClone(rows));return result;}
 async reauthorize(result){
  if(!result.citations?.length)return true;
  const proof=this.proofs.get(result);if(!proof)return false;
  return sameEvidence(proof,await this.store.authorize(proof.map(row=>row.node_id)));
 }
 async answer(message,lang,{signal}={}){
  signal?.throwIfAborted();
  lang=answerLanguage(message,lang);
  if(/(?:secret|private repo|\.env|salary|revenue|เงินเดือน|ข้อมูลลับ|รายได้)/i.test(message))return noEvidence(lang);
  // A source-code catalog cannot answer a personal resume request while the
  // owner has explicitly held that profile in review.
  if(/\b(?:resume|cv|qualifications|career history|employment history|education)\b|résumé|เรซูเม่|ประวัติการทำงาน|ประวัติการศึกษา/i.test(message)){
   if(!(await this.store.profile()).profile)return {...noEvidence(lang),status:'profile_not_published'};
  }
  const found=await this.search.search(message);
  signal?.throwIfAborted();
  const ids=[...new Set(found.results.map(r=>r.node_id))];
  // Reauthorize at response assembly; no cached answer or untrusted index properties.
  const authorized=await this.store.authorize(ids);
  const first=ids.map(id=>authorized.find(r=>r.node_id===id)).filter(Boolean);
  if(!first.length)return {...noEvidence(lang),status:found.status};
  const fresh=await this.store.authorize(first.map(r=>r.node_id));
  if(!sameEvidence(first,fresh))return noEvidence(lang);
  const rows=first.map(row=>fresh.find(r=>r.node_id===row.node_id));
  signal?.throwIfAborted();
  const citation=r=>({title:r.title?.[lang]||r.title?.en||'Evidence',url:r.url,project_slug:r.project_slug,source_id:r.source_id,generation:r.generation});
  if(this.llm){
   const context=scopeEvidence(message,rows).slice(0,5).map(r=>({...r}));
   const sources=context.map((r,i)=>({id:`S${i+1}`,title:r.title?.en||r.project_slug||'Source',text:r.text.slice(0,2200)}));
   let summary,designOnly=false;
   const started=performance.now();
   try{
    summary=validateSummary(await this.llm.summarize({question:message,lang,sources},{timeoutMs:12000,signal}),sources,lang);
    if(!summary.sentences.length&&canDescribeDesign(message,context)&&performance.now()-started<=4000){
     // An approved architecture description is useful evidence, but is not proof
     // of a tested endpoint. Recheck before every additional provider disclosure.
     const checked=await this.store.authorize(context.map(r=>r.node_id));
     if(!sameEvidence(context,checked))return {...noEvidence(lang),status:'publication_changed'};
     const remaining=Math.floor(12000-(performance.now()-started));
     if(remaining>=8000){
      summary=undefined;
      const question='Describe only the documented architecture and data structures in the supplied sources. Report design facts, not a claim that a query feature is tested or released.';
      summary=validateSummary(await this.llm.summarize({question,lang,sources},{timeoutMs:remaining,signal}),sources,lang);
      designOnly=true;
     }
    }
   }catch{/* Return only reauthorized source text on provider/validation failure. */}
   signal?.throwIfAborted();
   const current=await this.store.authorize(context.map(r=>r.node_id));
   if(!sameEvidence(context,current))return {...noEvidence(lang),status:'publication_changed'};
   if(summary){
    if(!summary.sentences.length)return {...noEvidence(lang),status:'insufficient_evidence'};
    const used=[...new Set(summary.sentences.flatMap(s=>s.evidence.map(e=>e.id)))];
    const prefix=designOnly?(lang==='th'?'ข้อมูลจากเอกสารการออกแบบ: ':'Documented design: '):'';
    return this.withProof({answer:prefix+summary.sentences.map(s=>`${s.text} ${[...new Set(s.evidence.map(e=>e.id))].map(id=>`[${used.indexOf(id)+1}]`).join(' ')}`).join('\n\n'),citations:used.map(id=>citation(context[sources.findIndex(s=>s.id===id)])),confidence:'grounded_summary',...(designOnly?{status:'documented_design'}:{}),suggested_questions:[]},context);
   }
   const note=lang==='th'?'ขณะนี้สรุปคำตอบไม่ได้ ข้อมูลต้นฉบับที่อนุมัติแล้ว:':'Summary temporarily unavailable. Approved original source excerpts:';
   return this.withProof({answer:note+'\n\n'+context.map((r,i)=>`[${i+1}] ${sourceExcerpt(r.text)}`).join('\n\n'),citations:context.map(citation),confidence:'source_excerpt',status:'summary_unavailable',suggested_questions:[]},context);
  }
  return this.withProof({answer:rows.map((r,i)=>`[${i+1}] ${sourceExcerpt(r.text)}`).join('\n\n'),citations:rows.map(citation),confidence:'source_excerpt',suggested_questions:[]},rows);
 }
}
