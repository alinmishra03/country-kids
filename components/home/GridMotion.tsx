'use client';

/* GridMotion — a React-Bits-inspired animated hero background. A rotated 4×7 grid
   of PHOTO cards (from the site's room/gallery image pool) drifting with the mouse
   (horizontal, eased) plus a slow vertical float and a gentle opacity/scale
   "breathing". Dark scrims + the hero overlay keep the copy readable.

   Rendering / performance notes:
   - Render is SSR-safe (no window/document at render time — all browser access is
     inside useEffect), so it renders on the server too and is always visible; no
     hydration mismatch (markup is deterministic).
   - All motion lives inside a gsap.context() scoped to the root, reverted on
     unmount; the mousemove listener is removed too — no leaks.
   - Mouse easing uses gsap.quickTo (rAF-driven), so we don't spawn a tween per
     frame. Motion is disabled under prefers-reduced-motion and the mouse layer is
     skipped on touch/mobile (float amplitude is reduced there instead).
   - Images are lazy/async and served pre-sized from the Unsplash CDN via img(). */

import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { img } from '@/lib/images';

/* Photo pool — verified Unsplash ids already used across the site (rooms, gallery
   and page photos). */
const IMAGES = [
    '1495131292899-bc096577e8f5',
    '1526634332515-d56c5fd16991',
    '1503454537195-1dcabb73ffb9',
    '1578349035260-9f3d4042f1f7',
    '1613794713137-a78aba4be84a',
    '1607453998825-f3f36da5ab18',
    '1761208663763-c4d30657c910',
    '1596464716127-f2a82984de30',
    '1587654780291-39c9404d746b',
    '1599689868384-59cb2b01bb21',
    '1593893513213-0ecc2ea282c5',
    '1509781827353-fb95c262fc40',
    '1509414556967-312906f278a0',
    '1501686637-b7aa9c48a882',
    '1583468991267-3f068b607ae1',
    '1567746455504-cb3213f8f5b8',
    '1616089804390-b2daa80dbf02',
];

const ROWS = 4;
const COLS = 7;

/* Every tile is a photo (cycles through the pool to fill the 28-cell grid). */
const TILE_IMAGES = Array.from({ length: ROWS * COLS }, (_, i) => IMAGES[i % IMAGES.length]);

export default function GridMotion() {
    const rootRef = useRef<HTMLDivElement>(null);
    const rowRefs = useRef<Array<HTMLDivElement | null>>([]);
    const mouseXRef = useRef(0);

    useEffect(() => {
        const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        const isMobile = window.matchMedia('(max-width: 768px)').matches;
        mouseXRef.current = window.innerWidth / 2;

        // Mobile moves ~60% less than desktop (300 → 120).
        const maxMove = isMobile ? 120 : 300;
        let xSetters: Array<((value: number) => void) | null> = [];

        const ctx = gsap.context(() => {
            // Eased horizontal setters (rAF-driven, no per-frame tween churn).
            xSetters = rowRefs.current.map((row) =>
                row ? gsap.quickTo(row, 'x', { duration: 0.9, ease: 'power3' }) : null
            );

            if (reduced) return;

            // Slow vertical float per row (reduced amplitude on mobile).
            rowRefs.current.forEach((row, i) => {
                if (!row) return;
                const amp = (i % 2 ? 1 : -1) * (isMobile ? 1 : 2);
                gsap.to(row, {
                    yPercent: amp,
                    duration: 7 + i,
                    ease: 'sine.inOut',
                    repeat: -1,
                    yoyo: true,
                });
            });

            // Subtle opacity + scale "breathing" across tiles.
            gsap.fromTo(
                '.gm-tile',
                { opacity: 0.6, scale: 0.985 },
                {
                    opacity: 1,
                    scale: 1.015,
                    duration: 5,
                    ease: 'sine.inOut',
                    repeat: -1,
                    yoyo: true,
                    stagger: { each: 0.12, from: 'random' },
                }
            );
        }, rootRef);

        const onMove = (e: MouseEvent) => {
            const w = window.innerWidth || 1;
            mouseXRef.current = e.clientX;
            for (let i = 0; i < xSetters.length; i++) {
                const set = xSetters[i];
                if (!set) continue;
                const dir = i % 2 === 0 ? 1 : -1;
                const move = ((mouseXRef.current / w) * maxMove - maxMove / 2) * dir;
                set(move);
            }
        };

        // Only bind the mouse layer on non-touch/desktop and when motion is allowed.
        if (!reduced && !isMobile) {
            window.addEventListener('mousemove', onMove, { passive: true });
        }

        return () => {
            window.removeEventListener('mousemove', onMove);
            ctx.revert();
        };
    }, []);

    return (
        <div ref={rootRef} className="gm" aria-hidden="true">
            <div className="gm-grid">
                {Array.from({ length: ROWS }).map((_, r) => (
                    <div
                        key={r}
                        className="gm-row"
                        ref={(el) => {
                            rowRefs.current[r] = el;
                        }}
                    >
                        {Array.from({ length: COLS }).map((_, c) => {
                            const id = TILE_IMAGES[r * COLS + c];
                            return (
                                <div className="gm-tile-wrap" key={c}>
                                    <div className="gm-tile gm-img">
                                        <img
                                            src={img(id, 500, 55)}
                                            alt=""
                                            loading="lazy"
                                            decoding="async"
                                        />
                                        <span className="gm-img-scrim" aria-hidden="true" />
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ))}
            </div>
        </div>
    );
}
