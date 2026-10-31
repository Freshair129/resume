import {spawnSync} from 'node:child_process';
import {readFile} from 'node:fs/promises';
import {resolve} from 'node:path';
const root=resolve(import.meta.dirname,'..'),profile=JSON.parse(await readFile(resolve(root,process.argv[2]||'infra/voice-asr-profile.json'),'utf8'));
const source=profile._model_source||{cache_dir:'models',volume:'portfolio-intelligence_voice-models'};
if(!/^models(?:-[a-z0-9-]+)?$/.test(source.cache_dir)||!/^portfolio-intelligence_voice-(?:[a-z0-9]+-)*models$/.test(source.volume))throw Error('INVALID_MODEL_SOURCE');
const run=args=>{const r=spawnSync('docker',args,{stdio:'inherit',windowsHide:true});if(r.status!==0)throw Error('MODEL_STAGING_FAILED');};
run(['volume','create',source.volume]);
const program=`import sys,json,pathlib,hashlib,shutil
for asset in json.loads(sys.argv[1]):
 name=asset['role']
 if '/' in name or '..' in name: raise ValueError('invalid asset')
 source=pathlib.Path('/source')/name; target=pathlib.Path('/models')/name
 def digest(p):
  h=hashlib.sha256()
  with p.open('rb') as f:
   for chunk in iter(lambda:f.read(1024*1024),b''): h.update(chunk)
  return h.hexdigest()
 if digest(source)!=asset['sha256']: raise ValueError('source hash mismatch')
 if not target.exists() or digest(target)!=asset['sha256']: shutil.copyfile(source,target)
 if digest(target)!=asset['sha256']: raise ValueError('volume hash mismatch')
 print(name+': verified Docker volume')`;
run(['run','--rm','--network','none','--user','0:0','-v',resolve(root,'.runtime/voice-worker',source.cache_dir)+':/source:ro','-v',source.volume+':/models','--entrypoint','python','portfolio-voice-asr:d765e146','-c',program,JSON.stringify(profile.assets.map(({role,sha256})=>({role,sha256})))]);
