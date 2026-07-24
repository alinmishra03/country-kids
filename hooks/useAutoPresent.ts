'use client';

/* useAutoPresent — the globe's showcase loop.

   One card at a time, forever:

       fly out → hold at centre → shrink back to its EXACT slot → pause → next

   STRICT SEQUENCING is the point. The next card must not begin until the
   previous one has finished returning, or two cards are in flight at once and
   the globe reads as chaos rather than a presentation. The release step
   therefore waits `FOCUS.exit` — the real duration of the FocusCard exit tween,
   imported from the same config the tween reads — plus a short settle, before
   the next card is focused. Deriving it from the config means the two can never
   drift apart when the animation is retuned.

   MANUAL INTERACTION does not kill the loop any more, it PAUSES it: any
   deliberate input (pointerdown, wheel, touch, key) stops the current beat and
   schedules a resume. The user gets the globe to themselves for `resumeMs`,
   then the showcase picks up again from the next card.

   It also never runs when the hero is off screen, and stops while the tab is
   hidden — otherwise the loop would keep firing against a page nobody is
   looking at. */

import { useEffect, useRef } from 'react';
import { FOCUS } from '@/lib/hero/hero-config';

/* The FocusCard exit, in ms, plus a beat for the 3D card to fade back in. */
const RETURN_MS = FOCUS.exit * 1000 + 260;

type Options = {
    /** Number of cards to walk. */
    count: number;
    /** Focus a card, or clear the focus when passed null. */
    onFocus: (index: number | null) => void;
    /** The hero element — used for the in-view gate and interaction capture. */
    hostRef: React.RefObject<HTMLElement | null>;
    enabled: boolean;
    /** How long each card is held at centre. */
    holdMs?: number;
    /** Quiet beat between one card returning and the next flying out. */
    gapMs?: number;
    /** Delay before the loop begins, so the page can settle first. */
    startDelayMs?: number;
    /** How long the user keeps control after interacting. */
    resumeMs?: number;
};

export default function useAutoPresent({
    count,
    onFocus,
    hostRef,
    enabled,
    holdMs = 3000,
    gapMs = 620,
    startDelayMs = 1600,
    resumeMs = 6000,
}: Options) {
    /* Kept in a ref so a new callback identity cannot restart the loop. */
    const focusRef = useRef(onFocus);
    focusRef.current = onFocus;

    useEffect(() => {
        if (!enabled || count <= 0) return;
        const host = hostRef.current;
        if (!host) return;
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

        let index = 0;
        let disposed = false;
        /* Every pending step, so a pause can cancel the whole chain at once. */
        let timers: number[] = [];
        let holding = false;
        let started = false;

        const clear = () => {
            timers.forEach((t) => window.clearTimeout(t));
            timers = [];
        };
        const after = (ms: number, fn: () => void) => {
            timers.push(window.setTimeout(fn, ms));
        };

        /* ── One full beat ── */
        const present = () => {
            if (disposed) return;

            holding = true;
            focusRef.current(index);
            /* Wrap forever — the showcase does not end. */
            index = (index + 1) % count;

            after(holdMs, () => {
                if (disposed) return;
                holding = false;
                /* Ask for the return. FocusCard plays its exit from here. */
                focusRef.current(null);

                /* Only once it has actually landed back in the globe. */
                after(RETURN_MS + gapMs, present);
            });
        };

        /* ── Pause on interaction, resume later ── */
        const pause = () => {
            if (disposed) return;
            clear();
            /* Hand back whatever the loop was showing; if the user clicked a
               card, Hero has already selected it and this must not clear it —
               only a card the LOOP opened gets closed. */
            if (holding) {
                holding = false;
                focusRef.current(null);
            }
            after(resumeMs, present);
        };

        const onKey = (e: KeyboardEvent) => {
            /* A bare modifier is not an interaction. */
            if (['Shift', 'Control', 'Alt', 'Meta'].includes(e.key)) return;
            pause();
        };
        const onVisibility = () => {
            if (document.hidden) clear();
            else if (started) {
                clear();
                after(resumeMs, present);
            }
        };

        const passive = { passive: true, capture: true } as AddEventListenerOptions;
        host.addEventListener('pointerdown', pause, passive);
        host.addEventListener('wheel', pause, passive);
        host.addEventListener('touchstart', pause, passive);
        window.addEventListener('keydown', onKey);
        document.addEventListener('visibilitychange', onVisibility);

        const detach = () => {
            host.removeEventListener('pointerdown', pause, passive);
            host.removeEventListener('wheel', pause, passive);
            host.removeEventListener('touchstart', pause, passive);
            window.removeEventListener('keydown', onKey);
            document.removeEventListener('visibilitychange', onVisibility);
        };

        /* ── Start only once the hero is genuinely on screen ── */
        let observer: IntersectionObserver | null = null;
        const begin = () => {
            if (disposed || started) return;
            started = true;
            after(startDelayMs, present);
        };

        if (typeof IntersectionObserver === 'undefined') {
            begin();
        } else {
            observer = new IntersectionObserver(
                ([entry]) => {
                    if (!entry.isIntersecting) return;
                    observer?.disconnect();
                    observer = null;
                    begin();
                },
                { threshold: 0.4 }
            );
            observer.observe(host);
        }

        return () => {
            disposed = true;
            clear();
            observer?.disconnect();
            detach();
        };
    }, [count, enabled, hostRef, holdMs, gapMs, startDelayMs, resumeMs]);
}
