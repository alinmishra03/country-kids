'use client';

/* Age-group program cards, rendered from lib/programs-data.js. */

import Link from 'next/link';
import { PROGRAMS } from '@/lib/programs-data';

export default function ProgramsGrid() {
    return (
        <section className="section section-alt" id="programs">
            <div className="container">
                <div className="section-head">
                    <div className="section-eyebrow">Our Programs</div>
                    <h2 className="section-title">A program for every <span>age &amp; stage</span></h2>
                    <p className="section-subtitle">
                        From first steps to first words to first friends — each room is designed
                        around what your child needs right now.
                    </p>
                    <div className="divider-dots"><span></span><span></span><span></span></div>
                </div>

                <div className="programs-grid">
                    {PROGRAMS.map((p) => (
                        <article className="program-card" id={p.id} key={p.id}>
                            <div className="program-icon" aria-hidden="true">{p.icon}</div>
                            <h3>{p.name}</h3>
                            <span className="program-age">{p.age}</span>
                            <p>{p.blurb}</p>
                            <Link className="program-link" href="/programs">Learn more</Link>
                        </article>
                    ))}
                </div>
            </div>
        </section>
    );
}
