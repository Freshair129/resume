export function validateVoiceWav(input) {
 const b=Buffer.from(input);
 const invalid=()=>{throw new Error('INVALID_AUDIO');};
 if(b.length<46||b.length>512*1024||b.toString('ascii',0,4)!=='RIFF'||b.toString('ascii',8,12)!=='WAVE'||b.readUInt32LE(4)!==b.length-8)invalid();
 let offset=12,format=false,data=false,duration=0;
 while(offset+8<=b.length){
  const type=b.toString('ascii',offset,offset+4),size=b.readUInt32LE(offset+4),start=offset+8,end=start+size;
  if(end>b.length)invalid();
  if(type==='fmt '){if(format||size!==16||b.readUInt16LE(start)!==1||b.readUInt16LE(start+2)!==1||b.readUInt32LE(start+4)!==16000||b.readUInt32LE(start+8)!==32000||b.readUInt16LE(start+12)!==2||b.readUInt16LE(start+14)!==16)invalid();format=true;}
  else if(type==='data'){if(!format||data||!size||size%2)invalid();data=true;duration=size/32000;}
  else invalid();
  offset=end+(size%2);
 }
 if(offset!==b.length||!format||!data||duration>15)invalid();
 return {duration};
}
