import { lazy, Suspense, useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Link, NavLink, useLocation } from 'react-router-dom';
import { Globe, Menu, X } from 'lucide-react';
import { MotionConfig } from 'motion/react';
import { useLanguage } from './LanguageContext';
import { HomePage, ProjectsPage, ProjectDetailPage, ResumePage, AboutPage, ContactPage, PrivacyPage, NotFoundPage } from './features/portfolio/PortfolioPages';
import './features/portfolio/portfolio.css';

const Portfolio = lazy(() => import('./Portfolio'));
const Gallery = lazy(() => import('./Gallery'));
const ProjectDemo = import.meta.env.DEV ? lazy(() => import('./ProjectDemo')) : null;
const ChatbotWidget = lazy(() => import('./chatbot/ChatbotWidget'));
// Old factual biographies remain available for local review, outside the public bundle.
const LegacyHome = import.meta.env.DEV ? lazy(() => import('./LegacyHome')) : null;
const LegacyResume = import.meta.env.DEV ? lazy(() => import('./Resume')) : null;

function LegacyNotice({ children, factual = false }) {
  const { language } = useLanguage();
  return <><aside className="pk-legacy-notice">{language === 'th' ? 'แฟ้มผลงานเดิม · ข้อมูลและคำกล่าวอ้างยังไม่ผ่านการทบทวนสำหรับคลังความรู้ใหม่' : 'Original portfolio archive · content and claims have not been reviewed for the new knowledge base.'} <Link to="/projects">{language === 'th' ? 'ดูกรณีศึกษาที่เผยแพร่' : 'View published case studies'}</Link></aside>{factual && !import.meta.env.DEV ? <section className="pk-container pk-section"><h1>{language === 'th' ? 'ประวัติเดิมอยู่ระหว่างทบทวน' : 'Legacy biography under review'}</h1><p>{language === 'th' ? 'องค์ประกอบเดิมถูกเก็บไว้สำหรับการตรวจสอบในเครื่อง หน้าสาธารณะแสดงเฉพาะข้อมูลที่อนุมัติแล้ว' : 'Original components are preserved for local review. Public resume pages show approved records only.'}</p><Link className="pk-button" to="/resume">{language === 'th' ? 'เปิดเรซูเม่ปัจจุบัน' : 'Open canonical resume'}</Link></section> : children}</>;
}

function Site() {
  const { language, toggleLanguage } = useLanguage();
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();
  const links = [['/', 'หน้าหลัก', 'Home'], ['/projects', 'โปรเจกต์', 'Projects'], ['/resume', 'เรซูเม่', 'Resume'], ['/about', 'เกี่ยวกับ', 'About'], ['/contact', 'ติดต่อ', 'Contact']];
  useEffect(() => {
    document.title = 'PORNPON | AI Automation & Agentic Systems';
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [location.pathname]);
  return <div className="pk-site">
    <a className="pk-skip-link" href="#main-content">{language === 'th' ? 'ข้ามไปเนื้อหา' : 'Skip to content'}</a>
    <header className="pk-header"><div className="pk-container pk-nav">
      <Link className="pk-brand" to="/" aria-label="PORNPON home">PORNPON<span>.T</span></Link>
      <nav aria-label={language === 'th' ? 'เมนูหลัก' : 'Main navigation'} className={menuOpen ? 'pk-nav-links is-open' : 'pk-nav-links'} id="main-navigation" onKeyDown={event => { if (event.key === 'Escape') setMenuOpen(false); }}>
        {links.map(([to, th, en]) => <NavLink end={to === '/'} key={to} to={to} onClick={() => setMenuOpen(false)}>{language === 'th' ? th : en}</NavLink>)}
      </nav>
      <div className="pk-nav-controls"><button className="pk-language" onClick={toggleLanguage} aria-label={language === 'th' ? 'Switch to English' : 'เปลี่ยนเป็นภาษาไทย'}><Globe size={16} aria-hidden="true" />{language === 'th' ? 'EN' : 'ไทย'}</button><button className="pk-menu-toggle" aria-controls="main-navigation" aria-expanded={menuOpen} aria-label={language === 'th' ? 'เมนู' : 'Menu'} onClick={() => setMenuOpen(value => !value)}>{menuOpen ? <X size={22} /> : <Menu size={22} />}</button></div>
    </div></header>
    <main id="main-content" tabIndex={-1}><Suspense fallback={<p className="pk-container pk-section" role="status">{language === 'th' ? 'กำลังโหลด…' : 'Loading…'}</p>}>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/projects" element={<ProjectsPage />} />
        <Route path="/projects/:slug" element={<ProjectDetailPage />} />
        <Route path="/resume" element={<ResumePage />} />
        <Route path="/resume/:variantSlug" element={<ResumePage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/privacy" element={<PrivacyPage />} />
        <Route path="/portfolio" element={<LegacyNotice><Portfolio /></LegacyNotice>} />
        <Route path="/gallery" element={<Gallery />} />
        <Route path="/demo" element={<LegacyNotice factual>{ProjectDemo && <ProjectDemo />}</LegacyNotice>} />
        <Route path="/legacy/home" element={<LegacyNotice factual>{LegacyHome && <LegacyHome />}</LegacyNotice>} />
        <Route path="/legacy/resume/:variantSlug?" element={<LegacyNotice factual>{LegacyResume && <LegacyResume />}</LegacyNotice>} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Suspense></main>
    <footer className="pk-footer"><div className="pk-container"><Link className="pk-brand" to="/">PORNPON<span>.T</span></Link><nav aria-label={language === 'th' ? 'เมนูท้ายหน้า' : 'Footer navigation'}><Link to="/portfolio">{language === 'th' ? 'ผลงานสื่อ' : 'Media archive'}</Link><Link to="/gallery">{language === 'th' ? 'แกลเลอรี' : 'Gallery'}</Link><Link to="/demo">{language === 'th' ? 'เดโมเดิม' : 'Original demo'}</Link><Link to="/privacy">{language === 'th' ? 'ความเป็นส่วนตัว' : 'Privacy'}</Link></nav><p>{language === 'th' ? 'ข้อมูลที่เผยแพร่ · หลักฐานที่ตรวจสอบได้' : 'Published knowledge. Traceable evidence.'}</p></div></footer>
    <Suspense fallback={null}><ChatbotWidget /></Suspense>
  </div>;
}

export default function App() { return <MotionConfig reducedMotion="user"><BrowserRouter><Site /></BrowserRouter></MotionConfig>; }
