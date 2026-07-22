'use client';

/* StatsCarousel — the MOBILE-ONLY (≤768px) presentation of the stats. One stat at
   a time on a glassmorphism card: count-up number, swipe/dot navigation, 3.5s
   autoplay (paused while touching, loops), and Framer Motion enter/exit. Content
   comes straight from CENTRE_STATS (unchanged). Desktop never sees this — it's
   hidden via CSS and its autoplay is gated on useInView, so it does nothing off
   mobile. Fully respects prefers-reduced-motion. */

import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence, animate, useInView, useReducedMotion } from 'framer-motion';
import { CENTRE_STATS } from '@/lib/philosophy-data';

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];
const INTERVAL = 3500;

/* Count-up number (0 → value, ~1s), preserving prefix/suffix ("6wks", "100%",
   "12hrs"). Remounts per card (keyed), so it re-runs on every slide. */
function CounterValue({ value }: { value: string }) {
    const ref = useRef<HTMLSpanElement>(null);
    const reduced = useReducedMotion();

    const m0 = value.match(/\d+/);
    const initial = m0
        ? `${value.slice(0, m0.index ?? 0)}0${value.slice((m0.index ?? 0) + m0[0].length)}`
        : value;

    useEffect(() => {
        const el = ref.current;
        if (!el) return;
        const m = value.match(/\d+/);
        if (!m) {
            el.textContent = value;
            return;
        }
        if (reduced) {
            el.textContent = value;
            return;
        }
        const t = parseInt(m[0], 10);
        const i = m.index ?? 0;
        const pre = value.slice(0, i);
        const suf = value.slice(i + m[0].length);
        const controls = animate(0, t, {
            duration: 1,
            ease: EASE,
            onUpdate: (v) => {
                el.textContent = pre + Math.round(v) + suf;
            },
        });
        return () => controls.stop();
    }, [value, reduced]);

    return <span ref={ref}>{initial}</span>;
}

export default function StatsCarousel() {
    const rootRef = useRef<HTMLDivElement>(null);
    const inView = useInView(rootRef, { amount: 0.4 });
    const reduced = useReducedMotion();
    const [index, setIndex] = useState(0);
    const [dir, setDir] = useState(1);
    const pausedRef = useRef(false);
    const startX = useRef(0);
    const n = CENTRE_STATS.length;

    // Autoplay — only when visible and motion is allowed; paused while touching.
    useEffect(() => {
        if (reduced || !inView) return;
        const id = window.setInterval(() => {
            if (pausedRef.current) return;
            setDir(1);
            setIndex((i) => (i + 1) % n);
        }, INTERVAL);
        return () => window.clearInterval(id);
    }, [reduced, inView, n]);

    const goTo = (i: number) => {
        setDir(i > index ? 1 : -1);
        setIndex(((i % n) + n) % n);
    };

    const onTouchStart = (e: any) => {
        pausedRef.current = true;
        startX.current = e.touches[0].clientX;
    };
    const onTouchEnd = (e: any) => {
        pausedRef.current = false;
        const dx = e.changedTouches[0].clientX - startX.current;
        if (dx < -40) {
            setDir(1);
            setIndex((i) => (i + 1) % n);
        } else if (dx > 40) {
            setDir(-1);
            setIndex((i) => (i - 1 + n) % n);
        }
    };

    const stat = CENTRE_STATS[index];

    const variants = {
        enter: (d: number) => ({ x: d > 0 ? 70 : -70, opacity: 0, scale: 0.92, filter: 'blur(6px)' }),
        center: { x: 0, opacity: 1, scale: 1, filter: 'blur(0px)' },
        exit: (d: number) => ({ x: d > 0 ? -60 : 60, opacity: 0, scale: 0.96, filter: 'blur(4px)' }),
    };

    return (
        <div className="stats-mobile" ref={rootRef}>
            <div
                className="statm-stage"
                onTouchStart={reduced ? undefined : onTouchStart}
                onTouchEnd={reduced ? undefined : onTouchEnd}
                onTouchCancel={() => (pausedRef.current = false)}
            >
                <div className="statm-deco" aria-hidden="true">
                    <span className="statm-glow" />
                    <span className="statm-circle c1" />
                    <span className="statm-circle c2" />
                </div>

                <AnimatePresence mode="wait" custom={dir} initial={false}>
                    <motion.div
                        key={index}
                        className="statm-card"
                        custom={dir}
                        variants={reduced ? undefined : variants}
                        initial={reduced ? false : 'enter'}
                        animate={reduced ? false : 'center'}
                        exit={reduced ? undefined : 'exit'}
                        transition={{ duration: 0.5, ease: EASE }}
                        role="group"
                        aria-roledescription="slide"
                        aria-label={`${index + 1} of ${n}`}
                    >
                        <div className="statm-number">
                            <CounterValue value={stat.number} />
                        </div>
                        <div className="statm-label">{stat.label}</div>
                    </motion.div>
                </AnimatePresence>
            </div>

            <div className="statm-dots" role="tablist" aria-label="Statistics">
                {CENTRE_STATS.map((s, i) => (
                    <button
                        key={s.label}
                        type="button"
                        className={`statm-dot${i === index ? ' is-active' : ''}`}
                        aria-label={s.label}
                        aria-current={i === index}
                        onClick={() => goTo(i)}
                    />
                ))}
            </div>
        </div>
    );
}
