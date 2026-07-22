'use client';

/* GridMotion — a React-Bits-inspired animated hero background. A rotated 4×7 grid
   of photo cards (from the site's room/gallery image pool) interleaved with dark
   glass, abstract shapes and typography accents, drifting with the mouse
   (horizontal, eased) plus a slow vertical float and a gentle opacity/scale
   "breathing". Dark scrims + the hero overlay keep the copy readable.

   Next.js / performance notes:
   - Rendered client-only via next/dynamic({ ssr:false }) from Hero, so `window`
     is never touched during SSR and there are no hydration mismatches.
   - All motion lives inside a gsap.context() scoped to the root, reverted on
     unmount; the mousemove listener is removed too — no leaks.
   - Mouse easing uses gsap.quickTo (rAF-driven), so we don't spawn a tween per
     frame. Motion is disabled under prefers-reduced-motion and the mouse layer is
     skipped on touch/mobile (float amplitude is reduced there instead).
   - Images are lazy/async and served pre-sized from the Unsplash CDN via img(). */

import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import Icon from '@/components/shared/Icon';
import { img } from '@/lib/images';

type Tile =
    | { kind: 'image'; value: string }
    | { kind: 'icon'; value: string }
    | { kind: 'text'; value: string }
    | { kind: 'glass' }
    | { kind: 'circle' }
    | { kind: 'hex' }
    | { kind: 'outline' }
    | { kind: 'gradient' };

/* Photo pool — verified Unsplash ids already used across the site (rooms, gallery
   and page photos). */
const IMAGES = [
    '1519689680058-324335c77eba',
    '1526634332515-d56c5fd16991',
    '1503454537195-1dcabb73ffb9',
    '1560785496-3c9d27877182',
    '1544005313-94ddf0286df2',
    '1541692641319-981cc79ee10a',
    '1587616211892-f743fcca64f9',
    '1596464716127-f2a82984de30',
    '1587654780291-39c9404d746b',
    '1481627834876-b7833e8f5570',
    '1503919545889-aef636e10ad4',
    '1445633629932-0029acc44e88',
    '1444703686981-a3abbc4d4fe3',
    '1509228468518-180dd4864904',
    '1516627145497-ae6968895b74',
    '1509062522246-3755977927d7',
    '1503676260728-1c00da094a0b',
];

const pic = (i: number): Tile => ({ kind: 'image', value: IMAGES[i % IMAGES.length] });

/* 28 tiles (4 rows × 7): mostly photos, with glass / shape / typography accents
   woven in for a premium mood-board feel. */
const TILES: Tile[] = [
    pic(0), pic(1), { kind: 'glass' }, pic(2), pic(3), { kind: 'text', value: 'Belong' }, pic(4),
    pic(5), pic(6), { kind: 'gradient' }, pic(7), pic(8), { kind: 'hex' }, pic(9),
    pic(10), { kind: 'glass' }, pic(11), pic(12), { kind: 'text', value: 'Play' }, pic(13), pic(14),
    pic(15), pic(16), { kind: 'outline' }, pic(2), pic(5), { kind: 'circle' }, pic(9),
];

const ROWS = 4;
const COLS = 7;

function TileView({ tile }: { tile: Tile }) {
    switch (tile.kind) {
        case 'image':
            return (
                <div className="gm-tile gm-img">
                    <img src={img(tile.value, 420, 55)} alt="" loading="lazy" decoding="async" />
                    <span className="gm-img-scrim" aria-hidden="true" />
                </div>
            );
        case 'icon':
            return (
                <div className="gm-tile gm-glass gm-icon">
                    <Icon name={tile.value} />
                </div>
            );
        case 'text':
            return (
                <div className="gm-tile gm-text">
                    <span>{tile.value}</span>
                </div>
            );
        case 'circle':
            return (
                <div className="gm-tile gm-plain">
                    <span className="gm-circle" />
                </div>
            );
        case 'hex':
            return (
                <div className="gm-tile gm-plain">
                    <span className="gm-hex" />
                </div>
            );
        case 'outline':
            return <div className="gm-tile gm-outline" />;
        case 'gradient':
            return <div className="gm-tile gm-gradient" />;
        case 'glass':
        default:
            return <div className="gm-tile gm-glass" />;
    }
}

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
                        {Array.from({ length: COLS }).map((_, c) => (
                            <div className="gm-tile-wrap" key={c}>
                                <TileView tile={TILES[r * COLS + c]} />
                            </div>
                        ))}
                    </div>
                ))}
            </div>
        </div>
    );
}
