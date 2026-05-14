// Resume variant configurations for company-specific routing
// Each variant controls: experience order, title, about text, emphasis, and download file

export const allExperiences = {
  vSchool: {
    key: 'vSchool',
    useTranslation: true,
    translationKey: 'vSchool'
  },
  deputyManager: {
    key: 'deputyManager',
    useTranslation: true,
    translationKey: 'deputyManager'
  },
  operationsManager: {
    key: 'operationsManager',
    useTranslation: true,
    translationKey: 'operationsManager'
  },
  contentCreatorPermanent: {
    key: 'contentCreatorPermanent',
    useTranslation: true,
    translationKey: 'contentCreatorPermanent'
  },  contentCreatorPartTime: {
    key: 'contentCreatorPartTime',
    useTranslation: true,
    translationKey: 'contentCreatorPartTime'
  },
  freelance: {
    key: 'freelance',
    useTranslation: true,
    translationKey: 'freelance'
  },
  editorContract: {
    key: 'editorContract',
    useTranslation: true,
    translationKey: 'editorContract'
  },
  internship: {
    key: 'internship',
    useTranslation: true,
    translationKey: 'internship'
  }
};

// Default experience order — all 8 positions, reverse chronological
const defaultOrder = [
  'vSchool', 'deputyManager', 'operationsManager',
  'contentCreatorPermanent', 'contentCreatorPartTime',
  'freelance', 'editorContract', 'internship'
];

// Shared Google Docs URLs (single source of truth)
const DOC_ID = '1AfEhI64KNyYb7OiUyVC2792yKf29f9ch';
export const RESUME_DOC_VIEW = `https://docs.google.com/document/d/${DOC_ID}/preview`;
export const RESUME_DOC_PDF = `https://docs.google.com/document/d/${DOC_ID}/export?format=pdf`;

export const resumeVariants = {
  default: {
    label: null,
    roleName: null,
    downloadFile: RESUME_DOC_PDF,
    viewFile: RESUME_DOC_VIEW,
    experienceOrder: defaultOrder,
    titleOverride: null,
    aboutOverride: null,
    emphasisKeys: []
  },
  'content-coordinator': {
    label: 'Content Coordinator',
    roleName: 'Content Coordinator Position',
    downloadFile: RESUME_DOC_PDF,
    viewFile: RESUME_DOC_VIEW,
    experienceOrder: [
      'contentCreatorPermanent', 'contentCreatorPartTime', 'editorContract',
      'freelance', 'vSchool', 'deputyManager', 'operationsManager', 'internship'
    ],
    titleOverride: {
      en: 'Content Coordinator & Multimedia Producer',
      th: 'Content Coordinator & Multimedia Producer'
    },
    aboutOverride: {
      en: 'Content Coordinator with 4+ years of hands-on multimedia production across video editing, motion graphics, photography, and social content. Experienced in coordinating creative production end-to-end — planning content calendars, managing briefs and shooting schedules, and aligning teams of editors, hosts, and external agencies for brands in beauty, automotive, and education. Combines strong production craft with team coordination and AI-assisted workflows to ship polished content on time.',
      th: 'Content Coordinator ที่มีประสบการณ์ตรงด้านการผลิตสื่อมัลติมีเดียกว่า 4 ปี ทั้งตัดต่อวิดีโอ Motion Graphic ถ่ายภาพ และคอนเทนต์โซเชียล เชี่ยวชาญการประสานงานการผลิตคอนเทนต์แบบครบวงจร — วางแผน Content Calendar บริหาร Brief และตารางถ่ายทำ และประสานทีมตัดต่อ ทีม Host รวมถึงเอเจนซี่ภายนอก ให้กับแบรนด์ในสายความงาม ยานยนต์ และการศึกษา ผสมผสานทักษะงานผลิตเข้ากับการประสานงานทีมและการใช้ AI เพื่อส่งมอบงานคุณภาพตรงเวลา'
    },
    emphasisKeys: ['contentCreatorPermanent', 'contentCreatorPartTime', 'editorContract', 'freelance']
  },
  'performance-marketer': {
    label: 'Performance Marketer',
    roleName: 'Performance Marketing Position',
    downloadFile: '/Resume_Pornpon_PerformanceMarketer.docx',
    viewFile: null,
    experienceOrder: defaultOrder,
    titleOverride: {
      en: 'Performance Marketer & Content Specialist',
      th: 'Performance Marketer & Content Specialist'
    },
    aboutOverride: {
      en: 'Performance Marketer with hands-on experience in Meta Ads, CRM systems (Zuri), and content creation across digital channels. Built marketing funnels, managed ad budgets, and led creative production for brands in education, hospitality, and automotive industries. Combines strategic marketing thinking with strong creative production skills.',
      th: 'Performance Marketer ที่มีประสบการณ์ตรงด้าน Meta Ads, ระบบ CRM (Zuri) และการสร้างคอนเทนต์ผ่านช่องทางดิจิทัล สร้าง Marketing Funnel บริหารงบโฆษณา และนำทีมผลิตสื่อสร้างสรรค์ให้แบรนด์ในอุตสาหกรรมการศึกษา บริการ และยานยนต์ ผสมผสานความคิดเชิงกลยุทธ์กับทักษะการผลิตสื่อสร้างสรรค์'
    },
    emphasisKeys: ['vSchool', 'contentCreatorPermanent', 'contentCreatorPartTime', 'freelance']
  },
  'synnex-pm': {
    label: 'SYNNEX PM',
    roleName: 'Product Manager Position at SYNNEX',
    downloadFile: '/Resume_Pornpon_SYNNEX_PM.docx',
    viewFile: null,
    experienceOrder: defaultOrder,
    titleOverride: {
      en: 'Project & Product Manager',
      th: 'Project & Product Manager'
    },
    aboutOverride: {
      en: 'Project & Product Manager with progressive management experience across hospitality, automotive services, and EdTech. Built CRM systems from scratch, coordinated cross-functional teams, and managed end-to-end operations. Strong analytical mindset with hands-on experience in AI tools, system design, and stakeholder management.',
      th: 'Project & Product Manager ที่มีประสบการณ์ด้านการบริหารจัดการแบบก้าวหน้า ครอบคลุมสาย Hospitality, Automotive และ EdTech สร้างระบบ CRM ตั้งแต่เริ่มต้น ประสานงานทีม Cross-functional และบริหารงานครบวงจร มีแนวคิดเชิงวิเคราะห์ พร้อมประสบการณ์ตรงด้านเครื่องมือ AI, การออกแบบระบบ และการบริหารผู้มีส่วนได้ส่วนเสีย'
    },
    emphasisKeys: ['vSchool', 'deputyManager', 'operationsManager']
  }
};