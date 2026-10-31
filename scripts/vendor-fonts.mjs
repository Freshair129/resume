// Explicit maintenance command: vendor the same OFL fonts used by the design.
// Checked-in files and hashes make normal builds independent of Google Fonts.
import { mkdir,writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { basename } from 'node:path';
const source='https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500&family=IBM+Plex+Sans+Thai:wght@400;500;600;700&family=Inter:wght@400;500;600&family=Space+Grotesk:wght@400;500;600;700&display=swap';
const headers={'User-Agent':'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/156.0.0.0 Safari/537.36'};
const sha=bytes=>createHash('sha256').update(bytes).digest('hex');
async function download(url){const r=await fetch(url,{headers,redirect:'error',signal:AbortSignal.timeout(30000)});if(!r.ok)throw new Error(`Font source returned ${r.status}: ${url}`);return Buffer.from(await r.arrayBuffer());}
const bytes=await download(source),css=bytes.toString('utf8'),urls=[...new Set([...css.matchAll(/url\((https:\/\/fonts\.gstatic\.com\/[^)]+\.woff2)\)/g)].map(m=>m[1]))];
if(!urls.length)throw new Error('Expected WOFF2 font sources');
await mkdir('public/fonts',{recursive:true});
const files=[];
for(let i=0;i<urls.length;i+=8)await Promise.all(urls.slice(i,i+8).map(async url=>{
 const data=await download(url),file=basename(new URL(url).pathname);
 await writeFile(`public/fonts/${file}`,data);files.push({url,file,sha256:sha(data),bytes:data.length});
}));
const licenses=[];
for(const family of ['spacegrotesk','inter','ibmplexmono','ibmplexsansthai']){
 const url=`https://raw.githubusercontent.com/google/fonts/main/ofl/${family}/OFL.txt`,data=await download(url),file=`${family}-OFL.txt`;
 if(!data.toString('utf8').includes('SIL OPEN FONT LICENSE'))throw new Error('Expected OFL license');
 await writeFile(`public/fonts/${file}`,data);licenses.push({family,url,file,sha256:sha(data)});
}
let local=css;
for(const file of files)local=local.replaceAll(file.url,`/fonts/${file.file}`);
await writeFile('public/fonts/fonts.css',local);
await writeFile('public/fonts/manifest.json',JSON.stringify({observedAt:new Date().toISOString(),stylesheet:source,sourceCssSha256:sha(bytes),files:files.sort((a,b)=>a.file.localeCompare(b.file)),licenses},null,2));
const preload=[...local.matchAll(/\/\* latin \*\/\s*(@font-face\s*\{[^}]+\})/g)].map(m=>m[1]).filter(block=>/font-family: '(Inter|Space Grotesk)'/.test(block)).map(block=>block.match(/url\(([^)]+)\)/)[1]);
console.log(JSON.stringify({files:files.length,bytes:files.reduce((sum,f)=>sum+f.bytes,0),preload:[...new Set(preload)]},null,2));
