import React, { useState, useEffect } from 'react';
import {
  BrowserRouter as Router, Routes, Route, Link
} from 'react-router-dom';
import {
  Phone, Mail, MapPin, GraduationCap, Briefcase, Code, Brain, Star,
  CheckCircle2, ChevronRight, Menu, X, Cpu, Check, Camera, Video, Users, Car, FileText, ExternalLink
} from 'lucide-react';
import Resume from './Resume';
import heroBg from './assets/hero-bg.jpg';

const MainPortfolio = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const experiences = [
    {
      title: "Assistant Manager",
      company: "Hostpital Feelgood Club",
      period: "2025 (6 Months)",
      type: "Full-Time",
      desc: "ดูแลภาพรวมของร้านและเป็น MC ควบคุมกิจกรรมทั้งหมด จัดแจงงานให้กับทีม Service, ทีมการ์ด และทีม Host (PR) รวมถึงทำ CRM และแก้ปัญหาเฉพาะหน้าให้แก่ลูกค้า",
      IconComponent: Star,
      iconColor: "text-yellow-500"
    },
    {
      title: "Event Project Coordinator",
      company: "Joe Luxury Car Service",
      period: "2024 (1 Year)",
      type: "Contract",
      desc: "รับผิดชอบดูแลประสานงานทีมภาคสนามและลูกค้า VIP วางแผนจัดการทรัพยากร (คน, รถ, เวลา) และทำหน้าที่เป็นตัวแทนทีมในการติดต่อสื่อสารตอบสนองความต้องการลูกค้า",
      IconComponent: Car,
      iconColor: "text-blue-500"
    },
    {
      title: "Content Creator",
      company: "Saint Thonglor Clinic",
      period: "2020 - 2022",
      type: "Permanent",
      desc: "วางแผนคอนเทนต์รายวัน/สัปดาห์/เดือน วางแผนถ่ายทำ ประสานงานกับทีมแพทย์และทีม Digital Marketing ภายนอกเพื่อให้ผลงานออกมาตรงตามเป้าหมาย",
      IconComponent: Video,
      iconColor: "text-purple-500"
    },
    {
      title: "Content Creator",
      company: "U-Turn Shop",
      period: "2020 - 2022",
      type: "Part-Time",
      desc: "วางแผนคอนเทนต์และถ่ายทำสื่อโปรโมทสินค้า ประสานงานร่วมกับทีมช่าง รวมถึงดูแลและให้คำปรึกษาแก่ทีม Admin เพื่อพัฒนาศักยภาพการบริการ",
      IconComponent: Users,
      iconColor: "text-orange-500"
    },
    {
      title: "Editor",
      company: "Punnisa Clinic",
      period: "2019 (1 Year)",
      type: "Contract",
      desc: "รับผิดชอบการตัดต่อและสร้างสรรค์คอนเทนต์ภาพเคลื่อนไหว (Motion Content) ทั้งหมดของคลินิก เพื่อสื่อสารแบรนด์ผ่านช่องทางดิจิทัล",
      IconComponent: Camera,
      iconColor: "text-teal-500"
    }
  ];

  return (
    <div className="min-h-screen bg-white selection:bg-blue-100 selection:text-blue-900">
      {/* Navigation */}
      <nav className={`fixed w-full z-50 transition-all duration-300 ${scrolled ? 'bg-white/80 backdrop-blur-md shadow-md py-3' : 'bg-transparent py-5'}`}>
        <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">
          <div className="text-xl font-black tracking-tighter text-blue-600">PORNPON.P</div>
          <div className="hidden md:flex space-x-8 items-center">
            <a href="#home" className="text-sm font-medium hover:text-blue-600 transition-colors">หน้าหลัก</a>
            <a href="#skills" className="text-sm font-medium hover:text-blue-600 transition-colors">ทักษะ</a>
            <a href="#experience" className="text-sm font-medium hover:text-blue-600 transition-colors">ประสบการณ์</a>
            <Link to="/resume" className="text-sm font-bold text-slate-900 hover:text-blue-600 transition-colors flex items-center gap-1">
              Resume <ExternalLink size={14} />
            </Link>
            <a href="#contact" className="bg-blue-600 text-white px-5 py-2 rounded-full text-sm font-bold hover:bg-blue-700 shadow-lg shadow-blue-200 transition-all hover:-translate-y-0.5">จ้างงานผม</a>
          </div>
          <button className="md:hidden text-slate-900" onClick={() => setIsMenuOpen(!isMenuOpen)}>
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden absolute top-full left-0 w-full bg-white border-b border-slate-100 p-6 flex flex-col gap-4 shadow-xl animate-in slide-in-from-top duration-300">
            <a href="#home" className="text-lg font-bold" onClick={() => setIsMenuOpen(false)}>หน้าหลัก</a>
            <a href="#skills" className="text-lg font-bold" onClick={() => setIsMenuOpen(false)}>ทักษะ</a>
            <a href="#experience" className="text-lg font-bold" onClick={() => setIsMenuOpen(false)}>ประสบการณ์</a>
            <Link to="/resume" className="text-lg font-bold" onClick={() => setIsMenuOpen(false)}>Resume</Link>
            <a href="#contact" className="bg-blue-600 text-white p-4 rounded-2xl text-center font-black" onClick={() => setIsMenuOpen(false)}>จ้างงานผม</a>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section id="home" className="relative pt-32 pb-20 md:pt-48 md:pb-32 overflow-hidden bg-white">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center gap-12 relative z-10">
          <div className="flex-1 text-center md:text-left space-y-6">
            <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-600 px-4 py-2 rounded-full text-sm font-bold">
              <span className="flex h-2 w-2 rounded-full bg-blue-600 animate-pulse"></span>
              Available for Work
            </div>
            <h1 className="text-5xl md:text-7xl font-black leading-tight text-slate-900">
              พรพล <span className="text-blue-600">ธนสุวรรณธาร</span>
            </h1>
            <p className="text-xl text-slate-600 max-w-xl mx-auto md:mx-0 leading-relaxed">
              Assistant Manager & Digital Content Specialist ผู้เชี่ยวชาญการบริหารจัดการทีม ผสมผสานเทคโนโลยี AI เพื่อยกระดับประสิทธิภาพงาน
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
              <a href="#experience" className="bg-slate-900 text-white px-8 py-4 rounded-2xl font-bold flex items-center justify-center gap-2 shadow-xl shadow-slate-200 hover:bg-slate-800 transition-all hover:-translate-y-1">
                ดูประสบการณ์ <ChevronRight size={18} />
              </a>
              <Link to="/resume" className="bg-white text-slate-900 border-2 border-slate-900 px-8 py-4 rounded-2xl font-bold flex items-center justify-center gap-2 shadow-xl shadow-slate-100 hover:bg-slate-50 transition-all hover:-translate-y-1">
                ดู Resume <FileText size={18} />
              </Link>
            </div>
          </div>
          <div className="flex-1 relative">
            <div className="w-64 h-64 md:w-96 md:h-96 mx-auto relative z-10 group">
              <div className="absolute inset-0 bg-blue-600 rounded-[3rem] rotate-6 group-hover:rotate-3 transition-transform duration-500"></div>
              <img
                src="https://i.postimg.cc/tTGwsnXb/518287125-10228728079362270-6514242073905598389-n.jpg"
                alt="Pornpon Thansuvanthanan"
                className="absolute inset-0 w-full h-full object-cover rounded-[3rem] -rotate-3 group-hover:rotate-0 transition-transform duration-500 border-4 border-white shadow-2xl"
                onError={(e) => { e.target.src = "https://via.placeholder.com/400?text=Pornpon+P." }}
              />
            </div>
            <div className="absolute -bottom-4 -right-4 md:bottom-10 md:-right-10 bg-white p-6 rounded-3xl shadow-2xl z-20 animate-bounce-slow">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center text-white">
                  <Brain size={24} />
                </div>
                <div className="text-left">
                  <div className="text-xs text-slate-400 font-bold uppercase">AI Specialist</div>
                  <div className="text-lg font-black text-slate-900">Agentic RAG</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Showcase Section */}
      <section className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="relative rounded-[3rem] overflow-hidden shadow-2xl group border-8 border-white">
            <img
              src={heroBg}
              alt="Highlight"
              className="w-full h-auto object-cover transition-transform duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-end p-12">
              <p className="text-white text-2xl font-black italic">"Crafting excellence through digital innovation."</p>
            </div>
          </div>
        </div>
      </section>

      {/* Skills Section */}
      <section id="skills" className="bg-slate-50 py-24">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-3xl md:text-5xl font-black text-center mb-16 text-slate-900">ทักษะและความสามารถ</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-slate-900 text-white p-8 rounded-[2rem] shadow-2xl transition-all hover:-translate-y-2 duration-500">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-blue-600 rounded-2xl"><Cpu /></div>
                <h3 className="text-2xl font-bold">AI Innovation</h3>
              </div>
              <div className="space-y-4">
                {["Prompt Engineering", "Context Engineering", "Agentic RAG", "AI Marketing"].map(s => (
                  <div key={s} className="flex justify-between items-center text-slate-300">
                    <span>{s}</span>
                    <CheckCircle2 size={14} className="text-blue-500" />
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-white p-8 rounded-[2rem] shadow-xl border border-slate-100 transition-all hover:-translate-y-2 duration-500">
              <div className="flex items-center gap-3 mb-6 text-slate-900">
                <div className="p-3 bg-slate-100 rounded-2xl"><Code /></div>
                <h3 className="text-2xl font-bold">Tools & Media</h3>
              </div>
              <div className="grid grid-cols-1 gap-4 text-slate-700 font-bold">
                {["Premiere Pro", "Photoshop", "Illustrator", "After Effects", "Canva"].map(s => (
                  <div key={s} className="flex items-center gap-3"><Check size={16} className="text-blue-600" /> {s}</div>
                ))}
              </div>
            </div>
            <div className="bg-white p-8 rounded-[2rem] shadow-xl border border-slate-100 transition-all hover:-translate-y-2 duration-500">
              <div className="flex items-center gap-3 mb-6 text-slate-900">
                <div className="p-3 bg-slate-100 rounded-2xl"><Star /></div>
                <h3 className="text-2xl font-bold">Core Skills</h3>
              </div>
              <div className="flex flex-wrap gap-2">
                {["Communication", "Teamwork", "Crisis Solving", "Growth Mindset", "Management"].map(s => (
                  <span key={s} className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-bold border border-blue-100">{s}</span>
                ))}
              </div>
              <div className="mt-8 pt-6 border-t border-slate-100 text-sm">
                <p className="font-bold text-slate-900">ม.รังสิต นิเทศศาสตร์</p>
                <p className="text-slate-500">มัธยม สวนกุหลาบวิทยาลัย</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Experience Section */}
      <section id="experience" className="py-24 max-w-4xl mx-auto px-6">
        <h2 className="text-4xl font-black text-center mb-16 text-slate-900">ประสบการณ์การทำงาน</h2>
        <div className="space-y-12">
          {experiences.map((exp, idx) => (
            <div key={idx} className="flex gap-6 group">
              <div className="flex flex-col items-center">
                <div className="w-12 h-12 bg-white border-2 border-slate-200 rounded-2xl flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-all shadow-lg text-slate-900">
                  <exp.IconComponent size={24} />
                </div>
                {idx !== experiences.length - 1 && <div className="w-0.5 h-full bg-slate-100 mt-4 group-hover:bg-blue-100"></div>}
              </div>
              <div className="pb-12">
                <div className="flex flex-wrap items-center gap-3 mb-2">
                  <h3 className="text-2xl font-bold group-hover:text-blue-600 transition-colors text-slate-900">{exp.title}</h3>
                  <span className="text-[10px] font-black uppercase bg-slate-100 px-2 py-1 rounded text-slate-500">{exp.type}</span>
                </div>
                <p className="text-blue-600 font-bold mb-4">{exp.company} • {exp.period}</p>
                <p className="text-slate-600 italic leading-relaxed text-lg">"{exp.desc}"</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Contact Section */}
      <footer id="contact" className="bg-slate-900 text-white py-20 px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
          <div className="space-y-8">
            <h2 className="text-4xl md:text-6xl font-black leading-tight text-center md:text-left">ร่วมงานกับผม<br /><span className="text-blue-500">คลิกเพื่อติดต่อ</span></h2>
            <div className="space-y-4">
              <a href="tel:0831840662" className="flex items-center gap-4 text-xl hover:text-blue-400 transition-colors"><Phone /> 083-184-0662</a>
              <a href="mailto:suanranger129@gmail.com" className="flex items-center gap-4 text-xl hover:text-blue-400 transition-colors"><Mail /> suanranger129@gmail.com</a>
              <p className="flex items-center gap-4 text-xl text-slate-400"><MapPin /> กรุงเทพมหานคร, ประเทศไทย</p>
            </div>
          </div>
          <div className="bg-white/5 p-10 rounded-[3rem] text-center space-y-4 backdrop-blur-sm">
            <p className="text-slate-400">ขอบคุณที่เยี่ยมชมประวัติการทำงานของผมครับ</p>
            <p className="text-xs text-slate-600 font-bold uppercase tracking-widest">© 2025 PORNPON.P - DIGITAL PORTFOLIO</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<MainPortfolio />} />
        <Route path="/resume" element={<Resume />} />
      </Routes>
    </Router>
  );
};

export default App;
