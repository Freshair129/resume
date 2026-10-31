import { useEffect, useState } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { ArrowDownToLine, ArrowRight, Camera, ExternalLink, Mail } from 'lucide-react';
import { motion } from 'motion/react';
import { useLanguage } from '../../LanguageContext';
import { usePublicData } from './usePublicData';
import { contactLinks, filterProjects, localized, resolveTrack, resumePdfUrl, resumeTracks, safePublicUrl } from './publicData.mjs';
import profileImage from '../../assets/profile.jpg';
import heroImage from '../../assets/gallery/66744889_10214371131447545_2533396217711296512_n.jpg';
import { VerifiedContactLink } from './IntelligencePortfolio';
import ZuriLineLink from './ZuriLineLink';

const copy = {
  th: {
    projects: 'สำรวจโปรเจกต์', resume: 'ดาวน์โหลดเรซูเม่ PDF', contact: 'ติดต่อ', ask: 'คุยกับ Zuri ผ่าน LINE',
    empty: 'กำลังเตรียมเนื้อหาที่ผ่านการอนุมัติ', emptyBody: 'ข้อมูลจะแสดงเมื่อเจ้าของตรวจสอบแหล่งอ้างอิงและอนุมัติการเผยแพร่แล้ว',
    unavailable: 'ยังโหลดข้อมูลที่เผยแพร่ไม่ได้', unavailableBody: 'บริการข้อมูลไม่พร้อมใช้งานชั่วคราว คุณยังเปิดเมนู ผลงานสื่อ และแกลเลอรีได้',
    retry: 'ลองใหม่', loading: 'กำลังโหลดข้อมูลที่เผยแพร่…', sources: 'หลักฐานและแหล่งอ้างอิง', view: 'อ่านกรณีศึกษา',
  },
  en: {
    projects: 'Explore projects', resume: 'Download PDF resume', contact: 'Contact', ask: 'Chat with Zuri on LINE',
    empty: 'Awaiting approved content', emptyBody: 'Content appears after the owner reviews its evidence and approves publication.',
    unavailable: 'Published content is unavailable', unavailableBody: 'The knowledge service is temporarily unavailable. Navigation, media work and the gallery remain accessible.',
    retry: 'Try again', loading: 'Loading published content…', sources: 'Evidence & sources', view: 'Read case study',
  },
};

function useCopy() { const { language } = useLanguage(); return { language, c: copy[language] }; }

function ResourceState({ resource, empty = false }) {
  const { language, c } = useCopy();
  if (resource.loading) return <p role="status" className="pk-status">{c.loading}</p>;
  if (resource.error) return <div className="pk-notice" role="status">
    <h2>{resource.error.status === 404 ? (language === 'th' ? 'ไม่พบเนื้อหาที่เผยแพร่' : 'No published content found') : c.unavailable}</h2>
    <p>{c.unavailableBody}</p><button className="pk-button pk-button-light" onClick={resource.retry}>{c.retry}</button>
  </div>;
  if (empty) return <div className="pk-notice"><h2>{c.empty}</h2><p>{c.emptyBody}</p></div>;
  return null;
}

function ExternalSource({ href, children }) {
  const safe = safePublicUrl(href);
  return safe ? <a href={safe} target={safe.startsWith('https:') ? '_blank' : undefined} rel="noreferrer noopener" className="pk-source-link">{children}<ExternalLink size={14} aria-hidden="true" /></a> : <span>{children}</span>;
}

function ProjectCard({ project }) {
  const { language, c } = useCopy();
  return <article className="pk-card">
    <div className="pk-tags"><span>{project.category}</span><span className="pk-status-tag">{project.status}</span></div>
    <h3><Link to={`/projects/${encodeURIComponent(project.slug)}`}>{localized(project.title, language)}</Link></h3>
    <p>{localized(project.summary, language)}</p>
    <Link className="pk-text-link" to={`/projects/${encodeURIComponent(project.slug)}`}>{c.view}<ArrowRight size={17} aria-hidden="true" /></Link>
  </article>;
}

function ProjectGrid({ projects }) {
  return <div className="pk-grid">{projects.map(project => <ProjectCard key={project.id || project.slug} project={project} />)}</div>;
}

function ProfileContact({ profile }) {
  const { language } = useCopy();
  const { email, line } = contactLinks(profile?.contacts);
  if (!email && !line) return <p className="pk-muted">{language === 'th' ? 'ช่องทางติดต่อสาธารณะอยู่ระหว่างการอนุมัติ' : 'Public contact details are awaiting approval.'}</p>;
  return <div className="pk-actions">
    {email && <a className="pk-button" href={email}><Mail size={18} aria-hidden="true" />{profile.contacts.email}</a>}
    {line && <a className="pk-button pk-button-light" href={line} target="_blank" rel="noreferrer noopener">LINE<ExternalLink size={16} aria-hidden="true" /></a>}
  </div>;
}

export function HomePage() {
  const { language, c } = useCopy();
  const profileResource = usePublicData(`/api/profile?lang=${language}&track=ai-automation`);
  const projectsResource = usePublicData('/api/projects');
  const profile = profileResource.data?.profile;
  const projects = Array.isArray(projectsResource.data) ? projectsResource.data : [];
  return <>
    <section className="pk-hero pk-container">
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <p className="pk-eyebrow">PORTFOLIO INTELLIGENCE / AI AUTOMATION</p>
        <h1>{localized(profile?.headline, language) || <>AI Automation.<br /><span>Agentic Systems.</span></>}</h1>
        <p className="pk-lead">{localized(profile?.summary, language) || (language === 'th' ? 'สำรวจงาน ระบบ และแนวคิดผ่านข้อมูลที่ตรวจสอบได้ พร้อม Zuri ช่วยค้นหาแหล่งอ้างอิงผ่าน LINE' : 'Explore projects, systems and ideas through reviewed evidence, with Zuri on LINE to help you find the sources.')}</p>
        <div className="pk-actions">
          <Link className="pk-button" to="/projects">{c.projects}<ArrowRight size={18} aria-hidden="true" /></Link>
          <a className="pk-button pk-button-light" href={resumePdfUrl('ai-automation', language)}><ArrowDownToLine size={18} aria-hidden="true" />{c.resume}</a>
        </div>
        <div className="pk-actions pk-secondary-actions">
          <ZuriLineLink className="pk-text-link" />
          <Link className="pk-text-link" to="/contact">{c.contact}<ArrowRight size={16} aria-hidden="true" /></Link>
        </div>
      </motion.div>
      <div className="pk-hero-photo">
        <img src={profileImage} alt={localized(profile?.name, language) || 'Pornpon'} fetchPriority="high" />
        <div className="pk-photo-caption"><span>PORNPON</span><span>PEOPLE × SYSTEMS × IDEAS</span></div>
      </div>
    </section>
    <section className="pk-container pk-section">
      <div className="pk-section-heading"><div><p className="pk-eyebrow">SELECTED WORK</p><h2>{language === 'th' ? 'จากแนวคิดสู่หลักฐาน' : 'From ideas to evidence'}</h2></div><Link className="pk-text-link" to="/projects">{c.projects}<ArrowRight size={18} aria-hidden="true" /></Link></div>
      <ResourceState resource={projectsResource} empty={!projects.length} />
      {!!projects.length && <ProjectGrid projects={projects.slice(0, 6)} />}
    </section>
    <section className="pk-container pk-section pk-creative">
      <img src={heroImage} alt={language === 'th' ? 'ภาพถ่ายจากแฟ้มผลงานเดิม' : 'Photography from the original portfolio'} loading="lazy" />
      <div><p className="pk-eyebrow">THE CREATIVE SIDE</p><h2>{language === 'th' ? 'ภาพ เรื่องเล่า และงานสร้างสรรค์' : 'Images, stories & creative work'}</h2><p>{language === 'th' ? 'เก็บภาพและงานสื่อจากแฟ้มผลงานเดิมไว้ให้สำรวจ พร้อมแยกจากกรณีศึกษาที่ผ่านการตรวจสอบแล้ว' : 'Explore the preserved photography and media archive alongside reviewed case studies.'}</p><div className="pk-actions"><Link className="pk-button pk-button-light" to="/gallery"><Camera size={18} aria-hidden="true" />{language === 'th' ? 'แกลเลอรี' : 'Photo gallery'}</Link><Link className="pk-text-link" to="/portfolio">{language === 'th' ? 'ผลงานสื่อ' : 'Media portfolio'}<ArrowRight size={18} aria-hidden="true" /></Link></div></div>
    </section>
    <section className="pk-container pk-section"><ResourceState resource={profileResource} /><ProfileContact profile={profile} /></section>
  </>;
}

export function ProjectsPage() {
  const { language, c } = useCopy();
  const resource = usePublicData('/api/projects');
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('');
  const [status, setStatus] = useState('');
  const projects = Array.isArray(resource.data) ? resource.data : [];
  const filtered = filterProjects(projects, { query, category, status, language });
  return <section className="pk-container pk-section">
    <p className="pk-eyebrow">PROJECTS & CASE STUDIES</p><h1 className="pk-page-title">{language === 'th' ? 'งานที่มีหลักฐานให้สำรวจ' : 'Explore the work and its evidence'}</h1>
    <p className="pk-lead">{language === 'th' ? 'แต่ละโปรเจกต์ระบุสถานะและแหล่งอ้างอิงของตนเอง' : 'Each project carries its own status and sources.'}</p>
    <div className="pk-filters">
      <label>{language === 'th' ? 'ค้นหา' : 'Search'}<input type="search" value={query} onChange={event => setQuery(event.target.value)} placeholder={language === 'th' ? 'ชื่อหรือคำอธิบายโปรเจกต์' : 'Project name or description'} /></label>
      <label>{language === 'th' ? 'หมวดหมู่' : 'Category'}<select value={category} onChange={event => setCategory(event.target.value)}><option value="">{language === 'th' ? 'ทุกหมวดหมู่' : 'All categories'}</option>{[...new Set(projects.map(project => project.category).filter(Boolean))].sort().map(value => <option key={value}>{value}</option>)}</select></label>
      <label>{language === 'th' ? 'สถานะ' : 'Status'}<select value={status} onChange={event => setStatus(event.target.value)}><option value="">{language === 'th' ? 'ทุกสถานะ' : 'All statuses'}</option>{[...new Set(projects.map(project => project.status).filter(Boolean))].sort().map(value => <option key={value}>{value}</option>)}</select></label>
    </div>
    <ResourceState resource={resource} empty={!projects.length} />
    {!!projects.length && <><p className="pk-muted" role="status">{language === 'th' ? `พบ ${filtered.length} โปรเจกต์` : `${filtered.length} projects found`}</p><ProjectGrid projects={filtered} /></>}
    {!resource.loading && !resource.error && !!projects.length && !filtered.length && <p>{language === 'th' ? 'ไม่พบโปรเจกต์ที่ตรงกับตัวกรอง ลองเปลี่ยนคำค้นหาหรือเลือกทุกหมวดหมู่' : 'No projects match. Try another search or clear the filters.'}</p>}
    <Link className="pk-text-link" to="/resume">{c.resume}<ArrowRight size={18} aria-hidden="true" /></Link>
  </section>;
}

export function ProjectDetailPage() {
  const { slug } = useParams();
  const { language, c } = useCopy();
  const resource = usePublicData(`/api/projects/${encodeURIComponent(slug)}`);
  const project = resource.data;
  useEffect(() => { if (project) document.title = `${localized(project.title, language)} | PORNPON`; }, [project, language]);
  return <article className="pk-container pk-section pk-reading">
    <Link className="pk-text-link" to="/projects">← {c.projects}</Link>
    <ResourceState resource={resource} />
    {project && <>
      <div className="pk-tags"><span>{project.category}</span><span className="pk-status-tag">{project.status}</span></div>
      <h1 className="pk-page-title">{localized(project.title, language)}</h1><p className="pk-lead">{localized(project.summary, language)}</p>
      {['challenge', 'role', 'architecture', 'decisions', 'implementation', 'outcomes'].map(field => localized(project[field], language) && <section className="pk-section" key={field}><h2>{({ challenge: 'Problem / โจทย์', role: 'Role / บทบาท', architecture: 'Architecture / สถาปัตยกรรม', decisions: 'Decisions / การตัดสินใจ', implementation: 'Implementation / การพัฒนา', outcomes: 'Outcome / ผลลัพธ์' })[field]}</h2><p className="pk-preserve-text">{localized(project[field], language)}</p></section>)}
      <section className="pk-section"><h2>{c.sources}</h2>{project.documents?.length ? project.documents.map(document => <details className="pk-evidence" key={document.id}><summary>{document.path || (language === 'th' ? 'เอกสารอ้างอิง' : 'Source document')}</summary><ExternalSource href={document.url}>{language === 'th' ? 'เปิดแหล่งอ้างอิง' : 'Open source'}</ExternalSource>{document.sha && <p className="pk-source-version">{language === 'th' ? 'เวอร์ชันต้นฉบับ' : 'Source revision'}: {document.sha}</p>}<p className="pk-preserve-text">{document.text}</p></details>) : <p className="pk-muted">{language === 'th' ? 'ยังไม่มีเอกสารอ้างอิงที่เผยแพร่ในหน้านี้' : 'No source documents are published on this page yet.'}</p>}</section>
    </>}
  </article>;
}

export function ResumePage() {
  const { variantSlug } = useParams();
  const [params, setParams] = useSearchParams();
  const { language, c } = useCopy();
  const track = resolveTrack(params.get('track') || variantSlug);
  const resource = usePublicData(`/api/profile?lang=${language}&track=${track}`);
  const { profile, experiences = [], skills = [], projects = [] } = resource.data || {};
  const selectedTrack = resumeTracks.find(item => item.id === track);
  return <section className="pk-container pk-section pk-reading">
    <p className="pk-eyebrow">CANONICAL RESUME / TH + EN</p><h1 className="pk-page-title">{language === 'th' ? 'ประวัติและผลงาน' : 'Resume & selected work'}</h1>
    <div className="pk-resume-controls"><label>{language === 'th' ? 'สายงาน' : 'Track'}<select value={track} onChange={event => setParams({ track: event.target.value })}>{resumeTracks.map(item => <option value={item.id} key={item.id}>{item.label}{item.legacy ? (language === 'th' ? ' · รูปแบบเดิม' : ' · retained track') : ''}</option>)}</select></label><a href={resumePdfUrl(track, language)} className="pk-button"><ArrowDownToLine size={18} aria-hidden="true" />{c.resume} ({language.toUpperCase()})</a></div>
    {selectedTrack.legacy && <p className="pk-notice">{language === 'th' ? 'เก็บตัวเลือกสายงานเดิมไว้ หน้านี้และ PDF ใช้เฉพาะข้อมูลที่ผ่านการอนุมัติแล้ว' : 'This original track is retained. This view and its PDF use approved canonical records only.'}</p>}
    <ResourceState resource={resource} empty={!profile} />
    {profile && <div className="pk-resume-content"><h2>{localized(profile.name, language)}</h2><p className="pk-lead">{localized(profile.headline, language)}</p><p>{localized(profile.summary, language)}</p><ProfileContact profile={profile} />
      {!!experiences.length && <section className="pk-section"><h2>{language === 'th' ? 'ประสบการณ์' : 'Experience'}</h2>{experiences.map((item, index) => <article className="pk-experience" key={item.id || index}><h3>{localized(item.title, language)}</h3><p>{localized(item.org || item.company, language)}{item.period ? ` · ${localized(item.period, language)}` : ''}</p><p>{localized(item.scope || item.summary, language)}</p>{Array.isArray(item.responsibilities) && <ul>{item.responsibilities.map((text, i) => <li key={i}>{localized(text, language)}</li>)}</ul>}</article>)}</section>}
      {!!skills.length && <section className="pk-section"><h2>{language === 'th' ? 'ทักษะ' : 'Skills'}</h2><div className="pk-tags">{skills.map((skill, index) => <span key={skill.id || index}>{localized(skill.name || skill.label || skill, language)}</span>)}</div></section>}
      {!!projects.length && <section className="pk-section"><h2>{language === 'th' ? 'โปรเจกต์' : 'Projects'}</h2><ProjectGrid projects={projects} /></section>}
    </div>}
  </section>;
}

export function AboutPage() {
  const { language } = useCopy();
  const resource = usePublicData(`/api/profile?lang=${language}&track=ai-automation`);
  const profile = resource.data?.profile;
  return <section className="pk-container pk-section pk-reading"><p className="pk-eyebrow">ABOUT</p><h1 className="pk-page-title">{language === 'th' ? 'รู้จักเจ้าของผลงาน' : 'Meet the person behind the work'}</h1><ResourceState resource={resource} empty={!profile} />{profile && <><h2>{localized(profile.name, language)}</h2><p className="pk-lead">{localized(profile.headline, language)}</p><p>{localized(profile.summary, language)}</p><ProfileContact profile={profile} /></>}<div className="pk-actions"><Link className="pk-button pk-button-light" to="/resume">{language === 'th' ? 'อ่านเรซูเม่' : 'Read the resume'}</Link><Link className="pk-text-link" to="/gallery">{language === 'th' ? 'ชมภาพถ่าย' : 'Explore photography'}<ArrowRight size={18} aria-hidden="true" /></Link></div></section>;
}

export function ContactPage() {
  const { language } = useCopy();
  const resource = usePublicData(`/api/profile?lang=${language}&track=ai-automation`);
  return <section className="pk-container pk-section pk-reading"><p className="pk-eyebrow">CONTACT</p><h1 className="pk-page-title">{language === 'th' ? 'เริ่มต้นบทสนทนา' : 'Start a conversation'}</h1><p className="pk-lead">{language === 'th' ? 'ติดต่อผ่านช่องทางที่เจ้าของอนุมัติให้เผยแพร่ เพื่อพูดคุยเรื่องงานหรือโปรเจกต์' : 'Use the owner-approved public channels to discuss a role or project.'}</p><div className="zuri-page-cta"><ZuriLineLink /><Link className="pk-text-link" to="/voice">{language === 'th' ? 'คุยกับ Zuri ด้วยเสียง' : 'Talk to Zuri by voice'}<ArrowRight size={16} aria-hidden="true" /></Link></div><ResourceState resource={resource} />{resource.data?.profile && <ProfileContact profile={resource.data.profile} />}<VerifiedContactLink /><p className="pk-muted">{language === 'th' ? 'Zuri ช่วยค้นหาข้อมูลผลงานพร้อมแหล่งอ้างอิงใน LINE แต่ไม่เสนอราคา รับนัดหมาย หรือให้คำมั่นแทนเจ้าของผลงาน' : 'Zuri helps you explore the work with source links in LINE. It cannot quote fees, schedule meetings or make commitments on the owner’s behalf.'}</p></section>;
}

export function PrivacyPage() {
  const { language } = useCopy();
  return <section className="pk-container pk-section pk-reading"><p className="pk-eyebrow">PRIVACY</p><h1 className="pk-page-title">{language === 'th' ? 'ความเป็นส่วนตัว' : 'Privacy'}</h1>{language === 'th' ? <>
    <h2>เมื่อคุณคุยกับ Zuri ผ่าน LINE</h2><p>เมื่อคุณเปิดแชตและส่งข้อความผ่าน LINE ข้อความจะประมวลผลผ่าน LINE และระบบตอบคำถามของเรา เพื่อค้นหาข้อมูลที่อนุมัติแล้วและสรุปด้วยโมเดลบนเซิร์ฟเวอร์ หลีกเลี่ยงข้อมูลส่วนบุคคล ความลับ และข้อมูลลูกค้า</p><p>หน้าเว็บนี้ไม่เก็บประวัติสนทนา LINE ระบบใช้ข้อมูลชั่วคราวเพื่อส่งคำตอบและป้องกันการส่งซ้ำ การจัดเก็บข้อมูลของ LINE เป็นไปตามนโยบายของ LINE</p>
    <h2>เมื่อคุณใช้หน้าคุยด้วยเสียง</h2><p>ไมโครโฟนเริ่มบันทึกเมื่อคุณกดเท่านั้น สูงสุดครั้งละ 15 วินาที ระบบถอดเสียงด้วยโมเดลบนเซิร์ฟเวอร์ของเว็บ ไม่มีการส่งไปบริการรู้จำเสียงภายนอก คุณตรวจและแก้ข้อความก่อนส่งคำถามได้ ไฟล์เสียงลบหลังประมวลผลหรือยกเลิก งานตกค้างมีอายุไม่เกินหนึ่งนาที ข้อความและคำตอบแสดงในหน่วยความจำของหน้าเว็บจนล้างหรือออกจากหน้า ไม่เพิ่มคำถามของคุณเข้าเป็นข้อมูลอนุมัติในคลังความรู้ เสียงอ่านคำตอบจะแสดงเมื่อมีโมเดลและ preset ที่ผ่านการทดสอบและอนุมัติแล้ว</p><h2>ข้อมูลการใช้งาน</h2><p>ระบบอาจประมวลผลข้อมูลคำขอที่จำเป็นเพื่อความปลอดภัยและจำกัดการใช้งาน หน้าเว็บนี้ไม่ได้เปิดใช้ analytics โดยอัตโนมัติ นโยบายการเก็บข้อมูลของผู้ให้บริการและระยะเวลาเก็บบันทึกบนระบบที่เปิดใช้งานจริงต้องยืนยันกับผู้ดูแล</p>
    <h2>สื่อและเว็บไซต์ภายนอก</h2><p>ลิงก์ภายนอกและสื่อฝังในแฟ้มผลงานอาจเปิดบริการภายนอกซึ่งมีนโยบายความเป็นส่วนตัวของตนเอง</p><h2>สอบถามหรือลบข้อมูล</h2><p>ใช้ช่องทางที่เผยแพร่ในหน้าติดต่อเพื่อขอรายละเอียดหรือขอลบข้อมูล หากยังไม่มีช่องทางที่อนุมัติ โปรดหลีกเลี่ยงการส่งข้อมูลส่วนบุคคลผ่านแชต</p>
  </> : <><h2>When you chat with Zuri on LINE</h2><p>When you open the chat and send a message through LINE, LINE and our answering service process it to retrieve approved content and summarize it with the server’s model. Avoid sharing personal information, secrets or customer data.</p><p>This website does not store your LINE conversation history. Our service uses temporary data to reply and prevent duplicate delivery. LINE retains data according to its own policies.</p><h2>When you use the voice page</h2><p>The microphone records only after you tap, for up to 15 seconds. A model on this site’s server transcribes the audio; no external recognition service is used. You can review and edit the transcript before sending a question. Audio is deleted after processing or cancellation, with a maximum one-minute residual lifetime for abandoned work. Questions and answers remain in page memory until cleared or you leave the page. Your questions are not added to approved knowledge. Spoken replies are shown only when a tested, approved model and voice preset are available.</p><h2>Operational data</h2><p>The service may process request metadata for security and rate limiting. This frontend does not enable analytics automatically. Provider retention and the retention of logs in an active deployment must be confirmed with its operator.</p><h2>External media and websites</h2><p>External links and embedded portfolio media may open third-party services with their own privacy policies.</p><h2>Questions or deletion requests</h2><p>Use the published contact channels to request details or deletion. If no approved contact channel is available, avoid sending personal information through chat.</p></>}
    <Link className="pk-text-link" to="/contact">{language === 'th' ? 'ไปหน้าติดต่อ' : 'Contact'}<ArrowRight size={18} aria-hidden="true" /></Link>
  </section>;
}

export function NotFoundPage() {
  const { language } = useCopy();
  return <section className="pk-container pk-section"><h1 className="pk-page-title">{language === 'th' ? 'ไม่พบหน้านี้' : 'Page not found'}</h1><Link className="pk-button" to="/projects">{language === 'th' ? 'สำรวจโปรเจกต์' : 'Explore projects'}</Link></section>;
}
