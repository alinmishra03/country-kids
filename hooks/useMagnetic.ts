'use client';

/* useMagnetic — pointer-follow for buttons.
 *
 * Attaches to a container and makes every [data-magnetic] descendant drift a few
 * pixels toward the cursor while the pointer is over it, then spring back on
 * leave. The offset is written to the --mx / --my custom properties that the
 * shared button transform in css/base.css already composes with its hover lift,
 * so this never fights the CSS transition and never touches layout.
 *
 * Deliberately cheap:
 *   · one pointermove listener per button, only while hovered
 *   · writes two custom properties — no style recalc beyond the transform
 *   · disabled entirely for coarse pointers (touch) and reduced motion
 */

import { useEffect, RefObject } from 'react';

const STRENGTH = 0.28;   /* fraction of the cursor's offset the button follows */
const MAX = 10;          /* px cap, so the button never detaches from its slot  */

export default function useMagnetic(rootRef: RefObject<HTMLElement | null>) {
    useEffect(() => {
        const root = rootRef.current;
        if (!root) return;

        const fine = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
        const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        if (!fine || reduced) return;

        const targets = Array.from(
            root.querySelectorAll<HTMLElement>('[data-magnetic]')
        );
        if (!targets.length) return;

        const cleanups = targets.map((el) => {
            const move = (e: PointerEvent) => {
                const r = el.getBoundingClientRect();
                const dx = e.clientX - (r.left + r.width / 2);
                const dy = e.clientY - (r.top + r.height / 2);
                const clamp = (n: number) => Math.max(-MAX, Math.min(MAX, n * STRENGTH));
                el.style.setProperty('--mx', `${clamp(dx)}px`);
                el.style.setProperty('--my', `${clamp(dy)}px`);
            };
            const reset = () => {
                el.style.setProperty('--mx', '0px');
                el.style.setProperty('--my', '0px');
            };

            el.addEventListener('pointermove', move);
            el.addEventListener('pointerleave', reset);
            el.addEventListener('blur', reset);

            return () => {
                el.removeEventListener('pointermove', move);
                el.removeEventListener('pointerleave', reset);
                el.removeEventListener('blur', reset);
                reset();
            };
        });

        return () => cleanups.forEach((fn) => fn());
    }, [rootRef]);
}
