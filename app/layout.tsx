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
import SmoothScroll from '@/components/providers/SmoothScroll';

export const metadata = {
    title: 'Country Kids Learning Centre — Rooted in Country, Flourishing Together',
    description:
        'A not-for-profit early learning centre in Ravenhall, Victoria. Seven purpose-named rooms for children 6 weeks to 6 years, funded 3 & 4 year old kinder, five fresh meals daily. Book a free tour today.',
    icons: { icon: '/images/favicon.svg' },
};

export const viewport = {
    width: 'device-width',
    initialScale: 1,
    /* Matches the dark theme's page field, so the mobile browser chrome blends
       with the site instead of showing the old blue. */
    themeColor: '#05060A',
};

/* Runs before paint to prevent a flash of the wrong theme (FOUC). Default =
   DARK for every first-time visitor; only an explicit toggle (saved to
   localStorage under 'ckTheme') flips to light on later visits.

   Note the inverted test: anything other than an explicit stored 'light' means
   dark, so a missing or corrupt value falls back to the default rather than to
   the toggled state. */
const THEME_INIT = `(function () {
    try {
        var stored = localStorage.getItem('ckTheme');
        var theme = stored === 'light' ? 'light' : 'dark';
        document.documentElement.setAttribute('data-theme', theme);
    } catch (e) {
        document.documentElement.setAttribute('data-theme', 'dark');
    }
})();`;

export default function RootLayout({ children }) {
    return (
        <html lang="en" data-theme="dark" suppressHydrationWarning>
            <head>
                <link rel="preconnect" href="https://fonts.googleapis.com" />
                <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
                {/* Newsreader (display) + Plus Jakarta Sans (body) — a modern,
                    elegant pairing kept deliberately light: only 300/400/500 are
                    requested so no heavy weight can ever be synthesised. */}
                <link
                    href="https://fonts.googleapis.com/css2?family=Newsreader:ital,opsz,wght@0,6..72,300..500;1,6..72,300..500&family=Plus+Jakarta+Sans:wght@300;400;500&display=swap"
                    rel="stylesheet"
                />
                <script dangerouslySetInnerHTML={{ __html: THEME_INIT }} />
                {/* Safety net. The reveal components ship their hidden state in
                    the server HTML (a word translated below its mask, an image
                    clipped away), which JS then animates in. With scripting off
                    that state would never be undone and the headings would stay
                    invisible — the text is in the DOM for crawlers either way,
                    but a human with JS disabled would see empty headings. */}
                <noscript>
                    <style
                        dangerouslySetInnerHTML={{
                            __html:
                                '.tr-word{transform:none!important}' +
                                '.pm{clip-path:none!important}' +
                                '.pm-inner{transform:none!important}',
                        }}
                    />
                </noscript>
            </head>
            <body>
                <ThemeProvider>
                    <TranslationProvider>
                        {/* Renders nothing — owns the Lenis + ScrollTrigger loop. */}
                        <SmoothScroll />
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
