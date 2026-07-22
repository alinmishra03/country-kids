'use client';

/* Primary navbar — a React-Bits "PillNav"-styled bar adapted for Next.js App
   Router. Every existing feature is preserved: the flat nav mirrors the source
   IA, "Rooms" keeps its dropdown, plus the theme toggle, Enrol CTA, sticky-glass
   behaviour, active-route highlight, and a premium full-screen mobile slide menu.

   Motion split for robustness + 60fps:
   - Pill hover (expanding gold circle + vertical label swap) + active pill: CSS
     transitions (transform/opacity only, GPU-composited).
   - GSAP: initial load reveal, scroll hide/show by direction, hamburger→X morph,
     and the mobile menu (backdrop + slide-in panel + item stagger).
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
import Icon from '@/components/shared/Icon';
import ThemeToggle from './ThemeToggle';
import { NAV_GROUP_FOR_ROUTE, routeIdFromPathname } from '@/lib/routes';
import { PRIMARY_NAV } from '@/lib/nav-data';

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

    /* ── Scroll: toggle glass state (only on change) + hide on down / show on up ── */
    useEffect(() => {
        const nav = navRef.current;
        const reduced = prefersReduced();
        let lastY = window.scrollY;
        let hidden = false;
        let ticking = false;
        let scrolledState = window.scrollY > 40;
        setScrolled(scrolledState);

        const update = () => {
            ticking = false;
            const y = window.scrollY;
            const nextScrolled = y > 40;
            if (nextScrolled !== scrolledState) {
                scrolledState = nextScrolled;
                setScrolled(nextScrolled);
            }
            if (!nav || reduced || mobileOpenRef.current) {
                lastY = y;
                return;
            }
            if (y > lastY && y > 220 && !hidden) {
                hidden = true;
                gsap.to(nav, { yPercent: -100, duration: 0.4, ease: 'power2.out' });
            } else if ((y < lastY || y <= 220) && hidden) {
                hidden = false;
                gsap.to(nav, { yPercent: 0, duration: 0.4, ease: 'power2.out' });
            }
            lastY = y;
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

    /* ── Initial load reveal (logo + pills + actions) ── */
    useIsoLayoutEffect(() => {
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
                className={scrolled ? 'scrolled' : undefined}
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
                        <Link className="nav-cta" href="/enroll">
                            Enrol Now
                        </Link>
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

                    <Link className="m-item mobile-cta" href="/enroll" onClick={closeMobile}>
                        <Icon name="sparkles" /> Enrol Now
                    </Link>

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
