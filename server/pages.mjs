import express from 'express';
import { readFile } from 'node:fs/promises';
import { publicPortfolio } from './knowledge/catalog.mjs';
const escape=x=>String(x??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export function mountPages(app,store,origin){
 const base=new URL(origin).origin;
 app.get('/sitemap.xml',async(_req,res)=>{const catalog=await publicPortfolio(store),paths=['/','/portfolio','/projects','/resume','/about','/contact','/privacy',...catalog.projects.map(p=>`/work/${p.slug}`),...(await store.projects()).map(p=>`/projects/${p.slug}`)];res.set('Cache-Control','no-store').type('application/xml').send(`<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${paths.map(p=>`<url><loc>${escape(base+p)}</loc></url>`).join('')}</urlset>`);});
 app.get('/robots.txt',(_req,res)=>res.type('text').send('User-agent: *\nDisallow: /api/admin\nDisallow: /legacy\nSitemap: '+base+'/sitemap.xml'));
 app.use('/assets',express.static('dist/assets',{immutable:true,maxAge:'1y'}));
 app.get(['/','/voice','/projects','/projects/:slug','/work/:slug','/resume','/resume/:track','/about','/contact','/privacy','/portfolio','/media','/gallery','/demo'],async(req,res)=>{
  let title='Intelligence in Motion | Freshair129',body='',status=200,structuredData=null;
  try{
   if(req.path.startsWith('/work/')){
    const p=(await publicPortfolio(store)).projects.find(p=>p.slug===req.params.slug);
    if(!p){status=404;title='Project not published';body='<h1>Project not published</h1>';}
    else{title=p.name+' | Intelligence in Motion';body=`<h1>${escape(p.name)}</h1><p>${escape(p.summary)}</p>${['challenge','approach','architecture','implementation','outcome','lessons'].map(section=>`<section><h2>${escape(section)}</h2><p>${escape(p[section])}</p></section>`).join('')}<p>${escape(p.role.text)}</p><h2>Evidence</h2>${p.evidence.map(e=>`<p><a href="${escape(e.url)}">${escape(e.label)}</a></p>`).join('')}`;structuredData={'@context':'https://schema.org','@type':'CreativeWork',name:p.name,description:p.summary,url:base+req.path,codeRepository:p.url,citation:p.evidence.map(e=>e.url)};}
   }
   else if(req.params.slug){const p=await store.project(req.params.slug);if(!p){status=404;title='Project not published';}else{title=p.title.en;body=`<h1>${escape(title)}</h1><p>${escape(p.status)}</p><p>${escape(p.summary.en)}</p>${p.documents.map(d=>`<p>${escape(d.text)}</p><a href="${escape(d.url)}">Source at ${escape(d.sha.slice(0,12))}</a>`).join('')}`;}}
   else if(req.path.startsWith('/resume')||req.path==='/about'){const p=await store.profile();body=p.profile?`<h1>${escape(p.profile.name.en)}</h1><p>${escape(p.profile.headline.en)}</p><p>${escape(p.profile.summary.en)}</p>`:'<h1>Resume</h1><p>Awaiting owner-approved profile.</p>';}
   else if(req.path==='/voice'){title='Voice | Zuri';body='<h1>Ask Zuri by voice</h1><p>Ask about approved public projects. Microphone recordings are limited to 15 seconds and processed on this site’s local speech server. Text questions and source links are available when speech is unavailable.</p>';}
   else if(req.path==='/privacy')body='<h1>Privacy</h1><p>Chat input is processed to retrieve public evidence. Web chat text is not stored. Voice input is processed locally, deleted after processing, with abandoned media removed within one minute. LINE reply payloads expire after one minute; deduplication IDs expire after seven days. Contact the owner through approved contact links for deletion requests.</p>';
   else{const catalog=await publicPortfolio(store);body='<h1>Intelligence in Motion</h1><p>Source-backed systems, tools and experiments.</p>'+catalog.projects.map(p=>`<article><h2><a href="/work/${escape(p.slug)}">${escape(p.name)}</a></h2><p>${escape(p.summary)}</p><p>${escape(p.category)}</p></article>`).join('');structuredData={'@context':'https://schema.org','@type':'CollectionPage',name:'Intelligence in Motion',url:base+req.path,hasPart:catalog.projects.map(p=>({'@type':'CreativeWork',name:p.name,url:base+'/work/'+p.slug}))};}
  }catch{status=503;body='<h1>Portfolio</h1><p>Published knowledge is temporarily unavailable.</p>';}
  let html=await readFile('dist/index.html','utf8');
  html=html.replace(/<title>[\s\S]*?<\/title>/,`<title>${escape(title)}</title>`).replace(/<meta[^>]+(?:property="og:[^"]+"|name="description")[^>]*>/g,'').replace(/<link[^>]+rel="canonical"[^>]*>/g,'');
  html=html.replace('</head>',`<link rel="canonical" href="${escape(base+req.path)}"><meta property="og:title" content="${escape(title)}"><meta property="og:url" content="${escape(base+req.path)}"><meta name="description" content="Approved portfolio projects and source-backed evidence."></head>`);
  if(structuredData)html=html.replace('</head>',`<script type="application/ld+json">${JSON.stringify(structuredData).replaceAll('<','\\u003c')}</script></head>`);
  html=html.replace('<div id="root"></div>',`<div id="root"><nav><a href="/">Home</a> <a href="/projects">Projects</a> <a href="/resume">Resume</a> <a href="/gallery">Gallery</a></nav><main>${body}</main></div>`);
  res.status(status).set('Cache-Control','no-store').type('html').send(html);
 });
 app.use(express.static('dist',{index:false}));
 app.use((_req,res)=>res.status(404).type('text').send('Not found'));
}
