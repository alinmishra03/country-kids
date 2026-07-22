'use client';

/* StatsBar — "Country Kids at a glance". A premium, interactive glassmorphism
   stat grid. Content (numbers, labels, order) is unchanged — it comes straight
   from CENTRE_STATS. Enhancements: count-up on scroll (once, 1.52s), staggered
   entrance, per-card hover lift/glow, floating background blobs, and a subtle
   mouse parallax. All motion is GPU-friendly (transform/opacity) and respects
   prefers-reduced-motion. */

import { useEffect, useRef } from 'react';
import {
    motion,
    animate,
    useInView,
    useMotionValue,
    useSpring,
    useReducedMotion,
} from 'framer-motion';
import { Baby, GraduationCap, Utensils, Award, Clock, School } from 'lucide-react';
import { CENTRE_STATS } from '@/lib/philosophy-data';
import StatsCarousel from '@/components/home/StatsCarousel';

/* Shared ease-out-expo curve (typed as a 4-tuple so Framer accepts it). */
const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

/* Icon per label — content stays identical, we only pair each stat with an icon. */
const ICON_BY_LABEL: Record<string, any> = {
    'Youngest Age': Baby,
    'Oldest Age': GraduationCap,
    'Meals Daily': Utensils,
    'Qualified Educators': Award,
    'Open Daily': Clock,
    'Specialised Rooms': School,
};

/* Count-up value. Preserves any non-digit prefix/suffix (e.g. "6wks", "100%",
   "12hrs"). Updates textContent directly via a ref so counting never triggers a
   React re-render. Runs once, when `start` becomes true. */
function StatValue({ value, start }: { value: string; start: boolean }) {
    const ref = useRef<HTMLSpanElement>(null);
    const reduced = useReducedMotion();

    const match = value.match(/\d+/);
    const target = match ? parseInt(match[0], 10) : 0;
    const idx = match?.index ?? 0;
    const prefix = match ? value.slice(0, idx) : '';
    const suffix = match ? value.slice(idx + match[0].length) : '';

    useEffect(() => {
        const el = ref.current;
        if (!el) return;
        if (!match) {
            el.textContent = value;
            return;
        }
        if (!start || reduced) {
            el.textContent = value;
            return;
        }
        const controls = animate(0, target, {
            duration: 1.52,
            ease: EASE,
            onUpdate: (v) => {
                el.textContent = prefix + Math.round(v) + suffix;
            },
        });
        return () => controls.stop();
    }, [start, reduced, match, target, prefix, suffix, value]);

    return <span ref={ref}>{match ? `${prefix}0${suffix}` : value}</span>;
}

export default function StatsBar() {
    const sectionRef = useRef<HTMLElement>(null);
    const inView = useInView(sectionRef, { once: true, amount: 0.3 });
    const reduced = useReducedMotion();

    // Mouse parallax (spring-smoothed → no jitter), capped at ±10px.
    const mx = useMotionValue(0);
    const my = useMotionValue(0);
    const spring = { stiffness: 120, damping: 22, mass: 0.4 };
    const sx = useSpring(mx, spring);
    const sy = useSpring(my, spring);

    const handleMove = (e: any) => {
        if (reduced) return;
        const rect = e.currentTarget.getBoundingClientRect();
        const px = (e.clientX - rect.left) / rect.width - 0.5;
        const py = (e.clientY - rect.top) / rect.height - 0.5;
        mx.set(px * 20);
        my.set(py * 20);
    };
    const handleLeave = () => {
        mx.set(0);
        my.set(0);
    };

    const container: any = {
        hidden: {},
        show: { transition: { staggerChildren: 0.08 } },
    };
    const item: any = reduced
        ? { hidden: { opacity: 1 }, show: { opacity: 1 } }
        : {
              hidden: { opacity: 0, y: 40, scale: 0.95 },
              show: {
                  opacity: 1,
                  y: 0,
                  scale: 1,
                  transition: { duration: 0.6, ease: EASE },
              },
          };
    const hover: any = reduced ? undefined : { y: -8, scale: 1.05 };

    return (
        <section
            className="stats-bar"
            ref={sectionRef}
            onMouseMove={handleMove}
            onMouseLeave={handleLeave}
            aria-label="Country Kids at a glance"
        >
            <div className="stats-blobs" aria-hidden="true">
                <span className="stats-blob b1" />
                <span className="stats-blob b2" />
                <span className="stats-blob b3" />
            </div>

            <motion.div
                className="stats-cards"
                style={{ x: sx, y: sy }}
                variants={container}
                initial="hidden"
                animate={inView ? 'show' : 'hidden'}
            >
                {CENTRE_STATS.map((s) => {
                    const IconCmp = ICON_BY_LABEL[s.label] || Award;
                    return (
                        <motion.div
                            className="stat-card"
                            key={s.label}
                            variants={item}
                            whileHover={hover}
                            whileFocus={hover}
                            transition={{ duration: 0.3, ease: EASE }}
                            tabIndex={0}
                        >
                            <span className="stat-icon" aria-hidden="true">
                                <IconCmp strokeWidth={1.8} />
                            </span>
                            <div className="stat-value">
                                <StatValue value={s.number} start={inView} />
                            </div>
                            <div className="stat-label">{s.label}</div>
                        </motion.div>
                    );
                })}
            </motion.div>

            {/* Mobile-only (≤768px) animated carousel — desktop grid above is untouched. */}
            <StatsCarousel />
        </section>
    );
}
