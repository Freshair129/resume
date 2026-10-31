import test from 'node:test';
import assert from 'node:assert/strict';
import { AnswerService } from '../server/agent/answer.mjs';

test('unpublished resume and qualifications questions abstain instead of returning unrelated repository excerpts',async()=>{
 let retrievalCalls=0;
 const answers=new AnswerService({profile:async()=>({profile:null}),authorize:async()=>[]},{search:async()=>{retrievalCalls++;return {results:[],status:'available'};}});
 for(const question of ['Download the English AI resume','Download a résumé','ขอเรซูเม่ภาษาไทย','Summarize their qualifications','Show the career history']){
  const reply=await answers.answer(question);assert.equal(reply.confidence,'none');assert.equal(reply.status,'profile_not_published');assert.deepEqual(reply.citations,[]);
 }
 assert.equal(retrievalCalls,0);
});

test('source excerpts never turn a clipped URL into a different link; canonical citations stay complete', async () => {
 const sourceUrl = 'https://github.com/Freshair129/GenesisBlock/blob/' + 'a'.repeat(40) + '/README.md';
 const prefix = 'Verified architecture details. '.repeat(27);
 const row = { node_id: 'source-node', text: prefix + sourceUrl + '\nAdditional source details.', url: sourceUrl, project_slug: 'genesisblock', title: { en: 'GenesisBlockDB' } };
 assert.ok(prefix.length < 900 && prefix.length + sourceUrl.length > 900, 'Fixture crosses the excerpt boundary.');
 assert.ok(prefix.length + 'https://github.com/'.length < 900, 'The broken link prefix must be visible before clipping.');
 const answers = new AnswerService({ authorize: async () => [row] }, { search: async () => ({ results: [{ node_id: row.node_id }] }) });
 const reply = await answers.answer('Describe this public database');
 assert.ok(reply.answer.startsWith('[1] Verified architecture details.'));
 assert.ok(!reply.answer.includes('https://github.com/'), 'A URL crossing the limit must not become a partial link.');
 assert.equal(reply.citations[0].url, sourceUrl);
 assert.equal(reply.confidence, 'source_excerpt');

 row.text = 'Read ' + sourceUrl + '\n' + 'Verified source details. '.repeat(80);
 const complete = await answers.answer('Describe this public database');
 assert.ok(complete.answer.includes(sourceUrl), 'A complete URL inside the limit is retained.');
 assert.ok(complete.answer.length <= 904);
 assert.equal(complete.citations[0].url, sourceUrl);
});
