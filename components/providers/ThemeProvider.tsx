'use client';

/* Light/dark theme provider.

   - localStorage key 'ckTheme', values 'dark' | 'light'
   - writes data-theme on <html>; all theming is CSS vars keyed off [data-theme]
   - default is DARK; prefers-color-scheme is deliberately ignored, only an
     explicit toggle produces light
   - the pre-paint inline script in app/layout.js sets data-theme before first
     paint (FOUC guard); this provider re-syncs after hydration, which is why the
     initial state is 'dark' rather than a localStorage read. */

import { createContext, useContext, useCallback, useEffect, useState } from 'react';

type ThemeContextValue = { theme: string; setTheme: (next: string) => void; toggle: () => void };

const ThemeContext = createContext<ThemeContextValue>({
    theme: 'dark',
    setTheme: () => {},
    toggle: () => {},
});

export function ThemeProvider({ children }: any) {
    const [theme, setThemeState] = useState('dark');

    useEffect(() => {
        const current = document.documentElement.getAttribute('data-theme');
        if (current === 'light') setThemeState('light');
    }, []);

    const setTheme = useCallback((next) => {
        const value = next === 'dark' ? 'dark' : 'light';
        setThemeState(value);
        document.documentElement.setAttribute('data-theme', value);
        try {
            localStorage.setItem('ckTheme', value);
        } catch (e) {
            /* private mode — theme still applies for this session */
        }
    }, []);

    const toggle = useCallback(() => {
        setTheme(theme === 'dark' ? 'light' : 'dark');
    }, [theme, setTheme]);

    return (
        <ThemeContext.Provider value={{ theme, setTheme, toggle }}>
            {children}
        </ThemeContext.Provider>
    );
}

export function useTheme() {
    return useContext(ThemeContext);
}
