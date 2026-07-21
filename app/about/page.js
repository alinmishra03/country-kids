'use client';

import { useRef } from 'react';
import Page from '@/components/shared/Page';
import { FEATURES } from '@/lib/programs-data';

const TEAM = [
    { avatar: '\u{1F469}\u{200D}\u{1F3EB}', name: 'Ms. Ellie', role: 'Center Director · 15 yrs' },
    { avatar: '\u{1F468}\u{200D}\u{1F3EB}', name: 'Mr. Sam', role: 'Preschool Lead · ECE Certified' },
    { avatar: '\u{1F469}\u{200D}\u{2695}\u{FE0F}', name: 'Nurse Dana', role: 'Health & Safety Coordinator' },
    { avatar: '\u{1F469}\u{200D}\u{1F373}', name: 'Chef Maria', role: 'Nutrition & Meals' },
];

export default function AboutPage() {
    const rootRef = useRef(null);

    return (
        <Page id="about" innerRef={rootRef}>
            <section className="page-hero">
                <div className="page-hero-content container">
                    <span className="page-eyebrow">Our Story</span>
                    <h1>Caring for little ones since <span style={{ color: 'var(--gold-deep)' }}>2010</span></h1>
                    <p>
                        CountryKids began with one simple belief: every child deserves a warm,
                        safe place to learn and grow while their parents are at work.
                    </p>
                </div>
            </section>

            <section className="page-body">
                <div className="container prose">
                    <p>
                        What started as a small home daycare has grown into a beloved neighborhood
                        center serving hundreds of families — but our heart hasn&apos;t changed. We
                        keep our groups small, our teachers certified, and our doors open with the
                        same warmth we had on day one.
                    </p>

                    <h2 id="safety">Health &amp; Safety First</h2>
                    <p>
                        Your child&apos;s wellbeing is our highest priority. Our building features
                        secure keypad entry, CCTV monitoring, background-checked staff, and strict
                        allergy-aware meal preparation. Every teacher is trained in pediatric first
                        aid and CPR.
                    </p>
                </div>

                <div className="container" style={{ marginTop: '3rem' }}>
                    <div className="features-grid">
                        {FEATURES.map((f) => (
                            <div className="feature-item" key={f.title}>
                                <div className="feature-emoji" aria-hidden="true">{f.icon}</div>
                                <h3>{f.title}</h3>
                                <p>{f.text}</p>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="container" style={{ marginTop: '3.5rem' }} id="team">
                    <div className="section-head">
                        <div className="section-eyebrow">Meet the Teachers</div>
                        <h2 className="section-title">The people your child will <span>adore</span></h2>
                    </div>
                    <div className="features-grid">
                        {TEAM.map((m) => (
                            <div className="feature-item" key={m.name}>
                                <div className="feature-emoji" aria-hidden="true">{m.avatar}</div>
                                <h3>{m.name}</h3>
                                <p>{m.role}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>
        </Page>
    );
}
