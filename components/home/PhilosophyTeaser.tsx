'use client';

/* Home philosophy teaser. A two-column band: the "Rooted in Country" heading and
   pull-quote beside a grid of the seven values as chips. Links to /philosophy. */

import Link from 'next/link';
import Reveal from '@/components/shared/Reveal';
import Icon from '@/components/shared/Icon';
import { PHILOSOPHY_INTRO, VALUES } from '@/lib/philosophy-data';

export default function PhilosophyTeaser() {
    return (
        <section className="section philosophy-teaser" id="philosophy">
            <div className="container philosophy-teaser-grid">
                {/* Left copy — a directional slide-in cascade from the left. */}
                <div className="philosophy-teaser-copy">
                    <Reveal as="span" variant="slideInLeft" className="section-eyebrow">Our Philosophy</Reveal>
                    <Reveal as="h2" variant="slideInLeft" delay={0.08} className="section-title">
                        Rooted in Country. <span>Flourishing together.</span>
                    </Reveal>
                    <Reveal as="p" variant="slideInLeft" delay={0.16} className="philosophy-teaser-lead">
                        {PHILOSOPHY_INTRO.lead}
                    </Reveal>
                    <Reveal as="blockquote" variant="slideInLeft" delay={0.24} className="philosophy-teaser-quote">
                        <Icon name="quote" />
                        {PHILOSOPHY_INTRO.quote}
                    </Reveal>
                    <Reveal variant="fadeUp" delay={0.32}>
                        <Link className="btn-primary" href="/philosophy">
                            Explore our philosophy <Icon name="arrow-right" />
                        </Link>
                    </Reveal>
                </div>

                {/* Right list — a staggered springy pop-in, chip by chip. */}
                <div className="values-grid">
                    {VALUES.map((v, i) => (
                        <Reveal as="div" variant="popIn" delay={i * 0.07} className="value-chip" key={v.label}>
                            <span className="value-chip-icon" aria-hidden="true"><Icon name={v.icon} /></span>
                            <span className="value-chip-label">{v.label}</span>
                        </Reveal>
                    ))}
                </div>
            </div>
        </section>
    );
}
