import test from 'node:test';
import assert from 'node:assert/strict';
import {existsSync} from 'node:fs';
import {fileURLToPath} from 'node:url';

test('portfolio study follows the selected language for localized narrative records', {skip:process.env.RUN_BROWSER_TESTS!=='1',timeout:60000},async()=>{
 const {preview}=await import('vite'),{chromium}=await import('playwright');
 const server=await preview({root:fileURLToPath(new URL('../',import.meta.url)),preview:{host:'127.0.0.1',port:0,strictPort:true}});
 const executablePath=['C:/Program Files/Google/Chrome/Application/chrome.exe','C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe'].find(existsSync);
 let browser;
 try{
  browser=await chromium.launch({...(executablePath?{executablePath}:{}),headless:true});
  const page=await browser.newPage({reducedMotion:'reduce'}),errors=[];
  page.on('pageerror',error=>errors.push(error.message));
  const project={slug:'ui-language-fixture',name:'Language fixture',category:'data',summary:'Synthetic UI fixture only',challenge:{en:'English-only synthetic challenge'},architecture:{th:'สถาปัตยกรรมจำลองสำหรับทดสอบภาษา',en:'Synthetic English architecture'},technologies:[],evidence:[]};
  await page.route('**/api/**',route=>route.fulfill({json:{projects:[project],categories:[]}}));
  await page.goto(`http://127.0.0.1:${server.httpServer.address().port}/work/ui-language-fixture?lang=th`);
  await page.getByRole('heading',{name:'Language fixture',exact:true}).waitFor();
  assert.equal(await page.getByText(project.architecture.th,{exact:true}).count(),1);
  assert.equal(await page.getByText(project.challenge.en,{exact:true}).count(),1,'English-only evidence keeps its explicit fallback.');
  await page.locator('.pk-language').click();
  await page.getByText(project.architecture.en,{exact:true}).waitFor();
  assert.equal(await page.getByText(project.architecture.th,{exact:true}).count(),0);
  assert.deepEqual(errors,[]);
 }finally{await browser?.close();await new Promise(resolve=>server.httpServer.close(resolve));}
});
