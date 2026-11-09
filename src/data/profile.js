// Single source of truth for how the site positions Pornpon to a recruiter.
// The hero, the value section, the resume page and index.html all read from here
// (via SITE_VARIANT) so the job title never disagrees between pages.
import { resumeVariants } from './resumeVariants';

export const SITE_VARIANT = 'content-coordinator';
export const siteVariant = resumeVariants[SITE_VARIANT];

export const profile = {
  th: {
    role: siteVariant.titleOverride.th,
    headline: 'ช่วยทีมการตลาดส่งคอนเทนต์ทันแพลน คุมมาตรฐานแบรนด์ และลดงานซ้ำด้วย AI',
    intro:
      'ผมคือบอส ประสานงานการผลิตคอนเทนต์ครบวงจรมากว่า 4 ปี ให้แบรนด์สายความงาม ยานยนต์ และการศึกษา ตั้งแต่วาง Content Calendar คุม Brief และตารางถ่ายทำ ไปจนถึงตัดต่อและทำ Motion Graphic เอง และล่าสุดสร้างระบบ AI MarTech ที่ทีมใช้งานจริง',
    stats: [
      { value: '4+', unit: 'ปี', label: 'ผลิตและประสานงานคอนเทนต์' },
      { value: '60+', unit: 'คน', label: 'ทีมที่เคยบริหารโดยตรง' },
      { value: '2', unit: 'ระบบ', label: 'AI MarTech ที่สร้างและใช้งานจริง' },
    ],
    cta: {
      primary: 'ดู Resume ฉบับเต็ม',
      secondary: 'ดาวน์โหลด PDF',
      portfolio: 'ดูผลงานคอนเทนต์',
    },
    badge: { kicker: 'สร้างระบบ AI ใช้งานจริง', title: 'Zuri · V School CRM' },
    value: {
      eyebrow: 'สิ่งที่ผมช่วยองค์กรได้',
      title: 'ผมช่วยทีมคุณได้ 3 เรื่อง',
      lead: 'ไม่ใช่แค่ทำคอนเทนต์เป็น แต่ทำให้งานของทั้งทีมเดินได้ตามแพลน ปลอดภัยต่อแบรนด์ และเบาแรงขึ้นด้วยระบบที่สร้างเอง',
      proofLabel: 'หลักฐาน:',
      items: [
        {
          icon: 'calendar',
          title: 'คอนเทนต์ออกตรงแพลน ครบทุกช่องทาง',
          desc: 'วาง Content Calendar ตั้งแต่รายวันถึงรายเดือน คุม Brief และตารางถ่ายทำ ประสานทีมตัดต่อ ทีม Host และเอเจนซี่ภายนอก ให้งานส่งทันโดยไม่ต้องรอตาม',
          proof: 'ดูแลคอนเทนต์คลินิกความงามระดับ Top-tier ต่อเนื่อง 3 ปี ควบคู่กับแบรนด์ยานยนต์',
          link: { to: '/portfolio', label: 'ดูผลงานคอนเทนต์' },
        },
        {
          icon: 'shield',
          title: 'แบรนด์ปลอดภัย ทั้ง CI และนโยบายโฆษณา',
          desc: 'คุมมาตรฐาน Brand CI ทุกช่องทาง ตรวจงานเอเจนซี่ และเช็กคอนเทนต์ตาม Meta Ad Policy ด้วยระบบ AI ที่สร้างขึ้นเอง ก่อนที่แอดจะโดนปิด',
          proof: 'Audit เอเจนซี่ดิจิทัลให้ Saint Thonglor Clinic และวาง Guideline การตอบแชทให้ทีมแอดมินของ U-Turn Shop บริษัทในเครือ',
          link: { href: '#projects', label: 'ดูระบบที่สร้าง' },
        },
        {
          icon: 'bot',
          title: 'ลดงานซ้ำของทีมด้วยระบบ AI ที่ใช้จริง',
          desc: 'ออกแบบและสร้างระบบ MarTech ที่ทีมใช้ทุกวัน ตั้งแต่ Unified Inbox รวม Meta และ LINE, AI ประเมิน KPI แอดมิน ไปจนถึง Dashboard สรุปผลให้ผู้บริหาร',
          proof: 'Zuri AI MarTech Ecosystem และ V School CRM v2 ใช้งานจริงที่ V School Food Institute',
          link: { to: '/demo', label: 'ดูเดโมระบบ' },
        },
      ],
    },
  },
  en: {
    role: siteVariant.titleOverride.en,
    headline: 'I help marketing teams ship content on schedule, keep the brand safe, and cut repetitive work with AI.',
    intro:
      "I'm Boss. For 4+ years I've coordinated end-to-end content production for beauty, automotive and education brands: planning content calendars, running briefs and shoot schedules, editing video and motion graphics myself, and most recently building AI MarTech systems teams actually use.",
    stats: [
      { value: '4+', unit: 'yrs', label: 'producing & coordinating content' },
      { value: '60+', unit: 'people', label: 'managed directly' },
      { value: '2', unit: 'systems', label: 'AI MarTech built and in real use' },
    ],
    cta: {
      primary: 'View full resume',
      secondary: 'Download PDF',
      portfolio: 'See content work',
    },
    badge: { kicker: 'AI systems in production', title: 'Zuri · V School CRM' },
    value: {
      eyebrow: 'What I bring to your team',
      title: 'Three things I take off your plate',
      lead: 'Not just someone who can make content, but someone who keeps the whole team on plan, keeps the brand safe, and builds the tooling that makes the work lighter.',
      proofLabel: 'Proof:',
      items: [
        {
          icon: 'calendar',
          title: 'Content ships on plan, across every channel',
          desc: 'Daily-to-monthly content calendars, briefs and shoot schedules, and coordination of editors, hosts and external agencies so work lands on time without chasing.',
          proof: '3 years of continuous content for a top-tier aesthetics clinic, alongside an automotive brand.',
          link: { to: '/portfolio', label: 'See content work' },
        },
        {
          icon: 'shield',
          title: 'Brand stays safe: CI and ad policy',
          desc: 'Brand CI enforced on every channel, agency output audited, and content checked against Meta Ad Policy with a self-built AI reviewer before an ad account gets flagged.',
          proof: 'Audited the digital agency for Saint Thonglor Clinic and wrote the admin response guidelines for its sister company, U-Turn Shop.',
          link: { href: '#projects', label: 'See the systems' },
        },
        {
          icon: 'bot',
          title: 'Less repetitive work, with AI tools in real use',
          desc: 'Designed and built MarTech the team uses daily: a unified Meta + LINE inbox, AI-scored admin KPIs, and executive dashboards.',
          proof: 'Zuri AI MarTech Ecosystem and V School CRM v2 are in production at V School Food Institute.',
          link: { to: '/demo', label: 'See the demo' },
        },
      ],
    },
  },
};
