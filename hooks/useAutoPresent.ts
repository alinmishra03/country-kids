'use client';

/* useAutoPresent — walks the hero cards once, on first load, then hands the
   globe back to the user.

   Each beat is: focus card N → hold → release → short breath → focus card N+1.
   After the last card the tour ends and the globe returns to its idle orbit.

   YIELDING IS THE WHOLE POINT. A tour that fights the user is worse than no
   tour, so ANY deliberate interaction — a pointer press on the hero, a wheel
   gesture, a key, a touch — cancels it permanently for that page view. The
   cancel listeners are passive and capture-phase, so they see the gesture
   without interfering with it.

   It also never starts, or immediately stops, when:
     · prefers-reduced-motion is set,
     · the hero is not on screen (an IntersectionObserver gate — no point
       presenting to someone who has already scrolled past),
     · the tab is hidden (visibilitychange), which would otherwise burn the
       whole tour while the user is in another tab. */

import { useEffect, useRef } from 'react';

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
    /** Gap between one card returning and the next arriving. */
    gapMs?: number;
    /** Delay before the tour begins, so the page can settle first. */
    startDelayMs?: number;
};

export default function useAutoPresent({
    count,
    onFocus,
    hostRef,
    enabled,
    holdMs = 2600,
    gapMs = 700,
    startDelayMs = 1400,
}: Options) {
    /* Kept in refs so the effect never re-runs on a prop identity change and
       restarts the tour from the top. */
    const focusRef = useRef(onFocus);
    focusRef.current = onFocus;

    useEffect(() => {
        if (!enabled || count <= 0) return;
        const host = hostRef.current;
        if (!host) return;

        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

        let index = 0;
        let cancelled = false;
        let timer = 0;
        /* Only clear the focus on cancel if the tour actually set one. */
        let holding = false;

        const stop = (clearFocus: boolean) => {
            if (cancelled) return;
            cancelled = true;
            window.clearTimeout(timer);
            if (clearFocus && holding) focusRef.current(null);
            detach();
        };

        /* One beat of the tour. */
        const showNext = () => {
            if (cancelled) return;

            if (index >= count) {
                stop(false);
                return;
            }

            holding = true;
            focusRef.current(index);
            index += 1;

            timer = window.setTimeout(() => {
                if (cancelled) return;
                holding = false;
                focusRef.current(null);
                timer = window.setTimeout(showNext, gapMs);
            }, holdMs);
        };

        /* ── Cancel on any deliberate interaction ── */
        const onInteract = () => stop(true);

        const onKey = (e: KeyboardEvent) => {
            /* Ignore modifier-only presses so a stray Shift does not kill it. */
            if (e.key === 'Shift' || e.key === 'Control' || e.key === 'Alt' || e.key === 'Meta') {
                return;
            }
            stop(true);
        };

        const onVisibility = () => {
            if (document.hidden) stop(true);
        };

        const passive = { passive: true, capture: true } as AddEventListenerOptions;

        const attach = () => {
            host.addEventListener('pointerdown', onInteract, passive);
            host.addEventListener('wheel', onInteract, passive);
            host.addEventListener('touchstart', onInteract, passive);
            window.addEventListener('keydown', onKey);
            document.addEventListener('visibilitychange', onVisibility);
        };

        const detach = () => {
            host.removeEventListener('pointerdown', onInteract, passive);
            host.removeEventListener('wheel', onInteract, passive);
            host.removeEventListener('touchstart', onInteract, passive);
            window.removeEventListener('keydown', onKey);
            document.removeEventListener('visibilitychange', onVisibility);
        };

        attach();

        /* Only begin once the hero is genuinely on screen. */
        let observer: IntersectionObserver | null = null;
        const begin = () => {
            if (cancelled) return;
            timer = window.setTimeout(showNext, startDelayMs);
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
            cancelled = true;
            window.clearTimeout(timer);
            observer?.disconnect();
            detach();
        };
    }, [count, enabled, hostRef, holdMs, gapMs, startDelayMs]);
}
