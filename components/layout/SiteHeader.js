'use client';

/* Primary navbar + mobile menu. Both live in one component because they share
   the open/closed state. Behaviour mirrors the reference project's SiteHeader:

   - .scrolled toggles on #navbar past 50px of scroll
   - desktop dropdowns open on click and CSS hover; opening one closes the others;
     outside click and Escape close all
   - body.menu-open locks scroll while the mobile menu is open
   - route change closes the mobile menu
   - active-nav highlight derived from the route (NAV_GROUP_FOR_ROUTE) */

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import T from '@/components/shared/T';
import ThemeToggle from './ThemeToggle';
import { NAV_GROUP_FOR_ROUTE, routeIdFromPathname } from '@/lib/routes';
import { ABOUT_LINKS, PROGRAM_LINKS } from '@/lib/nav-data';

export default function SiteHeader() {
    const pathname = usePathname();
    const [scrolled, setScrolled] = useState(false);
    const [openDropdown, setOpenDropdown] = useState(null); // 'about' | 'programs'
    const [mobileOpen, setMobileOpen] = useState(false);
    const [openGroup, setOpenGroup] = useState(null);

    const routeId = routeIdFromPathname(pathname);
    const activeGroup = NAV_GROUP_FOR_ROUTE[routeId] || null;

    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 50);
        onScroll();
        window.addEventListener('scroll', onScroll);
        return () => window.removeEventListener('scroll', onScroll);
    }, []);

    useEffect(() => {
        if (!openDropdown) return;
        const onClick = (e) => {
            if (!e.target.closest('.nav-links .has-dropdown')) setOpenDropdown(null);
        };
        const onKey = (e) => {
            if (e.key === 'Escape') setOpenDropdown(null);
        };
        document.addEventListener('click', onClick);
        document.addEventListener('keydown', onKey);
        return () => {
            document.removeEventListener('click', onClick);
            document.removeEventListener('keydown', onKey);
        };
    }, [openDropdown]);

    useEffect(() => {
        document.body.classList.toggle('menu-open', mobileOpen);
        return () => document.body.classList.remove('menu-open');
    }, [mobileOpen]);

    useEffect(() => {
        setMobileOpen(false);
        setOpenDropdown(null);
    }, [pathname]);

    const closeMobile = useCallback(() => {
        setMobileOpen(false);
        setOpenGroup(null);
    }, []);

    const toggleMobile = useCallback(() => {
        setMobileOpen((was) => {
            if (was) setOpenGroup(null);
            return !was;
        });
    }, []);

    const toggleDropdown = (key) => (e) => {
        e.stopPropagation();
        setOpenDropdown((cur) => (cur === key ? null : key));
    };

    const Logo = (
        <>
            <span className="logo-mark" aria-hidden="true">{'\u{1F9F8}'}</span>
            <span>Country<b>Kids</b></span>
        </>
    );

    return (
        <>
            <nav id="navbar" className={scrolled ? 'scrolled' : undefined} aria-label="Primary">
                <div className="nav-inner">
                    <Link className="nav-logo" href="/" aria-label="CountryKids home">
                        {Logo}
                    </Link>

                    <ul className="nav-links">
                        <li>
                            <Link href="/" className={activeGroup === 'home' ? 'nav-link-active' : undefined}>
                                <T k="nav-home">Home</T>
                            </Link>
                        </li>

                        <li
                            className={`has-dropdown${openDropdown === 'programs' ? ' open' : ''}${
                                activeGroup === 'programs' ? ' nav-link-active' : ''
                            }`}
                        >
                            <button
                                type="button"
                                className="dropdown-toggle"
                                aria-haspopup="true"
                                aria-expanded={openDropdown === 'programs'}
                                onClick={toggleDropdown('programs')}
                            >
                                <T k="nav-programs">Programs</T> <span className="caret" aria-hidden="true"></span>
                            </button>
                            <ul className="dropdown">
                                {PROGRAM_LINKS.map((l) => (
                                    <li key={l.href}>
                                        <Link href={l.href}>{l.label}</Link>
                                    </li>
                                ))}
                            </ul>
                        </li>

                        <li
                            className={`has-dropdown${openDropdown === 'about' ? ' open' : ''}${
                                activeGroup === 'about' ? ' nav-link-active' : ''
                            }`}
                        >
                            <button
                                type="button"
                                className="dropdown-toggle"
                                aria-haspopup="true"
                                aria-expanded={openDropdown === 'about'}
                                onClick={toggleDropdown('about')}
                            >
                                <T k="nav-about">About</T> <span className="caret" aria-hidden="true"></span>
                            </button>
                            <ul className="dropdown">
                                {ABOUT_LINKS.map((l) => (
                                    <li key={l.href}>
                                        <Link href={l.href}>{l.label}</Link>
                                    </li>
                                ))}
                            </ul>
                        </li>

                        <li>
                            <Link href="/contact" className={activeGroup === 'contact' ? 'nav-link-active' : undefined}>
                                <T k="nav-contact">Contact</T>
                            </Link>
                        </li>
                    </ul>

                    <ThemeToggle id="themeToggleHeaderMobile" className="theme-toggle-header-mobile" />
                    <ThemeToggle id="themeToggle" className="theme-toggle-desktop" />

                    <Link className="nav-cta" href="/enroll">
                        <T k="nav-enroll">Enroll Now</T>
                    </Link>

                    <button
                        className="hamburger"
                        id="hamburger"
                        onClick={toggleMobile}
                        aria-expanded={mobileOpen}
                        aria-label="Menu"
                    >
                        <span></span>
                        <span></span>
                        <span></span>
                    </button>
                </div>
            </nav>

            {/* MOBILE MENU */}
            <div className={`mobile-menu${mobileOpen ? ' open' : ''}`} id="mobileMenu">
                <button className="mobile-close" onClick={toggleMobile} aria-label="Close">
                    ✕
                </button>
                <div className="mobile-scroll">
                    <Link className="m-link" href="/" onClick={closeMobile}>Home</Link>

                    <MobileGroup
                        id="programs"
                        label="Programs"
                        open={openGroup === 'programs'}
                        onToggle={setOpenGroup}
                    >
                        {PROGRAM_LINKS.map((l) => (
                            <Link href={l.href} key={l.href} onClick={closeMobile}>{l.label}</Link>
                        ))}
                    </MobileGroup>

                    <MobileGroup
                        id="about"
                        label="About"
                        open={openGroup === 'about'}
                        onToggle={setOpenGroup}
                    >
                        {ABOUT_LINKS.map((l) => (
                            <Link href={l.href} key={l.href} onClick={closeMobile}>{l.label}</Link>
                        ))}
                    </MobileGroup>

                    <Link className="m-link" href="/contact" onClick={closeMobile}>Contact</Link>
                    <Link className="mobile-cta" href="/enroll" onClick={closeMobile}>Enroll Now</Link>

                    <div className="mobile-toggles-row">
                        <ThemeToggle id="themeToggleMobile" className="theme-toggle-mobile" />
                    </div>
                </div>
            </div>
        </>
    );
}

function MobileGroup({ id, label, open, onToggle, children }) {
    return (
        <div className={`m-group${open ? ' open' : ''}`}>
            <button
                type="button"
                className="m-group-toggle"
                aria-expanded={open}
                onClick={() => onToggle((cur) => (cur === id ? null : id))}
            >
                {label} <span className="caret" aria-hidden="true"></span>
            </button>
            <div className="m-group-body">{children}</div>
        </div>
    );
}
