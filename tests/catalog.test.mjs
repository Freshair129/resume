import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { PGlite } from '@electric-sql/pglite';
import { KnowledgeStore } from '../server/knowledge/store.mjs';
import { importCatalog,parseCatalog,publicPortfolio } from '../server/knowledge/catalog.mjs';
import { createApp } from '../server/app.mjs';

const sha='a'.repeat(40),date='2026-10-29T10:00:00.000Z';
const project={slug:'catalog-fixture',name:'Catalog fixture',repository:'Freshair129/catalog-fixture',url:'https://github.com/Freshair129/catalog-fixture',public:true,description:'Synthetic SQL authorization fixture.',category:'systems',featured:true,language:'JavaScript',technologies:['Node.js'],topics:[],archived:false,fork:false,defaultBranch:'main',headSha:sha,updatedAt:date,verifiedAt:date,summary:'Fixture only; not portfolio content.',challenge:'Test publication.',approach:'Transactional outbox.',architecture:'Canonical SQL.',implementation:'Test fixture.',outcome:'No runtime outcome asserted.',lessons:'Not personal experience.',evidence:[{label:'Pinned fixture source',url:`https://github.com/Freshair129/catalog-fixture/blob/${sha}/README.md`,kind:'readme'}],role:{status:'unverified',text:'Personal contributions are not reviewed.'},verification:{readme:true,code:true,notes:['Synthetic authorization test, not native search evidence.']}};
const catalog={schemaVersion:1,owner:'Freshair129',verifiedAt:date,coverage:{publicCount:1,publicAuditedCount:1,complete:true,notes:[]},featuredSlugs:[project.slug],categories:[{id:'systems',label:'Systems',description:'Systems fixtures.'}],projects:[project]};
async function setup(){const db=new PGlite();for(const file of ['001_knowledge.sql','002_portfolio_catalog.sql'])await db.exec(await readFile(`postgres/migrations/${file}`,'utf8'));return {db,store:new KnowledgeStore(db)};}

test('catalog schema rejects private, unpinned, mismatched and exaggerated contribution records',()=>{
 assert.equal(parseCatalog(catalog).projects.length,1);
 for(const change of [{public:false},{url:'https://github.com/other/repo'},{evidence:[{label:'Moving source',url:'https://github.com/Freshair129/catalog-fixture/blob/main/README.md',kind:'readme'}]},{role:{status:'verified',text:'Sole author'}}])assert.throws(()=>parseCatalog({...catalog,projects:[{...project,...change}]}));
 assert.throws(()=>parseCatalog({...catalog,coverage:{...catalog.coverage,publicCount:2}}),/COVERAGE/);
 assert.throws(()=>parseCatalog({...catalog,featuredSlugs:[]}),/FEATURED/);
 for(const url of ['https://github.com/Freshair129/catalog-fixture/tree/main/src','https://api.github.com/repos/Freshair129/catalog-fixture/contents/README.md?ref=main'])assert.throws(()=>parseCatalog({...catalog,projects:[{...project,evidence:[{label:'Mutable source',url,kind:'source'}]}]}),/UNPINNED|UNSUPPORTED/);
});

test('catalog approval and outbox are atomic; SQL publication and revocation gate every API entry',async()=>{
 const {db,store}=await setup();let server;
 try{
  await assert.rejects(importCatalog(store,catalog,{model:'fixture',dimension:4}),/APPROVAL/);
  const result=await importCatalog(store,catalog,{approvePublicFacts:true,model:'fixture',dimension:4});assert.equal(result.queued,1);
  assert.equal((await db.query('SELECT count(*)::int n FROM knowledge_outbox')).rows[0].n,1);
  assert.equal((await publicPortfolio(store)).projects.length,0);
  // Legacy/internal manifest fields never belong in the public coverage response.
  await db.query("UPDATE portfolio_catalogs SET manifest=jsonb_set(manifest,'{coverage,privateCount}','7'::jsonb)");
  assert.equal(Object.hasOwn((await publicPortfolio(store)).coverage,'privateCount'),false);
  assert.equal((await store.profile()).profile,null);
  assert.equal((await db.query('SELECT count(*)::int n FROM audit_events WHERE action=$1',['approve-public-github-facts'])).rows[0].n,1);
  const g=(await db.query('SELECT * FROM index_generations')).rows[0];
  // Explicit SQL fixture: exercises publication permissions only, not a native engine pass.
  await db.query("UPDATE index_generations SET state='verified' WHERE id=$1",[g.id]);
  const chunks=(await db.query('SELECT id FROM kb_chunks')).rows;
  for(const c of chunks)await db.query('INSERT INTO knowledge_index_records(generation_id,chunk_id,node_id,verified_at) VALUES($1,$2,$3,now())',[g.id,c.id,`fixture:${c.id}`]);
  await store.activate(g.id);
  server=createApp({store}).listen(0,'127.0.0.1');await new Promise(r=>server.once('listening',r));
  const url=`http://127.0.0.1:${server.address().port}/api/portfolio`;
  const response=await fetch(url),published=await response.json();assert.equal(response.status,200);assert.equal(response.headers.get('cache-control'),'no-store');assert.equal(published.projects[0].repository,project.repository);assert.deepEqual(published.featuredSlugs,[project.slug]);
  await db.query("UPDATE index_generations SET state='failed' WHERE id=$1",[g.id]);assert.equal((await publicPortfolio(store)).projects.length,0);
  await db.query("UPDATE index_generations SET state='active' WHERE id=$1",[g.id]);
  await db.query('UPDATE source_documents SET approved=false WHERE project_id=$1',[g.project_id]);assert.equal((await publicPortfolio(store)).projects.length,0);
  await db.query('UPDATE source_documents SET approved=true WHERE project_id=$1',[g.project_id]);
  await db.query('UPDATE projects SET revision=revision+1 WHERE id=$1',[g.project_id]);assert.equal((await publicPortfolio(store)).projects.length,0);
  await db.query('UPDATE projects SET revision=revision-1 WHERE id=$1',[g.project_id]);
  await store.revoke(g.project_id);assert.deepEqual((await(await fetch(url)).json()).projects,[]);
  const replay=await importCatalog(store,catalog,{approvePublicFacts:true,model:'fixture',dimension:4});assert.equal(replay.alreadyImported,true);assert.equal(replay.queued,0);assert.equal((await publicPortfolio(store)).projects.length,0);
  const changed={...catalog,verifiedAt:'2026-10-30T10:00:00.000Z'};
  await assert.rejects(importCatalog(store,changed,{approvePublicFacts:true,model:'fixture',dimension:4}),/REVISION_REQUIRES_REVIEW/);
  assert.equal((await db.query('SELECT count(*)::int n FROM portfolio_catalogs')).rows[0].n,1,'failed import rolled back its manifest');
 }finally{if(server)await new Promise(r=>server.close(r));await db.close();}
});
