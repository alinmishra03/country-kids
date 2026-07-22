'use client';

/* CONTACT (app/contact) — contact-method cards, an opening-hours table beside a
   map, and the Acknowledgement of Country. Content from lib/site-data.js. */

import { useRef } from 'react';
import Page from '@/components/shared/Page';
import PageHero from '@/components/shared/PageHero';
import CTASection from '@/components/shared/CTASection';
import Reveal from '@/components/shared/Reveal';
import Icon from '@/components/shared/Icon';
import {
    PHONE,
    PHONE_HREF,
    EMAIL,
    EMAIL_HREF,
    ADDRESS,
    HOURS,
    ACKNOWLEDGEMENT,
} from '@/lib/site-data';
import { PHOTOS } from '@/lib/images';

const MAP_SRC =
    'https://www.google.com/maps?q=3+Nexus+Street+Ravenhall+VIC+3023&output=embed';

export default function ContactPage() {
    const rootRef = useRef(null);

    return (
        <Page id="contact" innerRef={rootRef}>
            <PageHero
                kicker="Contact"
                title={<>We&rsquo;d love to hear from you</>}
                lead="Questions, tours, or just saying hello — reach us any weekday between 6:30am and 6:30pm."
                image={PHOTOS.pageHeroContact}
                badges={['Mon–Fri · 6:30am–6:30pm', 'Ravenhall VIC 3023']}
            />

            <section className="section">
                <div className="container">
                    <Reveal className="features-grid" stagger amount={0.1}>
                        <Reveal as="div" variant="item" className="feature-item">
                            <div className="feature-icon" aria-hidden="true"><Icon name="phone" /></div>
                            <h3>Call</h3>
                            <p><a href={PHONE_HREF} className="link-accent">{PHONE}</a></p>
                        </Reveal>
                        <Reveal as="div" variant="item" className="feature-item">
                            <div className="feature-icon" aria-hidden="true"><Icon name="mail" /></div>
                            <h3>Email</h3>
                            <p><a href={EMAIL_HREF} className="link-accent">{EMAIL}</a></p>
                        </Reveal>
                        <Reveal as="div" variant="item" className="feature-item">
                            <div className="feature-icon" aria-hidden="true"><Icon name="map-pin" /></div>
                            <h3>Visit</h3>
                            <p><a href={ADDRESS.mapsHref} target="_blank" rel="noopener noreferrer" className="link-accent">{ADDRESS.line1}<br />{ADDRESS.line2}</a></p>
                        </Reveal>
                        <Reveal as="div" variant="item" className="feature-item">
                            <div className="feature-icon" aria-hidden="true"><Icon name="clock" /></div>
                            <h3>Hours</h3>
                            <p>Mon–Fri<br />6:30am – 6:30pm</p>
                        </Reveal>
                    </Reveal>

                    <div className="contact-lower">
                        <div className="contact-hours">
                            <h3><Icon name="calendar" /> Opening Hours</h3>
                            {HOURS.map((h) => (
                                <div className={`hours-row${h.open ? '' : ' is-closed'}`} key={h.day}>
                                    <span className="hours-day">{h.day}</span>
                                    <span className="hours-time">{h.time}</span>
                                </div>
                            ))}
                        </div>
                        <div className="contact-map">
                            <iframe
                                src={MAP_SRC}
                                title="Country Kids Learning Centre — 3 Nexus Street, Ravenhall VIC 3023"
                                loading="lazy"
                                referrerPolicy="no-referrer-when-downgrade"
                                allowFullScreen
                            />
                        </div>
                    </div>
                </div>
            </section>

            <section className="section section-alt">
                <div className="container">
                    <Reveal className="acknowledgement" variant="fadeUp">
                        <span className="acknowledgement-icon" aria-hidden="true"><Icon name="leaf" /></span>
                        <h3>Acknowledgement of Country</h3>
                        <p>{ACKNOWLEDGEMENT}</p>
                    </Reveal>
                </div>
            </section>

            <CTASection />
        </Page>
    );
}
