// Resume variant configurations for company-specific routing
// Each variant controls: experience order, title, about text, emphasis, and download file

export const allExperiences = {
  vSchool: {
    key: 'vSchool',
    title: 'Assistant Marketing Manager',
    company: 'V School Food Institute',
    period: 'Jan 2026 - Mar 2026 (2 Months)',
    responsibilities: [
      'Built and deployed Zuri CRM system from scratch to manage student leads and enrollment pipeline.',
      'Planned and executed Meta Ads campaigns with budget optimization and A/B testing for lead generation.',
      'Created end-to-end marketing funnels integrating LINE OA, Meta Ads, and CRM tracking.',
      'Produced all creative assets (video, photo, graphic) for social media and paid campaigns.',
      'Analyzed campaign performance data to optimize cost-per-lead and conversion rates.'
    ]
  },
  assistantManager: {
    key: 'assistantManager',
    // uses translation keys - title/company/period from t.resume.experience.assistantManager
    useTranslation: true,
    translationKey: 'assistantManager'
  },
  eventCoordinator: {
    key: 'eventCoordinator',
    useTranslation: true,
    translationKey: 'eventCoordinator'
  },
  contentCreatorPermanent: {
    key: 'contentCreatorPermanent',
    useTranslation: true,
    translationKey: 'contentCreatorPermanent'
  },
  contentCreatorPartTime: {
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
  veam: {
    key: 'veam',
    title: 'Assistant Project Manager (Intern)',
    company: 'Veam Agency',
    period: '2017 (Internship)',
    responsibilities: [
      'Assisted project managers in coordinating between clients and creative teams.',
      'Managed project timelines and tracked deliverables for multiple concurrent campaigns.',
      'Prepared presentation decks and client-facing documents.'
    ]
  }
};


// Default experience order (current resume)
const defaultOrder = [
  'freelance', 'assistantManager', 'eventCoordinator',
  'contentCreatorPermanent', 'contentCreatorPartTime', 'editorContract'
];

// Variant-specific order (includes V School and Veam)
const variantOrder = [
  'vSchool', 'assistantManager', 'eventCoordinator',
  'contentCreatorPermanent', 'contentCreatorPartTime',
  'freelance', 'editorContract', 'veam'
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
    experienceOrder: variantOrder,
    titleOverride: {
      en: 'Performance Marketer & Content Specialist',
      th: 'Performance Marketer & Content Specialist'
    },
    aboutOverride: {
      en: 'Performance Marketer with hands-on experience in Meta Ads, CRM systems (Zuri), and content creation across digital channels. Built marketing funnels, managed ad budgets, and led creative production for brands in education, hospitality, and automotive industries. Combines strategic marketing thinking with strong creative production skills.',
      th: 'Performance Marketer ที่มีประสบการณ์ตรงด้าน Meta Ads, ระบบ CRM (Zuri) และการสร้างคอนเทนต์ผ่านช่องทางดิจิทัล สร้าง Marketing Funnel บริหารงบโฆษณา และนำทีมผลิตสื่อสร้างสรรค์ให้แบรนด์ในอุตสาหกรรมการศึกษา การบริการ และยานยนต์ ผสมผสานกลยุทธ์การตลาดเข้ากับทักษะการผลิตสื่ออย่างมีประสิทธิภาพ'
    },
    emphasisKeys: ['vSchool', 'contentCreatorPermanent', 'contentCreatorPartTime', 'freelance']
  },

  'synnex-pm': {
    label: 'SYNNEX PM',
    roleName: 'Product Manager Position at SYNNEX',
    downloadFile: '/Resume_Pornpon_SYNNEX_PM.docx',
    experienceOrder: variantOrder,
    titleOverride: {
      en: 'Project & Product Manager',
      th: 'Project & Product Manager'
    },
    aboutOverride: {
      en: 'Project & Product Manager with progressive management experience across hospitality, automotive services, and EdTech. Built CRM systems from scratch, coordinated cross-functional teams, and managed end-to-end operations. Strong analytical mindset with hands-on experience in AI tools, system design, and stakeholder management.',
      th: 'Project & Product Manager ที่มีประสบการณ์ด้านการบริหารจัดการอย่างก้าวหน้า ครอบคลุมธุรกิจ Hospitality, Automotive และ EdTech สร้างระบบ CRM ตั้งแต่เริ่มต้น ประสานงานทีม Cross-functional และบริหารงานครบวงจร มีความสามารถด้านการวิเคราะห์ พร้อมประสบการณ์ตรงในเครื่องมือ AI, การออกแบบระบบ และการบริหารผู้มีส่วนได้ส่วนเสีย'
    },
    emphasisKeys: ['vSchool', 'assistantManager', 'eventCoordinator']
  }
};
