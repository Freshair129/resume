import React, { useState, useEffect, useRef } from 'react';
import {
  X, Github, ExternalLink, Brain, Cpu, Shield, Zap,
  MessageSquare, Database, Layers, ArrowRight, Code2
} from 'lucide-react';

/* ─────────────────── Project Data ─────────────────── */
const PROJECTS = [
  {
    id: 'eva',
    title: 'EVA v9.6.2',
    subtitle: 'Agentic AI Framework',
    category: 'AI / Personal R&D',
    emoji: '🤖',
    accent: '#6366f1',
    accentHover: '#4338ca',
    cardClass: 'bg-slate-900 text-white',
    tagClass: 'bg-slate-700 text-slate-200',
    shortDesc:
      'Advanced autonomous AI agent built on Registry-Centric Governance principles — memory systems, orchestration, and autonomous task execution.',
    github: 'https://github.com/Freshair129/agentic_agent',
    tech: ['Python', 'LLM', 'RAG', 'Memory Systems', 'Orchestration', 'EVA Matrix', 'JavaScript'],
    highlights: [
      { Icon: Brain, label: 'Memory & Soul Passport', desc: 'Persistent identity and long-term memory architecture across sessions.' },
      { Icon: Cpu, label: 'Resonance Memory System', desc: 'Multi-layer memory with context-aware retrieval and prioritization.' },
      { Icon: Shield, label: 'Registry-Centric Governance', desc: 'Structured protocol versioning and configuration management (8-8-8 Protocol).' },
      { Icon: Zap, label: 'Autonomous Orchestration', desc: 'Manages cognitive states, tool selection, and dynamic context switching.' },
    ],
    stats: [
      { label: 'Architecture', value: 'Multi-Agent' },
      { label: 'Language', value: 'Python 92%' },
      { label: 'Version', value: 'v9.6.2' },
    ],
    modalGradient: 'from-indigo-900 via-slate-900 to-slate-900',
    accentBg: 'bg-indigo-600',
    accentText: 'text-indigo-400',
    accentBorder: 'border-indigo-500/30',
    accentTagBg: 'bg-indigo-950 text-indigo-300 border border-indigo-500/20',
  },
  {
    id: 'crm',
    title: 'V School CRM v2',
    subtitle: 'Thai Cooking School Platform',
    category: 'Full-Stack / SaaS',
    emoji: '📊',
    accent: '#0ea5e9',
    accentHover: '#0369a1',
    cardClass: 'bg-white text-slate-900',
    tagClass: 'bg-slate-100 text-slate-700',
    shortDesc:
      'CRM for The V School Bangkok — unified inbox with real-time multi-channel messaging (Meta, LINE, Web), AI insights powered by Google Gemini, and Redis queue system.',
    github: 'https://github.com/Freshair129/crmapp',
    tech: ['Next.js 14', 'PostgreSQL', 'Redis', 'BullMQ', 'Google Gemini', 'Prisma', 'TailwindCSS', 'Meta API'],
    highlights: [
      { Icon: MessageSquare, label: 'Unified Inbox', desc: 'Centralized messages across Meta, LINE, and web in < 200ms ingestion time.' },
      { Icon: Database, label: 'Redis Cache Layer', desc: 'Cache-aside pattern for high-performance, low-latency data access.' },
      { Icon: Brain, label: 'AI-Powered Insights', desc: 'Google Gemini integration for automated customer behaviour analysis.' },
      { Icon: Layers, label: '36 ADRs Documented', desc: 'Well-architected system with comprehensive Architecture Decision Records.' },
    ],
    stats: [
      { label: 'Stack', value: 'Next.js 14' },
      { label: 'Commits', value: '165+' },
      { label: 'Version', value: 'v0.13.0' },
    ],
    modalGradient: 'from-sky-900 via-slate-900 to-slate-900',
    accentBg: 'bg-sky-500',
    accentText: 'text-sky-400',
    accentBorder: 'border-sky-500/30',
    accentTagBg: 'bg-sky-950 text-sky-300 border border-sky-500/20',
  },
];

/* ─────────────────── Scroll Reveal Hook ─────────────────── */
function useScrollReveal(threshold = 0.15) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); obs.disconnect(); } },
      { threshold }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);
  return [ref, visible];
}

/* ─────────────────── Case Study Modal ─────────────────── */
function CaseStudyModal({ project, onClose }) {
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-[200] flex items-end md:items-center justify-center p-0 md:p-6"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      style={{ background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)' }}
    >
      <div
        className="relative w-full md:max-w-3xl max-h-[95vh] overflow-y-auto rounded-t-[2.5rem] md:rounded-[2.5rem] shadow-2xl"
        style={{ background: '#0f172a', animation: 'slideUpModal 0.4s cubic-bezier(0.16,1,0.3,1) both' }}
      >
        <div className={`relative bg-gradient-to-br ${project.modalGradient} p-8 pb-12 rounded-t-[2.5rem]`}>
          <button
            onClick={onClose}
            className="absolute top-5 right-5 w-10 h-10 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center text-white transition-all"
          >
            <X size={20} />
          </button>
          <div className="flex items-center gap-3 mb-4">
            <span className="text-3xl">{project.emoji}</span>
            <span className={`text-xs font-black uppercase tracking-widest px-3 py-1 rounded-full ${project.accentBg} text-white`}>
              {project.category}
            </span>
          </div>
          <h2 className="text-3xl md:text-4xl font-black text-white mb-1">{project.title}</h2>
          <p className={`font-bold text-lg ${project.accentText}`}>{project.subtitle}</p>
        </div>

        <div className="p-8 space-y-8 -mt-6">
          <div className={`bg-white/5 border ${project.accentBorder} rounded-2xl p-6`}>
            <p className="text-slate-300 leading-relaxed text-base">{project.shortDesc}</p>
          </div>
          <div className="grid grid-cols-3 gap-4">
            {project.stats.map((s) => (
              <div key={s.label} className="bg-white/5 rounded-2xl p-4 text-center">
                <p className={`text-xl font-black ${project.accentText}`}>{s.value}</p>
                <p className="text-slate-500 text-xs font-bold uppercase tracking-wide mt-1">{s.label}</p>
              </div>
            ))}
          </div>
          <div>
            <h3 className="text-xs font-black uppercase tracking-widest text-slate-500 mb-4">Key Features</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {project.highlights.map(({ Icon, label, desc }) => (
                <div key={label} className={`bg-white/5 border ${project.accentBorder} rounded-2xl p-5 flex gap-4`}>
                  <div className={`w-10 h-10 shrink-0 rounded-xl flex items-center justify-center ${project.accentBg} bg-opacity-80`}>
                    <Icon size={18} className="text-white" />
                  </div>
                  <div>
                    <p className="text-white font-bold text-sm mb-1">{label}</p>
                    <p className="text-slate-400 text-xs leading-relaxed">{desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div>
            <h3 className="text-xs font-black uppercase tracking-widest text-slate-500 mb-3">Tech Stack</h3>
            <div className="flex flex-wrap gap-2">
              {project.tech.map((t) => (
                <span key={t} className={`px-3 py-1.5 rounded-full text-xs font-bold ${project.accentTagBg}`}>{t}</span>
              ))}
            </div>
          </div>
          <a
            href={project.github}
            target="_blank"
            rel="noopener noreferrer"
            className={`flex items-center justify-center gap-3 w-full py-4 rounded-2xl font-black text-white transition-all hover:-translate-y-0.5 shadow-lg ${project.accentBg}`}
          >
            <Github size={20} /> View on GitHub <ExternalLink size={16} />
          </a>
        </div>
      </div>
      <style>{`
        @keyframes slideUpModal {
          from { transform: translateY(60px); opacity: 0; }
          to   { transform: translateY(0);   opacity: 1; }
        }
      `}</style>
    </div>
  );
}

/* ─────────────────── Project Card ─────────────────── */
function ProjectCard({ project, index, onClick }) {
  const [ref, visible] = useScrollReveal(0.1);
  const isEven = index % 2 === 0;
  return (
    <div
      ref={ref}
      onClick={onClick}
      className={`group relative cursor-pointer overflow-hidden rounded-[2rem] shadow-xl transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl ${project.cardClass} ${visible ? 'opacity-100 translate-y-0' : `opacity-0 ${isEven ? '-translate-x-8' : 'translate-x-8'}`}`}
      style={{ transitionDelay: `${index * 120}ms` }}
    >
      <div className="absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-500 rounded-[2rem]"
        style={{ background: `radial-gradient(circle at 50% 0%, ${project.accent}, transparent 70%)` }}
      />
      <div className="p-8 md:p-10 flex flex-col h-full min-h-[320px]">
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center gap-3">
            <span className="text-4xl">{project.emoji}</span>
            <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full ${project.tagClass}`}>{project.category}</span>
          </div>
          <div className="w-10 h-10 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 group-hover:rotate-45"
            style={{ background: project.accent }}>
            <ArrowRight size={18} className="text-white" />
          </div>
        </div>
        <h3 className="text-2xl md:text-3xl font-black mb-1">{project.title}</h3>
        <p className="font-bold text-sm mb-4" style={{ color: project.accent }}>{project.subtitle}</p>
        <p className={`leading-relaxed text-sm flex-1 ${project.id === 'eva' ? 'text-slate-400' : 'text-slate-600'}`}>{project.shortDesc}</p>
        <div className="mt-8 flex items-center justify-between">
          <div className="flex flex-wrap gap-2">
            {project.tech.slice(0, 3).map((t) => (
              <span key={t} className={`px-2.5 py-1 text-[10px] font-black uppercase rounded-lg ${project.tagClass}`}>{t}</span>
            ))}
            {project.tech.length > 3 && (
              <span className={`px-2.5 py-1 text-[10px] font-black uppercase rounded-lg ${project.tagClass}`}>+{project.tech.length - 3}</span>
            )}
          </div>
          <span className="text-xs font-black uppercase tracking-wide flex items-center gap-1" style={{ color: project.accent }}>
            Case Study <ArrowRight size={12} />
          </span>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────── Main Section Export ─────────────────── */
export default function ProjectsSection() {
  const [active, setActive] = useState(null);
  const [headerRef, headerVisible] = useScrollReveal(0.2);

  return (
    <section id="projects" className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-6">
        <div
          ref={headerRef}
          className={`text-center mb-16 transition-all duration-700 ${headerVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
        >
          <div className="inline-flex items-center gap-2 bg-slate-100 text-slate-600 px-4 py-1.5 rounded-full text-sm font-bold mb-4">
            <Code2 size={16} /> Dev Projects
          </div>
          <h2 className="text-4xl md:text-5xl font-black text-slate-900">Things I've Built</h2>
          <p className="text-slate-500 mt-4 max-w-lg mx-auto">ผลงาน Dev จริงที่สร้างเอง — คลิกเพื่อดูรายละเอียด</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {PROJECTS.map((p, i) => (
            <ProjectCard key={p.id} project={p} index={i} onClick={() => setActive(p)} />
          ))}
        </div>
      </div>
      {active && <CaseStudyModal project={active} onClose={() => setActive(null)} />}
    </section>
  );
}
