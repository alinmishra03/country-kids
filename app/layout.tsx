/* Root layout — the shell every route renders inside: <head>, providers, the
   nav, footer and page-transition overlay. Mirrors the reference project's
   app/layout.js.

   CSS: styles/style.css is an @import chain whose ORDER IS LOAD-BEARING —
   base tokens first, theme-dark.css last. Importing the single entry point here
   preserves that cascade. responsive.css loads LAST (all rules are wrapped in
   max-width media queries, so it cannot affect the desktop layout). */

import '@/styles/style.css';
import '@/styles/responsive.css';
import { ThemeProvider } from '@/components/providers/ThemeProvider';
import { TranslationProvider } from '@/components/providers/TranslationProvider';
import SiteHeader from '@/components/layout/SiteHeader';
import SiteFooter from '@/components/layout/SiteFooter';
import PageTransition from '@/components/layout/PageTransition';

export const metadata = {
    title: 'Country Kids Learning Centre — Rooted in Country, Flourishing Together',
    description:
        'A not-for-profit early learning centre in Ravenhall, Victoria. Seven purpose-named rooms for children 6 weeks to 6 years, funded 3 & 4 year old kinder, five fresh meals daily. Book a free tour today.',
    icons: { icon: '/images/favicon.svg' },
};

export const viewport = {
    width: 'device-width',
    initialScale: 1,
    themeColor: '#0B1B2B',
};

/* Runs before paint to prevent a flash of the wrong theme (FOUC). Default =
   LIGHT for every first-time visitor; only an explicit toggle (saved to
   localStorage under 'ckTheme') flips to dark on later visits. */
const THEME_INIT = `(function () {
    try {
        var stored = localStorage.getItem('ckTheme');
        var theme = stored === 'dark' ? 'dark' : 'light';
        document.documentElement.setAttribute('data-theme', theme);
    } catch (e) {
        document.documentElement.setAttribute('data-theme', 'light');
    }
})();`;

export default function RootLayout({ children }) {
    return (
        <html lang="en" data-theme="light" suppressHydrationWarning>
            <head>
                <link rel="preconnect" href="https://fonts.googleapis.com" />
                <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
                <link
                    href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,500&family=Inter:wght@400;500&display=swap"
                    rel="stylesheet"
                />
                <script dangerouslySetInnerHTML={{ __html: THEME_INIT }} />
            </head>
            <body>
                <ThemeProvider>
                    <TranslationProvider>
                        <PageTransition />
                        <SiteHeader />
                        {children}
                        <SiteFooter />
                    </TranslationProvider>
                </ThemeProvider>
            </body>
        </html>
    );
}
