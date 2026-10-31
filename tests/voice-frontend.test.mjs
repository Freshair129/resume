import test from 'node:test';
import assert from 'node:assert/strict';
import {existsSync} from 'node:fs';
import {fileURLToPath} from 'node:url';

// Silent PCM tests browser media lifecycle, not a real TTS preset or ASR model.
function syntheticAudio(){
 const b=Buffer.alloc(44+96000);b.write('RIFF');b.writeUInt32LE(b.length-8,4);b.write('WAVEfmt ',8);b.writeUInt32LE(16,16);b.writeUInt16LE(1,20);b.writeUInt16LE(1,22);b.writeUInt32LE(24000,24);b.writeUInt32LE(48000,28);b.writeUInt16LE(2,32);b.writeUInt16LE(16,34);b.write('data',36);b.writeUInt32LE(b.length-44,40);return b.toString('base64');
}
test('Voice UI keeps typed fallback, source links and safe playback after hiding an idle answer', {skip:process.env.RUN_BROWSER_TESTS!=='1',timeout:90000},async()=>{
 const {preview}=await import('vite'),{chromium}=await import('playwright');
 const server=await preview({root:fileURLToPath(new URL('../',import.meta.url)),preview:{host:'127.0.0.1',port:0,strictPort:true}});
 const executablePath=['C:/Program Files/Google/Chrome/Application/chrome.exe','C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe'].find(existsSync);
 let browser;
 try{
  browser=await chromium.launch({...(executablePath?{executablePath}:{}),headless:true});
  const page=await browser.newPage({viewport:{width:390,height:844},reducedMotion:'reduce'}),errors=[],requests=[];
  page.on('pageerror',error=>errors.push(error.message));
  await page.addInitScript(()=>{
   Object.defineProperty(navigator.mediaDevices,'getUserMedia',{configurable:true,value:async()=>{throw new DOMException('Synthetic permission denial','NotAllowedError');}});
  });
  const reply={answer:'คำตอบจำลองสำหรับทดสอบ UI',confidence:'grounded_summary',citations:[{title:'Synthetic source',url:'https://example.com/approved-ui-fixture'},{title:'Unsafe fixture',url:'javascript:alert(1)'}],audio_status:'available',audio:{mime_type:'audio/wav',base64:syntheticAudio()}};
  await page.route('**/api/**',async route=>{
   if(new URL(route.request().url()).pathname==='/api/voice/reply'){requests.push(route.request().postDataJSON());return route.fulfill({json:reply});}
   return route.fulfill({json:{projects:[],categories:[]}});
  });
  await page.goto(`http://127.0.0.1:${server.httpServer.address().port}/voice?lang=en`);
  await page.getByRole('heading',{name:'A conversation, by voice.',exact:true}).waitFor();
  await page.getByRole('button',{name:'Tap to speak',exact:true}).click();
  await page.getByText('Microphone access was denied. You can type your question below.',{exact:true}).waitFor();
  await page.getByRole('combobox').selectOption('th');
  await page.getByRole('textbox').fill('GenesisBlockDB คืออะไร');
  await page.getByRole('button',{name:'Ask Zuri',exact:true}).click();
  await page.getByText(reply.answer,{exact:true}).waitFor();
  await page.getByRole('button',{name:'Play answer',exact:true}).waitFor();
  assert.deepEqual(requests,[{message:'GenesisBlockDB คืออะไร',lang:'th'}]);
  assert.equal(await page.getByRole('link',{name:'Synthetic source',exact:true}).getAttribute('href'),reply.citations[0].url);
  assert.equal(await page.locator('a[href^="javascript:"]').count(),0);
  await page.getByRole('button',{name:'Play answer',exact:true}).click();
  await page.waitForFunction(()=>{const audio=document.querySelector('#zuri-answer-audio');return audio&&!audio.paused&&audio.currentTime>0;});
  await page.getByRole('button',{name:'Stop audio',exact:true}).click();
  assert.equal(await page.locator('audio').evaluate(audio=>audio.paused&&audio.currentTime===0),true);
  await page.evaluate(async()=>{Object.defineProperty(document,'hidden',{configurable:true,value:true});document.dispatchEvent(new Event('visibilitychange'));await new Promise(requestAnimationFrame);await new Promise(requestAnimationFrame);});
  assert.equal(await page.locator('#zuri-answer-audio').count(),0,'Hiding an idle answer must remove revoked audio from the rendered UI.');
  await page.evaluate(()=>{Object.defineProperty(document,'hidden',{configurable:true,value:false});document.dispatchEvent(new Event('visibilitychange'));});
  assert.equal(await page.getByRole('button',{name:'Play answer',exact:true}).count(),0,'A revoked audio URL must not leave a stale Play button.');
  assert.equal(await page.getByText(reply.answer,{exact:true}).count(),1,'Hiding the page retains approved text and source links.');
  await page.getByRole('button',{name:'Clear',exact:true}).click();
  assert.equal(await page.getByRole('textbox').inputValue(),'');
  assert.equal(await page.getByRole('link',{name:'Synthetic source',exact:true}).count(),0);
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);
  assert.deepEqual(errors,[]);
 }finally{await browser?.close();await new Promise(resolve=>server.httpServer.close(resolve));}
});
