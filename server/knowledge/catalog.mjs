import { randomUUID } from 'node:crypto';
import { z } from 'zod';
import { hash } from './store.mjs';

const short=z.string().max(1000), prose=z.string().max(6000), slug=z.string().regex(/^[a-z0-9-]{1,80}$/);
const githubUrl=z.string().url().refine(value=>{
 const u=new URL(value);
 return u.protocol==='https:'&&!u.username&&!u.password&&!u.port&&['github.com','raw.githubusercontent.com','api.github.com'].includes(u.hostname);
},'Verified GitHub URLs only');
const projectSchema=z.object({
 slug,name:short,repository:z.string().regex(/^Freshair129\/[A-Za-z0-9_.-]+$/),url:githubUrl,public:z.literal(true),
 description:short.nullable(),category:slug,featured:z.boolean(),language:short.nullable(),
 technologies:z.array(short).max(40),topics:z.array(short).max(40),archived:z.boolean(),fork:z.boolean(),
 defaultBranch:short.nullable(),headSha:z.string().regex(/^[a-f0-9]{40}$/).nullable(),updatedAt:z.string().nullable(),verifiedAt:z.string().datetime(),
 summary:prose,challenge:prose,approach:prose,architecture:prose,implementation:prose,outcome:prose,lessons:prose,
 evidence:z.array(z.object({label:short,url:githubUrl,kind:short}).strict()).max(30),
 role:z.object({status:z.literal('unverified'),text:prose}).strict(),
 verification:z.object({readme:z.boolean(),code:z.boolean(),notes:z.array(prose).max(30)}).strict(),
 kind:short.optional(),
}).strict();
export const catalogSchema=z.object({
 schemaVersion:z.literal(1),owner:z.literal('Freshair129'),ownerUrl:z.literal('https://github.com/Freshair129').optional(),verifiedAt:z.string().datetime(),
 coverage:z.object({publicCount:z.number().int().nonnegative(),publicAuditedCount:z.number().int().nonnegative(),complete:z.boolean(),notes:z.array(prose)}).strict(),
 categories:z.array(z.object({id:slug,label:short,description:prose}).strict()).max(30),
 featuredSlugs:z.array(slug).max(12),projects:z.array(projectSchema).max(1000),
}).strict();

export function parseCatalog(input){
 const catalog=catalogSchema.parse(input),seen=new Set(),repositories=new Set(),categories=new Set(catalog.categories.map(x=>x.id));
 if(categories.size!==catalog.categories.length)throw new Error('DUPLICATE_CATEGORY');
 for(const p of catalog.projects){
  if(seen.has(p.slug)||repositories.has(p.repository))throw new Error('DUPLICATE_REPOSITORY');
  seen.add(p.slug);repositories.add(p.repository);
  if(!categories.has(p.category)||p.url!==`https://github.com/${p.repository}`)throw new Error('CATALOG_SOURCE_MISMATCH');
  // Any file citation must bind to this exact repository and audited commit.
  for(const e of p.evidence){
   const url=new URL(e.url),path=url.pathname;
   if(url.hostname==='github.com'){
    if(url.search||path!==`/${p.repository}`&&(!p.headSha||!path.startsWith(`/${p.repository}/blob/${p.headSha}/`)))throw new Error('UNPINNED_OR_UNSUPPORTED_SOURCE');
   }else if(url.hostname==='raw.githubusercontent.com'){
    if(url.search||!p.headSha||!path.startsWith(`/${p.repository}/${p.headSha}/`))throw new Error('UNPINNED_SOURCE');
   }else if(url.search||path!==`/repos/${p.repository}`)throw new Error('UNPINNED_OR_UNSUPPORTED_SOURCE');
  }
  if(!p.headSha&&(p.verification.code||p.verification.readme||p.featured))throw new Error('EMPTY_REPOSITORY_CLAIM');
 }
 if(catalog.coverage.publicCount!==catalog.projects.length||catalog.coverage.publicAuditedCount!==catalog.projects.length)throw new Error('CATALOG_COVERAGE_MISMATCH');
 if(new Set(catalog.featuredSlugs).size!==catalog.featuredSlugs.length||catalog.featuredSlugs.some(s=>!seen.has(s))||catalog.projects.some(p=>p.featured!==catalog.featuredSlugs.includes(p.slug)))throw new Error('FEATURED_SELECTION_MISMATCH');
 return catalog;
}

export function repositoryText(p){
 // Curated repository descriptions only. No legacy biography or raw README is imported.
 return [`${p.name} (${p.repository})`,p.summary,`Category: ${p.category}. Technologies: ${p.technologies.join(', ')}.`,
  `Challenge: ${p.challenge}`,`Approach: ${p.approach}`,`Architecture: ${p.architecture}`,`Implementation: ${p.implementation}`,
  `Evidence: ${p.evidence.map(e=>`${e.label}: ${e.url}`).join('\n')}`,`Outcome: ${p.outcome}`,`Lessons: ${p.lessons}`,
  `Personal contribution: ${p.role.text}`,`Verification: ${p.verification.notes.join(' ')}`,`GitHub observed: ${p.verifiedAt}. Commit: ${p.headSha||'No commit; metadata only'}.`].join('\n\n');
}

export async function importCatalog(store,input,{approvePublicFacts=false,model,dimension}={}){
 if(!approvePublicFacts)throw new Error('PUBLIC_FACT_APPROVAL_REQUIRED');
 if(!model||!Number.isInteger(dimension)||dimension<1||dimension>65535)throw new Error('MODEL_REQUIRED');
 const catalog=parseCatalog(input),digest=hash(JSON.stringify(catalog));
 return store.tx(async s=>{
  await s.db.query('SELECT pg_advisory_xact_lock(392872)');
  const prior=(await s.db.query('SELECT id FROM portfolio_catalogs WHERE content_hash=$1',[digest])).rows[0];
  if(prior)return {catalogId:prior.id,alreadyImported:true,queued:0};
  const catalogId=randomUUID();
  const {projects,...manifest}=catalog;
  await s.db.query('INSERT INTO portfolio_catalogs(id,content_hash,manifest,observed_at) VALUES($1,$2,$3,$4)',[catalogId,digest,manifest,catalog.verifiedAt]);
  let queued=0;
  for(const p of projects){
   // New observations need explicit review of the diff; never overwrite a reviewed or revoked record.
   const existing=(await s.db.query('SELECT id FROM projects WHERE slug=$1',[p.slug])).rows[0];
   if(existing)throw new Error('CATALOG_REVISION_REQUIRES_REVIEW');
   const id=randomUUID(),sourceId=randomUUID(),documentId=randomUUID(),generation=randomUUID();
   const text=repositoryText(p),checksum=hash(text);
   if(/(?:api[_-]?key|password|secret|token)\s*[:=]\s*\S+|AIza[\w-]{25,}|sk-[\w-]{20,}|-----BEGIN .*PRIVATE KEY/i.test(text))throw new Error('SENSITIVE_SOURCE');
   const citation=p.evidence.find(e=>e.url.includes(`/blob/${p.headSha}/`))?.url||p.url;
   const sourcePath=citation.includes('/blob/')?citation.split(`/blob/${p.headSha}/`)[1].split('#')[0]:'repository-metadata';
   await s.db.query("INSERT INTO projects(id,slug,title,summary,category,status,approved,visibility) VALUES($1,$2,$3,$4,$5,'source-verified',true,'public')",[id,p.slug,{en:p.name,th:p.name},{en:p.summary,th:p.summary},p.category]);
   await s.db.query("INSERT INTO sources(id,uri,sha,path,content_hash,access_scope,fetched_at) VALUES($1,$2,$3,$4,$5,'public',$6)",[sourceId,citation,p.headSha||'',sourcePath,checksum,p.verifiedAt]);
   await s.db.query('INSERT INTO source_documents(id,project_id,source_id,text,hash,approved) VALUES($1,$2,$3,$4,$5,true)',[documentId,id,sourceId,text,checksum]);
   const chunks=text.match(/[\s\S]{1,1500}/g);
   for(let i=0;i<chunks.length;i++)await s.db.query('INSERT INTO kb_chunks(id,document_id,chunk_index,text,checksum) VALUES($1,$2,$3,$4,$5)',[randomUUID(),documentId,i,chunks[i],hash(chunks[i])]);
   await s.db.query('INSERT INTO index_generations(id,project_id,revision,model,dimension,collection) VALUES($1,$2,1,$3,$4,$5)',[generation,id,model,dimension,'portfolio_'+generation.replaceAll('-','')]);
   await s.db.query('INSERT INTO publication_state(project_id,desired_generation,revoked,epoch) VALUES($1,$2,false,1)',[id,generation]);
   await s.db.query("INSERT INTO knowledge_outbox(id,project_id,generation_id,operation) VALUES($1,$2,$3,'index')",[randomUUID(),id,generation]);
   await s.db.query('INSERT INTO portfolio_catalog_entries(project_id,catalog_id,data,content_hash,revision,approved) VALUES($1,$2,$3,$4,1,true)',[id,catalogId,p,hash(JSON.stringify(p))]);
   await s.audit('approve-public-github-facts',id);queued++;
  }
  await s.audit('import-public-github-catalog',catalogId);
  return {catalogId,alreadyImported:false,queued};
 });
}

export async function publicPortfolio(store){
 // One SQL statement gives a coherent permission snapshot for data and manifest.
 const result=(await store.db.query(`WITH latest AS (SELECT * FROM portfolio_catalogs ORDER BY created_at DESC,id DESC LIMIT 1),
 visible AS (SELECT ce.data FROM portfolio_catalog_entries ce JOIN latest ON ce.catalog_id=latest.id
 JOIN projects p ON p.id=ce.project_id JOIN publication_state ps ON ps.project_id=p.id
 JOIN index_generations g ON g.id=ps.active_generation
 WHERE ce.approved AND ce.revision=p.revision AND p.approved AND p.visibility='public'
 AND NOT ps.revoked AND g.state='active' AND g.revision=p.revision
 AND EXISTS(SELECT 1 FROM source_documents d JOIN sources s ON s.id=d.source_id WHERE d.project_id=p.id AND d.approved AND s.access_scope='public')
 AND NOT EXISTS(SELECT 1 FROM source_documents d WHERE d.project_id=p.id AND NOT d.approved))
 SELECT (SELECT manifest FROM latest) AS manifest,COALESCE((SELECT jsonb_agg(data ORDER BY data->>'slug') FROM visible),'[]'::jsonb) AS projects`)).rows[0];
 const manifest=result.manifest||{},projects=result.projects||[],visible=new Set(projects.map(p=>p.slug));
 return {status:'available',owner:'Freshair129',githubUrl:'https://github.com/Freshair129',verifiedAt:manifest.verifiedAt||null,
  coverage:{publicCount:manifest.coverage?.publicCount||0,publicAuditedCount:manifest.coverage?.publicAuditedCount||0,complete:manifest.coverage?.complete===true,publishedCount:projects.length},
  categories:manifest.categories||[],featuredSlugs:(manifest.featuredSlugs||[]).filter(s=>visible.has(s)),projects};
}
