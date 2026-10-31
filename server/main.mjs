import { runtime } from './runtime.mjs';
import { createApp } from './app.mjs';
import { mountPages } from './pages.mjs';
const services=runtime(),app=createApp(services);
if(services.llm)void services.llm.warmup().then(ready=>console.log(ready?'EVA summarizer warm':'EVA summarizer unavailable; source fallback active'));
mountPages(app,services.store,services.config.origin);
const server=app.listen(Number(process.env.PORT||3100),'0.0.0.0',()=>console.log('Knowledge API listening'));
for(const signal of ['SIGINT','SIGTERM'])process.on(signal,()=>server.close(async()=>{await services.db.end();process.exit(0);}));
