import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import { database } from '../server/database.mjs';
import { KnowledgeStore } from '../server/knowledge/store.mjs';
// Explicit owner CLI imports only an allowlisted, pinned, anonymous-public README into review.
const [slug,status]=process.argv.slice(2);
if(!['concept','prototype','tested','deployed','released','archived'].includes(status))throw new Error('Pass slug and owner-reviewed status; nothing is auto-published.');
const manifest=JSON.parse(await readFile('content/seed/candidates.json','utf8')),item=manifest.projects.find(p=>p.slug===slug);
if(!item||item.source.access_scope!=='public')throw new Error('PUBLIC_CANDIDATE_REQUIRED');
const s=item.source,headers={'User-Agent':'portfolio-review-importer','Accept':'application/vnd.github+json'};
const meta=await fetch(`https://api.github.com/repos/${s.repository}`,{headers,redirect:'error',signal:AbortSignal.timeout(10000)});
if(!meta.ok||(await meta.json()).private!==false)throw new Error('PUBLIC_SOURCE_CHECK_FAILED');
const response=await fetch(`https://raw.githubusercontent.com/${s.repository}/${s.ref}/${s.path}`,{redirect:'error',signal:AbortSignal.timeout(10000)});
if(!response.ok)throw new Error('SOURCE_UNAVAILABLE');
const bytes=Buffer.from(await response.arrayBuffer());if(bytes.length>100000)throw new Error('SOURCE_TOO_LARGE');
const blob=createHash('sha1').update(`blob ${bytes.length}\0`).update(bytes).digest('hex');if(blob!==s.content_hash.value)throw new Error('SOURCE_HASH_MISMATCH');
const db=database();try{const saved=await new KnowledgeStore(db).ingest({slug:item.slug,title:{en:item.title,th:item.title},summary:{en:'Candidate source awaiting owner editorial review.',th:'แหล่งข้อมูลรอการตรวจสอบจากเจ้าของ'},category:item.editorial_angle_proposal,status,text:bytes.toString('utf8'),url:s.source_url,sha:s.ref,path:s.path});console.log(JSON.stringify({...saved,state:'review',approved:false}));}finally{await db.end();}
