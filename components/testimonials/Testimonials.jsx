'use client';

/* Family Stories — a clean, premium testimonial carousel.
   • One large centered card with slight previews of the adjacent cards on
     desktop; a single full-width card on mobile.
   • Smooth fade-and-slide transitions, subtle hover lift (desktop only), swipe /
     drag, arrows (desktop), pagination dots and keyboard support.
   • One-time count-up for the trust stats (IntersectionObserver).
   No decorative backgrounds, blur, parallax or looping animations — clarity and
   performance first. All testimonial content is passed through unchanged. */

import { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import Icon from '@/components/shared/Icon';
import { TESTIMONIALS } from '@/lib/testimonials-data';
import TestimonialCard from './TestimonialCard';
import './Testimonials.css';

const N = TESTIMONIALS.length;
const AUTOPLAY_MS = 6000;

const COUNTERS = [
    { target: 4.9, dec: 1, label: 'Average Rating' },
    { target: 100, dec: 0, plus: true, label: 'Happy Families' },
    { target: 7, dec: 0, label: 'Learning Rooms' },
];

/* Shortest signed distance from `active` on the ring (infinite loop). */
function ring(i, active) {
    let o = ((i - active) % N + N) % N;
    if (o > N / 2) o -= N;
    return o;
}

/* Coverflow transform for a card at signed position `pos`. Center is full size;
   immediate neighbours are a scaled, faded slice; everything else is parked
   off-stage. No blur, no rotation — just slide + fade. */
function cardStyle(pos, layout) {
    const abs = Math.abs(pos);
    if (abs > layout.span) {
        return {
            transform: `translate(-50%, -50%) translateX(${pos < 0 ? -140 : 140}%) scale(0.9)`,
            opacity: 0,
            zIndex: 1,
            transition: 'none', // teleport off-stage so the loop wrap is invisible
            pointerEvents: 'none',
        };
    }
    if (abs === 0) {
        return {
            transform: 'translate(-50%, -50%)',
            opacity: 1,
            zIndex: 10,
            pointerEvents: 'auto',
        };
    }
    return {
        transform: `translate(-50%, -50%) translateX(${pos * layout.xStep}%) scale(${layout.sideScale})`,
        opacity: 0.5,
        zIndex: 5,
        pointerEvents: 'none',
    };
}

export default function Testimonials() {
    const rootRef = useRef(null);
    const stageRef = useRef(null);
    const pausedRef = useRef(false);
    const dragRef = useRef(null);
    const movedRef = useRef(false);

    const [active, setActive] = useState(0);
    const [layout, setLayout] = useState({ span: 1, xStep: 60, sideScale: 0.88 });
    const [stageH, setStageH] = useState(null);

    const next = useCallback(() => setActive((a) => (a + 1) % N), []);
    const prev = useCallback(() => setActive((a) => (a - 1 + N) % N), []);
    const goTo = useCallback((i) => setActive(((i % N) + N) % N), []);

    /* Responsive: desktop/tablet show slight side previews; mobile is single. */
    useEffect(() => {
        const calc = () => {
            const w = window.innerWidth;
            if (w >= 1024) setLayout({ span: 1, xStep: 60, sideScale: 0.88 });
            else if (w >= 680) setLayout({ span: 1, xStep: 66, sideScale: 0.84 });
            else setLayout({ span: 0, xStep: 0, sideScale: 1 });
        };
        calc();
        window.addEventListener('resize', calc);
        return () => window.removeEventListener('resize', calc);
    }, []);

    /* Size the stage to the active card so nothing clips or overlaps the dots,
       and it adapts to content length + viewport. */
    useEffect(() => {
        const stage = stageRef.current;
        if (!stage) return;
        const measure = () => {
            const inner = stage.querySelector('.fs-card.is-active .fs-card-inner');
            if (inner) setStageH(inner.offsetHeight);
        };
        measure();
        window.addEventListener('resize', measure);
        let ro;
        const inner = stage.querySelector('.fs-card.is-active .fs-card-inner');
        if (inner && 'ResizeObserver' in window) {
            ro = new ResizeObserver(measure);
            ro.observe(inner);
        }
        return () => {
            window.removeEventListener('resize', measure);
            if (ro) ro.disconnect();
        };
    }, [active, layout]);

    /* Auto-advance; pause on hover / drag. */
    useEffect(() => {
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
        const id = setInterval(() => {
            if (!pausedRef.current) setActive((a) => (a + 1) % N);
        }, AUTOPLAY_MS);
        return () => clearInterval(id);
    }, []);

    /* One-time count-up when the section scrolls into view. */
    useEffect(() => {
        const root = rootRef.current;
        if (!root) return;
        const nums = root.querySelectorAll('.fs-counter-num');
        if (!nums.length) return;
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return; // keep final values

        // start from zero on the client
        nums.forEach((el) => {
            const dec = parseInt(el.dataset.dec || '0', 10);
            el.firstChild.nodeValue = (0).toFixed(dec);
        });

        const io = new IntersectionObserver(
            (entries, obs) => {
                if (!entries.some((e) => e.isIntersecting)) return;
                obs.disconnect();
                nums.forEach((el) => {
                    const target = parseFloat(el.dataset.target);
                    const dec = parseInt(el.dataset.dec || '0', 10);
                    const dur = 1500;
                    let started = null;
                    const step = (ts) => {
                        if (started === null) started = ts;
                        const p = Math.min((ts - started) / dur, 1);
                        const eased = 1 - Math.pow(1 - p, 3);
                        el.firstChild.nodeValue = (target * eased).toFixed(dec);
                        if (p < 1) requestAnimationFrame(step);
                    };
                    requestAnimationFrame(step);
                });
            },
            { threshold: 0.4 }
        );
        io.observe(root);
        return () => io.disconnect();
    }, []);

    /* Drag / swipe (pointer events cover mouse + touch). */
    const onPointerDown = (e) => {
        dragRef.current = { x: e.clientX };
        movedRef.current = false;
        pausedRef.current = true;
    };
    const onPointerMove = (e) => {
        if (!dragRef.current) return;
        if (Math.abs(e.clientX - dragRef.current.x) > 6) movedRef.current = true;
    };
    const endDrag = (e) => {
        const d = dragRef.current;
        dragRef.current = null;
        pausedRef.current = false;
        if (!d) return;
        const dx = (e.clientX ?? d.x) - d.x;
        if (Math.abs(dx) > 45) (dx < 0 ? next : prev)();
    };
    const onKeyDown = (e) => {
        if (e.key === 'ArrowLeft') { e.preventDefault(); prev(); }
        else if (e.key === 'ArrowRight') { e.preventDefault(); next(); }
    };

    return (
        <section className="section fs" id="families" ref={rootRef}>
            <div className="container">
                {/* Header */}
                <header className="fs-head">
                    <span className="fs-badge">
                        <span className="fs-badge-dot"></span>
                        Family Stories
                    </span>
                    <h2 className="fs-title">
                        Words from the families who <span className="fs-title-accent">trust us</span>
                    </h2>
                    <span className="fs-underline"></span>

                    <span className="fs-trust">
                        <GoogleGSmall />
                        <span className="fs-trust-stars" aria-hidden="true">
                            {Array.from({ length: 5 }).map((_, i) => (
                                <Icon key={i} name="star" />
                            ))}
                        </span>
                        <span className="fs-trust-sep"></span>
                        <span><b>5.0</b> rating on Google Reviews</span>
                    </span>

                    <div className="fs-counters">
                        {COUNTERS.map((c) => (
                            <div className="fs-counter" key={c.label}>
                                <span className="fs-counter-num" data-target={c.target} data-dec={c.dec}>
                                    {c.target.toFixed(c.dec)}
                                    {c.plus ? <span className="fs-counter-plus">+</span> : null}
                                </span>
                                <span className="fs-counter-label">{c.label}</span>
                            </div>
                        ))}
                    </div>
                </header>

                {/* Carousel */}
                <div
                    className="fs-carousel"
                    onPointerEnter={() => { pausedRef.current = true; }}
                    onPointerLeave={() => { pausedRef.current = false; }}
                >
                    <button className="fs-arrow fs-arrow-prev" aria-label="Previous testimonial" onClick={prev}>
                        <Icon name="chevron-right" style={{ transform: 'rotate(180deg)' }} />
                    </button>

                    <div
                        className="fs-stage"
                        ref={stageRef}
                        role="group"
                        aria-roledescription="carousel"
                        aria-label="Family testimonials"
                        tabIndex={0}
                        style={stageH ? { height: `${stageH}px` } : undefined}
                        onKeyDown={onKeyDown}
                        onPointerDown={onPointerDown}
                        onPointerMove={onPointerMove}
                        onPointerUp={endDrag}
                        onPointerCancel={endDrag}
                    >
                        {TESTIMONIALS.map((t, i) => {
                            const pos = ring(i, active);
                            return (
                                <TestimonialCard
                                    key={t.name}
                                    t={t}
                                    isActive={pos === 0}
                                    style={cardStyle(pos, layout)}
                                />
                            );
                        })}
                    </div>

                    <button className="fs-arrow fs-arrow-next" aria-label="Next testimonial" onClick={next}>
                        <Icon name="chevron-right" />
                    </button>
                </div>

                <div className="fs-dots" role="tablist" aria-label="Choose testimonial">
                    {TESTIMONIALS.map((t, i) => (
                        <button
                            key={t.name}
                            className={`fs-dot${i === active ? ' is-active' : ''}`}
                            aria-label={`Go to testimonial ${i + 1}`}
                            aria-current={i === active}
                            onClick={() => goTo(i)}
                        />
                    ))}
                </div>

                {/* CTA */}
                <div className="fs-cta">
                    <Link className="btn-outline" href="/families">
                        Read More Family Stories <Icon name="arrow-right" />
                    </Link>
                </div>
            </div>
        </section>
    );
}

/* Small Google "G" for the header trust pill. */
function GoogleGSmall() {
    return (
        <svg viewBox="0 0 48 48" width="16" height="16" aria-hidden="true" focusable="false">
            <path fill="#4285F4" d="M45.12 24.5c0-1.56-.14-3.06-.4-4.5H24v8.51h11.84c-.51 2.75-2.06 5.08-4.39 6.64v5.52h7.11c4.16-3.83 6.56-9.47 6.56-16.17z" />
            <path fill="#34A853" d="M24 46c5.94 0 10.92-1.97 14.56-5.33l-7.11-5.52c-1.97 1.32-4.49 2.1-7.45 2.1-5.73 0-10.58-3.87-12.31-9.07H4.34v5.7C7.96 41.07 15.4 46 24 46z" />
            <path fill="#FBBC05" d="M11.69 28.18c-.44-1.32-.69-2.73-.69-4.18s.25-2.86.69-4.18v-5.7H4.34C2.85 17.09 2 20.45 2 24s.85 6.91 2.34 9.88l7.35-5.7z" />
            <path fill="#EA4335" d="M24 10.75c3.23 0 6.13 1.11 8.41 3.29l6.31-6.31C34.91 4.18 29.93 2 24 2 15.4 2 7.96 6.93 4.34 14.12l7.35 5.7c1.73-5.2 6.58-9.07 12.31-9.07z" />
        </svg>
    );
}
