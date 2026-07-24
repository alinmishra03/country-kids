'use client';

/* The centred DOM overlay: eyebrow, heading, CTAs.

   Deliberately no description or subtitle — the heading carries the message and
   the buttons carry the action. The card's own copy lives on the card face,
   which is where the user is already looking when they focus one.

   This is REAL text, server-rendered, sitting above the canvas — so the hero's
   headline is in the HTML for search engines and screen readers whether WebGL
   ever initialises or not. The canvas is decoration; this is the content.

   GSAP drives the transition between the intro copy and a selected card's copy:
   the outgoing block fades, lifts and blurs out; the incoming one arrives on a
   staggered fade / slide / scale. A ref-based timeline (not React state) so the
   animation never re-renders the tree it is animating. */

import { useEffect, useLayoutEffect, useRef } from 'react';
import Link from 'next/link';
import gsap from 'gsap';
import Icon from '@/components/shared/Icon';
import type { HeroCard } from '@/lib/hero/hero-cards';
import { HERO_INTRO } from '@/lib/hero/hero-cards';

/* Layout effect on the client (so the copy is never painted un-animated for a
   frame), plain effect on the server, where React warns that useLayoutEffect
   does nothing. */
const useIsoLayoutEffect = typeof window !== 'undefined' ? useLayoutEffect : useEffect;

type Props = {
    card: HeroCard | null;
    onClear: () => void;
    onStep: (direction: 1 | -1) => void;
    reduced: boolean;
};

export default function Overlay({ card, onClear, onStep, reduced }: Props) {
    const rootRef = useRef<HTMLDivElement>(null);
    const timeline = useRef<gsap.core.Timeline | null>(null);

    /* GSAP owns this entrance outright — there is deliberately no CSS keyframe
       entrance on these elements. A CSS animation with `fill: both` outranks
       inline styles, so it would silently win against every GSAP tween from the
       moment it finished, and the card-to-card transitions would never play. */
    useIsoLayoutEffect(() => {
        const root = rootRef.current;
        if (!root) return;

        const items = root.querySelectorAll<HTMLElement>('[data-anim]');
        if (!items.length) return;

        if (reduced) {
            gsap.set(items, { opacity: 1, y: 0, filter: 'blur(0px)', scale: 1 });
            return;
        }

        timeline.current?.kill();
        timeline.current = gsap.timeline();
        timeline.current.fromTo(
            items,
            { opacity: 0, y: 26, filter: 'blur(9px)', scale: 0.985 },
            {
                opacity: 1,
                y: 0,
                filter: 'blur(0px)',
                scale: 1,
                duration: 0.75,
                ease: 'power3.out',
                stagger: 0.07,
            }
        );

        return () => {
            timeline.current?.kill();
        };
    }, [card?.id, reduced]);

    useEffect(() => () => void timeline.current?.kill(), []);

    /* Escape is NOT handled here — FocusCard owns it, so dismissing always
       plays the card's exit animation instead of tearing the selection out
       from under it. */

    /* Rendered once, placed between the heading and the buttons in BOTH
       branches — heading → drag hint → buttons. Held in a variable rather than
       duplicated so there is still only one copy of this markup. */
    const controls = (
        <div className="hero-controls">
            <button
                type="button"
                className="hero-arrow"
                onClick={() => onStep(-1)}
                aria-label="Previous card"
            >
                <Icon name="chevron-right" />
            </button>
            <span className="hero-hint">Drag to explore</span>
            <button
                type="button"
                className="hero-arrow"
                onClick={() => onStep(1)}
                aria-label="Next card"
            >
                <Icon name="chevron-right" />
            </button>
        </div>
    );

    return (
        <div className="hero-overlay" ref={rootRef}>
            {card ? (
                <>
                    <p className="hero-eyebrow" data-anim>
                        <span className="hero-eyebrow-dot" aria-hidden="true" />
                        {card.category}
                    </p>
                    <h1 className="hero-title" data-anim>
                        {card.title}
                    </h1>

                    {controls}

                    <div className="hero-cta" data-anim>
                        <Link className="btn-gold" href={card.href}>
                            {card.cta} <Icon name="arrow-right" />
                        </Link>
                        <button type="button" className="hero-back" onClick={onClear}>
                            Back to overview
                        </button>
                    </div>
                </>
            ) : (
                <>
                    <p className="hero-eyebrow" data-anim>
                        <span className="hero-eyebrow-dot" aria-hidden="true" />
                        {HERO_INTRO.eyebrow}
                    </p>
                    <h1 className="hero-title" data-anim>
                        {HERO_INTRO.title}{' '}
                        <em>{HERO_INTRO.titleAccent}</em>
                    </h1>

                    {controls}

                    <div className="hero-cta" data-anim>
                        <Link className="btn-gold" href={HERO_INTRO.primary.href}>
                            {HERO_INTRO.primary.label} <Icon name="arrow-right" />
                        </Link>
                        <Link className="btn-outline" href={HERO_INTRO.secondary.href}>
                            {HERO_INTRO.secondary.label} <Icon name="arrow-right" />
                        </Link>
                    </div>
                </>
            )}
        </div>
    );
}
