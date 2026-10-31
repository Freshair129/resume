import { enqueueGithub } from './adapters/github.mjs';
import { isReady } from './readiness.mjs';
import { publicPortfolio } from './knowledge/catalog.mjs';
import express from 'express';
import compression from 'compression';
import helmet from 'helmet';
import { rateLimit } from 'express-rate-limit';
import { timingSafeEqual,createHash } from 'node:crypto';
import { z } from 'zod';
import { verifyLineSignature,enqueueLine } from './adapters/line.mjs';
import { renderResume } from './pdf/resume.mjs';
import { mountVoiceRoutes } from './voice/routes.mjs';
const uuid=z.string().uuid(),slug=z.string().regex(/^[a-z0-9-]{1,80}$/);
const chat=z.object({message:z.string().trim().min(1).max(2000),lang:z.enum(['th','en']).optional()}).strict();
const tracks=['ai-automation','martech','product-operations','content-coordinator','performance-marketer','synnex-pm'];
const local=z.object({en:z.string().max(2000),th:z.string().max(2000)});
const profileSchema=z.object({name:local,headline:local,summary:local,contacts:z.object({email:z.string().email().optional(),line:z.string().url().refine(x=>x.startsWith('https://line.me/')||x.startsWith('https://lin.ee/')).optional()}).strict()}).strict();
function matches(header,token){if(!token||token.length<32||typeof header!=='string')return false;const a=createHash('sha256').update(header).digest(),b=createHash('sha256').update(`Bearer ${token}`).digest();return timingSafeEqual(a,b);}
export function createApp({store,genesis,answers,embeddings,search,voice,config={}}){
 const app=express();app.disable('x-powered-by');app.use(helmet());
 // Public HTML/assets/JSON benefit from compression; authenticated responses do
 // not share that representation. Authorization and no-store remain unchanged.
 app.use(compression({threshold:1024,filter:(req,res)=>!req.headers.authorization&&compression.filter(req,res)}));
 app.use('/api',(_,res,next)=>{res.set('Cache-Control','no-store');next();});
 const owner=(req,res,next)=>matches(req.headers.authorization,config.ownerToken)?next():res.status(401).json({error:'UNAUTHORIZED'});
 const mcp=(req,res,next)=>matches(req.headers.authorization,config.mcpToken)?next():res.status(401).json({error:'UNAUTHORIZED'});
 app.post('/api/webhooks/line',express.raw({type:'application/json',limit:'256kb'}),async(req,res)=>{
  if(!verifyLineSignature(req.body,req.headers['x-line-signature'],config.lineSecret))return res.status(401).json({error:'INVALID_SIGNATURE'});
  await enqueueLine(store.db,req.body);res.json({accepted:true});
 });
 app.post('/api/webhooks/github',express.raw({type:'application/json',limit:'256kb'}),async(req,res)=>{
  try{res.json(await enqueueGithub(store.db,req.body,req.headers['x-hub-signature-256'],req.headers['x-github-delivery'],config.githubSecret));}catch(e){if(e.message==='INVALID_SIGNATURE')return res.status(401).json({error:'INVALID_SIGNATURE'});throw e;}
 });
 app.get('/api/ready',rateLimit({windowMs:60000,limit:30,standardHeaders:'draft-8',legacyHeaders:false}),async(_req,res)=>{const ready=await isReady(store,genesis,embeddings);res.status(ready?200:503).json({ready});});
 mountVoiceRoutes(app,{answers,voice});
 app.use(express.json({limit:'128kb'}));
 app.use('/api/chat',rateLimit({windowMs:60000,limit:15,standardHeaders:'draft-8',legacyHeaders:false}));
 app.get('/api/health',async(_req,res)=>{try{await store.db.query('SELECT 1');res.json({status:'ok'});}catch{res.status(503).json({status:'unavailable'});}});
 app.get('/api/internal/index-health',owner,async(_req,res)=>{const backlog=(await store.db.query('SELECT state,operation,count(*)::int AS count,min(created_at) AS oldest FROM knowledge_outbox GROUP BY state,operation')).rows;let collections=[],reachable=false;try{collections=await genesis.collections();reachable=true;}catch{/* redacted */}res.json({postgres:true,genesis:reachable,collections,generations:await store.generations(),backlog});});
 app.get('/api/projects',async(req,res)=>{let rows=await store.projects();for(const key of ['category','status'])if(req.query[key])rows=rows.filter(p=>p[key]===req.query[key]);res.json(rows);});
 app.get('/api/portfolio',async(_req,res)=>res.json(await publicPortfolio(store)));
 app.get('/api/projects/:slug',async(req,res)=>{const p=await store.project(slug.parse(req.params.slug));res.status(p?200:404).json(p||{error:'NOT_FOUND'});});
 app.get('/api/profile',async(_req,res)=>res.json(await store.profile()));
 app.post('/api/chat',async(req,res)=>{const {message,lang}=chat.parse(req.body);res.json(await answers.answer(message,lang));});
 app.get('/api/resume/:track/:lang.pdf',async(req,res)=>{
  const track=z.enum(tracks).parse(req.params.track),lang=z.enum(['th','en']).parse(req.params.lang),data=await store.profile();
  if(!data.profile)return res.status(404).json({error:'PROFILE_NOT_PUBLISHED'});
  const pdf=await renderResume(data,{lang,track});
  // A profile revocation during generation must invalidate this download.
  if(JSON.stringify(await store.profile())!==JSON.stringify(data))return res.status(409).json({error:'PUBLICATION_CHANGED'});
  res.type('application/pdf').set('Content-Disposition',`attachment; filename="Pornpon-${track}-${lang}.pdf"`).send(pdf);
 });
 app.use('/api/admin',owner);
 app.get('/api/admin/projects',async(_req,res)=>res.json((await store.db.query('SELECT * FROM projects ORDER BY created_at DESC')).rows));
 app.post('/api/admin/candidates',async(req,res)=>res.status(201).json(await store.ingest(req.body)));
 app.post('/api/admin/projects/:id/approve',async(req,res)=>{await store.approve(uuid.parse(req.params.id));res.json({approved:true});});
 app.post('/api/admin/projects/:id/publish',async(req,res)=>res.status(202).json(await store.publish(uuid.parse(req.params.id),{model:embeddings.model,dimension:embeddings.dimension})));
 app.post('/api/admin/projects/:id/unpublish',async(req,res)=>{await store.revoke(uuid.parse(req.params.id));res.json({revoked:true});});
 app.put('/api/admin/profile',async(req,res)=>{const body=z.object({data:profileSchema,approved:z.boolean()}).strict().parse(req.body);await store.tx(async s=>{await s.db.query('INSERT INTO profile(id,data,approved) VALUES(1,$1,$2) ON CONFLICT(id) DO UPDATE SET data=$1,approved=$2,version=profile.version+1',[body.data,body.approved]);await s.audit('profile-review','1');});res.json({saved:true});});
 app.post('/api/mcp/:tool',mcp,async(req,res)=>{
  let result;
  switch(req.params.tool){
   case 'search_portfolio':result=await search.search(z.object({query:z.string().min(1).max(2000)}).parse(req.body).query);break;
   case 'list_public_projects':result=await store.projects();break;
   case 'get_project':result=await store.project(slug.parse(req.body.slug));break;
   case 'get_resume_profile':result=await store.profile();break;
   case 'get_evidence':{const id=uuid.parse(req.body.id);const rows=(await store.db.query('SELECT r.node_id FROM knowledge_index_records r JOIN kb_chunks c ON c.id=r.chunk_id WHERE c.id=$1 OR c.document_id=$1',[id])).rows;result=await store.authorize(rows.map(r=>r.node_id));break;}
   case 'suggest_case_study_gaps':{const p=await store.project(slug.parse(req.body.slug));result=p?{slug:p.slug,gaps:['Owner contribution and measured outcomes require separately approved evidence.']}:null;break;}
   default:return res.status(404).json({error:'TOOL_NOT_FOUND'});
  }
  res.status(result?200:404).json(result||{error:'NOT_FOUND'});
 });
 app.use('/api',(_req,res)=>res.status(404).json({error:'NOT_FOUND'}));
 app.use((err,_req,res,_next)=>{const bad=err instanceof z.ZodError||err instanceof SyntaxError||err.type==='entity.too.large';res.status(bad?400:503).json({error:bad?'INVALID_REQUEST':'SERVICE_UNAVAILABLE'});});
 return app;
}
