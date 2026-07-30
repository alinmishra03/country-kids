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

/* Kept in one place because the OG title, the Twitter title and the <title>
   have to agree, and because a link preview shows the description to people who
   have not seen the page yet — it is marketing copy, not a meta afterthought. */
const SITE_URL = 'https://www.countrykids.au';
const SITE_TITLE = 'Country Kids Learning Centre — Rooted in Country, Flourishing Together';
const SITE_DESC =
    'A not-for-profit early learning centre in Ravenhall, Victoria. Seven purpose-named rooms for children 6 weeks to 6 years, funded 3 & 4 year old kinder, five fresh meals daily. Book a free tour today.';

export const metadata = {
    /* Without this, Next emits the relative "/og-image.png" as-is. Every
       scraper — WhatsApp, Facebook, LinkedIn, iMessage — requires an ABSOLUTE
       url in og:image and simply drops a relative one, which is the blank grey
       panel that was showing. metadataBase is what turns the relative path
       below into https://www.countrykids.au/og-image.png. */
    metadataBase: new URL(SITE_URL),
    title: SITE_TITLE,
    description: SITE_DESC,
    /* Deliberately NO canonical here.
       Metadata in the root layout is inherited by every route, and a canonical
       of "/" would have every interior page declare itself a duplicate of the
       homepage — which invites search engines to drop /about, /philosophy and
       the rest from the index. That is worse than having none: with no tag,
       each page is canonical to its own URL, which is already correct.

       A per-page canonical is the right answer, but it needs each route to
       export its own metadata, and every page under app/ is a Client Component
       ('use client'), which cannot. Doing it properly means a small server
       layout per route — worth doing, but it is a structural change and not
       part of a metadata fix. */
    openGraph: {
        type: 'website',
        siteName: 'Country Kids Learning Centre',
        url: SITE_URL,
        title: SITE_TITLE,
        description: SITE_DESC,
        locale: 'en_AU',
        images: [
            {
                url: '/og-image.png',
                width: 1200,
                height: 630,
                type: 'image/png',
                alt: 'Country Kids Learning Centre',
            },
        ],
    },
    twitter: {
        card: 'summary_large_image',
        title: SITE_TITLE,
        description: SITE_DESC,
        images: ['/og-image.png'],
    },
    /* ── Favicon ──
       Built from the centre's supplied mark, composited onto the brand navy.

       The artwork is a WHITE logo on a TRANSPARENT background. A browser tab is
       white in light mode, so pointing at it directly makes the icon vanish —
       which is what the previous /images/favicon.png did, and before that the
       reference was to /images/favicon.svg, a zero-byte file. An opaque navy
       plate is what makes it legible on any tab chrome, light or dark.

       Several sizes rather than one: browsers downscale a single 512 badly at
       16px, so the 32 is rendered at its own size with tighter padding. No
       baked-in corner radius — every OS applies its own mask, and a radius
       underneath theirs shows as a dark halo.

       `apple` is separate because iOS ignores the standard icon on the home
       screen and would otherwise render a grey placeholder. */
    icons: {
        icon: [
            { url: '/icon-32.png', sizes: '32x32', type: 'image/png' },
            { url: '/icon-192.png', sizes: '192x192', type: 'image/png' },
            { url: '/icon-512.png', sizes: '512x512', type: 'image/png' },
        ],
        shortcut: '/icon-32.png',
        apple: '/apple-icon.png',
    },
};

export const viewport = {
    width: 'device-width',
    initialScale: 1,
    /* Matches the light theme's cream page field, so the mobile browser chrome
       blends with the site the visitor actually gets by default. */
    themeColor: '#ECBE00',
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
