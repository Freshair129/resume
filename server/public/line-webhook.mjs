import { boundedBytes } from './proxy.mjs';

const headers={'Cache-Control':'no-store','X-Content-Type-Options':'nosniff'};
const error=(status,code)=>Response.json({error:code},{status,headers});

// LINE cannot supply the private portfolio bridge token. Only this exact POST
// crosses the persistent ingress; the API verifies HMAC over unchanged bytes.
export function createLineWebhookProxy({origin,fetcher=fetch}={}){
 return async request=>{
  if(request.method!=='POST'||new URL(request.url).pathname!=='/api/webhooks/line')return error(404,'NOT_FOUND');
  const signature=request.headers.get('x-line-signature');
  if(!signature||! /^[A-Za-z0-9+/]{43}=$/.test(signature))return error(401,'INVALID_SIGNATURE');
  if(!/^application\/json(?:;|$)/i.test(request.headers.get('content-type')||'')||!['identity',''].includes(request.headers.get('content-encoding')||''))return error(415,'JSON_REQUIRED');
  let body;
  try{body=await boundedBytes(request.body,256*1024);}catch{return error(413,'BODY_TOO_LARGE');}
  let target;
  try{target=new URL(origin);if(!['http:','https:'].includes(target.protocol)||target.username||target.password||target.pathname!=='/'||target.search||target.hash)throw new Error();target.pathname='/api/webhooks/line';}catch{return error(503,'KNOWLEDGE_UNAVAILABLE');}
  try{
   const response=await fetcher(target,{method:'POST',body,headers:{'Content-Type':'application/json','x-line-signature':signature},redirect:'manual',cache:'no-store',signal:AbortSignal.timeout(5000)});
   // Do not expose upstream diagnostics, cookies, redirect locations or headers.
   await response.body?.cancel();
   if(response.status===200)return Response.json({accepted:true},{headers});
   if([400,401,413,415,429].includes(response.status))return error(response.status,response.status===401?'INVALID_SIGNATURE':'WEBHOOK_REJECTED');
   return error(502,'UPSTREAM_UNAVAILABLE');
  }catch{return error(503,'KNOWLEDGE_UNAVAILABLE');}
 };
}
