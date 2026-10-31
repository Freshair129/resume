import PDFDocument from 'pdfkit';
import { fileURLToPath } from 'node:url';
const font=fileURLToPath(new URL('./fonts/Sarabun-Regular.ttf',import.meta.url));
export async function renderResume(data,{lang='en',track='ai-automation'}={}){
 if(!data.profile)throw new Error('PROFILE_NOT_PUBLISHED');
 const local=v=>typeof v==='string'?v:v?.[lang]||v?.en||'';
 const doc=new PDFDocument({size:'A4',margin:50,info:{Title:`${local(data.profile.name)} - ${track}`,Author:local(data.profile.name)}}),chunks=[];
 const finished=new Promise((resolve,reject)=>{doc.on('data',c=>chunks.push(c));doc.on('end',()=>resolve(Buffer.concat(chunks)));doc.on('error',reject);});
 doc.font(font).fontSize(24).fillColor('#152b45').text(local(data.profile.name));
 doc.moveDown(.4).fontSize(14).text(local(data.profile.headline));
 doc.moveDown(.5).fontSize(10).fillColor('#394858').text(track);
 doc.moveDown().fontSize(11).text(local(data.profile.summary),{lineGap:4});
 for(const [key,value] of Object.entries(data.profile.contacts||{})){if(value)doc.moveDown(.4).fontSize(10).text(`${key}: ${value}`);}
 for(const item of data.experiences){doc.moveDown().fontSize(13).fillColor('#152b45').text(local(item.title));doc.fontSize(11).fillColor('#394858').text(local(item.summary));}
 if(data.projects.length){doc.moveDown().fontSize(16).text(lang==='th'?'โครงการที่เผยแพร่':'Published projects');for(const p of data.projects){doc.moveDown(.5).fontSize(12).text(`${local(p.title)} (${p.status})`);doc.fontSize(10).text(local(p.summary),{lineGap:3});}}
 doc.end();return finished;
}
