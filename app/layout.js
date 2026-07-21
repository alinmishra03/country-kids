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
    title: 'CountryKids Daycare — Learn, Play & Grow',
    description:
        'Warm, safe and joyful daycare for babies through pre-K. Caring teachers, nutritious meals, and daily updates. Book a free tour today.',
    icons: { icon: '/images/favicon.svg' },
};

export const viewport = {
    width: 'device-width',
    initialScale: 1,
    themeColor: '#1E6FC4',
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
                    href="https://fonts.googleapis.com/css2?family=Baloo+2:wght@500;600;700;800&family=Nunito:wght@400;600;700;800&display=swap"
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
