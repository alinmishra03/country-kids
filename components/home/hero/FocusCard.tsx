'use client';

/* The centred focus state for a selected card.

   WHY THIS IS DOM AND NOT THE 3D CARD — the focus state needs a real <img>, a
   real clickable CTA, per-element text fade-in and a blur behind it. A baked
   WebGL card texture can give none of those: the CTA would not be clickable,
   the text could not fade independently of the image, and blurring only the
   OTHER cards would need a second render pass. So the globe keeps doing what it
   is good at, and the focus card is a DOM element that flies out of it.

   THE HANDOFF — the card animates FROM the exact screen position and size the
   3D card occupied at the moment of the click (projected by Card.tsx and handed
   over as `origin`), so the DOM element appears to be the same object continuing
   its motion. Meanwhile the 3D card underneath fades to zero, and the canvas
   blurs and dims, which is what sells the swap.

   Only transform, opacity and filter are animated — no layout is read or
   written during the tween. */

import { useCallback, useEffect, useLayoutEffect, useRef } from 'react';
import Link from 'next/link';
import gsap from 'gsap';
import Icon from '@/components/shared/Icon';
import type { HeroCard } from '@/lib/hero/hero-cards';
import { cardImageUrl } from '@/lib/hero/card-image';
import { FOCUS } from '@/lib/hero/hero-config';

export type FocusOrigin = { x: number; y: number; size: number };

type Props = {
    card: HeroCard;
    /** Where the 3D card was on screen, in hero-relative px. */
    origin: FocusOrigin | null;
    /** Flipped by the parent to request the exit animation. */
    closing: boolean;
    /** Called once the exit animation has finished. */
    onClosed: () => void;
    /** Backdrop click / Escape — asks the parent to start closing. */
    onRequestClose: () => void;
};

const useIsoLayoutEffect = typeof window !== 'undefined' ? useLayoutEffect : useEffect;

export default function FocusCard({ card, origin, closing, onClosed, onRequestClose }: Props) {
    const cardRef = useRef<HTMLDivElement>(null);
    const backdropRef = useRef<HTMLDivElement>(null);
    /* The from-state, kept so the exit can reverse along the same path. */
    const fromRef = useRef({ x: 0, y: 0, scale: 0.35 });
    const tweenRef = useRef<gsap.core.Timeline | null>(null);

    /* Measure the delta between where the card WILL sit (dead centre, via the
       grid) and where the 3D card WAS. Read once, before paint. */
    const measure = useCallback(() => {
        const el = cardRef.current;
        if (!el) return { x: 0, y: 0, scale: 0.4 };

        const rect = el.getBoundingClientRect();
        const host = el.parentElement?.getBoundingClientRect();
        if (!origin || !host) return { x: 0, y: 0, scale: 0.88 };

        /* Centre of the focus card, in the same hero-relative space as origin. */
        const cx = rect.left - host.left + rect.width / 2;
        const cy = rect.top - host.top + rect.height / 2;

        return {
            x: origin.x - cx,
            y: origin.y - cy,
            /* The 3D card's on-screen height over this card's height, clamped so
               a far-side card does not start as an invisible speck. */
            scale: Math.max(0.18, Math.min(0.9, origin.size / rect.height)),
        };
    }, [origin]);

    /* ── Enter ── */
    useIsoLayoutEffect(() => {
        const el = cardRef.current;
        const backdrop = backdropRef.current;
        if (!el || !backdrop) return;

        const from = measure();
        fromRef.current = from;

        const items = el.querySelectorAll<HTMLElement>('[data-focus-anim]');

        tweenRef.current?.kill();
        const tl = gsap.timeline();
        tweenRef.current = tl;

        tl.fromTo(backdrop, { opacity: 0 }, { opacity: 1, duration: 0.4, ease: 'power2.out' }, 0)
            .fromTo(
                el,
                { x: from.x, y: from.y, scale: from.scale, opacity: 0 },
                {
                    x: 0,
                    y: 0,
                    scale: 1,
                    opacity: 1,
                    duration: FOCUS.enter,
                    ease: 'power3.out',
                },
                0
            )
            /* Copy arrives after the card has most of the way settled, so the
               text is never read mid-flight. */
            .fromTo(
                items,
                { opacity: 0, y: 16, filter: 'blur(6px)' },
                {
                    opacity: 1,
                    y: 0,
                    filter: 'blur(0px)',
                    duration: 0.5,
                    ease: 'power3.out',
                    stagger: 0.06,
                },
                FOCUS.enter * 0.45
            );

        return () => {
            tl.kill();
        };
        /* Re-runs when the card changes (arrow keys swap the focus card). */
    }, [card.id, measure]);

    /* ── Exit ── */
    useEffect(() => {
        if (!closing) return;
        const el = cardRef.current;
        const backdrop = backdropRef.current;
        if (!el || !backdrop) {
            onClosed();
            return;
        }

        const from = fromRef.current;
        tweenRef.current?.kill();

        const tl = gsap.timeline({ onComplete: onClosed });
        tweenRef.current = tl;

        tl.to(
            el,
            {
                x: from.x,
                y: from.y,
                scale: from.scale,
                opacity: 0,
                duration: FOCUS.exit,
                ease: 'power3.in',
            },
            0
        ).to(backdrop, { opacity: 0, duration: FOCUS.exit * 0.8, ease: 'power2.in' }, 0);
    }, [closing, onClosed]);

    /* Escape closes — owned here so the exit animation always plays, rather
       than the selection being torn out from under it. */
    useEffect(() => {
        const onKey = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onRequestClose();
        };
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, [onRequestClose]);

    return (
        <div className="hero-focus">
            {/* Click / tap anywhere off the card closes it. */}
            <div
                className="hero-focus-backdrop"
                ref={backdropRef}
                onClick={onRequestClose}
                aria-hidden="true"
            />

            <article
                className="hero-focus-card"
                ref={cardRef}
                role="dialog"
                aria-modal="false"
                aria-label={`${card.category}: ${card.title}`}
            >
                <div className="hero-focus-media">
                    <img
                        src={cardImageUrl(card.img, 900)}
                        alt={`${card.title} — ${card.subtitle}`}
                        draggable={false}
                    />
                    <span className="hero-focus-shade" aria-hidden="true" />

                    <span className="hero-focus-badge" data-focus-anim>
                        {card.category}
                    </span>

                    <div className="hero-focus-heading">
                        <h2 className="hero-focus-title" data-focus-anim>
                            {card.title}
                        </h2>
                        <p className="hero-focus-subtitle" data-focus-anim>
                            {card.subtitle}
                        </p>
                    </div>
                </div>

                <div className="hero-focus-body">
                    <p className="hero-focus-text" data-focus-anim>
                        {card.description}
                    </p>
                    <Link className="hero-focus-cta" href={card.href} data-focus-anim>
                        {card.cta} <Icon name="arrow-right" />
                    </Link>
                </div>

                <button
                    type="button"
                    className="hero-focus-close"
                    onClick={onRequestClose}
                    aria-label="Close and resume the gallery"
                >
                    <Icon name="x" />
                </button>
            </article>
        </div>
    );
}
