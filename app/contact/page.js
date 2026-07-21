'use client';

import { useRef } from 'react';
import Link from 'next/link';
import Page from '@/components/shared/Page';
import { PHONE, PHONE_HREF, EMAIL } from '@/lib/nav-data';

export default function ContactPage() {
    const rootRef = useRef(null);

    return (
        <Page id="contact" innerRef={rootRef}>
            <section className="page-hero">
                <div className="page-hero-content container">
                    <span className="page-eyebrow">Contact</span>
                    <h1>We&apos;d <span style={{ color: 'var(--blue)' }}>love</span> to hear from you</h1>
                    <p>Questions, tours, or just saying hello — reach us any weekday.</p>
                </div>
            </section>

            <section className="page-body">
                <div className="container">
                    <div className="features-grid">
                        <div className="feature-item">
                            <div className="feature-emoji" aria-hidden="true">{'\u{1F4DE}'}</div>
                            <h3>Call</h3>
                            <p><a href={PHONE_HREF} style={{ color: 'var(--blue)', fontWeight: 700 }}>{PHONE}</a></p>
                        </div>
                        <div className="feature-item">
                            <div className="feature-emoji" aria-hidden="true">{'\u{2709}\u{FE0F}'}</div>
                            <h3>Email</h3>
                            <p><a href={`mailto:${EMAIL}`} style={{ color: 'var(--blue)', fontWeight: 700 }}>{EMAIL}</a></p>
                        </div>
                        <div className="feature-item">
                            <div className="feature-emoji" aria-hidden="true">{'\u{1F4CD}'}</div>
                            <h3>Visit</h3>
                            <p>123 Meadow Lane<br />Springfield, USA</p>
                        </div>
                        <div className="feature-item">
                            <div className="feature-emoji" aria-hidden="true">{'\u{1F55C}'}</div>
                            <h3>Hours</h3>
                            <p>Mon–Fri<br />6:30am – 6:30pm</p>
                        </div>
                    </div>

                    <div style={{ textAlign: 'center', marginTop: '3rem' }}>
                        <Link className="btn-gold" href="/enroll">Book a Free Tour</Link>
                    </div>
                </div>
            </section>
        </Page>
    );
}
