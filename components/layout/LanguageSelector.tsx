'use client';

/* Language selector — the site's only translation control.

   WHY THE GOOGLE TRANSLATE ELEMENT, and not a dictionary:
   every page under app/ is a Client Component with its copy written inline, so
   a key-based dictionary would mean hand-authoring a translation for every
   string on the site and keeping fourteen copies in sync forever. The Website
   Translator element translates the LIVE DOM instead, which means new copy is
   covered the day it ships and no route ever needs a duplicate. It needs no npm
   package and no API key — one async <script>, appended once.

   WHY IT NEVER RELOADS:
   the usual recipe for this widget is "write the googtrans cookie, reload".
   That cannot be used here. HeroNavProvider derives `navRevealed` from the
   pathname, so a reload on "/" would drop the visitor back onto the pre-entry
   globe and make them press Continue again — the language switch would look
   like it threw the page away. So the selection is pushed straight into the
   widget's hidden <select> instead: the DOM is retranslated in place and every
   piece of app state (globe entry, open menu, scroll position) survives.

   The cookie is still written, because that is what carries the choice across
   a real page load — the widget reads it on init and re-applies the language
   with no help from us.

   The whole control is marked translate="no" / .notranslate on purpose: if the
   widget translated its own language list, "English" would render in the
   target language and the way back would be unreadable. */

import { useCallback, useEffect, useId, useRef, useState } from 'react';

/* English first (the default), then alphabetical by English name. The seven
   required languages plus the next most-spoken community languages in
   Victoria — long enough to be useful, short enough to scan in one glance.
   `short` is a fixed two-character badge so the trigger never changes width
   when the language changes (a widening button would shove the Enrol CTA). */
export const LANGUAGES = [
    { code: 'en', short: 'EN', native: 'English', name: 'English' },
    { code: 'ar', short: 'AR', native: 'العربية', name: 'Arabic' },
    { code: 'zh-CN', short: 'CN', native: '简体中文', name: 'Chinese (Simplified)' },
    { code: 'zh-TW', short: 'TW', native: '繁體中文', name: 'Chinese (Traditional)' },
    { code: 'tl', short: 'TL', native: 'Filipino', name: 'Filipino' },
    { code: 'el', short: 'EL', native: 'Ελληνικά', name: 'Greek' },
    { code: 'hi', short: 'HI', native: 'हिन्दी', name: 'Hindi' },
    { code: 'it', short: 'IT', native: 'Italiano', name: 'Italian' },
    { code: 'ko', short: 'KO', native: '한국어', name: 'Korean' },
    { code: 'ne', short: 'NE', native: 'नेपाली', name: 'Nepali' },
    { code: 'pa', short: 'PA', native: 'ਪੰਜਾਬੀ', name: 'Punjabi' },
    { code: 'es', short: 'ES', native: 'Español', name: 'Spanish' },
    { code: 'ur', short: 'UR', native: 'اردو', name: 'Urdu' },
    { code: 'vi', short: 'VI', native: 'Tiếng Việt', name: 'Vietnamese' },
];

const DEFAULT_LANG = 'en';
/* The element the widget mounts into. SiteHeader renders it once, off-screen —
   see GoogleTranslateHost at the bottom of this file. */
export const GT_HOST_ID = 'ck-gt-host';
const GT_SCRIPT_ID = 'ck-gt-script';

/* ── Cookie: the only thing that survives a full page load ──
   Format is the widget's own: /<page language>/<target>. Written at the bare
   host AND at the dotted parent so the choice holds across www and apex; the
   bare path=/ write is what works on localhost, where a domain= attribute is
   rejected outright. No Expires — this is a session cookie, which is exactly
   "remember it for this visit". */
function cookieScopes() {
    const host = typeof window !== 'undefined' ? window.location.hostname : '';
    if (!host || host === 'localhost' || /^[\d.]+$/.test(host)) return [''];
    return ['', `;domain=${host}`, `;domain=.${host}`];
}

function writeCookie(code: string) {
    const value = `/${DEFAULT_LANG}/${code}`;
    cookieScopes().forEach((scope) => {
        document.cookie = `googtrans=${value};path=/${scope}`;
    });
}

function clearCookie() {
    cookieScopes().forEach((scope) => {
        document.cookie = `googtrans=;path=/;expires=Thu, 01 Jan 1970 00:00:00 GMT${scope}`;
    });
}

function readCookieLang(): string {
    if (typeof document === 'undefined') return DEFAULT_LANG;
    const match = document.cookie.match(/(?:^|;\s*)googtrans=([^;]*)/);
    if (!match) return DEFAULT_LANG;
    const parts = decodeURIComponent(match[1]).split('/');
    const code = parts[2];
    return LANGUAGES.some((l) => l.code === code) ? code : DEFAULT_LANG;
}

/* ── Shared state ──
   Two instances of this control are on screen at once (the bar on desktop, the
   slide menu on mobile) and they must agree. A three-line module store rather
   than a context: the control is self-contained and nothing else on the site
   needs to read the language, so there is no reason to add another provider to
   the root layout. */
let currentLang = DEFAULT_LANG;
const listeners = new Set<(lang: string) => void>();

function broadcast(lang: string) {
    currentLang = lang;
    listeners.forEach((fn) => fn(lang));
}

/* ── Widget bootstrap (once per page load) ──
   Guarded twice: the module flag covers StrictMode running every effect twice
   in development, and the getElementById check covers a remount after a
   fast-refresh that reset module state but left the <script> in place. */
let scriptRequested = false;

function ensureWidget() {
    if (typeof window === 'undefined') return;
    if (scriptRequested || document.getElementById(GT_SCRIPT_ID)) {
        scriptRequested = true;
        return;
    }
    scriptRequested = true;

    (window as any).googleTranslateElementInit = function () {
        const g = (window as any).google;
        if (!g || !g.translate || !g.translate.TranslateElement) return;
        if (!document.getElementById(GT_HOST_ID)) return;
        /* autoDisplay:false suppresses the widget's own "translate this page?"
           prompt — the only entry point is the control below. */
        new g.translate.TranslateElement(
            { pageLanguage: DEFAULT_LANG, autoDisplay: false },
            GT_HOST_ID
        );
    };

    const s = document.createElement('script');
    s.id = GT_SCRIPT_ID;
    s.async = true;
    s.src = 'https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
    document.body.appendChild(s);
}

/* Web fonts for the scripts the site's own fonts lack — see section 8 of
   css/language-selector.css, which is what puts them in the font stacks.
   Requested on first use rather than from the root layout: the stylesheet is
   ~60KB of @font-face rules that an English visitor never needs. Once added it
   stays; Google Fonts serves each script by unicode-range, so only the files
   for glyphs actually on screen are ever downloaded. */
const INTL_FONTS_ID = 'ck-intl-fonts';
const INTL_FONTS_HREF =
    'https://fonts.googleapis.com/css2' +
    '?family=Noto+Naskh+Arabic:wght@400;500' +
    '&family=Noto+Sans:wght@300;400;500' +
    '&family=Noto+Sans+Arabic:wght@300;400;500' +
    '&family=Noto+Sans+Devanagari:wght@300;400;500' +
    '&family=Noto+Sans+Gurmukhi:wght@300;400;500' +
    '&family=Noto+Serif:wght@300;400;500' +
    '&family=Noto+Serif+Devanagari:wght@300;400;500' +
    '&family=Noto+Serif+Gurmukhi:wght@300;400;500' +
    '&display=swap';

function ensureIntlFonts() {
    if (typeof document === 'undefined' || document.getElementById(INTL_FONTS_ID)) return;
    const link = document.createElement('link');
    link.id = INTL_FONTS_ID;
    link.rel = 'stylesheet';
    link.href = INTL_FONTS_HREF;
    document.head.appendChild(link);
}

/* Push a language into the widget's hidden <select>.

   The script is async, so the combo may not exist yet when someone picks a
   language in the first second — hence the retry rather than a single miss.
   ~6s of polling, then it gives up silently rather than looping forever.

   Falling back to '' matters for the return to English: the widget builds its
   option list from the languages it can translate INTO, and the page language
   is not always among them. The empty option is the combo's "no translation"
   state, which is what restores the original copy. */
function applyToWidget(code: string, attempt = 0) {
    if (typeof document === 'undefined') return;
    if (code === DEFAULT_LANG && restoreOriginal()) return;
    const combo = document.querySelector('.goog-te-combo') as HTMLSelectElement | null;
    if (!combo) {
        if (attempt < 40) window.setTimeout(() => applyToWidget(code, attempt + 1), 150);
        return;
    }
    const target = Array.from(combo.options).some((o) => o.value === code) ? code : '';
    if (combo.value === target) return;
    combo.value = target;
    combo.dispatchEvent(new Event('change'));
}

/* The way back to English.

   The combo DOES list English, so pushing 'en' into it asks the widget to
   translate English into English: the page keeps its translated state, and the
   widget is left half-switched and ignores the next language picked. The
   widget's own "show original" action is the restore button in its banner — a
   same-origin iframe the stylesheet hides, but which is still in the DOM.
   Clicking that is exactly what a visitor would have done with the banner, and
   it leaves the widget ready for the next pick.

   Returns false when the banner is not there (widget not loaded yet, or a
   future markup change), so the caller falls back to the combo. */
function restoreOriginal(): boolean {
    const frames = Array.from(document.querySelectorAll('iframe')) as HTMLIFrameElement[];
    for (const frame of frames) {
        let restore: HTMLElement | null = null;
        try {
            restore = frame.contentDocument?.querySelector('[id$=".restore"]') as HTMLElement | null;
        } catch (e) {
            /* Cross-origin frame — not the widget's banner. */
        }
        if (restore) {
            restore.click();
            return true;
        }
    }
    return false;
}

/* ── Does the desktop bar still fit? ──
   The pills and the Enrol CTA are nowrap, and the widget translates them in
   place. In English the row only just fits at the 1080px handover; in Filipino,
   Greek, Spanish or Vietnamese it runs 150–340px wider than the shell, which
   shoves this control, the theme toggle and the CTA past the right edge of the
   viewport. No width is safe for every language, so instead of shrinking
   anything, the header falls back to its own tablet layout (hamburger + slide
   menu, with the menu instance of this control) whenever the row would not fit.

   The flag is an attribute on <html>, not a class: the widget rewrites the
   root's className when it adds translated-ltr/rtl. Measured with the flag
   removed so the answer is always about the full desktop row; the remove/read/
   restore happens in one task, so it never paints. Below 1080px the media
   query already owns the layout and the flag is simply cleared. */
const COMPACT_ATTR = 'data-ck-nav-compact';

function syncHeaderFit() {
    const root = document.documentElement;
    const inner = document.querySelector('.nav-inner') as HTMLElement | null;
    if (!inner || window.matchMedia('(max-width: 1080px)').matches) {
        root.removeAttribute(COMPACT_ATTR);
        return;
    }
    root.removeAttribute(COMPACT_ATTR);
    const kids = Array.from(inner.children).filter(
        (el) => el.getBoundingClientRect().width > 0
    );
    const gap = parseFloat(getComputedStyle(inner).columnGap) || 0;
    const needed =
        kids.reduce((sum, el) => sum + el.getBoundingClientRect().width, 0) +
        gap * Math.max(0, kids.length - 1);
    /* Sub-pixel slack: flex rounding alone can report a fraction over. */
    if (needed > inner.clientWidth + 1) root.setAttribute(COMPACT_ATTR, '');
}

function useHeaderFit(enabled: boolean) {
    useEffect(() => {
        if (!enabled) return;
        let frame = 0;
        const schedule = () => {
            cancelAnimationFrame(frame);
            frame = requestAnimationFrame(syncHeaderFit);
        };
        schedule();
        window.addEventListener('resize', schedule);
        /* Translation swaps the pills' text nodes; the root's class flips when
           a language is applied or removed. */
        const textObserver = new MutationObserver(schedule);
        const inner = document.querySelector('.nav-inner');
        if (inner) textObserver.observe(inner, { childList: true, subtree: true, characterData: true });
        const rootObserver = new MutationObserver(schedule);
        rootObserver.observe(document.documentElement, { attributes: true, attributeFilter: ['class', 'lang'] });
        document.fonts?.ready.then(schedule);
        return () => {
            cancelAnimationFrame(frame);
            window.removeEventListener('resize', schedule);
            textObserver.disconnect();
            rootObserver.disconnect();
            document.documentElement.removeAttribute(COMPACT_ATTR);
        };
    }, [enabled]);
}

function GlobeIcon() {
    return (
        <svg className="ck-lang-globe" viewBox="0 0 24 24" aria-hidden="true">
            <circle cx="12" cy="12" r="9" />
            <path d="M3 12h18" />
            <path d="M12 3a15 15 0 0 1 0 18a15 15 0 0 1 0-18z" />
        </svg>
    );
}

type Props = {
    /** `bar` = absolutely-positioned panel in the header. `menu` = in-flow list
        inside the mobile slide menu, which cannot be clipped by its scroll box. */
    variant?: 'bar' | 'menu';
    className?: string;
    /** Mobile menu only: let the header close the menu after a pick. */
    onSelect?: () => void;
};

export default function LanguageSelector({ variant = 'bar', className = '', onSelect }: Props) {
    const [open, setOpen] = useState(false);
    /* Always DEFAULT_LANG for the server render and the first client render —
       reading the cookie during render would be a hydration mismatch. The real
       value arrives in the effect below, one paint later. */
    const [lang, setLang] = useState(DEFAULT_LANG);
    const [activeIndex, setActiveIndex] = useState(0);

    const rootRef = useRef<HTMLDivElement>(null);
    const triggerRef = useRef<HTMLButtonElement>(null);
    const optionRefs = useRef<Array<HTMLButtonElement | null>>([]);
    const listId = `ck-lang-list-${useId()}`;

    const active = LANGUAGES.find((l) => l.code === lang) || LANGUAGES[0];

    /* One owner for the header-fit check: the bar instance, which is the one
       that lives in the row being measured. */
    useHeaderFit(variant === 'bar');

    /* Mount: start the widget, adopt whatever the cookie already says, and
       subscribe so the other instance's picks land here too. The widget
       re-applies the cookie itself on init, so there is nothing to push here. */
    useEffect(() => {
        ensureWidget();
        const fromCookie = readCookieLang();
        if (fromCookie !== currentLang) currentLang = fromCookie;
        if (currentLang !== DEFAULT_LANG) ensureIntlFonts();
        setLang(currentLang);
        const onChange = (next: string) => setLang(next);
        listeners.add(onChange);
        return () => {
            listeners.delete(onChange);
        };
    }, []);

    /* Keep the highlighted row in step with the current language each time the
       panel opens, so the keyboard starts where the eye does. */
    useEffect(() => {
        if (!open) return;
        const idx = LANGUAGES.findIndex((l) => l.code === lang);
        setActiveIndex(idx < 0 ? 0 : idx);
    }, [open, lang]);

    /* Move real focus onto the highlighted option (roving tabindex). */
    useEffect(() => {
        if (!open) return;
        optionRefs.current[activeIndex]?.focus();
    }, [open, activeIndex]);

    /* Close on outside press. pointerdown rather than click so the panel is
       gone before a tap can land on whatever is underneath it. */
    useEffect(() => {
        if (!open) return;
        const onPointerDown = (e: Event) => {
            if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
        };
        document.addEventListener('pointerdown', onPointerDown);
        return () => document.removeEventListener('pointerdown', onPointerDown);
    }, [open]);

    /* The bar and the slide menu swap at 1080px. A panel left open across that
       swap would be stranded on a control that is no longer on screen. */
    useEffect(() => {
        if (!open) return;
        const close = () => setOpen(false);
        window.addEventListener('resize', close);
        return () => window.removeEventListener('resize', close);
    }, [open]);

    const choose = useCallback(
        (code: string) => {
            setOpen(false);
            triggerRef.current?.focus();
            if (code === currentLang) {
                onSelect?.();
                return;
            }
            if (code === DEFAULT_LANG) clearCookie();
            else {
                writeCookie(code);
                ensureIntlFonts();
            }
            broadcast(code);
            applyToWidget(code);
            /* Announce the language to assistive tech. Only the live document
               is touched — the server HTML still ships lang="en", so nothing
               about the page as a crawler sees it changes. */
            try {
                document.documentElement.setAttribute('lang', code);
            } catch (e) {}
            onSelect?.();
        },
        [onSelect]
    );

    const onTriggerKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
            e.preventDefault();
            setOpen(true);
        } else if (e.key === 'Escape' && open) {
            e.preventDefault();
            setOpen(false);
        }
    };

    const onListKeyDown = (e: React.KeyboardEvent) => {
        switch (e.key) {
            case 'ArrowDown':
                e.preventDefault();
                setActiveIndex((i) => (i + 1) % LANGUAGES.length);
                break;
            case 'ArrowUp':
                e.preventDefault();
                setActiveIndex((i) => (i - 1 + LANGUAGES.length) % LANGUAGES.length);
                break;
            case 'Home':
                e.preventDefault();
                setActiveIndex(0);
                break;
            case 'End':
                e.preventDefault();
                setActiveIndex(LANGUAGES.length - 1);
                break;
            case 'Escape':
                e.preventDefault();
                setOpen(false);
                triggerRef.current?.focus();
                break;
            case 'Tab':
                /* Leave the panel the way a keyboard user expects — closed,
                   with the trigger behind them in the tab order. */
                setOpen(false);
                break;
            default:
                break;
        }
    };

    return (
        <div
            ref={rootRef}
            className={`ck-lang ck-lang--${variant}${open ? ' is-open' : ''}${
                className ? ` ${className}` : ''
            }`}
            /* Both markers: `translate` is the standard attribute, `.notranslate`
               is what the widget's own scanner honours. */
            translate="no"
        >
            <button
                type="button"
                ref={triggerRef}
                className="ck-lang-trigger notranslate"
                aria-haspopup="listbox"
                aria-expanded={open}
                aria-controls={listId}
                aria-label={`Select language. Current language: ${active.name}`}
                title="Select language"
                onClick={() => setOpen((o) => !o)}
                onKeyDown={onTriggerKeyDown}
            >
                <GlobeIcon />
                <span className="ck-lang-code">{active.short}</span>
                <svg className="ck-lang-chevron" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M6 9l6 6 6-6" />
                </svg>
            </button>

            <div
                id={listId}
                className="ck-lang-menu notranslate"
                role="listbox"
                aria-label="Choose a language"
                onKeyDown={onListKeyDown}
                /* The list is taller than its box and scrolls. Without this it
                   could not: Lenis runs with smoothWheel on every non-touch
                   pointer, and it answers the wheel by easing the PAGE — the
                   event never reaches this element, so the list sat still while
                   the site scrolled behind it. data-lenis-prevent is the opt-out
                   Lenis checks for, and it hands the wheel back to the browser's
                   native scrolling inside this subtree only.

                   Touch needs nothing: SmoothScroll bails out entirely on a
                   coarse pointer, so phones and tablets were already native. */
                data-lenis-prevent
                /* Removed from the accessibility tree AND the tab order while
                   closed — the mobile menu's focus trap walks this subtree. */
                hidden={!open}
            >
                {LANGUAGES.map((l, i) => {
                    const selected = l.code === lang;
                    return (
                        <button
                            key={l.code}
                            type="button"
                            role="option"
                            aria-selected={selected}
                            ref={(el) => {
                                optionRefs.current[i] = el;
                            }}
                            tabIndex={i === activeIndex ? 0 : -1}
                            className={`ck-lang-option${selected ? ' is-selected' : ''}`}
                            onClick={() => choose(l.code)}
                        >
                            <span className="ck-lang-native" lang={l.code}>
                                {l.native}
                            </span>
                            <span className="ck-lang-label">{l.name}</span>
                        </button>
                    );
                })}
            </div>
        </div>
    );
}

/* The element the widget mounts into — rendered ONCE, by SiteHeader.

   Parked off-screen rather than display:none. The widget builds a real <select>
   in here and the selection above is delivered by dispatching a change event on
   it; keeping it laid out (just nowhere visible) is the version that is
   guaranteed to keep working.

   `inert` is what stops a keyboard user tabbing into an invisible <select> —
   CSS alone cannot take a focusable element out of the tab order, and the
   off-screen combo would otherwise be a stop on the way through the header.
   Dispatching an event on an inert node still works, so the selection above is
   unaffected. aria-hidden covers assistive tech that predates inert. */
export function GoogleTranslateHost() {
    return <div id={GT_HOST_ID} className="ck-gt-host" aria-hidden="true" inert />;
}
