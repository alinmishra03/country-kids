'use client';

/* SectionProgress — the chapter rail for a long editorial page.

   Two presentations of ONE list, so there is a single source of truth and a
   single set of controls for assistive technology:

     ≥1100px  a vertical rail pinned to the right gutter. Dots only until
              hovered or focused, when the chapter's name slides out.
     <1100px  a slim glass bar along the bottom edge with the same buttons as
              numerals, and a progress line across its top.

   Why one scroll handler and no IntersectionObserver: the rail needs a
   CONTINUOUS progress value as well as a discrete active chapter, and IO only
   gives the second. Six getBoundingClientRect reads, throttled to one animation
   frame, is cheaper than running an observer and a scroll listener side by side.

   Scrolling goes through Lenis when it is running (css/motion-system.css and
   components/providers/SmoothScroll own that), and falls back to the native
   call otherwise — including on touch devices, where Lenis is deliberately not
   started. Under prefers-reduced-motion the jump is instant.

   The rail hides itself before the first chapter and after the last, so it can
   never sit over the hero, the closing image or the call to action. */

import { useCallback, useEffect, useRef, useState } from 'react';
import { getLenis } from '@/lib/smooth-scroll';

export type ProgressItem = {
    id: string;
    /** "Chapter One" — the visible label on the desktop rail. */
    label: string;
    /** The chapter title, used to build the button's accessible name. */
    short: string;
    /** "01" — the visible label on the mobile bar. */
    numeral: string;
};

export default function SectionProgress({ items }: { items: ProgressItem[] }) {
    const [active, setActive] = useState(0);
    const [progress, setProgress] = useState(0);
    const [visible, setVisible] = useState(false);
    const frame = useRef(0);

    useEffect(() => {
        const measure = () => {
            frame.current = 0;

            const nodes = items
                .map((it) => document.getElementById(it.id))
                .filter(Boolean) as HTMLElement[];
            if (nodes.length !== items.length) return;

            const vh = window.innerHeight || document.documentElement.clientHeight;
            const mid = vh * 0.5;

            const first = nodes[0].getBoundingClientRect();
            const last = nodes[nodes.length - 1].getBoundingClientRect();

            /* Span of the whole story, in viewport coordinates. */
            const span = last.bottom - first.top;
            const travelled = mid - first.top;
            setProgress(span > 0 ? Math.min(Math.max(travelled / span, 0), 1) : 0);

            /* The active chapter is the last one whose top has passed the
               midline. Sections between chapters (the quote band) leave the
               previous chapter marked, which is the honest answer — the reader
               is still inside that part of the story. */
            let index = 0;
            for (let i = 0; i < nodes.length; i += 1) {
                if (nodes[i].getBoundingClientRect().top <= mid) index = i;
            }
            setActive(index);

            /* Show once the first chapter is genuinely on screen; hide again
               once the last one has been read past. */
            setVisible(first.top < vh * 0.6 && last.bottom > mid);
        };

        const onScroll = () => {
            if (frame.current) return;
            frame.current = requestAnimationFrame(measure);
        };

        measure();
        window.addEventListener('scroll', onScroll, { passive: true });
        window.addEventListener('resize', onScroll, { passive: true });
        return () => {
            if (frame.current) cancelAnimationFrame(frame.current);
            window.removeEventListener('scroll', onScroll);
            window.removeEventListener('resize', onScroll);
        };
    }, [items]);

    const go = useCallback((id: string) => {
        const el = document.getElementById(id);
        if (!el) return;

        const navH =
            parseInt(
                getComputedStyle(document.documentElement).getPropertyValue('--nav-h'),
                10
            ) || 80;
        const top = el.getBoundingClientRect().top + window.scrollY - (navH + 16);

        const reduced =
            window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        if (reduced) {
            window.scrollTo({ top, behavior: 'auto' });
            return;
        }

        /* lib/smooth-scroll's string form is a no-op without Lenis, so an
           absolute offset is passed instead — that path works either way. */
        const lenis = getLenis();
        if (lenis) lenis.scrollTo(top, { duration: 1.1 });
        else window.scrollTo({ top, behavior: 'smooth' });
    }, []);

    return (
        <nav
            className={`sprog${visible ? ' is-visible' : ''}`}
            aria-label="Chapter navigation"
            /* Progress is published as a custom property rather than as an
               inline transform, because the two presentations need different
               axes — scaleY down the desktop rail, scaleX across the mobile
               bar — and an inline transform would outrank both. */
            style={{ '--sprog-p': progress } as any}
            /* Inert to pointers and to the tab order while hidden, so it can
               never trap focus behind an invisible panel. */
            {...(visible ? {} : { 'aria-hidden': true as any })}
        >
            <span className="sprog-progress" aria-hidden="true">
                <span className="sprog-progress-fill" />
            </span>

            <ol className="sprog-list">
                {items.map((item, i) => (
                    <li className="sprog-item" key={item.id}>
                        <button
                            type="button"
                            className={`sprog-btn${i === active ? ' is-active' : ''}`}
                            onClick={() => go(item.id)}
                            aria-label={`${item.label}: ${item.short}`}
                            aria-current={i === active ? 'true' : undefined}
                            tabIndex={visible ? 0 : -1}
                        >
                            <span className="sprog-numeral" aria-hidden="true">
                                {item.numeral}
                            </span>
                            <span className="sprog-dot" aria-hidden="true" />
                            <span className="sprog-label" aria-hidden="true">
                                {item.label}
                            </span>
                        </button>
                    </li>
                ))}
            </ol>
        </nav>
    );
}
