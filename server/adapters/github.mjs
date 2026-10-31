import { createHmac,timingSafeEqual } from 'node:crypto';
import { z } from 'zod';
export async function enqueueGithub(db,raw,signature,delivery,secret){
 if(!secret||!Buffer.isBuffer(raw)||typeof signature!=='string'||!/^sha256=[a-f0-9]{64}$/.test(signature))throw new Error('INVALID_SIGNATURE');
 const expected='sha256='+createHmac('sha256',secret).update(raw).digest('hex');if(!timingSafeEqual(Buffer.from(signature),Buffer.from(expected)))throw new Error('INVALID_SIGNATURE');
 const id=z.string().regex(/^[a-zA-Z0-9-]{1,100}$/).parse(delivery),event=z.object({repository:z.object({full_name:z.string().regex(/^Freshair129\/[a-zA-Z0-9_.-]+$/),private:z.literal(false)})}).passthrough().parse(JSON.parse(raw.toString('utf8')));
 await db.query(`INSERT INTO ingestion_jobs(id,source_uri,state) VALUES(gen_random_uuid(),$1,'awaiting-owner-sync') ON CONFLICT(source_uri) DO NOTHING`,[`github-delivery:${id}:${event.repository.full_name}`]);
 return {accepted:true,autoPublish:false};
}
