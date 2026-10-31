import { lazy, Suspense, useEffect, useRef, useState } from 'react';
import { BrowserRouter, Routes, Route, Link, NavLink, useLocation } from 'react-router-dom';
import { Globe, Menu, X } from 'lucide-react';
import { LazyMotion, MotionConfig, domAnimation, m, useScroll } from 'motion/react';
import { useLanguage } from './LanguageContext';
import { PortfolioArchivePage, WorkDetailPage } from './features/portfolio/IntelligencePortfolio';
import QuietPortfolioHome from './features/portfolio/QuietPortfolioHome';
import './features/portfolio/portfolio.css';
import './features/portfolio/intelligence.css';
import './features/portfolio/quiet.css';

const Portfolio = lazy(() => import('./Portfolio'));
const Gallery = lazy(() => import('./Gallery'));
const ProjectsPage = lazy(() => import('./features/portfolio/PortfolioPages').then(module => ({ default: module.ProjectsPage })));
const ProjectDetailPage = lazy(() => import('./features/portfolio/PortfolioPages').then(module => ({ default: module.ProjectDetailPage })));
const ResumePage = lazy(() => import('./features/portfolio/PortfolioPages').then(module => ({ default: module.ResumePage })));
const AboutPage = lazy(() => import('./features/portfolio/PortfolioPages').then(module => ({ default: module.AboutPage })));
const ContactPage = lazy(() => import('./features/portfolio/PortfolioPages').then(module => ({ default: module.ContactPage })));
const PrivacyPage = lazy(() => import('./features/portfolio/PortfolioPages').then(module => ({ default: module.PrivacyPage })));
const NotFoundPage = lazy(() => import('./features/portfolio/PortfolioPages').then(module => ({ default: module.NotFoundPage })));
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
  const menuButton = useRef(null);
  const { scrollYProgress } = useScroll();
  const location = useLocation();
  const links = [['/portfolio', 'ผลงาน', 'Work'], ['/#about', 'เกี่ยวกับ', 'About']];
  useEffect(() => {
    if (!location.pathname.startsWith('/work/')) document.title = `${location.pathname === '/portfolio' ? 'Work in Context' : 'Intelligence in Motion'} | PORNPON`;
    if (location.hash) {
      const frame = requestAnimationFrame(() => document.getElementById(location.hash.slice(1))?.scrollIntoView({ behavior: 'instant' }));
      return () => cancelAnimationFrame(frame);
    }
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [location.pathname, location.hash]);
  return <div className="pk-site">
    <a className="pk-skip-link" href="#main-content">{language === 'th' ? 'ข้ามไปเนื้อหา' : 'Skip to content'}</a>
    <header className="pk-header"><div className="pk-container pk-nav">
      <Link className="pk-brand" to="/" aria-label="PORNPON home">Pornpon<span>.</span></Link>
      <nav aria-label={language === 'th' ? 'เมนูหลัก' : 'Main navigation'} className={menuOpen ? 'pk-nav-links is-open' : 'pk-nav-links'} id="main-navigation" onKeyDown={event => { if (event.key === 'Escape') { setMenuOpen(false); menuButton.current?.focus(); } }}>
        {links.map(([to, th, en]) => <NavLink end key={to} to={to} onClick={() => setMenuOpen(false)} className={({ isActive }) => isActive && !to.includes('#') ? 'active' : undefined}>{language === 'th' ? th : en}</NavLink>)}
        <NavLink to="/contact" onClick={() => setMenuOpen(false)}>{language === 'th' ? 'ติดต่อ' : 'Contact'}</NavLink>
      </nav>
      <div className="pk-nav-controls"><button className="pk-language" onClick={toggleLanguage} aria-label={language === 'th' ? 'EN · Switch to English' : 'TH · เปลี่ยนเป็นภาษาไทย'}><Globe size={13} aria-hidden="true" />{language === 'th' ? 'EN' : 'TH'}</button><button ref={menuButton} className="pk-menu-toggle" aria-controls="main-navigation" aria-expanded={menuOpen} aria-label={language === 'th' ? 'เมนู' : 'Menu'} onClick={() => setMenuOpen(value => !value)}>{menuOpen ? <X size={20} /> : <Menu size={20} />}</button></div>
    </div><m.div className="im-scroll-progress" style={{ scaleX: scrollYProgress }} aria-hidden="true" /></header>
    <main id="main-content" tabIndex={-1}><Suspense fallback={<p className="pk-container pk-section" role="status">{language === 'th' ? 'กำลังโหลด…' : 'Loading…'}</p>}>
      <Routes>
        <Route path="/" element={<QuietPortfolioHome />} />
        <Route path="/portfolio" element={<PortfolioArchivePage />} />
        <Route path="/work/:slug" element={<WorkDetailPage />} />
        <Route path="/projects" element={<ProjectsPage />} />
        <Route path="/projects/:slug" element={<ProjectDetailPage />} />
        <Route path="/resume" element={<ResumePage />} />
        <Route path="/resume/:variantSlug" element={<ResumePage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/privacy" element={<PrivacyPage />} />
        <Route path="/media" element={<LegacyNotice><Portfolio /></LegacyNotice>} />
        <Route path="/gallery" element={<Gallery />} />
        <Route path="/demo" element={<LegacyNotice factual>{ProjectDemo && <ProjectDemo />}</LegacyNotice>} />
        <Route path="/legacy/home" element={<LegacyNotice factual>{LegacyHome && <LegacyHome />}</LegacyNotice>} />
        <Route path="/legacy/resume/:variantSlug?" element={<LegacyNotice factual>{LegacyResume && <LegacyResume />}</LegacyNotice>} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Suspense></main>
    <footer className="pk-footer"><div className="pk-container"><Link className="pk-brand" to="/">Pornpon<span>.</span></Link><nav aria-label={language === 'th' ? 'เมนูท้ายหน้า' : 'Footer navigation'}><Link to="/portfolio">{language === 'th' ? 'ผลงานทั้งหมด' : 'All work'}</Link><Link to="/media">{language === 'th' ? 'ผลงานสื่อ' : 'Media archive'}</Link><Link to="/gallery">{language === 'th' ? 'แกลเลอรี' : 'Gallery'}</Link><Link to="/resume">{language === 'th' ? 'เรซูเม่' : 'Resume'}</Link><Link to="/privacy">{language === 'th' ? 'ความเป็นส่วนตัว' : 'Privacy'}</Link></nav><p>{language === 'th' ? 'แนวคิด ระบบ และมุมมองระหว่างทาง' : 'Systems, ideas, and perspectives along the way.'}</p></div></footer>
    <Suspense fallback={null}><ChatbotWidget /></Suspense>
  </div>;
}

export default function App() { return <MotionConfig reducedMotion="user"><LazyMotion features={domAnimation}><BrowserRouter><Site /></BrowserRouter></LazyMotion></MotionConfig>; }
