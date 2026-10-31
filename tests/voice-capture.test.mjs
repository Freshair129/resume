import test from 'node:test';
import assert from 'node:assert/strict';
import {startCapture} from '../src/features/voice/capture.mjs';
test('Clear/navigation closes audio context during a pending permission prompt and stops late tracks',async t=>{
 const oldWindow=Object.getOwnPropertyDescriptor(globalThis,'window'),oldNavigator=Object.getOwnPropertyDescriptor(globalThis,'navigator');
 let permit,entered,closed=false,stopped=false;const asked=new Promise(r=>entered=r),permission=new Promise(r=>permit=r);
 class Context{resume(){return Promise.resolve();}close(){closed=true;return Promise.resolve();}}
 Object.defineProperty(globalThis,'window',{value:{AudioContext:Context,AudioWorkletNode:class{},isSecureContext:true},configurable:true});
 Object.defineProperty(globalThis,'navigator',{value:{mediaDevices:{getUserMedia:()=>{entered();return permission;}}},configurable:true});
 t.after(()=>{if(oldWindow)Object.defineProperty(globalThis,'window',oldWindow);else delete globalThis.window;if(oldNavigator)Object.defineProperty(globalThis,'navigator',oldNavigator);else delete globalThis.navigator;});
 const controller=new AbortController(),work=startCapture({signal:controller.signal}).catch(e=>e.message);
 await asked;controller.abort();const closedAtAbort=closed;permit({getTracks:()=>[{stop:()=>{stopped=true;}}]});await work;
 assert.equal(closedAtAbort,true);assert.equal(stopped,true);
});
