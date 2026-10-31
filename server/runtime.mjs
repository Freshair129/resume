import { database } from './database.mjs';
import { KnowledgeStore } from './knowledge/store.mjs';
import { GenesisClient } from './genesis/client.mjs';
import { EmbeddingProvider } from './adapters/embedding.mjs';
import { KnowledgeSearchService } from './knowledge/search.mjs';
import { AnswerService } from './agent/answer.mjs';
import { OllamaSummarizer } from './adapters/ollama.mjs';
import { LalinVoiceClient } from './voice/lalin.mjs';
import { WindowsTtsClient } from './voice/tts.mjs';
export function runtime(){
 const db=database(),store=new KnowledgeStore(db),embeddings=new EmbeddingProvider();
 const genesis=new GenesisClient({url:process.env.GENESIS_API_URL||'http://genesis:3000',apiKey:process.env.GENESIS_API_KEY,dimension:embeddings.dimension,model:embeddings.model||'unconfigured'});
 const search=new KnowledgeSearchService(store,genesis,embeddings);
 const llm=process.env.OLLAMA_CHAT_MODEL?new OllamaSummarizer():undefined,answers=new AnswerService(store,search,llm);
 const asr=process.env.VOICE_WORKER_SOCKET?new LalinVoiceClient():undefined;
 const tts=process.env.VOICE_TTS_APPROVED==='true'?new WindowsTtsClient():undefined;
 const voice=(asr||tts)?{...(asr?{transcribe:asr.transcribe.bind(asr)}:{}),...(tts?{synthesize:tts.synthesize.bind(tts)}:{})}:undefined;
 return {db,store,genesis,embeddings,search,answers,llm,voice,config:{ownerToken:process.env.OWNER_API_TOKEN,mcpToken:process.env.MCP_API_TOKEN,githubSecret:process.env.GITHUB_WEBHOOK_SECRET,lineSecret:process.env.LINE_CHANNEL_SECRET,origin:process.env.PUBLIC_ORIGIN||'http://localhost:3100'}};
}
