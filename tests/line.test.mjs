import test from 'node:test';
import assert from 'node:assert/strict';
import { createHmac } from 'node:crypto';
import { verifyLineSignature } from '../server/adapters/line.mjs';
test('LINE signature is over unchanged bytes before parse',()=>{
 const bytes=Buffer.from('{ "events": [] }'),secret='test-channel-secret',sig=createHmac('sha256',secret).update(bytes).digest('base64');
 assert.equal(verifyLineSignature(bytes,sig,secret),true);assert.equal(verifyLineSignature(Buffer.from('{"events":[]}'),sig,secret),false);assert.equal(verifyLineSignature(bytes,undefined,secret),false);assert.equal(verifyLineSignature(bytes,sig,''),false);
});
