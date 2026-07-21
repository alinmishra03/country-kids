'use client';

import { useRef } from 'react';
import Page from '@/components/shared/Page';
import EnrollForm from '@/components/shared/EnrollForm';
import { PHONE, PHONE_HREF, EMAIL } from '@/lib/nav-data';

export default function EnrollPage() {
    const rootRef = useRef(null);

    return (
        <Page id="enroll" innerRef={rootRef}>
            <section className="page-hero">
                <div className="page-hero-content container">
                    <span className="page-eyebrow">Enroll</span>
                    <h1>Book a <span style={{ color: 'var(--gold-deep)' }}>free tour</span></h1>
                    <p>
                        Tell us a little about your family and we&apos;ll reach out within one
                        business day to schedule your visit.
                    </p>
                </div>
            </section>

            <section className="page-body">
                <div className="container">
                    <div className="enroll-wrap">
                        <div className="enroll-info">
                            <div className="info-card">
                                <span className="info-emoji" aria-hidden="true">{'\u{1F4DE}'}</span>
                                <span><b>Call us</b><a href={PHONE_HREF} style={{ color: 'var(--blue)' }}>{PHONE}</a></span>
                            </div>
                            <div className="info-card">
                                <span className="info-emoji" aria-hidden="true">{'\u{2709}\u{FE0F}'}</span>
                                <span><b>Email</b><a href={`mailto:${EMAIL}`} style={{ color: 'var(--blue)' }}>{EMAIL}</a></span>
                            </div>
                            <div className="info-card">
                                <span className="info-emoji" aria-hidden="true">{'\u{1F4CD}'}</span>
                                <span><b>Visit</b><span>123 Meadow Lane, Springfield</span></span>
                            </div>
                            <div className="info-card">
                                <span className="info-emoji" aria-hidden="true">{'\u{1F55C}'}</span>
                                <span><b>Hours</b><span>Mon–Fri · 6:30am – 6:30pm</span></span>
                            </div>
                        </div>

                        <EnrollForm />
                    </div>
                </div>
            </section>
        </Page>
    );
}
