import { z } from 'zod';

export const summarySchema = z.object({sentences:z.array(z.object({
 text:z.string().trim().min(1).max(650),
 evidence:z.array(z.object({id:z.string().regex(/^S[1-5]$/),quote:z.string().trim().min(12).max(500)}).strict()).min(1).max(2),
}).strict()).max(1)}).strict();

export function answerLanguage(question, requested) {
 if(/(?:in English|ตอบ(?:เป็น)?ภาษาอังกฤษ)/i.test(question))return 'en';
 if(/(?:in Thai|ตอบ(?:เป็น)?ภาษาไทย)/i.test(question))return 'th';
 return ['th','en'].includes(requested)?requested:/[\u0e00-\u0e7f]/.test(question)?'th':'en';
}
const normalize = text => text.normalize('NFKC').replace(/\s+/g,' ').trim().toLowerCase();
const numbers = text => normalize(text).match(/\p{Decimal_Number}+(?:[.,]\p{Decimal_Number}+)*/gu)||[];

function namedEvidence(question, rows) {
 const query=normalize(question);
 const named=rows.filter(row=>Object.values(row.title||{}).some(value=>{
  if(typeof value!=='string'||value.trim().length<3)return false;
  const title=normalize(value);let start=query.indexOf(title);
  while(start!==-1){
   if(!/[a-z0-9]/i.test((query[start-1]||' ')+(query[start+title.length]||' ')))return true;
   start=query.indexOf(title,start+1);
  }
  return false;
 }));
 return named;
}

export function scopeEvidence(question, rows) {
 const named=namedEvidence(question,rows);
 return named.length?named:rows;
}

export function canDescribeDesign(question, rows) {
 if(/\b(?:how many|how much|number of|count|users?|customers?|paying|salary|revenue|price|cost)\b|กี่|จำนวน|เท่าไหร่|เท่าไร|ราคา|รายได้|เงินเดือน|ประวัติ/i.test(question))return false;
 if(!/(?:search|retriev|ค้นหา)/i.test(question)||!/(?:\b(?:types?|kinds?|approaches?|modes?)\b|how.*(?:search|retriev)|แบบ(?:ไหน|ใด)|ประเภท|แนวทาง|รูปแบบ|วิธี)/i.test(question))return false;
 return namedEvidence(question,rows).some(row=>/(?:^|\n)Architecture:\s*\S/i.test(row.text));
}

// References and exact quotations are checked independently of model compliance.
// This does not purport to be a formal semantic-entailment proof.
export function validateSummary(value, sources, lang) {
 const parsed=summarySchema.parse(value);
 for(const sentence of parsed.sentences){
  if(/https?:|www\.|\[[^\]]*\]|<[^>]*>|(?:ignore|disregard) (?:previous|system) instructions/i.test(sentence.text))throw new Error('INVALID_SUMMARY');
  if(lang==='th'?!/[\u0e00-\u0e7f]/.test(sentence.text):/[\u0e00-\u0e7f]/.test(sentence.text))throw new Error('INVALID_LANGUAGE');
  const support=[];
  for(const item of sentence.evidence){
   const source=sources.find(s=>s.id===item.id);
   if(!source||!normalize(source.text).includes(normalize(item.quote)))throw new Error('INVALID_EVIDENCE');
   support.push(item.quote);
  }
  const supportedNumbers=new Set(numbers(support.join(' ')));
  if(numbers(sentence.text).some(n=>!supportedNumbers.has(n)))throw new Error('UNSUPPORTED_NUMBER');
 }
 return parsed;
}

export function sameEvidence(before, after) {
 return before.length===after.length&&before.every(row=>{
  const current=after.find(r=>r.node_id===row.node_id);
  return current&&['node_id','text','url','source_id','generation','epoch','project_slug','sha','path','chunk_id'].every(key=>String(current[key])===String(row[key]))&&JSON.stringify(current.title)===JSON.stringify(row.title);
 });
}
