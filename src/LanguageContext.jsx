import { createContext, useState, useContext } from 'react';
import { en, th } from './data/translations';

const LanguageContext = createContext();

export const LanguageProvider = ({ children }) => {
    const [language, setLanguage] = useState('th'); // Default to Thai

    const toggleLanguage = () => {
        setLanguage((prev) => (prev === 'th' ? 'en' : 'th'));
    };

    const t = language === 'th' ? th : en;

    return (
        <LanguageContext.Provider value={{ language, toggleLanguage, t }}>
            {children}
        </LanguageContext.Provider>
    );
};

export const useLanguage = () => useContext(LanguageContext);
