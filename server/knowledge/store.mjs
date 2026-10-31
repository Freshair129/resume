import { randomUUID, createHash } from 'node:crypto';
import { z } from 'zod';
const localized=z.object({en:z.string().min(1).max(500),th:z.string().min(1).max(500)});
export const candidateSchema=z.object({slug:z.string().regex(/^[a-z0-9-]{1,80}$/),title:localized,summary:localized,category:z.string().max(80),status:z.enum(['concept','prototype','tested','deployed','released','archived']),text:z.string().min(1).max(100000),url:z.string().url(),sha:z.string().regex(/^[a-f0-9]{40}$/),path:z.string().regex(/^(README\.md|docs\/[a-zA-Z0-9_./-]+\.md)$/)}).strict();
export const hash=text=>createHash('sha256').update(text).digest('hex');
export function sanitizeCandidate(input){
 const c=candidateSchema.parse(input),u=new URL(c.url);
 if(u.protocol!=='https:'||u.hostname!=='github.com'||u.username||u.password||!u.pathname.includes(`/blob/${c.sha}/`)||!u.pathname.endsWith('/'+c.path)||c.path.includes('..'))throw new Error('SOURCE_NOT_ALLOWED');
 if(/(?:api[_-]?key|password|secret|token)\s*[:=]\s*\S+|AIza[\w-]{25,}|sk-[\w-]{20,}|-----BEGIN .*PRIVATE KEY|https?:\/\/(?:localhost|127\.|192\.168\.|10\.)/i.test(c.text))throw new Error('SENSITIVE_SOURCE');
 return c;
}
export class KnowledgeStore {
 constructor(db){this.db=db;}
 async tx(fn){
  if(this.db.transaction) return this.db.transaction(db=>fn(new KnowledgeStore(db)));
  const client=await this.db.connect();
  try {await client.query('BEGIN');const result=await fn(new KnowledgeStore(client));await client.query('COMMIT');return result;}catch(e){await client.query('ROLLBACK');throw e;}finally{client.release();}
 }
 async ingest(input){const c=sanitizeCandidate(input);return this.tx(async s=>{
  const id=randomUUID(),sid=randomUUID(),did=randomUUID();
  await s.db.query('INSERT INTO projects(id,slug,title,summary,category,status) VALUES($1,$2,$3,$4,$5,$6)',[id,c.slug,c.title,c.summary,c.category,c.status]);
  await s.db.query('INSERT INTO sources(id,uri,sha,path,content_hash,access_scope) VALUES($1,$2,$3,$4,$5,$6)',[sid,c.url,c.sha,c.path,hash(c.text),'public']);
  await s.db.query('INSERT INTO source_documents(id,project_id,source_id,text,hash) VALUES($1,$2,$3,$4,$5)',[did,id,sid,c.text,hash(c.text)]);
  const chunks=c.text.match(/[\s\S]{1,1500}/g);
  for(let i=0;i<chunks.length;i++)await s.db.query('INSERT INTO kb_chunks(id,document_id,chunk_index,text,checksum) VALUES($1,$2,$3,$4,$5)',[randomUUID(),did,i,chunks[i],hash(chunks[i])]);
  await s.db.query('INSERT INTO publication_state(project_id) VALUES($1)',[id]);
  await s.audit('ingest',id);return {id,slug:c.slug};
 });}
 async audit(action,id){await this.db.query("INSERT INTO audit_events(actor,action,resource_id) VALUES('owner',$1,$2)",[action,id]);}
 async approve(id){return this.tx(async s=>{const r=await s.db.query('UPDATE projects SET approved=true WHERE id=$1 RETURNING id',[id]);if(!r.rows.length)throw new Error('NOT_FOUND');await s.db.query('UPDATE source_documents SET approved=true WHERE project_id=$1',[id]);await s.audit('approve',id);});}
 async publish(id,{model,dimension}){if(!model||!Number.isInteger(dimension)||dimension<1)throw new Error('MODEL_REQUIRED');return this.tx(async s=>{
  const p=(await s.db.query('SELECT * FROM projects WHERE id=$1 FOR UPDATE',[id])).rows[0];if(!p?.approved)throw new Error('APPROVAL_REQUIRED');
  const docs=(await s.db.query('SELECT * FROM source_documents WHERE project_id=$1',[id])).rows;
  if(!docs.length||docs.some(d=>!d.approved))throw new Error('APPROVAL_REQUIRED');
  const gid=randomUUID(),collection='portfolio_'+gid.replaceAll('-','');
  await s.db.query('INSERT INTO index_generations(id,project_id,revision,model,dimension,collection) VALUES($1,$2,$3,$4,$5,$6)',[gid,id,p.revision,model,dimension,collection]);
  await s.db.query("UPDATE projects SET visibility='public' WHERE id=$1",[id]);
  await s.db.query('UPDATE publication_state SET desired_generation=$2,revoked=false,epoch=epoch+1 WHERE project_id=$1',[id,gid]);
  await s.db.query("INSERT INTO knowledge_outbox(id,project_id,generation_id,operation) VALUES($1,$2,$3,'index')",[randomUUID(),id,gid]);
  await s.audit('publish-request',id);return {id:gid,collection};
 });}
 async activate(id){return this.tx(async s=>{
  const g=(await s.db.query('SELECT * FROM index_generations WHERE id=$1 FOR UPDATE',[id])).rows[0];if(!g||g.state!=='verified')throw new Error('INDEX_NOT_VERIFIED');
  const count=(await s.db.query('SELECT count(*)::int AS n FROM kb_chunks c JOIN source_documents d ON d.id=c.document_id WHERE d.project_id=$1 AND d.approved',[g.project_id])).rows[0].n;
  const indexed=(await s.db.query('SELECT count(*)::int AS n FROM knowledge_index_records WHERE generation_id=$1 AND verified_at IS NOT NULL',[id])).rows[0].n;
  if(!count||count!==indexed)throw new Error('INDEX_COVERAGE');
  const r=await s.db.query(`UPDATE publication_state ps SET active_generation=$1,epoch=epoch+1 FROM projects p WHERE ps.project_id=$2 AND p.id=ps.project_id AND ps.desired_generation=$1 AND NOT ps.revoked AND p.approved AND p.visibility='public' AND p.revision=$3 RETURNING ps.project_id`,[id,g.project_id,g.revision]);
  if(!r.rows.length)throw new Error('STALE_GENERATION');
  await s.db.query("UPDATE index_generations SET state='active' WHERE id=$1",[id]);await s.audit('activate',g.project_id);
 });}
 async revoke(id){return this.tx(async s=>{
  await s.db.query('SELECT id FROM projects WHERE id=$1 FOR UPDATE',[id]);
  await s.db.query("UPDATE projects SET visibility='review',approved=false,revision=revision+1 WHERE id=$1",[id]);
  await s.db.query('UPDATE publication_state SET revoked=true,active_generation=NULL,desired_generation=NULL,epoch=epoch+1 WHERE project_id=$1',[id]);
  await s.db.query('UPDATE source_documents SET approved=false WHERE project_id=$1',[id]);
  await s.db.query("INSERT INTO knowledge_outbox(id,project_id,generation_id,operation) SELECT gen_random_uuid(),project_id,id,'revoke' FROM index_generations WHERE project_id=$1 ON CONFLICT(generation_id,operation) DO NOTHING",[id]);
  await s.db.query("UPDATE index_generations SET state='revoked' WHERE project_id=$1",[id]);await s.audit('revoke',id);
 });}
 async generations({includeUnhealthy=false}={}){return (await this.db.query(`SELECT g.*,p.revision AS canonical_revision,(SELECT count(*)::int FROM kb_chunks c JOIN source_documents d ON d.id=c.document_id WHERE d.project_id=p.id AND d.approved) AS expected_chunks FROM index_generations g JOIN publication_state ps ON ps.active_generation=g.id JOIN projects p ON p.id=ps.project_id WHERE NOT ps.revoked AND p.approved AND p.visibility='public'${includeUnhealthy?'':" AND g.state='active' AND g.revision=p.revision"}`)).rows;}
 async authorize(ids){if(!ids.length)return [];return (await this.db.query(`SELECT c.id AS chunk_id,c.text,s.uri AS url,s.sha,s.path,d.id AS source_id,p.slug AS project_slug,p.title,r.node_id,g.id AS generation,ps.epoch FROM knowledge_index_records r JOIN kb_chunks c ON c.id=r.chunk_id JOIN source_documents d ON d.id=c.document_id JOIN sources s ON s.id=d.source_id JOIN projects p ON p.id=d.project_id JOIN publication_state ps ON ps.project_id=p.id JOIN index_generations g ON g.id=r.generation_id WHERE r.node_id=ANY($1::text[]) AND r.verified_at IS NOT NULL AND ps.active_generation=g.id AND NOT ps.revoked AND p.visibility='public' AND p.approved AND d.approved AND s.access_scope='public' AND g.state='active' AND g.revision=p.revision`,[ids])).rows;}
 async projects(){return (await this.db.query(`SELECT p.* FROM projects p JOIN publication_state ps ON ps.project_id=p.id JOIN index_generations g ON g.id=ps.active_generation WHERE p.approved AND p.visibility='public' AND NOT ps.revoked AND g.state='active' AND g.revision=p.revision ORDER BY p.slug`)).rows;}
 async project(slug){
  return (await this.db.query(`SELECT p.*, COALESCE((SELECT jsonb_agg(jsonb_build_object('id',d.id,'text',d.text,'url',s.uri,'sha',s.sha,'path',s.path)) FROM source_documents d JOIN sources s ON s.id=d.source_id WHERE d.project_id=p.id AND d.approved AND s.access_scope='public'),'[]'::jsonb) AS documents FROM projects p JOIN publication_state ps ON ps.project_id=p.id JOIN index_generations g ON g.id=ps.active_generation WHERE p.slug=$1 AND p.approved AND p.visibility='public' AND NOT ps.revoked AND g.state='active' AND g.revision=p.revision`,[slug])).rows[0]||null;
 }
 async profile(){return (await this.db.query(`SELECT jsonb_build_object('profile',(SELECT data FROM profile WHERE approved AND id=1),'experiences',COALESCE((SELECT jsonb_agg(data) FROM experiences WHERE approved),'[]'::jsonb),'skills',COALESCE((SELECT jsonb_agg(data) FROM skills WHERE approved),'[]'::jsonb),'projects',COALESCE((SELECT jsonb_agg(to_jsonb(p)) FROM projects p JOIN publication_state ps ON ps.project_id=p.id JOIN index_generations g ON g.id=ps.active_generation WHERE p.approved AND p.visibility='public' AND NOT ps.revoked AND g.state='active' AND g.revision=p.revision),'[]'::jsonb)) AS data`)).rows[0].data;}
}
