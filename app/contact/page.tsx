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
import { PAGE_MEDIA } from '@/lib/page-media';

const MAP_SRC =
    'https://www.google.com/maps?q=3+Nexus+Street+Ravenhall+VIC+3023&output=embed';

const CONTACT_METHODS = [
    {
        icon: 'phone',
        title: 'Call',
        content: (
            <a href={PHONE_HREF} className="link-accent">
                {PHONE}
            </a>
        ),
        image: PAGE_MEDIA.contact.highlights?.[0]?.src,
    },
    {
        icon: 'mail',
        title: 'Email',
        content: (
            <a href={EMAIL_HREF} className="link-accent">
                {EMAIL}
            </a>
        ),
        image: PAGE_MEDIA.contact.highlights?.[1]?.src,
    },
    {
        icon: 'map-pin',
        title: 'Visit',
        content: (
            <a href={ADDRESS.mapsHref} target="_blank" rel="noopener noreferrer" className="link-accent">
                {ADDRESS.line1}
                <br />
                {ADDRESS.line2}
            </a>
        ),
        image: PAGE_MEDIA.contact.highlights?.[2]?.src,
    },
    {
        icon: 'clock',
        title: 'Hours',
        content: (
            <>
                Mon–Fri
                <br />
                6:30am – 6:30pm
            </>
        ),
        image: PAGE_MEDIA.contact.highlights?.[3]?.src,
    },
];

export default function ContactPage() {
    const rootRef = useRef(null);

    return (
        <Page id="contact" innerRef={rootRef}>
            <PageHero
                kicker="Contact"
                title={<>We&rsquo;d love to hear from you</>}
                lead="Questions, tours, or just saying hello — reach us any weekday between 6:30am and 6:30pm."
                image={PAGE_MEDIA.contact.hero.src}
                badges={['Mon–Fri · 6:30am–6:30pm', 'Ravenhall VIC 3023']}
                variant="editorial"
                parallax
            />

            <section className="section">
                <div className="container">
                    <Reveal className="features-grid" stagger amount={0.1}>
                        {CONTACT_METHODS.map((item) => (
                            <Reveal as="div" variant="item" className={`feature-item${item.image ? ' has-bg' : ''}`} key={item.title}>
                                {item.image && (
                                    <div className="feature-item-bg" aria-hidden="true">
                                        <img src={item.image} alt="" loading="lazy" />
                                        <div className="feature-item-overlay" />
                                    </div>
                                )}
                                <div className="feature-icon" aria-hidden="true"><Icon name={item.icon} /></div>
                                <h3>{item.title}</h3>
                                <p>{item.content}</p>
                            </Reveal>
                        ))}
                    </Reveal>

                    <div className="contact-lower">
                        {/* Hours slide in from the left, each row stepping in
                            after the last, so the week reads as it arrives. */}
                        <Reveal className="contact-hours" variant="fadeLeft">
                            <h3><Icon name="calendar" /> Opening Hours</h3>
                            {HOURS.map((h) => (
                                <div className={`hours-row${h.open ? '' : ' is-closed'}`} key={h.day}>
                                    <span className="hours-day">{h.day}</span>
                                    <span className="hours-time">{h.time}</span>
                                </div>
                            ))}
                        </Reveal>

                        {/* The map wipes open behind a clip-path rather than
                            fading — an iframe fade shows the tiles loading, a
                            clip reveal shows a finished map appearing. */}
                        <Reveal className="contact-map" variant="maskReveal" once>
                            <iframe
                                src={MAP_SRC}
                                title="Country Kids Learning Centre — 3 Nexus Street, Ravenhall VIC 3023"
                                loading="lazy"
                                referrerPolicy="no-referrer-when-downgrade"
                                allowFullScreen
                            />
                        </Reveal>
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
