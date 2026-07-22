'use client';

/* Primary navbar + mobile menu. Both live in one component because they share
   the open/closed state.

   - .scrolled toggles on #navbar past 40px of scroll (transparent over hero →
     solid on scroll)
   - flat top-level nav mirrors the source site; "Rooms" also opens a dropdown of
     the seven rooms (click + CSS hover). Opening one closes the others; outside
     click and Escape close all.
   - body.menu-open locks scroll while the mobile menu is open
   - route change closes the mobile menu
   - active-nav highlight derived from the route */

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import Icon from '@/components/shared/Icon';
import ThemeToggle from './ThemeToggle';
import { NAV_GROUP_FOR_ROUTE, routeIdFromPathname } from '@/lib/routes';
import { PRIMARY_NAV } from '@/lib/nav-data';

export default function SiteHeader() {
    const pathname = usePathname();
    const [scrolled, setScrolled] = useState(false);
    const [openDropdown, setOpenDropdown] = useState<string | null>(null);
    const [mobileOpen, setMobileOpen] = useState(false);
    const [openGroup, setOpenGroup] = useState<string | null>(null);

    const routeId = routeIdFromPathname(pathname);
    const activeGroup = NAV_GROUP_FOR_ROUTE[routeId] || null;

    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 40);
        onScroll();
        window.addEventListener('scroll', onScroll, { passive: true });
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

    const isActive = (item) =>
        activeGroup === item.id || (item.children && item.children.some((c) => activeGroup && c.href.startsWith(`/${activeGroup}`)));

    const Logo = (
        <>
            <span className="logo-mark" aria-hidden="true"><Icon name="sprout" /></span>
            <span className="logo-text">
                Country<b>Kids</b>
                <em>Learning Centre</em>
            </span>
        </>
    );

    return (
        <>
            <nav id="navbar" className={scrolled ? 'scrolled' : undefined} aria-label="Primary">
                <div className="nav-inner">
                    <Link className="nav-logo" href="/" aria-label="Country Kids home">
                        {Logo}
                    </Link>

                    <ul className="nav-links">
                        {PRIMARY_NAV.map((item) =>
                            item.children ? (
                                <li
                                    key={item.id}
                                    className={`has-dropdown${openDropdown === item.id ? ' open' : ''}${
                                        activeGroup === item.id ? ' nav-link-active' : ''
                                    }`}
                                >
                                    <span className="dropdown-split">
                                        <Link href={item.href} className="dropdown-label">
                                            {item.label}
                                        </Link>
                                        <button
                                            type="button"
                                            className="dropdown-toggle"
                                            aria-haspopup="true"
                                            aria-expanded={openDropdown === item.id}
                                            aria-label={`${item.label} menu`}
                                            onClick={toggleDropdown(item.id)}
                                        >
                                            <span className="caret" aria-hidden="true" />
                                        </button>
                                    </span>
                                    <ul className="dropdown">
                                        {item.children.map((l) => (
                                            <li key={l.href}>
                                                <Link href={l.href}>{l.label}</Link>
                                            </li>
                                        ))}
                                    </ul>
                                </li>
                            ) : (
                                <li key={item.id}>
                                    <Link
                                        href={item.href}
                                        className={activeGroup === item.id ? 'nav-link-active' : undefined}
                                    >
                                        {item.label}
                                    </Link>
                                </li>
                            )
                        )}
                    </ul>

                    <ThemeToggle id="themeToggleHeaderMobile" className="theme-toggle-header-mobile" />
                    <ThemeToggle id="themeToggle" className="theme-toggle-desktop" />

                    <Link className="nav-cta" href="/enroll">
                        Enrol Now
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
                <button className="mobile-close" onClick={toggleMobile} aria-label="Close menu">
                    <Icon name="x" />
                </button>
                <div className="mobile-scroll">
                    <Link className="m-link" href="/" onClick={closeMobile}>Home</Link>

                    {PRIMARY_NAV.map((item) =>
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
                                {item.children.map((l) => (
                                    <Link href={l.href} key={l.href} onClick={closeMobile}>{l.label}</Link>
                                ))}
                            </MobileGroup>
                        ) : (
                            <Link className="m-link" href={item.href} key={item.id} onClick={closeMobile}>
                                {item.label}
                            </Link>
                        )
                    )}

                    <Link className="mobile-cta" href="/enroll" onClick={closeMobile}>Enrol Now</Link>

                    <div className="mobile-toggles-row">
                        <ThemeToggle id="themeToggleMobile" className="theme-toggle-mobile" />
                    </div>
                </div>
            </div>
        </>
    );
}

function MobileGroup({ id, label, href, open, onToggle, onNavigate, children }: any) {
    return (
        <div className={`m-group${open ? ' open' : ''}`}>
            <div className="m-group-head">
                <Link className="m-group-link" href={href} onClick={onNavigate}>{label}</Link>
                <button
                    type="button"
                    className="m-group-toggle"
                    aria-expanded={open}
                    aria-label={`${label} submenu`}
                    onClick={() => onToggle((cur) => (cur === id ? null : id))}
                >
                    <span className="caret" aria-hidden="true"></span>
                </button>
            </div>
            <div className="m-group-body">{children}</div>
        </div>
    );
}
