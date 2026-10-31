import { runtime } from '../server/runtime.mjs';
import { reconcile } from '../server/workers/indexer.mjs';
const r=runtime();try{console.log(JSON.stringify(await reconcile(r.store,r.genesis),null,2));}finally{await r.db.end();}
