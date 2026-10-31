export class KnowledgeSearchService {
 constructor(store,genesis,embeddings){Object.assign(this,{store,genesis,embeddings});}
 async search(query){
  const generations=await this.store.generations();if(!generations.length)return {results:[],status:'no_published_evidence'};
  if(generations.length>40)return {results:[],status:'capacity_limit'};
  try {
   if(generations.some(g=>g.model!==this.embeddings.model||g.dimension!==this.embeddings.dimension))return {results:[],status:'search_unavailable'};
   await this.genesis.assertQualified();
   const v=await this.embeddings.embed(query),hits=[];
   for(const g of generations){
    const result=await this.genesis.hybridSearch({queryVector:v,k:12,alpha:.4,collection:g.collection});
    hits.push(...result.filter(h=>Number.isFinite(h.score)&&h.score>=.1));
   }
   const ids=[...new Set(hits.sort((a,b)=>b.score-a.score).map(h=>h.id))].slice(0,40);
   const rows=await this.store.authorize(ids);
   return {results:ids.map(id=>rows.find(r=>r.node_id===id)).filter(Boolean).slice(0,5),status:'available'};
  }catch{return {results:[],status:'search_unavailable'};}
 }
}
