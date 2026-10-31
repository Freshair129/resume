import {useCallback,useEffect,useRef,useState} from 'react';
import {Link} from 'react-router-dom';
import {Mic,Square,ArrowUpRight,Send,Volume2,Trash2} from 'lucide-react';
import {useLanguage} from '../../LanguageContext';
import ZuriLineLink from '../portfolio/ZuriLineLink';
import {startCapture} from './capture.mjs';
import './voice.css';

export default function VoicePage(){
 const {language}=useLanguage(),th=language==='th',word=(a,b)=>th?a:b;
 const [inputLanguage,setInputLanguage]=useState(language),[text,setText]=useState(''),[phase,setPhase]=useState('idle'),[answer,setAnswer]=useState(null),[error,setError]=useState('');
 const [audioSource,setAudioSource]=useState(null);
 const capture=useRef(),abort=useRef(),generation=useRef(0),audio=useRef(),audioUrl=useRef(),phaseRef=useRef('idle');
 const status=next=>{phaseRef.current=next;setPhase(next);};
 const stopAudio=useCallback(()=>{audio.current?.pause();if(audio.current)audio.current.currentTime=0;},[]);
 const cleanup=useCallback(()=>{generation.current++;abort.current?.abort();capture.current?.cancel();capture.current=null;stopAudio();if(audioUrl.current)URL.revokeObjectURL(audioUrl.current);audioUrl.current=null;setAudioSource(null);audio.current=null;},[stopAudio]);
 useEffect(()=>{
  const hide=()=>{if(document.hidden){cleanup();phaseRef.current='idle';setPhase('idle');}};
  document.addEventListener('visibilitychange',hide);
  return ()=>{document.removeEventListener('visibilitychange',hide);cleanup();};
 },[cleanup]);
 async function finishRecording(){
  if(phaseRef.current!=='recording'||!capture.current)return;
  const current=generation.current,recording=capture.current;capture.current=null;status('transcribing');
  try{
   const bytes=await recording.stop();
   const response=await fetch(`/api/voice/transcribe?lang=${inputLanguage}`,{method:'POST',headers:{'Content-Type':'audio/wav'},body:bytes,signal:AbortSignal.any([abort.current.signal,AbortSignal.timeout(24000)])});
   const body=await response.json();if(!response.ok)throw Error(body.error||'VOICE_UNAVAILABLE');
   if(current===generation.current)setText(body.text);
  }catch(e){if(current===generation.current)setError(e.message==='NO_SPEECH'?'silence':'transcribe');}
  finally{if(current===generation.current)status('idle');}
 }
 async function record(){
  if(phaseRef.current==='recording'){await finishRecording();return;}
  if(phaseRef.current!=='idle')return;
  stopAudio();setError('');status('permission');abort.current=new AbortController();const current=++generation.current;
  try{
   const recording=await startCapture({signal:abort.current.signal,onLimit:()=>void finishRecording()});
   if(current!==generation.current){recording.cancel();return;}
   capture.current=recording;status('recording');
  }catch(e){if(current===generation.current){setError(e.name==='NotAllowedError'?'permission':e.message==='UNSUPPORTED_CAPTURE'?'unsupported':'capture');status('idle');}}
 }
 async function send(event){
  event.preventDefault();if(!text.trim()||phaseRef.current!=='idle')return;
  cleanup();abort.current=new AbortController();const current=generation.current;setError('');setAnswer(null);status('answering');
  try{
   const response=await fetch('/api/voice/reply',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({message:text.trim(),lang:inputLanguage}),signal:AbortSignal.any([abort.current.signal,AbortSignal.timeout(26000)])});
   const body=await response.json();if(!response.ok)throw Error('unavailable');
   if(current!==generation.current)return;
   setAnswer(body);
   if(body.audio_status==='available'&&body.audio?.mime_type==='audio/wav'&&body.audio.base64?.length<=2800000){
    const bytes=Uint8Array.from(atob(body.audio.base64),c=>c.charCodeAt(0));audioUrl.current=URL.createObjectURL(new Blob([bytes],{type:'audio/wav'}));setAudioSource(audioUrl.current);
   }
  }catch{if(current===generation.current)setError('answer');}
  finally{if(current===generation.current)status('idle');}
 }
 const busy=phase!=='idle'&&phase!=='recording';
 const errors={permission:word('ยังไม่ได้รับสิทธิ์ไมโครโฟน คุณพิมพ์คำถามด้านล่างได้','Microphone access was denied. You can type your question below.'),unsupported:word('เบราว์เซอร์นี้ยังรับเสียงไม่ได้ คุณพิมพ์คำถามได้','Voice capture is unavailable in this browser. You can type instead.'),silence:word('ยังไม่ได้ยินคำพูด ลองพูดใหม่หรือพิมพ์คำถามได้','No speech detected. Try again or type your question.'),transcribe:word('ถอดเสียงไม่สำเร็จ ลองพูดสั้นลงหรือพิมพ์คำถามได้','Transcription is unavailable. Try a shorter recording or type instead.'),capture:word('เปิดไมโครโฟนไม่ได้ ลองใหม่หรือพิมพ์คำถามได้','Could not start recording. Try again or type instead.'),answer:word('ขณะนี้ตอบคำถามไม่ได้ ลองอีกครั้งหรือดูผลงานที่เผยแพร่','Answers are temporarily unavailable. Try again or explore the published work.')};
 const phases={idle:word('พร้อมรับคำถาม','Ready for your question'),permission:word('กำลังเปิดไมโครโฟน','Opening microphone'),recording:word('กำลังฟัง · กดอีกครั้งเพื่อหยุด','Listening · tap again to stop'),transcribing:word('กำลังถอดเสียง','Transcribing'),answering:word('กำลังค้นข้อมูลที่อนุมัติแล้ว','Searching approved sources')};
 return <div className="zv-page pk-container">
  <header className="zv-intro"><p className="zv-eyebrow">ZURI / VOICE</p><h1>{word('ลองถามด้วยเสียง','A conversation, by voice.')}</h1><p>{word('สำรวจผลงานผ่านคำถามของคุณ พร้อมแหล่งอ้างอิงให้เปิดอ่านต่อ','Explore the work through your questions, with sources to follow.')}</p></header>
  <div className="zv-layout"><section className="zv-console" aria-label={word('ถาม Zuri','Ask Zuri')}>
   <label className="zv-language">{word('ภาษาที่พูด','Speaking language')}<select value={inputLanguage} disabled={phase!=='idle'} onChange={event=>setInputLanguage(event.target.value)}><option value="th">ไทย</option><option value="en">English</option></select></label>
   <div className={`zv-orbit ${phase==='recording'?'is-listening':''}`} aria-hidden="true"><span/><span/><span/></div>
   <p className="zv-status" role="status" aria-live="polite">{phases[phase]}</p>
   <button className={`zv-mic ${phase==='recording'?'is-listening':''}`} type="button" disabled={busy} onClick={()=>void record()} aria-pressed={phase==='recording'}>{phase==='recording'?<Square size={18}/>:<Mic size={20}/>}<span>{phase==='recording'?word('หยุดบันทึก','Stop recording'):word('กดเพื่อพูด','Tap to speak')}</span></button>
   <p className="zv-disclosure">{word('บันทึกเมื่อกดเท่านั้น สูงสุด 15 วินาที เสียงจะส่งไปถอดบนเครื่องเซิร์ฟเวอร์ของเว็บและลบหลังประมวลผล','Records only when you tap, up to 15 seconds. Audio is transcribed on this site’s server and deleted after processing.')} <Link to="/privacy">{word('ความเป็นส่วนตัว','Privacy')}</Link></p>
   <form onSubmit={send}><label htmlFor="zuri-question">{word('ตรวจข้อความ หรือพิมพ์คำถาม','Review the transcript, or type a question')}</label><textarea id="zuri-question" value={text} maxLength={2000} onChange={event=>setText(event.target.value)} disabled={phase!=='idle'} placeholder={word('GenesisBlockDB ค้นหาข้อมูลแบบไหนได้บ้าง','What is GenesisBlockDB?')} rows={3}/><div className="zv-actions"><button className="pk-button" disabled={phase!=='idle'||!text.trim()} type="submit"><Send size={15}/>{word('ส่งคำถาม','Ask Zuri')}</button><button className="zv-clear" type="button" onClick={()=>{cleanup();setText('');setAnswer(null);setError('');status('idle');}}><Trash2 size={15}/>{word('ล้าง','Clear')}</button></div></form>
   {error&&<p className="zv-error" role="alert">{errors[error]}</p>}
  </section><section className="zv-answer" aria-label={word('คำตอบและแหล่งอ้างอิง','Answer and sources')} aria-live="polite" aria-busy={phase==='answering'}>
   <p className="zv-eyebrow">{word('คำตอบจากข้อมูลที่อนุมัติแล้ว','ANSWERS FROM APPROVED SOURCES')}</p>
   {answer?<><h2>{word('Zuri ตอบว่า','From Zuri')}</h2><p className="zv-answer-text">{answer.answer}</p>{answer.confidence==='source_excerpt'&&<p className="zv-note">{word('แสดงข้อความต้นฉบับที่อนุมัติแล้ว','Showing approved original source excerpts.')}</p>}<ol className="zv-sources">{(answer.citations||[]).filter(c=>/^https:\/\//.test(c.url)).map((citation,i)=><li key={citation.url+i}><a href={citation.url} target="_blank" rel="noopener noreferrer">{citation.title}<ArrowUpRight size={14}/></a></li>)}</ol>{answer.audio_status==='available'&&audioSource?<div className="zv-actions"><audio id="zuri-answer-audio" ref={audio} src={audioSource} preload="metadata" aria-label={word('เสียงคำตอบจาก Zuri','Zuri answer audio')} /><button className="pk-text-link" onClick={()=>{const player=audio.current;if(player)void player.play().catch(()=>setError('answer'));}}><Volume2 size={16}/>{word('ฟังคำตอบ','Play answer')}</button><button className="pk-text-link" onClick={stopAudio}>{word('หยุดเสียง','Stop audio')}</button></div>:<p className="zv-note">{word('เสียงอ่านคำตอบยังไม่พร้อม — อ่านคำตอบและเปิดแหล่งอ้างอิงได้','Spoken replies are not available yet. Read the answer and follow its sources.')}</p>}</>:<><h2>{word('เริ่มจากสิ่งที่อยากรู้','Start with your curiosity.')}</h2><p>{word('ถามเกี่ยวกับโปรเจกต์ เทคโนโลยี หรือการออกแบบระบบ หากไม่มีหลักฐาน Zuri จะบอกตรง ๆ','Ask about projects, technologies or system design. When evidence is missing, Zuri will say so.')}</p><button className="zv-example" disabled={phase!=='idle'} onClick={()=>setText(inputLanguage==='th'?'GenesisBlockDB รองรับการค้นหาแบบไหนบ้าง':'What is GenesisBlockDB?')}>{word('ลองถามเรื่อง GenesisBlockDB','Try asking about GenesisBlockDB')}<ArrowUpRight size={16}/></button></>}
   <div className="zv-line"><ZuriLineLink className="pk-text-link"/></div>
  </section></div>
 </div>;
}
