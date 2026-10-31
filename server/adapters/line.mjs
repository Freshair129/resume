import { createHmac, timingSafeEqual } from 'node:crypto';
import { z } from 'zod';
export function verifyLineSignature(raw,signature,secret){
 if(!secret||typeof signature!=='string'||!Buffer.isBuffer(raw))return false;
 const expected=Buffer.from(createHmac('sha256',secret).update(raw).digest('base64')),actual=Buffer.from(signature);
 return actual.length===expected.length&&timingSafeEqual(actual,expected);
}
const event=z.object({webhookEventId:z.string().min(1).max(200),type:z.string(),replyToken:z.string().max(300).optional(),message:z.object({type:z.string(),text:z.string().max(2000).optional()}).passthrough().optional()}).passthrough();
export async function enqueueLine(db,raw){
 const body=z.object({events:z.array(event).max(100)}).passthrough().parse(JSON.parse(raw.toString('utf8')));
 // Validate the complete batch before any queue side effect.
 for(const e of body.events)if(e.type==='message'&&e.message?.type==='text')z.string().trim().min(1).max(2000).parse(e.message.text);
 for(const e of body.events){
  if(e.type!=='message'||e.message?.type!=='text'||!e.replyToken)continue;
  // No LINE user/group IDs persisted. Payload contains only short-lived reply data.
  await db.query('INSERT INTO line_deliveries(id,payload) VALUES($1,$2) ON CONFLICT(id) DO NOTHING',[e.webhookEventId,{message:e.message.text,replyToken:e.replyToken}]);
 }
 return body.events.length;
}
export async function deliverLine(db,answers,{token=process.env.LINE_CHANNEL_ACCESS_TOKEN,fetchImpl=fetch}={}){
 await db.query("UPDATE line_deliveries SET payload=NULL,state='expired' WHERE expires_at<now() AND state<>'done'");
 await db.query("DELETE FROM line_deliveries WHERE expires_at<now()-interval '7 days'");
 if(!token)return false;
 // Never reclaim a still-running generation while its token can be used. If a
 // worker crashes, this short-lived token expires rather than racing a reply.
 const r=await db.query(`UPDATE line_deliveries SET state='sending',attempts=attempts+1,next_attempt_at=expires_at WHERE id=(SELECT id FROM line_deliveries WHERE state='pending' AND attempts<3 AND expires_at>now() AND next_attempt_at<=now() ORDER BY expires_at LIMIT 1 FOR UPDATE SKIP LOCKED) RETURNING *`);
 const job=r.rows[0];if(!job)return false;
 try{
  const a=await answers.answer(job.payload.message);
  const messages=lineMessages(a);
  const live=await db.query("SELECT id FROM line_deliveries WHERE id=$1 AND state='sending' AND expires_at>now()",[job.id]);
  if(!live.rows.length){await db.query("UPDATE line_deliveries SET state='expired',payload=NULL WHERE id=$1",[job.id]);return true;}
  const res=await fetchImpl('https://api.line.me/v2/bot/message/reply',{method:'POST',headers:{Authorization:`Bearer ${token}`,'Content-Type':'application/json'},body:JSON.stringify({replyToken:job.payload.replyToken,messages}),redirect:'error',signal:AbortSignal.timeout(10000)});
  if(!res.ok)throw new Error(res.status>=500||res.status===429?'RETRY':'TERMINAL');
  await db.query("UPDATE line_deliveries SET state='done',payload=NULL WHERE id=$1",[job.id]);
 }catch(e){const terminal=e.message==='TERMINAL'||job.attempts>=3;await db.query("UPDATE line_deliveries SET state=$2,error_code='DELIVERY_FAILED',next_attempt_at=now()+interval '3 seconds',payload=CASE WHEN $3 THEN NULL ELSE payload END WHERE id=$1",[job.id,terminal?'failed':'pending',terminal]);}
 await db.query("UPDATE line_deliveries SET payload=NULL,state='expired' WHERE expires_at<now() AND state<>'done'");
 await db.query("DELETE FROM line_deliveries WHERE expires_at<now()-interval '7 days'");
 return true;
}

function lineMessages(answer){
 // Preserve numbered source links in full; clipping a URL changes its meaning.
 const messages=[];let remaining=answer.answer;
 while(remaining.length>4500){
  const boundary=Math.max(remaining.lastIndexOf('\n',4499),remaining.lastIndexOf(' ',4499));
  if(boundary<0)throw new Error('TERMINAL');
  messages.push({type:'text',text:remaining.slice(0,boundary+1)});remaining=remaining.slice(boundary+1);
 }
 messages.push({type:'text',text:remaining});
 for(const part of answer.citations.map((c,i)=>`[${i+1}] ${c.title}\n${c.url}`)){
  if(typeof part!=='string'||part.length>4500)throw new Error('TERMINAL');
  const last=messages.at(-1);
  if(last&&last.text.length+part.length+2<=4500)last.text+='\n\n'+part;
  else messages.push({type:'text',text:part});
 }
 if(messages.length>5)throw new Error('TERMINAL');
 return messages;
}
