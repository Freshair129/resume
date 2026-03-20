import { Link } from 'react-router-dom';
import { ArrowLeft, ExternalLink, Github, Cpu, Code, Star, Zap, Database, Globe, Shield, BarChart3, MessageSquare, Package } from 'lucide-react';

const projects = [
  {
    id: 'vschool',
    title: 'V School CRM v2',
    subtitle: 'Cooking School Management System',
    version: 'v1.1.0 · Production',
    versionColor: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    stack: ['Next.js 14', 'PostgreSQL', 'Prisma', 'Upstash / QStash', 'Meta Graph API', 'Gemini Vision'],
    accent: '#1A2B4A',
    accentLight: '#F0F4FC',
    accentText: '#B8933A',
    icon: Database,
    iconBg: 'bg-[#1A2B4A]',
    description: 'Full-stack CRM rebuilt from scratch for a Japanese cooking school in Bangkok. Unified FB+LINE inbox, chat-first revenue attribution, FEFO stock system, POS with Slip OCR payment verification.',
    features: [
      { icon: MessageSquare, label: 'Unified Inbox', desc: 'Facebook + LINE messages in one view, reply from CRM' },
      { icon: BarChart3, label: 'Meta Ads Analytics', desc: 'ROAS tracking, campaign attribution, ad-to-revenue split' },
      { icon: Package, label: 'FEFO Stock System', desc: 'Lot tracking with real-time deduction on class completion' },
      { icon: Shield, label: 'Slip OCR Payment', desc: 'Gemini Vision reads payment slips — 0.80 confidence threshold auto-creates transactions' },
      { icon: Globe, label: 'Zero Local Infra', desc: 'QStash + Upstash Redis, fully Vercel-native deployment' },
      { icon: Code, label: '186 Unit Tests', desc: 'Full test coverage: webhooks, OCR, payment flows, RBAC' },
    ],
    tags: ['Full-Stack', 'CRM / POS', 'Solo Build'],
    note: '⚠️ Live system — demo video coming soon',
  },
  {
    id: 'eva',
    title: 'EVA',
    subtitle: 'Embodied Virtual Agent',
    version: 'v9.7.0 · Epoch: Reflex',
    versionColor: 'bg-purple-100 text-purple-700 border-purple-200',
    stack: ['Python 3.13', 'FastAPI', 'Vue.js / Vite', 'ChromaDB', 'Agentic RAG', 'WebSocket'],
    accent: '#4c1d95',
    accentLight: '#f5f3ff',
    accentText: '#7c3aed',
    icon: Cpu,
    iconBg: 'bg-purple-900',
    description: 'Bio-inspired AI architecture implementing "Resonance Intelligence" — a single-inference LLM system with hormone simulation, emotional state matrix, and 8-8-8 episodic memory governance. Built solo from scratch.',
    features: [
      { icon: Zap, label: 'Bio-Digital Gap', desc: 'LLM pauses mid-inference → hormone cascade fires → LLM resumes from identical mental state' },
      { icon: Database, label: '7-Stream Agentic RAG', desc: 'GraphRAG + vector search for deep context recall across episodic memory' },
      { icon: Code, label: '8 Microservices', desc: 'MSP, RMS, CIM, CNS, PhysioCore, IdentityManager, AgenticRAG, Orchestrator — fully decoupled' },
      { icon: BarChart3, label: 'PhysioCore', desc: 'Hormone simulation: cortisol, dopamine, serotonin affect LLM response style in real-time' },
      { icon: MessageSquare, label: 'Live Emotional UI', desc: 'WebSocket real-time chat with emotional state visualization panel' },
      { icon: Star, label: 'Solo Architecture', desc: 'Full system designed, architected, and built entirely solo — v1 to v9.7 over 12 months' },
    ],
    tags: ['Personal Project', 'AI Architecture', 'Solo Build'],
    note: '🔒 Private repo — architecture overview available on request',
  },
];

const ProjectDemo = () => {
  return (
    <div className="min-h-screen bg-[#0f172a] text-white py-10 px-4 sm:px-6">
      <div className="max-w-4xl mx-auto mb-8 flex justify-between items-center">
        <Link to="/resume" className="inline-flex items-center gap-2 text-slate-400 hover:text-white font-bold transition-colors bg-white/5 px-4 py-2 rounded-xl border border-white/10">
          <ArrowLeft size={18} /> Back to Resume
        </Link>
        <div className="text-lg font-black tracking-tighter text-[#B8933A]">PORNPON.T</div>
      </div>

      <div className="max-w-4xl mx-auto mb-12 text-center">
        <p className="text-slate-400 text-xs uppercase tracking-widest font-bold mb-3">Personal Projects</p>
        <h1 className="text-4xl md:text-5xl font-black mb-4">
          Things I <span className="text-[#B8933A]">Built</span>
        </h1>
        <p className="text-slate-400 max-w-xl mx-auto leading-relaxed">
          Both projects built entirely solo — no team, no templates. Designed, architected, and shipped from scratch.
        </p>
      </div>

      <div className="max-w-4xl mx-auto space-y-16">
        {projects.map((proj) => {
          const Icon = proj.icon;
          return (
            <div key={proj.id} id={proj.id} className="bg-white/5 border border-white/10 rounded-3xl overflow-hidden">
              {/* Header */}
              <div className="p-8 border-b border-white/10">
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-4">
                  <div className="flex items-center gap-4">
                    <div className={`w-14 h-14 ${proj.iconBg} rounded-2xl flex items-center justify-center shadow-lg flex-shrink-0`}>
                      <Icon size={28} className="text-white" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-black">{proj.title}</h2>
                      <p className="text-slate-400 text-sm">{proj.subtitle}</p>
                    </div>
                  </div>
                  <span className={`text-xs font-bold px-3 py-1.5 rounded-full border self-start ${proj.versionColor}`}>
                    {proj.version}
                  </span>
                </div>
                <div className="flex flex-wrap gap-2 mb-4">
                  {proj.stack.map(s => (
                    <span key={s} className="text-xs font-mono bg-white/10 text-slate-300 px-2 py-1 rounded">{s}</span>
                  ))}
                </div>
                <p className="text-slate-300 leading-relaxed">{proj.description}</p>
              </div>

              {/* Demo Video Placeholder */}
              <div className="p-8 border-b border-white/10">
                <p className="text-xs text-slate-500 uppercase tracking-widest font-bold mb-4">Demo</p>
                <div className="bg-black/40 border border-white/10 rounded-2xl aspect-video flex flex-col items-center justify-center gap-3">
                  <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center border border-white/10">
                    <div className="w-0 h-0 border-t-[10px] border-t-transparent border-b-[10px] border-b-transparent border-l-[18px] border-l-white ml-1 opacity-40"></div>
                  </div>
                  <p className="text-slate-500 text-sm font-medium">{proj.note}</p>
                </div>
              </div>

              {/* Features Grid */}
              <div className="p-8">
                <p className="text-xs text-slate-500 uppercase tracking-widest font-bold mb-6">Key Features</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {proj.features.map((f, i) => {
                    const FIcon = f.icon;
                    return (
                      <div key={i} className="bg-white/5 rounded-xl p-4 border border-white/5 hover:border-white/20 transition-all">
                        <div className="flex items-center gap-2 mb-2">
                          <FIcon size={15} className="text-[#B8933A]" />
                          <span className="font-bold text-sm text-white">{f.label}</span>
                        </div>
                        <p className="text-slate-400 text-xs leading-relaxed">{f.desc}</p>
                      </div>
                    );
                  })}
                </div>
                <div className="flex flex-wrap gap-2 mt-6">
                  {proj.tags.map(tag => (
                    <span key={tag} className="bg-[#B8933A]/10 text-[#B8933A] border border-[#B8933A]/20 px-3 py-1 rounded-full text-xs font-bold">{tag}</span>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="max-w-4xl mx-auto mt-16 text-center text-slate-600 text-xs pb-10">
        <p>© 2026 Pornpon Thansuvanthanan · Built with React + Vite + Tailwind</p>
      </div>
    </div>
  );
};

export default ProjectDemo;
