'use client';

/* ENROL (app/enroll) — the five-step enrolment journey, the Kinder-funding
   callout, and the enquiry form beside the centre's contact details. Content
   from lib/enrolment-data.js + site-data.js. */

import { useRef } from 'react';
import Page from '@/components/shared/Page';
import PageHero from '@/components/shared/PageHero';
import SectionHeader from '@/components/shared/SectionHeader';
import EnrollForm from '@/components/shared/EnrollForm';
import Reveal from '@/components/shared/Reveal';
import Icon from '@/components/shared/Icon';
import {
    ENROL_INTRO,
    ENROL_STEPS,
    KINDER_CALLOUT,
    FORM_INTRO,
} from '@/lib/enrolment-data';
import { PHONE, PHONE_HREF, EMAIL, EMAIL_HREF, ADDRESS } from '@/lib/site-data';
import { img, PHOTOS } from '@/lib/images';

export default function EnrollPage() {
    const rootRef = useRef(null);

    return (
        <Page id="enroll" innerRef={rootRef}>
            <PageHero
                kicker={ENROL_INTRO.kicker}
                title={ENROL_INTRO.title}
                lead={ENROL_INTRO.lead}
                image={PHOTOS.pageHeroEnroll}
                badges={['Free tours welcome', 'Responses within 1 business day']}
            />

            <section className="section">
                <div className="container">
                    <SectionHeader
                        kicker="How Enrolment Works"
                        title={<>Five gentle steps to <span>your first day</span></>}
                        lead="Our team guides you through every step — from your first tour to your child settling happily into their named room."
                    />
                    <Reveal className="features-grid" stagger amount={0.1}>
                        {ENROL_STEPS.map((s) => (
                            <Reveal as="div" variant="item" className="feature-item" key={s.title}>
                                <div className="feature-icon" aria-hidden="true"><Icon name={s.icon} /></div>
                                <h3>{s.title}</h3>
                                <p>{s.text}</p>
                            </Reveal>
                        ))}
                    </Reveal>

                    <Reveal className="sblocks-callout is-spaced" variant="fadeUp">
                        <div className="sblocks-callout-text">
                            <h3>{KINDER_CALLOUT.title}</h3>
                            <p>{KINDER_CALLOUT.text}</p>
                        </div>
                        <a className="btn-gold" href="#enquire"><Icon name="graduation" /> Ask about funding</a>
                    </Reveal>
                </div>
            </section>

            <section className="section section-alt" id="enquire">
                <div className="container">
                    <SectionHeader
                        kicker="Get in Touch"
                        title={FORM_INTRO.title}
                        lead={FORM_INTRO.lead}
                    />
                    <div className="enroll-wrap">
                        <div className="enroll-info">
                            <figure className="enroll-photo">
                                <img
                                    src={img(PHOTOS.enroll, 800, 60)}
                                    alt="Children busy with arts and crafts at Country Kids"
                                    loading="lazy"
                                    decoding="async"
                                    width="800"
                                    height="500"
                                />
                            </figure>
                            <div className="info-card">
                                <span className="info-icon" aria-hidden="true"><Icon name="phone" /></span>
                                <span><b>Call us</b><a href={PHONE_HREF} className="link-accent">{PHONE}</a></span>
                            </div>
                            <div className="info-card">
                                <span className="info-icon" aria-hidden="true"><Icon name="mail" /></span>
                                <span><b>Email</b><a href={EMAIL_HREF} className="link-accent">{EMAIL}</a></span>
                            </div>
                            <div className="info-card">
                                <span className="info-icon" aria-hidden="true"><Icon name="map-pin" /></span>
                                <span><b>Visit</b><span>{ADDRESS.full}</span></span>
                            </div>
                            <div className="info-card">
                                <span className="info-icon" aria-hidden="true"><Icon name="clock" /></span>
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
