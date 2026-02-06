import React, { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { translations } from './translations';
import type { Language } from './translations';

interface I18nContextType {
    language: Language;
    setLanguage: (lang: Language) => void;
    t: (key: string) => string;
}

const I18nContext = createContext<I18nContextType | undefined>(undefined);

export const useTranslation = () => {
    const context = useContext(I18nContext);
    if (!context) {
        throw new Error('useTranslation must be used within an I18nProvider');
    }
    return context;
};

interface I18nProviderProps {
    children: ReactNode;
}

export const I18nProvider: React.FC<I18nProviderProps> = ({ children }) => {
    // Get initial language from localStorage or default to English
    const [language, setLanguageState] = useState<Language>(() => {
        const saved = localStorage.getItem('app_language');
        return (saved === 'ml' || saved === 'en') ? saved : 'en';
    });

    // Translation function with nested key support (e.g., "common.save")
    const t = (key: string): string => {
        const keys = key.split('.');
        let value: any = translations[language];

        for (const k of keys) {
            if (value && typeof value === 'object' && k in value) {
                value = value[k];
            } else {
                // Fallback to English if key not found
                let fallback: any = translations.en;
                for (const fk of keys) {
                    if (fallback && typeof fallback === 'object' && fk in fallback) {
                        fallback = fallback[fk];
                    } else {
                        return key; // Return key itself if not found
                    }
                }
                return fallback;
            }
        }

        return typeof value === 'string' ? value : key;
    };

    // Update language and save to localStorage
    const setLanguage = (lang: Language) => {
        setLanguageState(lang);
        localStorage.setItem('app_language', lang);
        // Update HTML lang attribute for accessibility
        document.documentElement.lang = lang === 'ml' ? 'ml' : 'en';
    };

    // Set initial HTML lang attribute
    useEffect(() => {
        document.documentElement.lang = language === 'ml' ? 'ml' : 'en';
    }, []);

    return (
        <I18nContext.Provider value={{ language, setLanguage, t }}>
            {children}
        </I18nContext.Provider>
    );
};
