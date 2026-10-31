import { useEffect, useId, useRef, useState } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { ArrowRight, ArrowUpRight, ExternalLink, Github, Plus, Search, X } from 'lucide-react';
import { useLanguage } from '../../LanguageContext';
import { usePublicData } from './usePublicData';
import ZuriLineLink from './ZuriLineLink';
import { filterPortfolioProjects, localized, portfolioCategories, portfolioProjects, publicEvidence, safePublicUrl } from './publicData.mjs';

const pad = value => String(value).padStart(2, '0');
function useWords() {
  const { language } = useLanguage();
  return { language, th: language === 'th', word: (en, thai) => language === 'th' ? thai : en };
}

function SourceLink({ href, className = '', children }) {
  const url = safePublicUrl(href);
  if (!url) return null;
  return <a href={url} className={className} target={url.startsWith('https:') ? '_blank' : undefined} rel="noopener noreferrer">{children}</a>;
}

function CatalogState({ resource, empty, compact = false }) {
  const { word } = useWords();
  if (resource.loading) return <div className={`im-state ${compact ? 'im-state-compact' : ''}`} role="status"><span className="im-status-dot" /><p>{word('Loading the public collection…', 'กำลังโหลดแฟ้มผลงานสาธารณะ…')}</p></div>;
  if (resource.error) return <div className="im-state" role="status"><span className="im-mono">COLLECTION / TEMPORARILY UNAVAILABLE</span><h3>{word('The work will be back shortly.', 'ยังโหลดผลงานไม่ได้ในขณะนี้')}</h3><p>{word('The public collection could not be loaded. You can still explore the site and photography archive.', 'โหลดแฟ้มผลงานสาธารณะไม่ได้ชั่วคราว คุณยังสำรวจเว็บไซต์และแกลเลอรีได้')}</p><button className="im-button im-button-outline" onClick={resource.retry}>{word('Try again', 'ลองใหม่')}<ArrowRight size={17} /></button></div>;
  if (empty) return <div className="im-state"><span className="im-mono">COLLECTION / IN REVIEW</span><h3>{word('Awaiting approved content', 'กำลังเตรียมเนื้อหาที่ผ่านการอนุมัติ')}</h3><p>{word('Projects appear here once their public sources and publication have been reviewed.', 'โปรเจกต์จะแสดงเมื่อแหล่งอ้างอิงสาธารณะและการเผยแพร่ได้รับการทบทวนแล้ว')}</p><Link className="im-inline-link" to="/gallery">{word('Explore photography', 'ชมภาพถ่าย')}<ArrowUpRight size={17} /></Link></div>;
  return null;
}

function NetworkObject({ compact = false, variant = 0, className = '' }) {
  const id = useId().replace(/:/g, '');
  const nodes = [
    [400, 88], [620, 180], [695, 340], [555, 490], [320, 515], [118, 365], [155, 175],
    [400, 300], [300, 195], [510, 225], [515, 390], [290, 400], [258, 292], [405, 448],
  ];
  const edges = [[0, 1], [0, 6], [0, 8], [0, 9], [1, 2], [1, 9], [1, 10], [2, 3], [2, 10], [3, 4], [3, 10], [3, 13], [4, 5], [4, 11], [4, 13], [5, 6], [5, 11], [5, 12], [6, 8], [6, 12], [7, 8], [7, 9], [7, 10], [7, 11], [7, 12], [7, 13], [8, 9], [8, 12], [9, 10], [10, 13], [11, 12], [11, 13]];
  return <svg className={`im-network ${compact ? 'im-network-compact' : ''} ${className}`} viewBox="0 0 800 600" fill="none" aria-hidden="true">
    <defs><radialGradient id={`${id}-glow`}><stop stopColor="currentColor" stopOpacity=".13" /><stop offset="1" stopColor="currentColor" stopOpacity="0" /></radialGradient><linearGradient id={`${id}-line`} x1="100" y1="60" x2="700" y2="540" gradientUnits="userSpaceOnUse"><stop stopColor="currentColor" stopOpacity=".08" /><stop offset=".5" stopColor="currentColor" stopOpacity=".6" /><stop offset="1" stopColor="currentColor" stopOpacity=".08" /></linearGradient></defs>
    <circle cx="400" cy="300" r="270" fill={`url(#${id}-glow)`} />
    <g className="im-network-orbits" stroke={`url(#${id}-line)`} strokeWidth=".65">
      {[0, 30, 60, 90, 120, 150].map(angle => <ellipse key={angle} cx="400" cy="300" rx="260" ry={variant % 2 ? '100' : '155'} transform={`rotate(${angle} 400 300)`} />)}
      <circle cx="400" cy="300" r="260" /><circle cx="400" cy="300" r="195" strokeDasharray="2 9" /><circle cx="400" cy="300" r="92" />
    </g>
    <g stroke="currentColor" strokeOpacity=".32" strokeWidth=".75">{edges.map(([a, b], index) => <path key={index} d={`M${nodes[a][0]} ${nodes[a][1]} L${nodes[b][0]} ${nodes[b][1]}`} className={index % 5 === 0 ? 'im-signal-path' : ''} />)}</g>
    <g>{nodes.map(([cx, cy], index) => <g key={index}><circle cx={cx} cy={cy} r={index === 7 ? 17 : 4} fill="var(--im-bg)" stroke="currentColor" strokeOpacity={index === 7 ? '1' : '.7'} /><circle cx={cx} cy={cy} r={index === 7 ? 6 : 1.5} fill="currentColor" /></g>)}</g>
    <g stroke="currentColor" strokeOpacity=".25"><path d="M400 5V45M400 555V595M15 300H65M735 300H785" /><path d="M70 80h18m-9-9v18M710 510h18m-9-9v18" /></g>
    <g fill="currentColor" fontFamily="var(--im-mono)" fontSize="9" letterSpacing="1.4"><text x="400" y="33" textAnchor="middle">INPUT / IDEAS</text><text x="400" y="579" textAnchor="middle">OUTPUT / SYSTEMS</text><text x="636" y="165">CONNECT</text><text x="78" y="156">THINK</text><text x="574" y="505">EXECUTE</text></g>
  </svg>;
}

function useArtworkVisibility() {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return undefined;
    // Only decorative SVG nodes are deferred. Their fixed-size canvas, label and
    // illustration disclosure remain in the document and the accessibility tree.
    if (!('IntersectionObserver' in window)) {
      const frame = requestAnimationFrame(() => setVisible(true));
      return () => cancelAnimationFrame(frame);
    }
    const observer = new IntersectionObserver(entries => {
      if (entries.some(entry => entry.isIntersecting)) {
        setVisible(true);
        observer.disconnect();
      }
    }, { rootMargin: '500px' });
    observer.observe(canvas);
    return () => observer.disconnect();
  }, []);
  return { ref, visible };
}

function ProjectArtwork({ project, index = 0, large = false }) {
  const { word } = useWords();
  const { ref, visible } = useArtworkVisibility();
  const mode = /fung|audio|voice/i.test(`${project.name} ${project.category}`) ? 'wave' : /database|genesis|data/i.test(`${project.name} ${project.category}`) ? 'database' : index % 2 ? 'network' : 'system';
  return <figure className={`im-project-art im-art-${mode}${large ? ' im-art-large' : ''}`}>
    <div className="im-art-top"><span>{project.name}</span><span>STUDY / {pad(index + 1)}</span></div>
    <div className="im-art-canvas" ref={ref}>{visible && (mode === 'network' ? <NetworkObject compact variant={index} /> : <svg viewBox="0 0 800 520" fill="none" aria-hidden="true">
      <g stroke="currentColor" strokeOpacity=".12">{[100, 200, 300, 400, 500, 600, 700].map(value => <path key={value} d={`M${value} 0V520`} />)}{[60, 160, 260, 360, 460].map(value => <path key={value} d={`M0 ${value}H800`} />)}</g>
      {mode === 'wave' ? <><g stroke="currentColor" strokeWidth="2">{Array.from({ length: 75 }, (_, i) => { const amplitude = 12 + Math.pow(Math.sin(i * .24), 2) * 130 * Math.sin((i + 1) / 76 * Math.PI); return <path key={i} d={`M${66 + i * 9} ${260 - amplitude}v${amplitude * 2}`} opacity={i > 27 && i < 49 ? '.9' : '.28'} />; })}</g><circle cx="400" cy="260" r="175" stroke="currentColor" strokeOpacity=".25" /><path d="M400 62V458" stroke="currentColor" strokeDasharray="3 8" strokeOpacity=".35" /><rect x="330" y="430" width="140" height="28" fill="var(--im-art-bg)" stroke="currentColor" strokeOpacity=".3" /><text x="400" y="449" fill="currentColor" textAnchor="middle" fontFamily="var(--im-mono)" fontSize="9" letterSpacing="2">SIGNAL → CONTEXT</text></> : mode === 'database' ? <><g transform="translate(400 260)">{[-120, -60, 0, 60, 120].map((offset, i) => <g key={offset} transform={`translate(0 ${offset})`}><path d="M0 -65L180 0 0 65 -180 0Z" fill="var(--im-art-bg)" fillOpacity=".65" stroke="currentColor" strokeOpacity={.3 + i * .13} /><path d="M-180 0v18L0 83 180 18V0" stroke="currentColor" strokeOpacity=".2" /><path d="M-90 -32L90 32M90 -32L-90 32" stroke="currentColor" strokeOpacity=".15" /><circle cx="0" cy="0" r="4" fill="currentColor" /></g>)}</g><path d="M400 45V475M195 260H605" stroke="currentColor" strokeDasharray="2 8" strokeOpacity=".35" /></> : <><g transform="translate(400 260)">{[0, 60, 120].map(angle => <g key={angle} transform={`rotate(${angle})`}><rect x="-145" y="-145" width="290" height="290" rx="2" stroke="currentColor" strokeOpacity=".5" /><rect x="-100" y="-100" width="200" height="200" stroke="currentColor" strokeOpacity=".18" /></g>)}<circle r="74" fill="var(--im-art-bg)" stroke="currentColor" /><circle r="52" stroke="currentColor" strokeDasharray="1 8" /><path d="M-20 0h40M0 -20v40" stroke="currentColor" /></g></>}
      <g fill="currentColor" fontSize="9" fontFamily="var(--im-mono)" letterSpacing="1.5"><text x="45" y="43">STRUCTURE / PROCESS / CONNECTION</text><text x="750" y="485" textAnchor="end">{project.language || 'SOFTWARE'} / {project.headSha ? project.headSha.slice(0, 7) : 'PUBLIC SOURCE'}</text></g>
    </svg>)}</div>
    <figcaption><span className="im-mini-cross" aria-hidden="true">+</span>{word('Illustrative visualization · not a product screenshot', 'ภาพประกอบแนวคิด · ไม่ใช่ภาพหน้าจอผลิตภัณฑ์')}</figcaption>
  </figure>;
}

function RepositoryKind({ project }) {
  const { word } = useWords();
  return <span className={`im-repo-kind ${project.archived ? 'is-archived' : ''}`}>{project.archived ? word('Archived', 'เก็บถาวร') : project.fork ? word('Fork', 'Fork') : project.kind === 'empty' || !project.headSha ? word('Repository', 'Repository') : word('Public source', 'ต้นฉบับสาธารณะ')}</span>;
}

export function PortfolioArchivePage() {
  const { word } = useWords();
  const resource = usePublicData('/api/portfolio');
  const [params, setParams] = useSearchParams();
  const query = params.get('q') || '';
  const category = params.get('category') || '';
  const kind = params.get('kind') || '';
  const projects = portfolioProjects(resource.data);
  const categories = portfolioCategories(resource.data);
  const filtered = filterPortfolioProjects(projects, { query, category, kind });
  const coverage = resource.data?.coverage;
  const update = (key, value) => { const next = new URLSearchParams(window.location.search); value ? next.set(key, value) : next.delete(key); setParams(next, { replace: true }); };
  return <div className="im-archive im-container"><div className="im-archive-head"><p className="im-kicker">{word('PUBLIC REPOSITORIES', 'แฟ้มผลงานสาธารณะ')}</p><h1>{word('The collection.', 'แฟ้มผลงาน')}<sup>{pad(projects.length)}</sup></h1><div className="im-archive-intro"><p>{word('Systems, applications, experiments and tools. Browse the public collection by discipline, or follow a particular thread.', 'ระบบ แอปพลิเคชัน การทดลอง และเครื่องมือ สำรวจแฟ้มสาธารณะตามสาขาหรือหัวข้อที่สนใจ')}</p><span className="im-mono">{word('PUBLIC SOURCES. EXPLICIT LIMITS.', 'ต้นฉบับสาธารณะ ข้อจำกัดที่ชัดเจน')}</span></div></div><div className="zuri-page-cta"><ZuriLineLink /></div><div className="im-archive-filterbar"><label className="im-search"><Search size={18} aria-hidden="true" /><span className="sr-only">{word('Search repositories', 'ค้นหา repositories')}</span><input type="search" placeholder={word('Find a project, technology or idea…', 'ค้นหาโปรเจกต์ เทคโนโลยี หรือแนวคิด…')} value={query} onChange={event => update('q', event.target.value)} />{query && <button aria-label={word('Clear search', 'ล้างคำค้น')} onClick={() => update('q', '')}><X size={18} /></button>}</label><label className="im-kind-filter"><span>{word('Show', 'แสดง')}</span><select value={kind} onChange={event => update('kind', event.target.value)}><option value="">{word('All repositories', 'ทุก repository')}</option><option value="original">{word('Active, not marked as forks', 'ไม่เก็บถาวรและไม่ใช่ fork')}</option><option value="archived">{word('Archived', 'เก็บถาวร')}</option><option value="fork">{word('Forks', 'Fork')}</option></select></label></div><div className="im-category-filters" aria-label={word('Filter by category', 'กรองตามหมวดหมู่')}><button aria-pressed={!category} onClick={() => update('category', '')}>{word('All work', 'ทั้งหมด')}<span>{projects.length}</span></button>{categories.map(item => <button key={item.id} aria-pressed={category === item.id} onClick={() => update('category', item.id)}>{item.label}<span>{item.count}</span></button>)}</div><CatalogState resource={resource} empty={!projects.length} />{!!projects.length && <><div className="im-results-meta"><p role="status">{word(`${filtered.length} of ${projects.length} repositories`, `${filtered.length} จาก ${projects.length} repositories`)}</p>{(query || category || kind) && <button onClick={() => { const next = new URLSearchParams(window.location.search); ['q', 'category', 'kind'].forEach(key => next.delete(key)); setParams(next, { replace: true }); }}>{word('Reset filters', 'ล้างตัวกรอง')}<X size={13} /></button>}</div>{filtered.length ? <div className="im-repo-list">{filtered.map((project, index) => <article className="im-repo-row" key={project.slug}><span className="im-repo-index">{pad(index + 1)}</span><div className="im-repo-main"><div className="im-repo-labels"><span>{categories.find(item => item.id === project.category)?.label || project.category}</span><RepositoryKind project={project} /></div><h2><Link to={`/work/${encodeURIComponent(project.slug)}`}>{project.name}<ArrowUpRight size={25} /></Link></h2><p>{project.summary || project.description || word('A public repository. Open the study for the source inspection and its limits.', 'Repository สาธารณะ เปิดเพื่อดูข้อมูลต้นฉบับและขอบเขตการตรวจสอบ')}</p></div><div className="im-repo-side"><div className="im-micro-tags">{(project.technologies?.length ? project.technologies : [project.language]).filter(Boolean).slice(0, 3).map(technology => <span key={technology}>{technology}</span>)}</div><SourceLink href={project.url} className="im-repo-source">GitHub<ExternalLink size={13} /></SourceLink></div><Link to={`/work/${encodeURIComponent(project.slug)}`} className="im-repo-open" aria-label={`${word('Read study:', 'อ่านกรณีศึกษา:')} ${project.name}`}><ArrowUpRight size={25} /></Link></article>)}</div> : <div className="im-state"><h2>{word('No projects on this path.', 'ไม่พบโปรเจกต์ที่ตรงกับตัวกรอง')}</h2><p>{word('Try another term or reset the filters to explore the full collection.', 'ลองคำค้นอื่นหรือล้างตัวกรองเพื่อดูผลงานทั้งหมด')}</p></div>}</>}<div className="im-archive-provenance"><span className="im-mono">ABOUT THIS COLLECTION</span><p>{word('Repository ownership is verified. Personal contributions, deployment status and business outcomes require separate evidence. Archived, forked, empty and upstream-derived repositories are described individually.', 'ตรวจสอบความเป็นเจ้าของ repository แล้ว แต่บทบาทส่วนบุคคล สถานะการเปิดใช้งาน และผลลัพธ์ทางธุรกิจต้องมีหลักฐานเพิ่มเติม แต่ละรายการระบุข้อจำกัดของตนเอง')}</p>{coverage && <p className="im-mono">{word('Published here', 'เผยแพร่ในหน้านี้')}: {projects.length}{Number.isInteger(coverage.publicCount) && ` / ${coverage.publicCount} ${word('public repositories audited', 'repositories สาธารณะในรายการตรวจสอบ')}`}{resource.data?.verifiedAt && ` · ${word('Audit', 'ตรวจสอบ')}: ${String(resource.data.verifiedAt).slice(0, 10)}`}</p>}<Link className="im-inline-link" to="/media">{word('Explore the original media archive', 'สำรวจแฟ้มสื่อเดิม')}<ArrowUpRight size={17} /></Link></div></div>;
}

function NarrativeSection({ number, title, content, fallback, children }) {
  const { language } = useLanguage();
  return <section className="im-case-section"><div><span className="im-mono">{number}</span><h2>{title}</h2></div><div className="im-case-section-body">{content && <p>{typeof content === 'string' ? content : localized(content, language)}</p>}{!content && fallback && <p className="im-muted">{fallback}</p>}{children}</div></section>;
}

export function WorkDetailPage() {
  const { slug } = useParams();
  const { word } = useWords();
  const resource = usePublicData('/api/portfolio');
  const projects = portfolioProjects(resource.data);
  const project = projects.find(item => item.slug === slug);
  const categories = portfolioCategories(resource.data);
  const evidence = publicEvidence(project);
  useEffect(() => { if (project) document.title = `${project.name} — Repository study | PORNPON`; }, [project]);
  if (!project) return <div className="im-container im-case-empty"><Link className="im-inline-link" to="/portfolio">← {word('Back to all work', 'กลับไปดูผลงานทั้งหมด')}</Link><CatalogState resource={resource} />{!resource.loading && !resource.error && <div className="im-state"><h1>{word('This study is not published.', 'กรณีศึกษานี้ยังไม่เผยแพร่')}</h1><p>{word('Explore the approved public collection for available projects.', 'สำรวจรายการสาธารณะที่อนุมัติแล้วเพื่อดูโปรเจกต์ที่เปิดอ่านได้')}</p><Link className="im-button im-button-accent" to="/portfolio">{word('Explore the collection', 'สำรวจแฟ้มผลงาน')}<ArrowRight size={18} /></Link></div>}</div>;
  const roleText = project.role?.text || word('Repository ownership is verified; personal contributions are not yet reviewed.', 'ตรวจสอบความเป็นเจ้าของ repository แล้ว บทบาทส่วนบุคคลยังไม่ผ่านการทบทวน');
  const roleVerified = project.role?.status === 'verified';
  const next = projects[(projects.indexOf(project) + 1) % projects.length];
  return <article className="im-case"><div className="im-container im-case-head"><Link className="im-inline-link" to="/portfolio">← {word('All work', 'ผลงานทั้งหมด')}</Link><div className="im-case-eyebrow"><span>{categories.find(item => item.id === project.category)?.label || project.category}</span><RepositoryKind project={project} /><span>REPOSITORY STUDY</span></div><h1>{project.name}</h1><p className="im-case-summary">{project.summary || project.description || word('A source-backed view of this public repository.', 'ข้อมูลจากต้นฉบับของ repository สาธารณะนี้')}</p><div className="im-case-meta"><div><span>REPOSITORY</span><SourceLink href={project.url}>{project.repository || project.name}<ArrowUpRight size={15} /></SourceLink></div><div><span>{word('SOURCE REVISION', 'เวอร์ชันต้นฉบับ')}</span><strong>{project.headSha?.slice(0, 12) || word('No commit available', 'ไม่มี commit')}</strong></div><div><span>{word('VERIFIED ON', 'วันที่ตรวจสอบ')}</span><strong>{project.verifiedAt ? String(project.verifiedAt).slice(0, 10) : word('See source evidence', 'ดูหลักฐานต้นฉบับ')}</strong></div></div></div><div className="im-container"><ProjectArtwork project={project} index={Math.max(0, projects.indexOf(project))} large /></div><div className="im-container im-case-content"><aside className="im-case-sidebar"><span className="im-mono">IN THIS STUDY</span><a href="#case-challenge">{word('Challenge & approach', 'โจทย์และแนวทาง')}</a><a href="#case-architecture">{word('Architecture & implementation', 'สถาปัตยกรรมและการพัฒนา')}</a><a href="#case-evidence">{word('Evidence & outcome', 'หลักฐานและผลลัพธ์')}</a><SourceLink href={project.url} className="im-inline-link">GitHub<ArrowUpRight size={15} /></SourceLink></aside><div className="im-case-narrative"><div className={`im-role-note${roleVerified ? ' is-verified' : ''}`}><span className="im-mono">{roleVerified ? word('REVIEWED ROLE', 'บทบาทที่ทบทวนแล้ว') : word('CONTRIBUTION / NOT YET REVIEWED', 'บทบาทส่วนบุคคล / ยังไม่ทบทวน')}</span><p>{roleText}</p></div><div id="case-challenge"><NarrativeSection number="01" title={word('The challenge', 'โจทย์')} content={project.challenge} fallback={word('A detailed problem statement has not been approved for this repository.', 'ยังไม่มีโจทย์ฉบับละเอียดที่อนุมัติสำหรับ repository นี้')} /><NarrativeSection number="02" title={word('Constraints', 'ขอบเขตและข้อจำกัด')} content={project.constraints || (Array.isArray(project.verification?.notes) ? project.verification.notes.join('\n\n') : '') || word('This study describes inspected repository material. Source inspection does not establish production deployment, benchmark results, commercial outcomes or the owner’s individual contribution.', 'กรณีศึกษานี้อธิบายต้นฉบับที่ตรวจสอบ การอ่านซอร์สไม่ได้ยืนยันการเปิดใช้งานจริง ผล benchmark ผลทางธุรกิจ หรือบทบาทส่วนบุคคลของเจ้าของ')} /><NarrativeSection number="03" title={word('The approach', 'แนวทาง')} content={project.approach} fallback={word('Read the linked source for the documented approach. No additional approach claim is published yet.', 'อ่านแนวทางที่มีเอกสารรองรับจากลิงก์ต้นฉบับ ยังไม่เผยแพร่คำอธิบายเพิ่มเติม')} /></div><div id="case-architecture"><NarrativeSection number="04" title={word('Architecture', 'สถาปัตยกรรม')} content={project.architecture} fallback={word('Architecture details are not yet documented in this study.', 'ยังไม่มีรายละเอียดสถาปัตยกรรมในกรณีศึกษานี้')}><div className="im-micro-tags">{(project.technologies || []).map(technology => <span key={technology}>{technology}</span>)}</div></NarrativeSection><NarrativeSection number="05" title={word('Implementation', 'การพัฒนา')} content={project.implementation} fallback={word('Implementation scope requires further source review.', 'ขอบเขตการพัฒนาต้องตรวจสอบต้นฉบับเพิ่มเติม')} /></div><div id="case-evidence"><NarrativeSection number="06" title={word('The evidence', 'หลักฐาน')}><div className="im-evidence-list">{evidence.length ? evidence.map((item, index) => <SourceLink key={`${item.url}-${index}`} href={item.url} className="im-evidence-item"><span className="im-evidence-index">{pad(index + 1)}</span><div><strong>{item.label}</strong><small>{item.kind || 'SOURCE'}</small></div><ExternalLink size={18} /></SourceLink>) : <p>{word('No additional evidence links are published yet.', 'ยังไม่มีลิงก์หลักฐานเพิ่มเติมที่เผยแพร่')}</p>}</div>{project.verification?.notes?.length > 0 && <details className="im-verification-notes"><summary>{word('Source inspection notes', 'บันทึกการตรวจสอบต้นฉบับ')}<Plus size={16} /></summary>{(Array.isArray(project.verification.notes) ? project.verification.notes : [project.verification.notes]).map((note, index) => <p key={index}>{note}</p>)}</details>}</NarrativeSection><NarrativeSection number="07" title={word('Outcome', 'ผลลัพธ์')} content={project.outcome} fallback={word('No independently verified outcome is published for this project.', 'ยังไม่มีผลลัพธ์ที่ตรวจสอบอย่างอิสระและเผยแพร่สำหรับโปรเจกต์นี้')} /><NarrativeSection number="08" title={word('Lessons & next questions', 'บทเรียนและคำถามต่อไป')} content={project.lessons} fallback={word('A personal retrospective awaits contribution review.', 'บทเรียนส่วนบุคคลรอการทบทวนบทบาทในการพัฒนา')} /></div></div></div>{next && next.slug !== project.slug && <div className="im-case-next"><div className="im-container"><span className="im-mono">{word('KEEP EXPLORING', 'สำรวจต่อ')}</span><Link to={`/work/${encodeURIComponent(next.slug)}`}><span>{next.name}</span><ArrowUpRight size={64} /></Link><Link className="im-inline-link" to="/portfolio">{word('Return to the complete collection', 'กลับไปแฟ้มผลงานทั้งหมด')}<ArrowRight size={16} /></Link></div></div>}</article>;
}

export function VerifiedContactLink() {
  const resource = usePublicData('/api/portfolio');
  const { word } = useWords();
  return <SourceLink href={resource.data?.githubUrl || resource.data?.ownerUrl} className="im-button im-button-outline"><Github size={18} />{word('Connect on GitHub', 'ติดต่อผ่าน GitHub')}<ArrowUpRight size={17} /></SourceLink>;
}
