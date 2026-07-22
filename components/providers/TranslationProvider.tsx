'use client';

/* Lightweight translation context — kept for structural parity with the
   reference project. This site currently ships English only, so <T> renders its
   children (the English fallback) directly. To add a language, extend
   TRANSLATIONS and the lang toggle; every <T k="..."> call already reads through
   this provider. */

import { createContext, useContext, useState, useCallback } from 'react';

const TRANSLATIONS = {
    en: {},
};

type TranslationContextValue = {
    lang: string;
    setLang: (next: string) => void;
    t: (key: string, fallback?: any) => any;
};

const TranslationContext = createContext<TranslationContextValue>({
    lang: 'en',
    setLang: () => {},
    t: (key, fallback) => fallback,
});

export function TranslationProvider({ children }: any) {
    const [lang, setLangState] = useState('en');

    const setLang = useCallback((next) => {
        setLangState(next);
        try {
            document.documentElement.setAttribute('lang', next);
        } catch (e) {}
    }, []);

    const t = useCallback(
        (key, fallback) => {
            const dict = TRANSLATIONS[lang] || {};
            return dict[key] != null ? dict[key] : fallback;
        },
        [lang]
    );

    return (
        <TranslationContext.Provider value={{ lang, setLang, t }}>
            {children}
        </TranslationContext.Provider>
    );
}

export function useTranslation() {
    return useContext(TranslationContext);
}
