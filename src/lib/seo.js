import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { useLanguage } from '../LanguageContext';
import { profile } from '../data/profile';

const PERSON_NAME = {
  th: 'พรพล ธนสุวรรณธาร (บอส)',
  en: 'Pornpon Thanasuwanthat (Boss)',
};

const PAGE_META = {
  '/': { title: 'home', description: 'home' },
  '/portfolio': { title: 'portfolio', description: 'portfolio' },
  '/gallery': { title: 'gallery', description: 'gallery' },
  '/resume/content-coordinator': { title: 'resume', description: 'resume' },
};

const FALLBACK_TITLE = 'พรพล ธนสุวรรณธาร (บอส) · Content Coordinator & Multimedia Producer';
const FALLBACK_DESCRIPTION = 'Content Coordinator & Multimedia Producer ประสบการณ์ 4+ ปี ประสานงานการผลิตคอนเทนต์ครบวงจรให้แบรนด์ความงาม ยานยนต์ และการศึกษา เคยบริหารทีม 60+ คน และสร้างระบบ AI MarTech ที่ใช้งานจริง (Zuri, V School CRM)';

export const usePageMeta = () => {
  const { pathname } = useLocation();
  const { language, t } = useLanguage();
  const defaults = useRef(null);

  useEffect(() => {
    const descriptionMeta = document.querySelector('meta[name="description"]');
    if (!defaults.current) {
      defaults.current = {
        title: document.title || FALLBACK_TITLE,
        description: descriptionMeta?.content || FALLBACK_DESCRIPTION,
      };
    }

    const page = PAGE_META[pathname];
    if (!page) {
      document.title = defaults.current.title;
      if (descriptionMeta) descriptionMeta.content = defaults.current.description;
      return;
    }

    const label = t.seo.pageTitles[page.title];
    const description = t.seo.pageDescriptions[page.description];
    document.title = `${PERSON_NAME[language] || PERSON_NAME.th} · ${label} | ${profile[language].role}`;
    if (descriptionMeta) descriptionMeta.content = description;
  }, [language, pathname, t]);
};
