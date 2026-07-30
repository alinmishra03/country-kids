'use client';

/* Primary navbar — a React-Bits "PillNav"-styled bar adapted for Next.js App
   Router. Every existing feature is preserved: the flat nav mirrors the source
   IA, "Rooms" keeps its dropdown, plus the theme toggle, Enrol CTA, sticky-glass
   behaviour, active-route highlight, and a premium full-screen mobile slide menu.

   Motion split for robustness + 60fps:
   - Pill hover (expanding gold circle + vertical label swap) + active pill: CSS
     transitions (transform/opacity only, GPU-composited).
   - GSAP: initial load reveal, hamburger→X morph, and the mobile menu
     (backdrop + slide-in panel + item stagger). The bar does NOT hide on
     scroll — it is on screen at every scroll position; only its glass state
     responds to scrolling.
   All motion respects prefers-reduced-motion. The bar is light over the dark hero
   and switches to navy on the glass state when scrolled. */

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
    useCallback,
    useEffect,
    useLayoutEffect,
    useRef,
    useState,
} from 'react';
import { gsap } from 'gsap';
import { CustomEase } from 'gsap/CustomEase';
import Icon from '@/components/shared/Icon';
import EnrollCta from '@/components/shared/EnrollCta';
import ThemeToggle from './ThemeToggle';
import { NAV_GROUP_FOR_ROUTE, routeIdFromPathname } from '@/lib/routes';
import { PRIMARY_NAV } from '@/lib/nav-data';
import { useHeroNav } from '@/components/providers/HeroNavProvider';

/* The site's --ease-out, expressed for GSAP. The reveal below is the one place
   the navbar animates on the same curve as the hero's pre-entry layer, so the
   handover reads as a single movement rather than two. */
gsap.registerPlugin(CustomEase);
const EASE_OUT = CustomEase.create('ckEaseOut', 'M0,0 C0.22,1 0.36,1 1,1');

/* Runs before paint on the client, no-ops on the server (avoids the SSR warning
   while preventing a reveal flash). */
const useIsoLayoutEffect = typeof window !== 'undefined' ? useLayoutEffect : useEffect;

const prefersReduced = () =>
    typeof window !== 'undefined' &&
    window.matchMedia &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

function PillLabel({ label }: { label: string }) {
    return (
        <span className="pill">
            <span className="pill-circle" aria-hidden="true" />
            <span className="pill-labels">
                <span className="pill-label">{label}</span>
                <span className="pill-label pill-label--alt" aria-hidden="true">
                    {label}
                </span>
            </span>
        </span>
    );
}

export default function SiteHeader() {
    const pathname = usePathname();
    /* On the home page the bar starts concealed: the hero owns navigation until
       "Continue" is pressed. Everywhere else this is true from the first render,
       so nothing below changes on any other route. */
    const { navRevealed } = useHeroNav();
    const [scrolled, setScrolled] = useState(false);
    const [openDropdown, setOpenDropdown] = useState<string | null>(null);
    const [mobileOpen, setMobileOpen] = useState(false);
    const [openGroup, setOpenGroup] = useState<string | null>(null);

    const routeId = routeIdFromPathname(pathname);
    const activeGroup = NAV_GROUP_FOR_ROUTE[routeId] || null;

    // Refs for GSAP-driven bits.
    const navRef = useRef<HTMLElement>(null);
    const hamburgerRef = useRef<HTMLButtonElement>(null);
    const barTopRef = useRef<HTMLSpanElement>(null);
    const barMidRef = useRef<HTMLSpanElement>(null);
    const barBotRef = useRef<HTMLSpanElement>(null);
    const backdropRef = useRef<HTMLDivElement>(null);
    const panelRef = useRef<HTMLDivElement>(null);
    const hamburgerTl = useRef<gsap.core.Timeline | null>(null);
    const mobileTl = useRef<gsap.core.Timeline | null>(null);
    const mobileOpenRef = useRef(false);
    /* Whether the bar was already on screen when this mounted — the difference
       between "the site loaded" and "the hero handed over". */
    const mountedRevealedRef = useRef(navRevealed);
    const lastRevealedRef = useRef(navRevealed);

    /* ── Scroll: toggle the glass state, and nothing else ──
       The bar used to hide itself on a downward scroll and slide back on an
       upward one. It no longer does: the header stays on screen at every scroll
       position, which is what the rest of this effect now exists to leave
       alone. Only the glass/solid state still responds to scrolling, because
       that is a change of appearance rather than of presence.

       The home page's pre-entry conceal is a different mechanism and is
       untouched — there the hero owns navigation until "Continue" is pressed,
       and the reveal effect below still runs the handover. */
    useEffect(() => {
        let ticking = false;
        let scrolledState = window.scrollY > 40;
        setScrolled(scrolledState);

        const update = () => {
            ticking = false;
            const nextScrolled = window.scrollY > 40;
            if (nextScrolled !== scrolledState) {
                scrolledState = nextScrolled;
                setScrolled(nextScrolled);
            }
        };
        const onScroll = () => {
            if (!ticking) {
                ticking = true;
                requestAnimationFrame(update);
            }
        };
        window.addEventListener('scroll', onScroll, { passive: true });
        return () => window.removeEventListener('scroll', onScroll);
    }, []);

    /* ── Initial load reveal (logo + pills + actions) ──
       Unchanged for every route that ships its navbar visible. Skipped when the
       bar mounts concealed: it would play behind a hidden element and be spent
       before anyone could see it. The handover effect below plays the same
       stagger at the moment it is worth watching. */
    useIsoLayoutEffect(() => {
        if (!mountedRevealedRef.current) return;
        if (prefersReduced() || !navRef.current) return;
        const ctx = gsap.context(() => {
            gsap.from('.nav-reveal', {
                y: -18,
                opacity: 0,
                duration: 0.7,
                ease: 'power3.out',
                stagger: 0.06,
                delay: 0.1,
            });
        }, navRef);
        return () => ctx.revert();
    }, []);

    /* ── Handover: the hero's Continue button reveals the bar, "Back to globe"
       and any route change back to home take it away again ──
       A layout effect, not a plain one: React has already dropped the
       `.nav-concealed` class in the render that flipped the flag, so the inline
       concealed state has to be written back before the browser paints or the
       bar flashes in at full opacity for one frame.

       Inline styles are also why the class alone cannot conceal it again on the
       way back: once GSAP has written a transform, only GSAP can take it away.

       Nothing here runs on any route that mounts revealed. */
    useIsoLayoutEffect(() => {
        const nav = navRef.current;
        if (!nav) return;
        if (lastRevealedRef.current === navRevealed) return;
        lastRevealedRef.current = navRevealed;

        /* Going back to the globe — or to home from another route — re-arms the
           pre-entry experience. Animated rather than snapped, because on "Back
           to globe" this is on screen and needs to leave the way it arrived; on
           a route change it plays under the page wipe, where it costs nothing.

           The mobile menu is closed alongside it: the panel is a sibling of the
           bar, so hiding one would otherwise strand the other. */
        if (!navRevealed) {
            setMobileOpen(false);
            if (prefersReduced()) {
                gsap.set(nav, { yPercent: -104, autoAlpha: 0 });
                return;
            }
            const out = gsap.to(nav, {
                yPercent: -104,
                autoAlpha: 0,
                duration: 0.55,
                ease: EASE_OUT,
            });
            return () => {
                out.kill();
            };
        }

        if (prefersReduced()) {
            gsap.set(nav, { yPercent: 0, autoAlpha: 1 });
            return;
        }

        gsap.set(nav, { yPercent: -104, autoAlpha: 0 });
        /* Killed rather than reverted on cleanup: reverting would hand `yPercent`
           back to a recorded value, and that property belongs to the scroll
           hide/show handler once this has finished. */
        const tl = gsap
            .timeline()
            .to(nav, { yPercent: 0, autoAlpha: 1, duration: 0.85, ease: EASE_OUT })
            .from(
                nav.querySelectorAll('.nav-reveal'),
                {
                    y: -14,
                    opacity: 0,
                    duration: 0.6,
                    ease: EASE_OUT,
                    stagger: 0.07,
                    /* A killed `from` tween does not restore what it overwrote.
                       Without this, navigating away mid-reveal could leave the
                       logo and pills stranded at opacity 0. */
                    clearProps: 'opacity,transform',
                },
                0.18
            );
        return () => {
            tl.kill();
        };
    }, [navRevealed]);

    /* ── Hamburger → X morph timeline (built once) ── */
    useIsoLayoutEffect(() => {
        if (!barTopRef.current) return;
        const tl = gsap.timeline({
            paused: true,
            defaults: { duration: 0.3, ease: 'power2.inOut' },
        });
        tl.to(barTopRef.current, { rotate: 45, y: 7 }, 0)
            .to(barMidRef.current, { opacity: 0, scaleX: 0.2 }, 0)
            .to(barBotRef.current, { rotate: -45, y: -7 }, 0);
        hamburgerTl.current = tl;
        return () => {
            tl.kill();
            hamburgerTl.current = null;
        };
    }, []);

    /* ── Mobile menu timeline: backdrop fade + panel slide-in + item stagger ── */
    useIsoLayoutEffect(() => {
        const panel = panelRef.current;
        const backdrop = backdropRef.current;
        if (!panel || !backdrop) return;
        const items = panel.querySelectorAll<HTMLElement>('.m-item');

        gsap.set(backdrop, { autoAlpha: 0 });
        gsap.set(panel, { xPercent: 100 });
        gsap.set(items, { autoAlpha: 0, x: 30 });

        const tl = gsap.timeline({ paused: true });
        tl.to(backdrop, { autoAlpha: 1, duration: 0.3, ease: 'power1.out' }, 0)
            .to(panel, { xPercent: 0, duration: 0.5, ease: 'power3.out' }, 0)
            .to(
                items,
                { autoAlpha: 1, x: 0, duration: 0.4, ease: 'power2.out', stagger: 0.05 },
                0.18
            );
        mobileTl.current = tl;
        return () => {
            tl.kill();
            mobileTl.current = null;
        };
    }, []);

    /* Play/reverse mobile menu on state change (or set instantly if reduced). */
    useEffect(() => {
        mobileOpenRef.current = mobileOpen;
        const tl = mobileTl.current;
        const hTl = hamburgerTl.current;
        const reduced = prefersReduced();
        if (tl) {
            if (reduced) tl.progress(mobileOpen ? 1 : 0).pause();
            else if (mobileOpen) tl.play();
            else tl.reverse();
        }
        if (hTl) {
            if (reduced) hTl.progress(mobileOpen ? 1 : 0).pause();
            else if (mobileOpen) hTl.play();
            else hTl.reverse();
        }
        document.body.classList.toggle('menu-open', mobileOpen);
        // Fully remove the closed panel from focus order / accessibility tree.
        if (panelRef.current) (panelRef.current as any).inert = !mobileOpen;
    }, [mobileOpen]);

    /* Focus management + focus trap + ESC while the mobile menu is open. */
    useEffect(() => {
        if (!mobileOpen) return;
        const panel = panelRef.current;
        if (!panel) return;
        const focusables = () =>
            Array.from(
                panel.querySelectorAll<HTMLElement>(
                    'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])'
                )
            ).filter((el) => el.offsetParent !== null);

        const first = focusables()[0];
        first?.focus();

        const onKey = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                setMobileOpen(false);
                return;
            }
            if (e.key !== 'Tab') return;
            const f = focusables();
            if (!f.length) return;
            const firstEl = f[0];
            const lastEl = f[f.length - 1];
            if (e.shiftKey && document.activeElement === firstEl) {
                e.preventDefault();
                lastEl.focus();
            } else if (!e.shiftKey && document.activeElement === lastEl) {
                e.preventDefault();
                firstEl.focus();
            }
        };
        document.addEventListener('keydown', onKey);
        return () => {
            document.removeEventListener('keydown', onKey);
            hamburgerRef.current?.focus();
        };
    }, [mobileOpen]);

    /* Desktop dropdown: close on outside click / Escape. */
    useEffect(() => {
        if (!openDropdown) return;
        const onClick = (e: MouseEvent) => {
            if (!(e.target as HTMLElement).closest('.pill-nav .has-dropdown'))
                setOpenDropdown(null);
        };
        const onKey = (e: KeyboardEvent) => {
            if (e.key === 'Escape') setOpenDropdown(null);
        };
        document.addEventListener('click', onClick);
        document.addEventListener('keydown', onKey);
        return () => {
            document.removeEventListener('click', onClick);
            document.removeEventListener('keydown', onKey);
        };
    }, [openDropdown]);

    /* Close everything on route change. */
    useEffect(() => {
        setMobileOpen(false);
        setOpenDropdown(null);
        setOpenGroup(null);
    }, [pathname]);

    const closeMobile = useCallback(() => setMobileOpen(false), []);
    const toggleMobile = useCallback(() => setMobileOpen((o) => !o), []);
    const toggleDropdown = (key: string) => (e: any) => {
        e.stopPropagation();
        e.preventDefault();
        setOpenDropdown((cur) => (cur === key ? null : key));
    };

    const Logo = <span className="logo-img nav-logo-img" aria-hidden="true" />;

    return (
        <>
            <nav
                id="navbar"
                ref={navRef}
                /* `nav-concealed` is rendered, not applied by an effect, so the
                   home page's server HTML already ships the bar hidden — there
                   is no frame in which it exists on screen before the pre-entry
                   layer takes over. */
                className={
                    [scrolled ? 'scrolled' : '', navRevealed ? '' : 'nav-concealed']
                        .filter(Boolean)
                        .join(' ') || undefined
                }
                aria-label="Primary"
            >
                <div className="nav-inner">
                    <Link className="nav-logo nav-reveal" href="/" aria-label="Country Kids home">
                        {Logo}
                    </Link>

                    <ul className="pill-nav nav-reveal">
                        {PRIMARY_NAV.map((item: any) =>
                            item.children ? (
                                <li
                                    key={item.id}
                                    className={`pill-item has-dropdown${
                                        openDropdown === item.id ? ' open' : ''
                                    }${activeGroup === item.id ? ' is-active' : ''}`}
                                >
                                    <span className="pill-split">
                                        <Link
                                            href={item.href}
                                            className="pill-link"
                                            aria-current={activeGroup === item.id ? 'page' : undefined}
                                        >
                                            <PillLabel label={item.label} />
                                        </Link>
                                        <button
                                            type="button"
                                            className="pill-caret-btn"
                                            aria-haspopup="true"
                                            aria-expanded={openDropdown === item.id}
                                            aria-label={`${item.label} menu`}
                                            onClick={toggleDropdown(item.id)}
                                        >
                                            <span className="caret" aria-hidden="true" />
                                        </button>
                                    </span>
                                    <ul className="dropdown" role="menu">
                                        {item.children.map((l: any) => (
                                            <li key={l.href} role="none">
                                                <Link role="menuitem" href={l.href}>
                                                    {l.label}
                                                </Link>
                                            </li>
                                        ))}
                                    </ul>
                                </li>
                            ) : (
                                <li
                                    key={item.id}
                                    className={`pill-item${
                                        activeGroup === item.id ? ' is-active' : ''
                                    }`}
                                >
                                    <Link
                                        href={item.href}
                                        className="pill-link"
                                        aria-current={activeGroup === item.id ? 'page' : undefined}
                                    >
                                        <PillLabel label={item.label} />
                                    </Link>
                                </li>
                            )
                        )}
                    </ul>

                    <div className="nav-actions nav-reveal">
                        <ThemeToggle id="themeToggle" className="theme-toggle-desktop" />
                        <ThemeToggle
                            id="themeToggleHeaderMobile"
                            className="theme-toggle-header-mobile"
                        />
                        <EnrollCta className="nav-cta" />
                        <button
                            className="hamburger"
                            ref={hamburgerRef}
                            onClick={toggleMobile}
                            aria-expanded={mobileOpen}
                            aria-controls="mobileMenu"
                            aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
                        >
                            <span ref={barTopRef} />
                            <span ref={barMidRef} />
                            <span ref={barBotRef} />
                        </button>
                    </div>
                </div>
            </nav>

            {/* MOBILE MENU */}
            <div
                className="m-backdrop"
                ref={backdropRef}
                onClick={closeMobile}
                aria-hidden="true"
            />
            <aside
                className="m-panel"
                ref={panelRef}
                id="mobileMenu"
                role="dialog"
                aria-modal="true"
                aria-label="Menu"
                aria-hidden={!mobileOpen}
            >
                <nav className="m-nav" aria-label="Mobile">
                    <Link className="m-item m-link" href="/" onClick={closeMobile}>
                        Home
                    </Link>

                    {PRIMARY_NAV.map((item: any) =>
                        item.children ? (
                            <MobileGroup
                                key={item.id}
                                id={item.id}
                                label={item.label}
                                href={item.href}
                                open={openGroup === item.id}
                                onToggle={setOpenGroup}
                                onNavigate={closeMobile}
                            >
                                {item.children.map((l: any) => (
                                    <Link href={l.href} key={l.href} onClick={closeMobile}>
                                        {l.label}
                                    </Link>
                                ))}
                            </MobileGroup>
                        ) : (
                            <Link
                                className="m-item m-link"
                                href={item.href}
                                key={item.id}
                                onClick={closeMobile}
                            >
                                {item.label}
                            </Link>
                        )
                    )}

                    <EnrollCta
                        className="m-item mobile-cta"
                        icon="sparkles"
                        iconPosition="start"
                        onNavigate={closeMobile}
                    />

                    <div className="m-item mobile-toggles-row">
                        <ThemeToggle id="themeToggleMobile" className="theme-toggle-mobile" />
                    </div>
                </nav>
            </aside>
        </>
    );
}

function MobileGroup({
    id,
    label,
    href,
    open,
    onToggle,
    onNavigate,
    children,
}: any) {
    return (
        <div className={`m-item m-group${open ? ' open' : ''}`}>
            <div className="m-group-head">
                <Link className="m-group-link" href={href} onClick={onNavigate}>
                    {label}
                </Link>
                <button
                    type="button"
                    className="m-group-toggle"
                    aria-expanded={open}
                    aria-label={`${label} submenu`}
                    onClick={() => onToggle((cur: string | null) => (cur === id ? null : id))}
                >
                    <span className="caret" aria-hidden="true" />
                </button>
            </div>
            <div className="m-group-body">
                <div className="m-group-body-inner">{children}</div>
            </div>
        </div>
    );
}
