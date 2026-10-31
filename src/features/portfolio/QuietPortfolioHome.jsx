import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowDown, ArrowUpRight, Pause, Play } from 'lucide-react';
import { useLanguage } from '../../LanguageContext';
import { usePublicData } from './usePublicData';
import { featuredPortfolioProjects, portfolioProjects, safePublicUrl } from './publicData.mjs';
import { scrollProgress } from './sceneMotion.mjs';

const shots = [
  { label: 'Form', thLabel: 'แนวคิด', title: 'Ideas, made tangible.', thTitle: 'เมื่อแนวคิด เริ่มมีรูปทรง', line: 'A practice in systems, software & possibility.', thLine: 'สำรวจระบบ ซอฟต์แวร์ และความเป็นไปได้' },
  { label: 'Connection', thLabel: 'เชื่อมต่อ', title: 'Space for connection.', thTitle: 'เว้นที่ให้สิ่งต่าง ๆ เชื่อมกัน', line: 'Consider the parts. Find the relationships.', thLine: 'เข้าใจแต่ละส่วน มองเห็นความสัมพันธ์' },
  { label: 'Perspective', thLabel: 'มุมมอง', title: 'A different perspective.', thTitle: 'มองระบบ จากอีกมุมหนึ่ง', line: 'Thoughtful systems. Work you can explore.', thLine: 'ระบบที่คิดอย่างใส่ใจ ผลงานที่เปิดให้สำรวจ' },
];

function ScrollSculpture({ th }) {
  const section = useRef(null), host = useRef(null), controller = useRef(null);
  const latest = useRef(0);
  const [reduced, setReduced] = useState(() => window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  const [motionOff, setMotionOff] = useState(() => Boolean(navigator.connection?.saveData));
  const [state, setState] = useState('poster');
  const [active, setActive] = useState(0);
  const [capture, setCapture] = useState('');
  const enabled = !reduced && !motionOff;
  useEffect(() => {
    const preference = window.matchMedia('(prefers-reduced-motion: reduce)');
    const change = () => setReduced(preference.matches);
    preference.addEventListener('change', change);
    return () => preference.removeEventListener('change', change);
  }, []);
  useEffect(() => {
    if (!enabled) return;
    let cancelled = false, renderer;
    const mount = async () => {
      try {
        const { createSculpture } = await import('./sculptureScene');
        if (cancelled) return;
        renderer = createSculpture(host.current, { onReady: () => setState('ready'), onError: () => setState('fallback') });
        controller.current = renderer;
        renderer.setProgress(latest.current);
      } catch { if (!cancelled) setState('fallback'); }
    };
    // The matching poster is the initial composition. Load the renderer only
    // when a visitor starts exploring, keeping shader work out of initial paint.
    let idle, started = false;
    const element = section.current;
    const begin = () => {
      if (started || cancelled) return;
      const rect = element.getBoundingClientRect();
      if (rect.bottom < 0 || rect.top > window.innerHeight) return;
      started = true;
      idle = window.requestIdleCallback ? window.requestIdleCallback(mount, { timeout: 250 }) : setTimeout(mount, 0);
      window.removeEventListener('scroll', begin);
      element.removeEventListener('pointerdown', begin);
      element.removeEventListener('wheel', begin);
    };
    window.addEventListener('scroll', begin, { passive: true });
    element.addEventListener('pointerdown', begin, { passive: true });
    element.addEventListener('wheel', begin, { passive: true });
    if (import.meta.env.DEV && new URLSearchParams(location.search).has('capture-scene')) begin();
    return () => {
      cancelled = true;
      if (window.cancelIdleCallback) window.cancelIdleCallback(idle); else clearTimeout(idle);
      window.removeEventListener('scroll', begin); element.removeEventListener('pointerdown', begin); element.removeEventListener('wheel', begin);
      renderer?.dispose(); controller.current = null; setState('poster');
    };
  }, [enabled]);
  useEffect(() => {
    const element = section.current;
    let raf = 0, top = 0, height = 0, viewport = 0, header = 72;
    const measure = () => {
      top = element.getBoundingClientRect().top + window.scrollY;
      height = element.offsetHeight; viewport = window.innerHeight;
      header = document.querySelector('.pk-header')?.offsetHeight || 72; update();
    };
    const update = () => {
      raf = 0;
      const progress = enabled ? scrollProgress(window.scrollY, top, height, viewport, header) : 0;
      latest.current = progress;
      element.style.setProperty('--film-progress', progress);
      setActive(Math.min(2, Math.floor(progress * 3)));
      const visible = window.scrollY < top + height && window.scrollY + viewport > top;
      controller.current?.setActive(visible);
      controller.current?.setProgress(progress);
    };
    const scroll = () => { if (!raf) raf = requestAnimationFrame(update); };
    const resize = new ResizeObserver(measure); resize.observe(element);
    window.addEventListener('scroll', scroll, { passive: true });
    window.addEventListener('resize', measure);
    measure();
    return () => { resize.disconnect(); cancelAnimationFrame(raf); window.removeEventListener('scroll', scroll); window.removeEventListener('resize', measure); };
  }, [enabled]);
  const choose = index => {
    const element = section.current;
    const top = element.getBoundingClientRect().top + window.scrollY;
    const header = document.querySelector('.pk-header')?.offsetHeight || 72;
    const travel = element.offsetHeight - window.innerHeight + header;
    window.scrollTo({ top: Math.max(0, top - header + travel * [0, .5, 1][index]), behavior: reduced ? 'instant' : 'smooth' });
  };
  return <section ref={section} className={`ql-film${enabled ? '' : ' ql-film-static'}`} aria-label={th ? 'มุมมองที่เปลี่ยนไปตามการเลื่อน' : 'A study in perspective'} data-motion={enabled ? 'on' : 'off'} data-shot={active}>
    <div className="ql-film-sticky">
      <div className="ql-film-top"><span>{th ? 'ระบบ · ซอฟต์แวร์ · ความเป็นไปได้' : 'Systems · Software · Possibility'}</span><span>Portfolio / 2026</span></div>
      <div className="ql-film-art" data-state={enabled ? state : 'poster'}>
        <picture className="ql-film-poster"><source media="(max-width: 700px)" srcSet="/media/quiet/sculpture-mobile.webp" /><img src="/media/quiet/sculpture-0.webp" alt="" fetchPriority="high" width="1200" height="1000" /></picture>
        <div className="ql-sculpture" ref={host} aria-hidden="true" />
      </div>
      <div className="ql-film-captions">
        {shots.map((shot, index) => <div className={`ql-shot${index === active ? ' is-active' : ''}`} key={shot.label} aria-hidden={index !== active}>
          <span className="ql-eyebrow">{String(index + 1).padStart(2, '0')} — {th ? shot.thLabel : shot.label}</span>
          {index === 0 ? <h1>{th ? shot.thTitle : shot.title}</h1> : <h2>{th ? shot.thTitle : shot.title}</h2>}
          <p>{th ? shot.thLine : shot.line}</p>
          <a href="#selected-work" tabIndex={index === active ? 0 : -1} className="ql-text-link">{th ? 'ชมผลงานที่คัดสรร' : 'Explore selected work'}<ArrowUpRight size={16} /></a>
        </div>)}
      </div>
      <div className="ql-film-bottom"><a href="#selected-work" className="ql-scroll-cue">{th ? 'เลื่อนเพื่อเปลี่ยนมุมมอง' : 'Scroll for a different view'}<ArrowDown size={14} /></a>
        {enabled && <nav className="ql-shot-controls" aria-label={th ? 'เลือกมุมมอง' : 'Choose a perspective'}>{shots.map((shot, index) => <button key={shot.label} aria-label={`${String(index + 1).padStart(2, '0')} — ${th ? shot.thLabel : shot.label}`} aria-pressed={active === index} onClick={() => choose(index)}><span>{String(index + 1).padStart(2, '0')}</span><i /></button>)}</nav>}
        <button className="ql-motion-toggle" disabled={reduced} onClick={() => setMotionOff(value => !value)} aria-pressed={enabled} aria-label={reduced ? (th ? 'โมชั่นปิดตามการตั้งค่าระบบ' : 'Reduced motion follows system preference') : enabled ? (th ? 'ปิดโมชั่น' : 'Disable motion') : (th ? 'เปิดโมชั่น' : 'Enable motion')}>{enabled ? <Pause size={12} /> : <Play size={12} />}<span>{th ? 'โมชั่น' : 'Motion'}</span></button>
      </div>
      {import.meta.env.DEV && new URLSearchParams(location.search).has('capture-scene') && <div style={{ position: 'absolute', top: 60, left: 20, zIndex: 5, fontSize: 12 }}><button onClick={() => setCapture(controller.current?.capture() || '')}>Capture sculpture</button>{capture && <a href={capture} download="sculpture.webp" style={{ marginLeft: 15 }}>Download sculpture</a>}</div>}
    </div>
  </section>;
}

export default function QuietPortfolioHome() {
  const { language } = useLanguage(), th = language === 'th';
  const resource = usePublicData('/api/portfolio');
  const projects = portfolioProjects(resource.data);
  const featured = featuredPortfolioProjects(resource.data);
  const github = safePublicUrl(resource.data?.githubUrl || resource.data?.ownerUrl);
  return <div className="ql-home"><ScrollSculpture th={th} />
    <section className="ql-work ql-container" id="selected-work" aria-labelledby="selected-title">
      <div className="ql-section-heading"><div><span className="ql-eyebrow">{th ? 'แฟ้มที่คัดสรร' : 'The selected collection'}</span><h2 id="selected-title">{th ? 'ผลงานบางส่วน' : 'Selected work.'}</h2></div><Link className="ql-text-link" to="/portfolio">{th ? 'ดูทั้งหมด' : 'View the collection'}{projects.length ? ` (${projects.length})` : ''}<ArrowUpRight size={16} /></Link></div>
      {resource.loading ? <p role="status" className="ql-empty">{th ? 'กำลังโหลดผลงาน…' : 'Loading the collection…'}</p> : resource.error ? <div className="ql-empty" role="status"><h3>{th ? 'ยังโหลดผลงานไม่ได้ในขณะนี้' : 'The work will be back shortly.'}</h3><button className="ql-text-link" onClick={resource.retry}>{th ? 'ลองใหม่' : 'Try again'}</button></div> : !featured.length ? <div className="ql-empty"><h3>{th ? 'กำลังเตรียมเนื้อหาที่ผ่านการอนุมัติ' : 'Awaiting approved content'}</h3><Link to="/gallery" className="ql-text-link">{th ? 'ชมภาพถ่าย' : 'Explore photography'}<ArrowUpRight size={16} /></Link></div> : <div className="ql-project-grid">{featured.map((project, index) => <article key={project.slug} className={`ql-project ql-project-${index}`}>
        <Link to={`/work/${encodeURIComponent(project.slug)}`} className="ql-project-image" aria-label={`${th ? 'ภาพแนวคิด' : 'Visual study'} / ${String(index + 1).padStart(2, '0')} — ${th ? 'สำรวจ' : 'Explore'} ${project.name}`}><img src={`/media/quiet/sculpture-${index % 3}.webp`} alt="" width="1200" height="1000" loading="lazy" /><span className="ql-art-label">{th ? 'ภาพแนวคิด' : 'Visual study'} / {String(index + 1).padStart(2, '0')}</span><span className="ql-project-arrow"><ArrowUpRight size={22} /></span></Link>
        <div className="ql-project-info"><div><span>{(project.technologies?.length ? project.technologies : [project.language]).filter(Boolean).slice(0, 2).join(' / ')}</span><h3><Link to={`/work/${encodeURIComponent(project.slug)}`}>{project.name}</Link></h3></div><span className="ql-project-number">{String(index + 1).padStart(2, '0')}</span></div>
      </article>)}</div>}
      {!!projects.length && <p className="ql-evidence-note">{th ? 'อ้างอิงต้นฉบับสาธารณะจาก GitHub · ดูหลักฐานและขอบเขตในแต่ละโปรเจกต์' : 'Public GitHub sources. Evidence and scope inside each study.'}</p>}
    </section>
    <section className="ql-about ql-container" id="about"><span className="ql-eyebrow">{th ? 'แนวทาง' : 'A considered practice'}</span><div><h2>{th ? 'ให้ความซับซ้อน\nอยู่เบื้องหลังความเรียบง่าย' : 'Complexity,\nwith a sense of calm.'}</h2><p>{th ? 'พื้นที่เล็ก ๆ สำหรับระบบที่กำลังสร้าง แนวคิดที่กำลังทดลอง และมุมมองระหว่างทาง' : 'A collection of systems, ongoing experiments, and perspectives along the way.'}</p><div className="ql-about-links"><Link to="/gallery" className="ql-text-link">{th ? 'ภาพถ่าย' : 'Photography'}<ArrowUpRight size={15} /></Link><Link to="/about" className="ql-text-link">{th ? 'เกี่ยวกับ' : 'About'}<ArrowUpRight size={15} /></Link></div></div></section>
    <section className="ql-contact ql-container" id="contact"><div><span className="ql-eyebrow">{th ? 'บทสนทนาถัดไป' : 'The next conversation'}</span><h2>{th ? 'เริ่มต้น จากไอเดียหนึ่ง' : 'Something in mind?'}</h2></div><div className="ql-contact-links">{github && <a className="ql-text-link" href={github} target="_blank" rel="noopener noreferrer">GitHub<ArrowUpRight size={17} /></a>}<Link className="ql-text-link" to="/contact">{th ? 'ติดต่อ' : 'Get in touch'}<ArrowUpRight size={17} /></Link></div></section>
  </div>;
}
