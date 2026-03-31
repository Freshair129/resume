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

export const resumeVariants = {
  default: {
    label: null,
    roleName: null,
    downloadFile: null,
    experienceOrder: defaultOrder,
    titleOverride: null,
    aboutOverride: null,
    emphasisKeys: []
  },
  'performance-marketer': {
    label: 'Performance Marketer',
    roleName: 'Performance Marketing Position',
    downloadFile: '/Resume_Pornpon_PerformanceMarketer.docx',
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