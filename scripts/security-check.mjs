import { readdir,readFile } from 'node:fs/promises';
import { execFileSync } from 'node:child_process';
const tracked=execFileSync('git',['ls-files'],{encoding:'utf8'}).split('\n');
if(tracked.some(p=>/(^|\/)\.env(?:\.|$)/.test(p)&&!p.endsWith('.example')))throw new Error('TRACKED_ENV_FILE');
async function walk(dir){for(const e of await readdir(dir,{withFileTypes:true})){const p=`${dir}/${e.name}`;if(e.isDirectory())await walk(p);else if(/\.(?:js|html)$/.test(p)){const text=await readFile(p,'utf8');if(/VITE_GEMINI_API_KEY|AIza[\w-]{30,}|sk-[a-zA-Z0-9]{24,}/.test(text))throw new Error('PUBLIC_SECRET_PATTERN_FOUND: '+p);}}}
await walk('dist');console.log('Tracked env and production bundle secret-pattern checks passed; historical key revocation remains owner action.');
