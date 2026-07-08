import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X, Globe, ArrowRight, MousePointerClick } from 'lucide-react';
import { useLanguage } from './LanguageContext';

// Swap these two imports to change the reveal pair.
// BASE = what you see first · REVEAL = what the cursor spotlight uncovers.
import BG_IMAGE_1 from './assets/hero-bg.jpg';
import BG_IMAGE_2 from './assets/profile.jpg';

const SPOTLIGHT_R = 260;

// ---- Spotlight reveal layer (canvas-driven mask) ----
function RevealLayer({ image, cursorX, cursorY }) {
  const canvasRef = useRef(null);
  const revealRef = useRef(null);

  useEffect(() => {
    const resize = () => {
      const c = canvasRef.current;
      if (!c) return;
      c.width = window.innerWidth;
      c.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);
    return () => window.removeEventListener('resize', resize);
  }, []);

  useEffect(() => {
    const c = canvasRef.current;
    const reveal = revealRef.current;
    if (!c || !reveal) return;
    const ctx = c.getContext('2d');
    ctx.clearRect(0, 0, c.width, c.height);

    const g = ctx.createRadialGradient(cursorX, cursorY, 0, cursorX, cursorY, SPOTLIGHT_R);
    g.addColorStop(0, 'rgba(255,255,255,1)');
    g.addColorStop(0.4, 'rgba(255,255,255,1)');
    g.addColorStop(0.6, 'rgba(255,255,255,0.75)');
    g.addColorStop(0.75, 'rgba(255,255,255,0.4)');
    g.addColorStop(0.88, 'rgba(255,255,255,0.12)');
    g.addColorStop(1, 'rgba(255,255,255,0)');

    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(cursorX, cursorY, SPOTLIGHT_R, 0, Math.PI * 2);
    ctx.fill();

    const url = c.toDataURL();
    reveal.style.maskImage = `url(${url})`;
    reveal.style.webkitMaskImage = `url(${url})`;
    reveal.style.maskSize = '100% 100%';
    reveal.style.webkitMaskSize = '100% 100%';
  }, [cursorX, cursorY]);

  return (
    <>
      <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none" style={{ display: 'none' }} />
      <div
        ref={revealRef}
        className="absolute inset-0 bg-center bg-cover bg-no-repeat z-30 pointer-events-none"
        style={{ backgroundImage: `url(${image})` }}
      />
    </>
  );
}

export default function HeroReveal() {
  const { language, toggleLanguage } = useLanguage();
  const isTH = language === 'th';

  const [cursorPos, setCursorPos] = useState({ x: -999, y: -999 });
  const [scrolled, setScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const mouse = useRef({ x: -999, y: -999 });
  const smooth = useRef({ x: -999, y: -999 });
  const rafRef = useRef(null);

  const onMove = useCallback((e) => {
    mouse.current = { x: e.clientX, y: e.clientY };
  }, []);

  useEffect(() => {
    window.addEventListener('mousemove', onMove);
    const loop = () => {
      smooth.current.x += (mouse.current.x - smooth.current.x) * 0.1;
      smooth.current.y += (mouse.current.y - smooth.current.y) * 0.1;
      setCursorPos({ x: smooth.current.x, y: smooth.current.y });
      rafRef.current = requestAnimationFrame(loop);
    };
    rafRef.current = requestAnimationFrame(loop);
    return () => {
      window.removeEventListener('mousemove', onMove);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [onMove]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const navLinks = [
    { label: isTH ? 'ผลงาน' : 'Work', href: '#home', active: true },
    { label: isTH ? 'ทักษะ' : 'Skills', href: '#skills' },
    { label: isTH ? 'ประสบการณ์' : 'Experience', href: '#experience' },
    { label: 'Projects', href: '#projects' },
  ];

  return (
    <div style={{ fontFamily: "'Inter', sans-serif" }}>
      {/* ---- Navigation ---- */}
      <nav className={`fixed top-0 left-0 right-0 z-[100] transition-all duration-300 ${scrolled ? 'bg-white/85 backdrop-blur-md shadow-sm py-3' : 'bg-transparent py-4 sm:py-5'}`}>
        <div className="flex items-center justify-between px-4 sm:px-6 max-w-[1400px] mx-auto">
          {/* Left: logo + wordmark */}
          <a href="#home" className="flex items-center gap-2.5">
            <svg width="24" height="24" viewBox="0 0 256 256" fill={scrolled ? '#0f172a' : '#ffffff'} className="transition-colors">
              <path d="M 256 256 L 128 256 L 0 128 L 128 128 Z M 256 128 L 128 128 L 0 0 L 128 0 Z" />
            </svg>
            <span className={`text-2xl font-playfair italic transition-colors ${scrolled ? 'text-slate-900' : 'text-white'}`}>Pornpon</span>
          </a>

          {/* Center pill */}
          <div className={`hidden md:flex absolute left-1/2 -translate-x-1/2 rounded-full px-2 py-2 items-center gap-1 border transition-colors ${scrolled ? 'bg-slate-900/5 border-slate-900/10' : 'bg-white/20 backdrop-blur-md border-white/30'}`}>
            {navLinks.map((l) => (
              <a
                key={l.label}
                href={l.href}
                className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                  l.active
                    ? (scrolled ? 'bg-slate-900 text-white' : 'bg-white text-slate-900')
                    : (scrolled ? 'text-slate-600 hover:bg-slate-900/10 hover:text-slate-900' : 'text-white/80 hover:bg-white/20 hover:text-white')
                }`}
              >
                {l.label}
              </a>
            ))}
            <Link
              to="/portfolio"
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${scrolled ? 'text-slate-600 hover:bg-slate-900/10 hover:text-slate-900' : 'text-white/80 hover:bg-white/20 hover:text-white'}`}
            >
              Portfolio
            </Link>
          </div>

          {/* Right (desktop) */}
          <div className="hidden md:flex items-center gap-3">
            <button
              onClick={toggleLanguage}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-full text-xs font-semibold transition-colors ${scrolled ? 'bg-slate-100 text-slate-700 hover:bg-slate-200' : 'bg-white/20 text-white hover:bg-white/30 backdrop-blur-md'}`}
            >
              <Globe size={14} /> {language.toUpperCase()}
            </button>
            <a
              href="#contact"
              className={`text-sm font-semibold px-6 py-2.5 rounded-full transition-colors ${scrolled ? 'bg-slate-900 text-white hover:bg-slate-800' : 'bg-white text-gray-900 hover:bg-gray-100'}`}
            >
              {isTH ? 'ร่วมงาน' : 'Hire Me'}
            </a>
          </div>

          {/* Mobile hamburger */}
          <button
            className={`md:hidden transition-colors ${scrolled ? 'text-slate-900' : 'text-white'}`}
            onClick={() => setIsMenuOpen((v) => !v)}
            aria-label="Toggle menu"
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile menu */}
        {isMenuOpen && (
          <div className="md:hidden mx-4 mt-2 bg-white rounded-2xl border border-slate-100 p-5 flex flex-col gap-3 shadow-xl">
            {navLinks.map((l) => (
              <a key={l.label} href={l.href} className="text-lg font-semibold text-slate-900" onClick={() => setIsMenuOpen(false)}>{l.label}</a>
            ))}
            <Link to="/portfolio" className="text-lg font-semibold text-slate-900" onClick={() => setIsMenuOpen(false)}>Portfolio</Link>
            <Link to="/resume" className="text-lg font-semibold text-slate-900" onClick={() => setIsMenuOpen(false)}>{isTH ? 'เรซูเม่' : 'Resume'}</Link>
            <button onClick={() => { toggleLanguage(); setIsMenuOpen(false); }} className="flex items-center gap-2 text-lg font-semibold text-slate-900">
              <Globe size={20} /> {isTH ? 'English' : 'ไทย'}
            </button>
            <a href="#contact" className="bg-slate-900 text-white text-center font-bold py-3 rounded-xl" onClick={() => setIsMenuOpen(false)}>{isTH ? 'ร่วมงาน' : 'Hire Me'}</a>
          </div>
        )}
      </nav>

      {/* ---- Hero ---- */}
      <section id="home" className="relative w-full overflow-hidden h-screen bg-black" style={{ height: '100dvh' }}>
        {/* Base image */}
        <div
          className="absolute inset-0 bg-center bg-cover bg-no-repeat z-10 hero-zoom"
          style={{ backgroundImage: `url(${BG_IMAGE_1})` }}
        />
        {/* Legibility vignette */}
        <div className="absolute inset-0 z-20 pointer-events-none" style={{ background: 'linear-gradient(to bottom, rgba(0,0,0,0.45) 0%, rgba(0,0,0,0.15) 30%, rgba(0,0,0,0.2) 60%, rgba(0,0,0,0.6) 100%)' }} />

        {/* Reveal layer */}
        <RevealLayer image={BG_IMAGE_2} cursorX={cursorPos.x} cursorY={cursorPos.y} />

        {/* Heading */}
        <div className="absolute top-[14%] left-0 right-0 flex flex-col items-center text-center px-5 z-50 pointer-events-none">
          <h1 className="text-white leading-[0.95]">
            <span className="block font-playfair italic font-normal text-5xl sm:text-7xl md:text-8xl hero-anim hero-reveal" style={{ letterSpacing: '-0.05em', animationDelay: '0.25s' }}>
              Every surface
            </span>
            <span className="block font-normal text-5xl sm:text-7xl md:text-8xl -mt-1 hero-anim hero-reveal" style={{ letterSpacing: '-0.08em', animationDelay: '0.42s' }}>
              hides a system
            </span>
          </h1>
          <div className="hero-anim hero-fade mt-6 flex items-center gap-2 text-white/70 text-xs sm:text-sm" style={{ animationDelay: '1s' }}>
            <MousePointerClick size={15} className="hero-hint" />
            <span>{isTH ? 'ปัดเมาส์เพื่อเผยอีกด้าน' : 'move your cursor to reveal'}</span>
          </div>
        </div>

        {/* Bottom-left paragraph */}
        <div className="hidden sm:block absolute bottom-14 left-10 md:left-14 max-w-[280px] z-50 hero-anim hero-fade" style={{ animationDelay: '0.7s' }}>
          <p className="text-sm text-white/80 leading-relaxed">
            {isTH
              ? 'Creative Technologist ที่เชื่อมการตลาด คอนเทนต์ และวิศวกรรม AI เข้าด้วยกัน — สี่ปีของการเปลี่ยนไอเดียให้กลายเป็นระบบจริง'
              : 'Creative Technologist bridging marketing, content, and AI engineering — four years turning ideas into living systems.'}
          </p>
        </div>

        {/* Bottom-right block */}
        <div className="absolute bottom-10 sm:bottom-24 left-5 right-5 sm:left-auto sm:right-10 md:right-14 max-w-full sm:max-w-[280px] flex flex-col items-start gap-4 sm:gap-5 z-50 hero-anim hero-fade" style={{ animationDelay: '0.85s' }}>
          <p className="text-xs sm:text-sm text-white/80 leading-relaxed">
            {isTH
              ? 'จากแคมเปญคลินิก สู่แพลตฟอร์ม AI แบบ multi-agent และฐานข้อมูล Rust — สำรวจผลงานที่อยู่เบื้องหลังพื้นผิว'
              : 'From clinic campaigns to multi-agent AI platforms and a Rust database — explore the work that lives beneath the surface.'}
          </p>
          <Link
            to="/resume"
            className="bg-[#2563eb] hover:bg-[#1d4ed8] text-white text-sm font-medium px-7 py-3 rounded-full transition-all hover:scale-[1.03] active:scale-95 hover:shadow-lg hover:shadow-[#2563eb]/30 flex items-center gap-2"
          >
            {isTH ? 'ดู Resume' : 'View Resume'} <ArrowRight size={16} />
          </Link>
        </div>
      </section>
    </div>
  );
}
