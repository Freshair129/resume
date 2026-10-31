export class EmbeddingProvider {
 constructor({url=process.env.EMBEDDING_URL,key=process.env.EMBEDDING_API_KEY,model=process.env.EMBEDDING_MODEL,dimension=Number(process.env.EMBEDDING_DIMENSION||384),fetchImpl=fetch}={}){Object.assign(this,{url,key,model,dimension,fetchImpl});}
 async embed(text){
  if(!this.url||!this.model)throw new Error('EMBEDDING_NOT_CONFIGURED');
  const res=await this.fetchImpl(this.url,{method:'POST',headers:{'Content-Type':'application/json',...(this.key?{Authorization:`Bearer ${this.key}`}:{})},body:JSON.stringify({input:text.slice(0,12000),model:this.model}),signal:AbortSignal.timeout(15000)});
  if(!res.ok)throw new Error('EMBEDDING_UNAVAILABLE');
  const json=await res.json(),v=json.data?.[0]?.embedding;
  if(!Array.isArray(v)||v.length!==this.dimension||v.some(x=>!Number.isFinite(x))||!v.some(x=>x!==0))throw new Error('EMBEDDING_DIMENSION_OR_VALUE');
  return v;
 }
}
