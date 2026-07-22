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
                <Reveal className="philosophy-teaser-copy" stagger>
                    <Reveal as="span" variant="item" className="section-eyebrow">Our Philosophy</Reveal>
                    <Reveal as="h2" variant="item" className="section-title">
                        Rooted in Country. <span>Flourishing together.</span>
                    </Reveal>
                    <Reveal as="p" variant="item" className="philosophy-teaser-lead">
                        {PHILOSOPHY_INTRO.lead}
                    </Reveal>
                    <Reveal as="blockquote" variant="item" className="philosophy-teaser-quote">
                        <Icon name="quote" />
                        {PHILOSOPHY_INTRO.quote}
                    </Reveal>
                    <Reveal variant="item">
                        <Link className="btn-primary" href="/philosophy">
                            Explore our philosophy <Icon name="arrow-right" />
                        </Link>
                    </Reveal>
                </Reveal>

                <Reveal className="values-grid" stagger amount={0.1}>
                    {VALUES.map((v) => (
                        <Reveal as="div" variant="item" className="value-chip" key={v.label}>
                            <span className="value-chip-icon" aria-hidden="true"><Icon name={v.icon} /></span>
                            <span className="value-chip-label">{v.label}</span>
                        </Reveal>
                    ))}
                </Reveal>
            </div>
        </section>
    );
}
