'use client';

/* LINE SIDEBAR — the hero's pre-entry navigation.

   A vertical rail on the right edge of the hero: one thin rule per destination,
   the label sitting to its left. It exists only before "Continue" is pressed;
   afterwards the site's real navbar takes over and this unmounts for good.

   Items are real links, so clicking one goes straight to that page. That is why
   they are <Link> and not buttons: PageTransition intercepts anchor clicks in
   the capture phase and plays the site's wipe before pushing the route, so the
   rail travels exactly like every other link on the site — and middle-click,
   ctrl-click and "copy link address" all keep working. The selected item lights
   up on the way out, which is the only thing the `active` state is for.

   ── The proximity engine ────────────────────────────────────────────────────
   Each item carries a single custom property, `--p` (0 → 1), and every visual
   response — line length, label brightness, the horizontal shift — is derived
   from it in CSS. That means one property write per item per frame and zero
   React renders while the pointer moves, which matters because a WebGL globe is
   rendering behind this.

   The value the pointer computes is a TARGET; a rAF loop eases the rendered
   value toward it, so the rail keeps moving for a few frames after the pointer
   stops. The loop is self-terminating: once every item is within epsilon of its
   target it snaps, writes once and cancels itself, and the next pointer move
   starts it again. An idle sidebar costs nothing.

   Item rectangles are measured once and re-measured on resize, never per frame
   — reading layout inside the loop would force a synchronous reflow every frame
   for no new information (the hero does not scroll).

   Coarse pointers skip the whole engine: there is nothing to be near. */

import { useCallback, useEffect, useMemo, useRef } from 'react';
import Link from 'next/link';
import { PRIMARY_NAV } from '@/lib/nav-data';

/* How far the pointer reaches, in px. Wider horizontally than vertically so the
   rail wakes up as the pointer approaches from the globe, but stays calm when
   the pointer is merely at the same height on the far side of the screen. */
const REACH_Y = 170;
const REACH_X = 360;
/* Per-frame approach fraction. 0.18 settles in ~8 frames — quick enough to feel
   attached to the pointer, slow enough to read as easing rather than tracking. */
const LERP = 0.18;
const EPSILON = 0.002;

/* Hermite smoothstep: flat at both ends, so an item neither snaps awake at the
   edge of the reach nor keeps creeping once it is fully lit. */
const smoothstep = (t: number) => t * t * (3 - 2 * t);
const clamp01 = (n: number) => (n < 0 ? 0 : n > 1 ? 1 : n);

export type LineSidebarItem = {
    id: string;
    label: string;
    href: string;
};

/* Derived from PRIMARY_NAV rather than retyped, so the rail can never drift
   from the navbar it hands over to — and can never accidentally list an item
   twice. The enrol CTA is not part of PRIMARY_NAV, which is exactly why this
   reads from it: the sidebar is destinations only. */
export const SIDEBAR_ITEMS: LineSidebarItem[] = PRIMARY_NAV.map((item: any) => ({
    id: item.id,
    label: item.label,
    href: item.href,
}));

type Props = {
    /** The selected destination, or null. */
    activeId: string | null;
    onSelect: (id: string) => void;
    /** True from the moment Continue is pressed — plays the exit. */
    exiting: boolean;
    /** True when the rail is coming back from the browse wall, not arriving for
     *  the first time: same entrance, without the first-impression delay. */
    returning: boolean;
    reduced: boolean;
};

export default function LineSidebar({ activeId, onSelect, exiting, returning, reduced }: Props) {
    const rootRef = useRef<HTMLDivElement>(null);
    const listRef = useRef<HTMLUListElement>(null);

    /* Per-item animation state, kept in plain arrays outside React. */
    const itemsRef = useRef<HTMLElement[]>([]);
    const centresRef = useRef<{ x: number; y: number }[]>([]);
    const targetRef = useRef<number[]>([]);
    const valueRef = useRef<number[]>([]);
    const focusedRef = useRef<number>(-1);
    const rafRef = useRef<number | null>(null);

    const count = SIDEBAR_ITEMS.length;

    const measure = useCallback(() => {
        centresRef.current = itemsRef.current.map((el) => {
            if (!el) return { x: 0, y: 0 };
            const r = el.getBoundingClientRect();
            return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
        });
    }, []);

    /* One frame: ease every value toward its target, write it, and stop if the
       whole rail has settled. */
    const tick = useCallback(() => {
        const values = valueRef.current;
        const targets = targetRef.current;
        const els = itemsRef.current;
        let moving = false;

        for (let i = 0; i < values.length; i += 1) {
            const delta = targets[i] - values[i];
            if (Math.abs(delta) < EPSILON) {
                values[i] = targets[i];
            } else {
                values[i] += delta * LERP;
                moving = true;
            }
            els[i]?.style.setProperty('--p', values[i].toFixed(3));
        }

        rafRef.current = moving ? requestAnimationFrame(tick) : null;
    }, []);

    const start = useCallback(() => {
        if (rafRef.current === null) rafRef.current = requestAnimationFrame(tick);
    }, [tick]);

    /* Recompute every target from a pointer position (or clear them all when the
       pointer leaves). A keyboard-focused item is pinned at full strength so the
       rail responds to focus exactly as it responds to the pointer. */
    const retarget = useCallback(
        (px: number | null, py: number | null) => {
            const centres = centresRef.current;
            const targets = targetRef.current;
            for (let i = 0; i < targets.length; i += 1) {
                let p = 0;
                if (px !== null && py !== null && centres[i]) {
                    const dx = (px - centres[i].x) / REACH_X;
                    const dy = (py - centres[i].y) / REACH_Y;
                    p = smoothstep(clamp01(1 - Math.hypot(dx, dy)));
                }
                targets[i] = focusedRef.current === i ? 1 : p;
            }
            start();
        },
        [start]
    );

    useEffect(() => {
        targetRef.current = new Array(count).fill(0);
        valueRef.current = new Array(count).fill(0);
    }, [count]);

    /* Pointer + resize wiring. Skipped entirely without a fine pointer, and
       skipped under reduced motion (CSS :hover still gives a static response). */
    useEffect(() => {
        if (reduced) return;
        if (typeof window === 'undefined' || !window.matchMedia) return;
        if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;

        measure();

        const onMove = (e: PointerEvent) => retarget(e.clientX, e.clientY);
        const onLeave = () => retarget(null, null);
        const onResize = () => {
            measure();
            retarget(null, null);
        };

        window.addEventListener('pointermove', onMove, { passive: true });
        document.addEventListener('pointerleave', onLeave);
        window.addEventListener('resize', onResize);

        return () => {
            window.removeEventListener('pointermove', onMove);
            document.removeEventListener('pointerleave', onLeave);
            window.removeEventListener('resize', onResize);
            if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
            rafRef.current = null;
        };
    }, [measure, retarget, reduced]);

    /* Once the exit starts the rail is leaving — freeze the engine so it cannot
       keep writing --p over the transition. */
    useEffect(() => {
        if (!exiting) return;
        if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
    }, [exiting]);

    /* Roving arrow-key movement between items, in addition to native Tab. */
    const onKeyDown = useCallback((e: React.KeyboardEvent<HTMLUListElement>) => {
        const key = e.key;
        if (key !== 'ArrowDown' && key !== 'ArrowUp' && key !== 'Home' && key !== 'End') return;
        const buttons = Array.from(listRef.current?.querySelectorAll<HTMLElement>('.ls-btn') ?? []);
        if (!buttons.length) return;
        const current = buttons.indexOf(document.activeElement as HTMLElement);
        e.preventDefault();
        let next = 0;
        if (key === 'Home') next = 0;
        else if (key === 'End') next = buttons.length - 1;
        else {
            const step = key === 'ArrowDown' ? 1 : -1;
            next = (current + step + buttons.length) % buttons.length;
        }
        buttons[next]?.focus();
    }, []);

    const setItemRef = useMemo(
        () => (index: number) => (node: HTMLLIElement | null) => {
            if (node) itemsRef.current[index] = node;
        },
        []
    );

    return (
        <div
            className={`line-sidebar${exiting ? ' is-exiting' : ''}${
                returning ? ' is-returning' : ''
            }`}
            ref={rootRef}
            aria-hidden={exiting || undefined}
        >
            <nav className="ls-panel" aria-label="Choose where to begin">
                <p className="ls-eyebrow">
                    <span className="ls-eyebrow-rule" aria-hidden="true" />
                    Explore
                </p>

                <ul className="ls-list" ref={listRef} onKeyDown={onKeyDown}>
                    {SIDEBAR_ITEMS.map((item, index) => {
                        const isActive = activeId === item.id;
                        return (
                            <li
                                key={item.id}
                                className={`ls-item${isActive ? ' is-active' : ''}`}
                                ref={setItemRef(index)}
                            >
                                <Link
                                    href={item.href}
                                    className="ls-btn"
                                    onClick={() => onSelect(item.id)}
                                    onFocus={() => {
                                        focusedRef.current = index;
                                        retarget(null, null);
                                    }}
                                    onBlur={() => {
                                        if (focusedRef.current === index) focusedRef.current = -1;
                                        retarget(null, null);
                                    }}
                                >
                                    <span className="ls-label">{item.label}</span>
                                    <span className="ls-line" aria-hidden="true" />
                                </Link>
                            </li>
                        );
                    })}
                </ul>

                <p className="ls-hint">Or continue to explore.</p>
            </nav>
        </div>
    );
}
