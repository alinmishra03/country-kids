'use client';

/* Additive enhancement layer — scroll reveals (.fx-reveal / .fx-stagger), image
   fade-in and smooth in-page anchor scrolling. Opacity/transform only, so page
   geometry is never affected. Honors prefers-reduced-motion. Mirrors the
   reference project's hooks/useAnimations.js (trimmed to this project's needs). */

import { useEffect } from 'react';

const REVEAL_SELECTORS = [
    '.section-head > *',
    '.section-title',
    '.section-subtitle',
    '.about-copy > *',
    '.page-hero-content > *',
    '.prose > *',
];

const STAGGER_PARENT_SELECTORS = [
    '.programs-grid',
    '.features-grid',
    '.testimonials-grid',
    '.gallery-grid',
    '.stats-grid',
    '.footer-grid',
];

function tagOnce(el, cls) {
    if (!el || el.classList.contains(cls)) return false;
    el.classList.add(cls);
    return true;
}

function isAlreadyOnScreen(el) {
    const rect = el.getBoundingClientRect();
    const vh = window.innerHeight || document.documentElement.clientHeight;
    return rect.top < vh * 0.92 && rect.bottom > 0;
}

function autoTag(root) {
    if (!root) return;

    STAGGER_PARENT_SELECTORS.forEach((sel) => {
        root.querySelectorAll(sel).forEach((el) => {
            if (el.closest('.fade-up')) return;
            if (tagOnce(el, 'fx-stagger') && isAlreadyOnScreen(el)) el.classList.add('fx-in');
        });
    });

    REVEAL_SELECTORS.forEach((sel) => {
        root.querySelectorAll(sel).forEach((el) => {
            if (el.classList.contains('fx-stagger') || el.closest('.fx-stagger')) return;
            if (el.closest('.fade-up')) return;
            if (tagOnce(el, 'fx-reveal') && isAlreadyOnScreen(el)) el.classList.add('fx-in');
        });
    });
}

function observeReveals(root, reduced) {
    if (!root) return null;
    const targets = root.querySelectorAll('.fx-reveal:not(.fx-in), .fx-stagger:not(.fx-in)');
    if (!targets.length) return null;

    if (reduced || !('IntersectionObserver' in window)) {
        targets.forEach((t) => t.classList.add('fx-in'));
        return null;
    }

    const obs = new IntersectionObserver(
        (entries, o) => {
            entries.forEach((entry) => {
                if (!entry.isIntersecting) return;
                entry.target.classList.add('fx-in');
                o.unobserve(entry.target);
            });
        },
        { root: null, rootMargin: '0px 0px -8% 0px', threshold: 0.08 }
    );
    targets.forEach((t) => obs.observe(t));
    return obs;
}

function tagAndFadeImages(root) {
    if (!root) return;
    root.querySelectorAll('img').forEach((img) => {
        if (img.classList.contains('img-fade')) return;
        img.classList.add('img-fade');
        if (!img.hasAttribute('loading')) img.setAttribute('loading', 'lazy');
        if (!img.hasAttribute('decoding')) img.setAttribute('decoding', 'async');
        const markLoaded = () => img.classList.add('img-loaded');
        img.addEventListener('load', markLoaded, { once: true });
        img.addEventListener('error', markLoaded, { once: true });
        if (img.complete && img.naturalWidth > 0) markLoaded();
    });
}

function bindSmoothScroll() {
    const onClick = (e) => {
        const a = e.target.closest('a[href*="#"]');
        if (!a) return;
        const href = a.getAttribute('href') || '';
        const hashIndex = href.indexOf('#');
        if (hashIndex < 0) return;
        const id = href.slice(hashIndex);
        if (id === '#') return;
        // only intercept same-page anchors
        const path = href.slice(0, hashIndex);
        if (path && path !== window.location.pathname) return;
        const target = document.querySelector(id);
        if (!target) return;
        e.preventDefault();
        const navH =
            parseInt(getComputedStyle(document.documentElement).getPropertyValue('--nav-h')) || 80;
        const top = target.getBoundingClientRect().top + window.scrollY - (navH + 16);
        window.scrollTo({ top, behavior: 'smooth' });
    };
    document.addEventListener('click', onClick);
    return () => document.removeEventListener('click', onClick);
}

export default function useAnimations(rootRef) {
    useEffect(() => {
        const root = rootRef.current;
        if (!root) return;

        const reduced =
            window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

        autoTag(root);
        const obs = observeReveals(root, reduced);
        tagAndFadeImages(root);
        const unbind = bindSmoothScroll();

        const t1 = setTimeout(() => {
            autoTag(root);
            tagAndFadeImages(root);
        }, 200);

        return () => {
            clearTimeout(t1);
            if (obs) obs.disconnect();
            unbind();
        };
    }, [rootRef]);
}
