import { runtime } from '../runtime.mjs';
import { indexOnce } from './indexer.mjs';
import { deliverLine } from '../adapters/line.mjs';
const r=runtime();let stopping=false;for(const signal of ['SIGINT','SIGTERM'])process.on(signal,()=>{stopping=true;});
async function loop(work){while(!stopping){try{await work();}catch{console.error('Worker iteration unavailable; retrying');}await new Promise(resolve=>setTimeout(resolve,1000));}}
// Reply tokens have a short lifetime; indexing never blocks their consumer.
await Promise.all([loop(()=>indexOnce(r.store,r.genesis,r.embeddings)),loop(()=>deliverLine(r.db,r.answers))]);
await r.db.end();
