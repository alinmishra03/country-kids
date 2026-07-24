'use client';

/* Home philosophy teaser — ONE grid in which the copy sits in the middle and
   the seven value cards enclose it: two wide cards across the top, three down
   the right, two wide across the bottom.

       ┌──────────┬──────────┐
       │   card   │   card   │
       ├──────────┴────┬─────┤
       │               │card │
       │   THE COPY    ├─────┤
       │               │card │
       │               ├─────┤
       │               │card │
       ├──────────┬────┴─────┤
       │   card   │   card   │
       └──────────┴──────────┘

   The copy and the cards are SIBLINGS in the same grid, on the same gutters —
   that is what makes them read as one composition rather than two columns
   pushed together. Placement is explicit (a --area custom property per card)
   so the visual arrangement is independent of DOM order: the copy comes first
   in the markup, which is what a screen reader and a phone both want, while
   the grid puts it in the middle on desktop.

   EVERY string is unchanged: the eyebrow, both headline lines,
   PHILOSOPHY_INTRO.lead, PHILOSOPHY_INTRO.quote, the CTA label and href, and
   the VALUES labels/icons.

   Motion: one Framer Motion sequence triggered when the section enters view —
   badge → headline (masked, line by line) → lead → quote → CTA → cards. Cards
   carry a 4° cursor tilt (useCardTilt) and the CTA is magnetic (useMagnetic);
   both write CSS custom properties that the transform composes, so neither
   fights the hover transition. */

import { useRef } from 'react';
import Link from 'next/link';
import { motion, useReducedMotion, useScroll, useTransform } from 'framer-motion';
import Icon from '@/components/shared/Icon';
import useMagnetic from '@/hooks/useMagnetic';
import useCardTilt from '@/hooks/useCardTilt';
import { PHILOSOPHY_INTRO, VALUES } from '@/lib/philosophy-data';

/* Matches --ease-out in css/base.css. */
const EASE = [0.22, 1, 0.36, 1] as const;

/* grid-area per card: row-start / col-start / row-end / col-end, on a 4-column
   grid whose rows are: [top cards] [copy × 3 rows] [bottom cards].
   Seven entries, in VALUES order. */
const PLACEMENT = [
    '1 / 1 / 2 / 3', // top-left, 2 cols wide
    '1 / 3 / 2 / 5', // top-right, 2 cols wide
    '2 / 4 / 3 / 5', // right column, upper
    '3 / 4 / 4 / 5', // right column, middle
    '4 / 4 / 5 / 5', // right column, lower
    '5 / 1 / 6 / 3', // bottom-left, 2 cols wide
    '5 / 3 / 6 / 5', // bottom-right, 2 cols wide
];

const grid = {
    hidden: {},
    show: { transition: { staggerChildren: 0.075, delayChildren: 0.05 } },
};

const copyGroup = {
    hidden: {},
    show: { transition: { staggerChildren: 0.09 } },
};

/* opacity 0→1, translateY 40px→0. */
const item = {
    hidden: { opacity: 0, y: 40 },
    show: { opacity: 1, y: 0, transition: { duration: 0.7, ease: EASE } },
};

/* Headline lines rise out of an overflow-hidden mask. */
const line = {
    hidden: { y: '110%' },
    show: { y: '0%', transition: { duration: 0.8, ease: EASE } },
};

const card = {
    hidden: { opacity: 0, y: 40 },
    show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: EASE } },
};

const VIEWPORT = { once: false, amount: 0.15, margin: '0px 0px -10% 0px' } as const;

export default function PhilosophyTeaser() {
    const sectionRef = useRef<HTMLElement>(null);
    const reduced = useReducedMotion();

    useMagnetic(sectionRef);
    useCardTilt(sectionRef);

    /* Slight parallax on the decorative layer only — transform-only, and it
       never touches the content, so nothing can shift. */
    const { scrollYProgress } = useScroll({
        target: sectionRef,
        offset: ['start end', 'end start'],
    });
    const decorY = useTransform(scrollYProgress, [0, 1], ['6%', '-6%']);

    /* Reduced motion: everything renders in its final state. */
    const anim = reduced
        ? {}
        : { initial: 'hidden' as const, whileInView: 'show' as const, viewport: VIEWPORT };
    const v = (variants: any) => (reduced ? undefined : variants);

    return (
        <section className="section philosophy-teaser" id="philosophy" ref={sectionRef}>
            {/* Decorative field: soft radial washes + slow floating orbs. */}
            <motion.div
                className="pt-decor"
                aria-hidden="true"
                style={reduced ? undefined : { y: decorY }}
            >
                <span className="pt-orb pt-orb--sage" />
                <span className="pt-orb pt-orb--navy" />
                <span className="pt-orb pt-orb--clay" />
            </motion.div>

            <motion.div className="container pt-grid" variants={v(grid)} {...anim}>
                {/* ── The copy, in the middle of the grid ── */}
                <motion.div className="pt-copy" variants={v(copyGroup)}>
                    <motion.p className="pt-badge" variants={v(item)}>
                        <span className="pt-badge-dot" aria-hidden="true" />
                        Our Philosophy
                    </motion.p>

                    <h2 className="pt-title">
                        <span className="pt-line">
                            <motion.span variants={v(line)}>Rooted in Country.</motion.span>
                        </span>
                        <span className="pt-line">
                            <motion.span className="pt-accent" variants={v(line)}>
                                Flourishing together.
                            </motion.span>
                        </span>
                    </h2>

                    <motion.p className="pt-lead" variants={v(item)}>
                        {PHILOSOPHY_INTRO.lead}
                    </motion.p>

                    <motion.blockquote className="pt-quote" variants={v(item)}>
                        <span className="pt-quote-mark" aria-hidden="true">
                            <Icon name="quote" />
                        </span>
                        {PHILOSOPHY_INTRO.quote}
                    </motion.blockquote>

                    <motion.div className="pt-cta" variants={v(item)}>
                        <Link className="btn-primary" href="/philosophy" data-magnetic>
                            Explore our philosophy <Icon name="arrow-right" />
                        </Link>
                    </motion.div>
                </motion.div>

                {/* ── The seven value cards, enclosing it ── */}
                {VALUES.map((value: any, i: number) => (
                    <motion.div
                        className="pt-value"
                        key={value.label}
                        variants={v(card)}
                        style={{ ['--area']: PLACEMENT[i] } as any}
                        data-tilt
                    >
                        <span className="pt-value-icon" aria-hidden="true">
                            <Icon name={value.icon} />
                        </span>
                        <span className="pt-value-label">{value.label}</span>
                    </motion.div>
                ))}
            </motion.div>
        </section>
    );
}
