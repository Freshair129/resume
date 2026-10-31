import test from 'node:test';
import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { once } from 'node:events';
import { OllamaSummarizer } from '../server/adapters/ollama.mjs';

test('remaining request budget shortens generation and cannot extend the provider ceiling',async()=>{
 const timers=[];
 const server=createServer((req,res)=>{
  req.resume();
  timers.push(setTimeout(()=>{
   res.setHeader('Content-Type','application/json');
   res.end(JSON.stringify({done:true,done_reason:'stop',message:{content:JSON.stringify({sentences:[]})}}));
  },250));
 });
 server.listen(0,'127.0.0.1');await once(server,'listening');
 const baseUrl=`http://127.0.0.1:${server.address().port}`;
 const input={question:'Describe the documented design.',lang:'en',sources:[{id:'S1',title:'Architecture',text:'Architecture: Approved source description.'}]};
 try{
  const provider=new OllamaSummarizer({baseUrl,model:'local-test',timeoutMs:1000});
  await assert.rejects(provider.summarize(input,{timeoutMs:40}),/MODEL_UNAVAILABLE/);
  const lowerCeiling=new OllamaSummarizer({baseUrl,model:'local-test',timeoutMs:40});
  await assert.rejects(lowerCeiling.summarize(input,{timeoutMs:1000}),/MODEL_UNAVAILABLE/);
  await assert.rejects(provider.summarize(input,{timeoutMs:0}),/INVALID_OLLAMA_DEADLINE/);
 }finally{timers.forEach(clearTimeout);server.closeAllConnections();await new Promise(resolve=>server.close(resolve));}
});
