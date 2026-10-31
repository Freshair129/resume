class ZuriRecorder extends AudioWorkletProcessor {
 constructor(){super();this.buffer=new Float32Array(2048);this.offset=0;}
 process(inputs){
  const input=inputs[0]?.[0];
  if(input)for(let i=0;i<input.length;i++){this.buffer[this.offset++]=input[i];if(this.offset===this.buffer.length){this.port.postMessage(this.buffer);this.offset=0;}}
  return true;
 }
}
registerProcessor('zuri-recorder',ZuriRecorder);
