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
import IntroLoader from '@/components/layout/IntroLoader';
import SmoothScroll from '@/components/providers/SmoothScroll';
import { HeroNavProvider } from '@/components/providers/HeroNavProvider';

export const metadata = {
    title: 'Country Kids Learning Centre — Rooted in Country, Flourishing Together',
    description:
        'A not-for-profit early learning centre in Ravenhall, Victoria. Seven purpose-named rooms for children 6 weeks to 6 years, funded 3 & 4 year old kinder, five fresh meals daily. Book a free tour today.',
    /* The centre's own mark, 1080x1080. This replaced a reference to
       /images/favicon.svg, which was a ZERO-BYTE file — so the site has been
       shipping a favicon link to an empty document and browsers were falling
       back to a blank page icon. The svg is left in place untouched in case
       something else points at it; nothing here does any more.

       `apple` is the same file: iOS ignores the standard icon when adding to
       the home screen and would otherwise render a grey placeholder. */
    icons: {
        icon: '/images/favicon.png',
        shortcut: '/images/favicon.png',
        apple: '/images/favicon.png',
    },
};

export const viewport = {
    width: 'device-width',
    initialScale: 1,
    /* Matches the light theme's cream page field, so the mobile browser chrome
       blends with the site the visitor actually gets by default. */
    themeColor: '#C5B07C',
};

/* Runs before paint to prevent a flash of the wrong theme (FOUC). Default =
   LIGHT for every first-time visitor; only an explicit toggle (saved to
   localStorage under 'ckTheme') flips to dark on later visits.

   Note the inverted test: anything other than an explicit stored 'dark' means
   light, so a missing or corrupt value falls back to the default rather than to
   the toggled state.

   prefers-color-scheme is still deliberately ignored — the site has one default
   and one explicit switch, not three states. */
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
                                '.pm-inner{transform:none!important}' +
                                /* The intro overlay is server-rendered and is
                                   dismissed by an effect — without JS it would
                                   cover the homepage forever. */
                                '.intro{display:none!important}',
                        }}
                    />
                </noscript>
            </head>
            <body>
                <ThemeProvider>
                    <TranslationProvider>
                        {/* Renders nothing — owns the Lenis + ScrollTrigger loop. */}
                        <SmoothScroll />
                        <IntroLoader />

                        <PageTransition />
                        {/* The navbar and the hero live in different subtrees
                            but share one fact: whether the home page's
                            pre-entry experience has been dismissed. */}
                        <HeroNavProvider>
                            <SiteHeader />
                            {children}
                        </HeroNavProvider>
                        <SiteFooter />
                    </TranslationProvider>
                </ThemeProvider>
            </body>
        </html>
    );
}
