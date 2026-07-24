'use client';

/* The hero section.

   Composition, top to bottom:
     · .hero-bg      dark premium gradient + noise + vignette (CSS, no JS)
     · Scene         the WebGL globe, full-bleed, client-only
     · .hero-veil    scrim that keeps the centred copy legible over the globe
     · Overlay       the real, server-rendered heading / CTA
     · FocusCard     the centred DOM card, only while one is selected
     · .hero-sr      every card as a plain link, for crawlers and screen readers

   FOCUS LIFECYCLE — three pieces of state, because the exit is animated and
   therefore cannot simply drop the selection:

     select(i, origin) → selected = i          FocusCard flies out of `origin`
     requestClose()    → closing = true        FocusCard plays its exit
     onClosed()        → selected = null       globe resumes, canvas un-dims

   Nothing else re-renders: rotation, hover and the card springs all live in
   refs inside the canvas. */

import dynamic from 'next/dynamic';
import Link from 'next/link';
import { useCallback, useEffect, useRef, useState } from 'react';
import { HERO_CARDS } from '@/lib/hero/hero-cards';
import type { GlobeApi } from '@/hooks/useGlobeControls';
import { usePrefersReducedMotion } from '@/hooks/useMediaQuery';
import Overlay from '@/components/home/hero/Overlay';
import FocusCard, { type FocusOrigin } from '@/components/home/hero/FocusCard';

/* WebGL never runs on the server, and the canvas must not be in the SSR HTML —
   the copy above it is what gets server-rendered. */
const Scene = dynamic(() => import('@/components/home/hero/Scene'), {
    ssr: false,
    loading: () => <div className="hero-canvas" aria-hidden="true" />,
});

export default function Hero() {
    const sectionRef = useRef<HTMLElement>(null);
    const apiRef = useRef<GlobeApi | null>(null);
    const [selected, setSelected] = useState<number | null>(null);
    const [origin, setOrigin] = useState<FocusOrigin | null>(null);
    const [closing, setClosing] = useState(false);
    const reduced = usePrefersReducedMotion();

    const select = useCallback((index: number, from?: FocusOrigin) => {
        setOrigin(from ?? null);
        setClosing(false);
        setSelected(index);
    }, []);

    /* Ask the focus card to leave. The selection is NOT dropped here — the card
       needs it to render while it animates out. */
    const requestClose = useCallback(() => setClosing(true), []);

    const onClosed = useCallback(() => {
        setClosing(false);
        setSelected(null);
        setOrigin(null);
    }, []);

    /* Prev / next. The current position is the selection if there is one, and
       otherwise whatever card the idle orbit has drifted to the front — so the
       arrows always continue from what the user can actually see. Keyboard
       selection has no screen origin, so the card scales up in place. */
    const step = useCallback((direction: 1 | -1) => {
        setClosing(false);
        setOrigin(null);
        setSelected((current) => {
            const from = current ?? apiRef.current?.front() ?? 0;
            return (from + direction + HERO_CARDS.length) % HERO_CARDS.length;
        });
    }, []);

    /* Keyboard control, live whenever the hero is the thing on screen.
       Escape is handled by FocusCard itself, so its exit animation plays. */
    useEffect(() => {
        const onKey = (e: KeyboardEvent) => {
            const section = sectionRef.current;
            if (!section) return;

            const tag = (e.target as HTMLElement)?.tagName;
            if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;
            const rect = section.getBoundingClientRect();
            if (rect.bottom < window.innerHeight * 0.4) return;

            if (e.key === 'ArrowLeft') {
                e.preventDefault();
                step(-1);
            } else if (e.key === 'ArrowRight') {
                e.preventDefault();
                step(1);
            }
        };

        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, [step]);

    const card = selected === null ? null : HERO_CARDS[selected];
    /* The background recedes for the whole focus lifecycle, exit included. */
    const focused = selected !== null;

    return (
        <section
            className={`hero${focused ? ' is-focused' : ''}`}
            ref={sectionRef}
            aria-label="Welcome to Country Kids"
        >
            <div className="hero-bg" aria-hidden="true" />

            <Scene
                cards={HERO_CARDS}
                selectedIndex={selected}
                onSelect={select}
                onClear={requestClose}
                apiRef={apiRef}
                reduced={reduced}
                dimmed={focused && !closing}
            />

            <div className="hero-veil" aria-hidden="true" />

            <Overlay card={card} onClear={requestClose} onStep={step} reduced={reduced} />

            {card && (
                <FocusCard
                    card={card}
                    origin={origin}
                    closing={closing}
                    onClosed={onClosed}
                    onRequestClose={requestClose}
                />
            )}

            {/* The globe's content as plain, crawlable links. The canvas is
                decorative; this is the same information without it. */}
            <nav className="hero-sr" aria-label="Explore Country Kids">
                <ul>
                    {HERO_CARDS.map((c) => (
                        <li key={c.id}>
                            <Link href={c.href} prefetch={false}>
                                {c.category}: {c.title} — {c.subtitle}. {c.description}
                            </Link>
                        </li>
                    ))}
                </ul>
            </nav>
        </section>
    );
}
