'use client';

import { useRef } from 'react';
import Link from 'next/link';
import Page from '@/components/shared/Page';
import { PROGRAMS } from '@/lib/programs-data';

export default function ProgramsPage() {
    const rootRef = useRef(null);

    return (
        <Page id="programs" innerRef={rootRef}>
            <section className="page-hero">
                <div className="page-hero-content container">
                    <span className="page-eyebrow">Programs</span>
                    <h1>A room for every <span style={{ color: 'var(--blue)' }}>age &amp; stage</span></h1>
                    <p>
                        Play-based, developmentally-tuned care from six weeks old through
                        after-school. Find the right fit for your child below.
                    </p>
                </div>
            </section>

            <section className="page-body">
                <div className="container">
                    <div className="programs-grid">
                        {PROGRAMS.map((p) => (
                            <article className="program-card" id={p.id} key={p.id}>
                                <div className="program-icon" aria-hidden="true">{p.icon}</div>
                                <h3>{p.name}</h3>
                                <span className="program-age">{p.age}</span>
                                <p>{p.blurb}</p>
                                <Link className="program-link" href="/enroll">Enroll</Link>
                            </article>
                        ))}
                    </div>
                </div>
            </section>

            <section className="contact-strip">
                <div className="container">
                    <h2>Not sure which program fits?</h2>
                    <p>Our director will happily walk you through the options on a free tour.</p>
                    <div className="contact-actions">
                        <Link className="btn-gold" href="/enroll">Book a Free Tour</Link>
                    </div>
                </div>
            </section>
        </Page>
    );
}
