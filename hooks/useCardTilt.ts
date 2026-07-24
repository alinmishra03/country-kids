'use client';

/* useCardTilt — a very subtle cursor-follow tilt for cards.
 *
 * Attaches to a container and makes every [data-tilt] descendant rotate a
 * couple of degrees toward the cursor, then ease back to flat on leave.
 *
 * Built the same way as useMagnetic, and for the same reason: the rotation is
 * written to two custom properties (--rx / --ry) that the card's CSS transform
 * already composes with its hover lift. So the tilt, the lift and the CSS
 * transition never fight over `transform`, and a pointer move costs two
 * setProperty calls — no style recalc beyond the composited transform, and no
 * layout read per frame (the rect is measured once per gesture, on enter).
 *
 * Disabled entirely for coarse pointers and reduced motion.
 */

import { useEffect, RefObject } from 'react';

/** Degrees. The brief asks for "very subtle" — this is the cap. */
const MAX_DEG = 4;

export default function useCardTilt(rootRef: RefObject<HTMLElement | null>) {
    useEffect(() => {
        const root = rootRef.current;
        if (!root) return;

        const fine = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
        const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        if (!fine || reduced) return;

        const targets = Array.from(root.querySelectorAll<HTMLElement>('[data-tilt]'));
        if (!targets.length) return;

        const cleanups = targets.map((el) => {
            /* Measured on enter, not on every move — a getBoundingClientRect per
               pointermove is a forced layout, which is exactly what a 60fps
               interaction cannot afford. */
            let rect: DOMRect | null = null;

            const enter = () => {
                rect = el.getBoundingClientRect();
            };

            const move = (e: PointerEvent) => {
                if (!rect) rect = el.getBoundingClientRect();
                /* −0.5 … 0.5 across the card. */
                const px = (e.clientX - rect.left) / rect.width - 0.5;
                const py = (e.clientY - rect.top) / rect.height - 0.5;
                /* Pointer below centre tips the top toward the viewer, which is
                   the direction that reads as "leaning to face you". */
                el.style.setProperty('--rx', `${(-py * 2 * MAX_DEG).toFixed(2)}deg`);
                el.style.setProperty('--ry', `${(px * 2 * MAX_DEG).toFixed(2)}deg`);
            };

            const reset = () => {
                rect = null;
                el.style.setProperty('--rx', '0deg');
                el.style.setProperty('--ry', '0deg');
            };

            el.addEventListener('pointerenter', enter);
            el.addEventListener('pointermove', move);
            el.addEventListener('pointerleave', reset);

            return () => {
                el.removeEventListener('pointerenter', enter);
                el.removeEventListener('pointermove', move);
                el.removeEventListener('pointerleave', reset);
                reset();
            };
        });

        /* A resize invalidates every cached rect; clearing on the next enter is
           handled by `rect = null` in reset, so only in-flight gestures matter. */
        return () => cleanups.forEach((fn) => fn());
    }, [rootRef]);
}
