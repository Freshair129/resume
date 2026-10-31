import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {dirname,resolve} from 'node:path';
const root=resolve(import.meta.dirname,'..'),manifest=JSON.parse(await readFile(resolve(root,'infra/voice-source.json'),'utf8'));
const destination=resolve(root,'.runtime/voice-worker/src');
for(const entry of manifest.files){
 if(!/^apps\/api\/(app\/(voice_worker\/[a-z0-9_]+|__init__)\.py|requirements-voice-worker-linux-cpu\.lock\.txt)$/.test(entry.path))throw Error('INVALID_SOURCE_PATH');
 const hash=b=>createHash('sha1').update(`blob ${b.length}\0`).update(b).digest('hex');
 let bytes;
 // A local mirror may avoid downloads, but only identical Git blobs are accepted.
 for(const base of [resolve(root,'.runtime/lalin-voice-source'),...process.argv.slice(2)]){
  const candidate=await readFile(resolve(base,entry.path)).catch(()=>null);
  if(candidate&&hash(candidate)===entry.sha){bytes=candidate;break;}
 }
 if(!bytes){const r=await fetch(`https://raw.githubusercontent.com/Freshair129/Lalin-AI/${manifest.commit}/${entry.path}`,{signal:AbortSignal.timeout(30000)});if(!r.ok)throw Error('SOURCE_DOWNLOAD_FAILED');bytes=Buffer.from(await r.arrayBuffer());}
 if(hash(bytes)!==entry.sha)throw Error('SOURCE_HASH_MISMATCH');
 const path=resolve(destination,entry.path);await mkdir(dirname(path),{recursive:true});await writeFile(path,bytes);
}
await writeFile(resolve(root,'.runtime/voice-worker/source-receipt.json'),JSON.stringify({repository:manifest.repository,commit:manifest.commit,verified_files:manifest.files.length},null,2)+'\n');
console.log(`Verified ${manifest.files.length} pinned source blobs in .runtime/voice-worker/src`);
