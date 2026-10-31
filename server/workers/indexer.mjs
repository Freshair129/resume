import { randomUUID } from 'node:crypto';
import { projectionNodeId,GENESIS_MANIFEST } from '../genesis/manifest.mjs';
export async function indexOnce(store,genesis,embedding){
 const db=store.db,lease=randomUUID();
 const claimed=await db.query(`UPDATE knowledge_outbox SET lease_token=$1,lease_until=now()+interval '10 minutes',attempts=attempts+1 WHERE id=(SELECT id FROM knowledge_outbox WHERE state='pending' AND next_attempt_at<=now() AND (lease_until IS NULL OR lease_until<now()) ORDER BY created_at LIMIT 1 FOR UPDATE SKIP LOCKED) RETURNING *`,[lease]);
 const job=claimed.rows[0];if(!job)return false;
 try{
  const g=(await db.query('SELECT * FROM index_generations WHERE id=$1',[job.generation_id])).rows[0];
  if(job.operation==='index' && g.state==='active'){
   const active=await db.query('SELECT 1 FROM publication_state WHERE active_generation=$1 AND NOT revoked',[g.id]);
   if(active.rows.length){await db.query("UPDATE knowledge_outbox SET state='done',lease_token=NULL,lease_until=NULL,error_code=NULL WHERE id=$1 AND lease_token=$2",[job.id,lease]);return true;}
  }
  if(job.operation==='revoke'){
   // Pinned REST cannot retract nodes. Keep durable visible blocked work until a qualified rebuild.
   throw Object.assign(new Error('PHYSICAL_REMOVAL_REQUIRES_REBUILD'),{code:'GENESIS_CAPABILITY_UNSUPPORTED'});
  }
  async function eligible(){const owned=await db.query('SELECT 1 FROM knowledge_outbox WHERE id=$1 AND lease_token=$2 AND lease_until>now()',[job.id,lease]);if(!owned.rows.length)throw new Error('LEASE_LOST');const r=await db.query(`SELECT p.id FROM projects p JOIN publication_state ps ON ps.project_id=p.id WHERE p.id=$1 AND p.approved AND p.visibility='public' AND NOT ps.revoked AND ps.desired_generation=$2 AND p.revision=$3`,[job.project_id,g.id,g.revision]);if(!r.rows.length)throw Object.assign(new Error('STALE_GENERATION'),{code:'STALE_GENERATION'});}
  await eligible();
  if(g.model!==embedding.model||g.dimension!==embedding.dimension)throw new Error('MODEL_MISMATCH');
  await genesis.assertQualified();await genesis.createCollection(g.collection);
  const rows=(await db.query(`SELECT c.*,d.id AS document_id,d.hash AS document_hash,s.sha,s.uri FROM kb_chunks c JOIN source_documents d ON d.id=c.document_id JOIN sources s ON s.id=d.source_id WHERE d.project_id=$1 AND d.approved AND s.access_scope='public' ORDER BY d.id,c.chunk_index`,[job.project_id])).rows;
  const props=(kind,id,sha)=>({client_namespace:'portfolio',schema_ref:GENESIS_MANIFEST.schemaRef,schema_version:GENESIS_MANIFEST.schemaVersion,record_kind:kind,canonical_id:id,source_sha:sha,index_generation:g.id});
  const pid=projectionNodeId('Project',job.project_id,g.id);
  await genesis.addNode({id:pid,label:'Project',properties:props('Project',job.project_id,rows[0]?.sha||'')});
  for(const c of rows){
   await eligible();
   const did=projectionNodeId('SourceDocument',c.document_id,g.id),nid=projectionNodeId('Chunk',c.id,g.id),eid=projectionNodeId('Evidence',c.id,g.id);
   await genesis.addNode({id:did,label:'SourceDocument',properties:{...props('SourceDocument',c.document_id,c.sha),checksum:c.document_hash}});
   const expected={...props('Chunk',c.id,c.sha),checksum:c.checksum};
   const node=await genesis.addNode({id:nid,label:'Chunk',properties:expected});
   if(Object.entries(expected).some(([k,v])=>node.properties?.[k]!==v))throw new Error('NODE_READBACK_MISMATCH');
   await genesis.addNode({id:eid,label:'Evidence',properties:{...props('Evidence',c.id,c.sha),checksum:c.checksum}});
   for(const [from,to,relation] of [[pid,did,'PART_OF_PROJECT'],[did,nid,'HAS_CHUNK'],[nid,eid,'SUPPORTED_BY']]){
    const edge=await genesis.addEdge({id:`${from}:${relation}:${to}`,from,to,relation,properties:{source_sha:c.sha,index_generation:g.id}});
    if(edge.from!==from||edge.to!==to||edge.relation!==relation||edge.properties.source_sha!==c.sha)throw new Error('EDGE_READBACK_MISMATCH');
   }
   const vector=await embedding.embed(c.text);await eligible();
   await genesis.addVector({id:nid,vector,collection:g.collection});await genesis.verifyVector({id:nid,vector,collection:g.collection});
   await db.query('INSERT INTO knowledge_index_records(generation_id,chunk_id,node_id,verified_at) VALUES($1,$2,$3,now()) ON CONFLICT(generation_id,chunk_id) DO UPDATE SET verified_at=now()',[g.id,c.id,nid]);
  }
  await genesis.flush();const collection=(await genesis.collections()).find(c=>c.name===g.collection);
  if(!collection||collection.count!==rows.length||collection.index_lag!==0)throw new Error('COLLECTION_COVERAGE');
  await eligible();
  if(GENESIS_MANIFEST.nativeHybridGraphQualified!==true)throw Object.assign(new Error('HYBRID_GRAPH_UNQUALIFIED'),{code:'GENESIS_CAPABILITY_UNSUPPORTED'});
  await db.query("UPDATE index_generations SET state='verified',verified_at=now() WHERE id=$1 AND state='pending'",[g.id]);
  await store.activate(g.id);
  await db.query("UPDATE knowledge_outbox SET state='done',lease_token=NULL,lease_until=NULL,error_code=NULL WHERE id=$1 AND lease_token=$2",[job.id,lease]);
 }catch(e){
  const blocked=['GENESIS_CAPABILITY_UNSUPPORTED','GENESIS_BUILD_UNQUALIFIED','STALE_GENERATION'].includes(e.code)||job.attempts>=8;
  const code=['GENESIS_CAPABILITY_UNSUPPORTED','GENESIS_BUILD_UNQUALIFIED','STALE_GENERATION'].includes(e.code)?e.code:'INDEX_FAILED';
  await db.query("UPDATE knowledge_outbox SET state=$3,error_code=$4,next_attempt_at=now()+interval '60 seconds',lease_token=NULL,lease_until=NULL WHERE id=$1 AND lease_token=$2",[job.id,lease,blocked?'blocked':'pending',code]);
 }
 return true;
}
export async function reconcile(store,genesis){
 const report=[];
 const candidates=(await store.db.query("SELECT g.* FROM index_generations g JOIN publication_state ps ON ps.active_generation=g.id JOIN projects p ON p.id=g.project_id WHERE g.state IN ('active','failed') AND NOT ps.revoked AND p.approved AND p.visibility='public' AND g.revision=p.revision")).rows;
 for(const g of candidates){
  try{await genesis.assertQualified();const rows=(await store.db.query('SELECT * FROM knowledge_index_records WHERE generation_id=$1',[g.id])).rows;
   for(const r of rows){const n=await genesis.getNode(r.node_id);if(n?.properties?.index_generation!==g.id)throw new Error('DRIFT');}
   const c=(await genesis.collections()).find(c=>c.name===g.collection);if(!c||c.count!==rows.length||c.index_lag!==0)throw new Error('DRIFT');
      await genesis.flush();
   if(GENESIS_MANIFEST.nativeHybridGraphQualified!==true)throw new Error('HYBRID_GRAPH_UNQUALIFIED');
   await store.db.query("UPDATE index_generations SET state='active',verified_at=now() WHERE id=$1 AND EXISTS(SELECT 1 FROM publication_state WHERE active_generation=$1 AND NOT revoked)",[g.id]);
   report.push({generation:g.id,state:'verified'});
  }catch{await store.db.query("UPDATE index_generations SET state='failed' WHERE id=$1",[g.id]);report.push({generation:g.id,state:'drift_or_unavailable'});}
 }
 return report;
}
