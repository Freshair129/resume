import { createContext, useState, useContext, useEffect } from 'react';
import { en, th } from './data/translations';
import { publicEn, publicTh } from './data/publicTranslations';

const LanguageContext = createContext();

export const LanguageProvider = ({ children }) => {
    const [language, setLanguage] = useState(() => new URLSearchParams(window.location.search).get('lang') === 'en' ? 'en' : 'th');
    useEffect(() => { document.documentElement.lang = language; }, [language]);

    const toggleLanguage = () => {
        setLanguage((prev) => (prev === 'th' ? 'en' : 'th'));
    };

    const t = import.meta.env.DEV ? (language === 'th' ? th : en) : (language === 'th' ? publicTh : publicEn);

    return (
        <LanguageContext.Provider value={{ language, toggleLanguage, t }}>
            {children}
        </LanguageContext.Provider>
    );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useLanguage = () => useContext(LanguageContext);
