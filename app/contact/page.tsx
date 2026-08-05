'use client';

/* CONTACT (app/contact) — accreditation rail, the enquiry form beside a glass
   information card, three contact cards, the map, and the Acknowledgement of
   Country. Content from lib/site-data.ts.

   The HERO IS UNCHANGED — same PageHero, same props, same media. Everything
   below it is the redesign. */

import { useRef } from 'react';
import Page from '@/components/shared/Page';
import PageHero from '@/components/shared/PageHero';
import CTASection from '@/components/shared/CTASection';
import Reveal from '@/components/shared/Reveal';
import Icon from '@/components/shared/Icon';
import ContactForm from '@/components/contact/ContactForm';
import EnrollCta from '@/components/shared/EnrollCta';
import {
    PHONE,
    PHONE_HREF,
    EMAIL,
    EMAIL_HREF,
    ADDRESS,
    ACKNOWLEDGEMENT,
} from '@/lib/site-data';
import { PAGE_MEDIA } from '@/lib/page-media';
import PageNavigator from '@/components/common/PageNavigator';

const MAP_SRC =
    'https://www.google.com/maps?q=3+Nexus+Street+Ravenhall+VIC+3023&output=embed';

/* Accreditation marks. Every claim below is one the site ALREADY makes on
   /compliance (lib/compliance-data.ts) — none of them is invented here, and
   none is a third-party logo. Text marks rather than logo files: the centre
   has supplied no logo assets, and rendering a regulator's mark we do not hold
   permission for would be worse than not showing one. */
const ACCREDITATIONS = [
    { icon: 'landmark', label: 'NQF Approved Provider' },
    { icon: 'shield', label: 'Child Safe Organisation' },
    { icon: 'clipboard-check', label: 'Registered on Starting Blocks' },
    { icon: 'graduation', label: 'Victorian Funded Kinder' },
    { icon: 'users', label: 'National Worker Register' },
    { icon: 'heart-handshake', label: 'Working with Children Checked' },
];

const CONTACT_CARDS = [
    {
        icon: 'phone',
        title: 'Call us',
        body: 'Speak with our centre team about availability, fees or anything else on your mind.',
        actionLabel: PHONE,
        href: PHONE_HREF,
        external: false,
    },
    {
        icon: 'mail',
        title: 'Email us',
        body: 'Send through your questions and we will reply within one business day.',
        actionLabel: EMAIL,
        href: EMAIL_HREF,
        external: false,
    },
    {
        icon: 'map-pin',
        title: 'Visit the centre',
        body: `${ADDRESS.line1}, ${ADDRESS.line2}. Tours are welcome — book ahead so we can give you our full attention.`,
        actionLabel: 'Get directions',
        href: ADDRESS.mapsHref,
        external: true,
    },
];

export default function ContactPage() {
    const rootRef = useRef(null);

    return (
        <Page id="contact" innerRef={rootRef}>
            {/* ── HERO — UNCHANGED ── */}
            <PageHero
                kicker="Contact"
                title={<>We&rsquo;d love to hear from you</>}
                lead="Questions, tours, or just saying hello — reach us any weekday between 6:30am and 6:30pm."
                image={PAGE_MEDIA.contact.hero.src}
                badges={['Mon–Fri · 6:30am–6:30pm', 'Ravenhall VIC 3023']}
                variant="editorial"
                parallax
            />

            {/* ── 1 · ACCREDITATION RAIL ── */}
            <section className="section trust-strip" aria-labelledby="trust-heading">
                <div className="container">
                    <Reveal>
                        <p className="trust-strip-label" id="trust-heading">
                            Regulated, registered and accountable
                        </p>
                    </Reveal>
                    <Reveal as="ul" className="trust-rail" stagger amount={0.1}>
                        {ACCREDITATIONS.map((item) => (
                            <Reveal as="li" variant="item" className="trust-mark" key={item.label}>
                                <span className="trust-mark-icon" aria-hidden="true">
                                    <Icon name={item.icon} />
                                </span>
                                <span className="trust-mark-text">{item.label}</span>
                            </Reveal>
                        ))}
                    </Reveal>
                </div>
            </section>

            {/* ── 2 · FORM + INFORMATION CARD ── */}
            <section className="section section-alt" aria-labelledby="enquiry-heading">
                <div className="container">
                    <div className="contact-split">
                        <Reveal>
                            <h2 id="enquiry-heading" className="sr-only">
                                Send us an enquiry
                            </h2>
                            <ContactForm />
                        </Reveal>

                        <Reveal delay={0.1}>
                            <aside className="contact-aside">
                                <img
                                    className="contact-aside-logo"
                                    src="/images/countrykids.png"
                                    alt="Country Kids Learning Centre"
                                    /* Must match the file's real 1080x658 ratio. The CSS pins
                                       height and leaves width auto, so the browser derives the
                                       rendered width from these two numbers until the PNG
                                       loads — a ratio that disagrees with the file reserves the
                                       wrong box and shifts the aside as it settles. */
                                    width={56}
                                    height={34}
                                />
                                <h2>Let&rsquo;s start your child&rsquo;s learning journey</h2>
                                <p className="contact-aside-lead">
                                    Every enquiry reaches our centre team directly — not a call
                                    centre. Tell us a little about your family and we will find the
                                    right room, the right days and the right start.
                                </p>

                                <dl className="aside-details">
                                    <div className="aside-detail">
                                        <span className="aside-detail-icon" aria-hidden="true">
                                            <Icon name="phone" />
                                        </span>
                                        <div>
                                            <dt>Phone</dt>
                                            <dd><a href={PHONE_HREF}>{PHONE}</a></dd>
                                        </div>
                                    </div>
                                    <div className="aside-detail">
                                        <span className="aside-detail-icon" aria-hidden="true">
                                            <Icon name="mail" />
                                        </span>
                                        <div>
                                            <dt>Email</dt>
                                            <dd><a href={EMAIL_HREF}>{EMAIL}</a></dd>
                                        </div>
                                    </div>
                                    <div className="aside-detail">
                                        <span className="aside-detail-icon" aria-hidden="true">
                                            <Icon name="clock" />
                                        </span>
                                        <div>
                                            <dt>Office hours</dt>
                                            <dd>Monday – Friday, 6:30am – 6:30pm</dd>
                                        </div>
                                    </div>
                                    <div className="aside-detail">
                                        <span className="aside-detail-icon" aria-hidden="true">
                                            <Icon name="map-pin" />
                                        </span>
                                        <div>
                                            <dt>Address</dt>
                                            <dd>
                                                {ADDRESS.line1}
                                                <br />
                                                {ADDRESS.line2}
                                            </dd>
                                        </div>
                                    </div>
                                    <div className="aside-detail">
                                        <span className="aside-detail-icon" aria-hidden="true">
                                            <Icon name="shield" />
                                        </span>
                                        <div>
                                            <dt>Urgent or after hours</dt>
                                            <dd>
                                                <a href={PHONE_HREF}>{PHONE}</a> — enrolled families
                                                also hold our centre director&rsquo;s direct line.
                                            </dd>
                                        </div>
                                    </div>
                                </dl>

                                <EnrollCta className="contact-aside-cta" />
                            </aside>
                        </Reveal>
                    </div>
                </div>
            </section>

            {/* ── 3 · CONTACT CARDS ── */}
            <section className="section" aria-labelledby="reach-heading">
                <div className="container">
                    <h2 id="reach-heading" className="sr-only">
                        Other ways to reach us
                    </h2>
                    <Reveal className="contact-cards" stagger amount={0.1}>
                        {CONTACT_CARDS.map((card) => (
                            <Reveal as="div" variant="item" className="contact-card" key={card.title}>
                                <span className="contact-card-icon" aria-hidden="true">
                                    <Icon name={card.icon} />
                                </span>
                                <h3>{card.title}</h3>
                                <p>{card.body}</p>
                                <p className="contact-card-action">
                                    <a
                                        href={card.href}
                                        className="link-accent"
                                        {...(card.external
                                            ? { target: '_blank', rel: 'noopener noreferrer' }
                                            : {})}
                                    >
                                        {card.actionLabel}
                                        {card.external && (
                                            <span className="sr-only"> (opens in a new tab)</span>
                                        )}
                                    </a>
                                </p>
                            </Reveal>
                        ))}
                    </Reveal>
                </div>
            </section>

            {/* ── 4 · MAP ── */}
            <section className="section section-alt" aria-labelledby="map-heading">
                <div className="container">
                    <Reveal className="map-panel">
                        <div className="map-panel-head">
                            <div>
                                <h3 id="map-heading">Find us in Ravenhall</h3>
                                <p>{ADDRESS.full}</p>
                            </div>
                            <a
                                className="btn-outline"
                                href={ADDRESS.mapsHref}
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                Get directions
                                <Icon name="arrow-right" />
                            </a>
                        </div>
                        <div className="map-frame">
                            <iframe
                                src={MAP_SRC}
                                title={`Map showing Country Kids Learning Centre at ${ADDRESS.full}`}
                                loading="lazy"
                                referrerPolicy="no-referrer-when-downgrade"
                                allowFullScreen
                            />
                        </div>
                    </Reveal>
                </div>
            </section>

            {/* ── ACKNOWLEDGEMENT OF COUNTRY — kept from the previous page ── */}
            <section className="section">
                <div className="container">
                    <Reveal className="acknowledgement" variant="fadeUp">
                        <span className="acknowledgement-icon" aria-hidden="true">
                            <Icon name="leaf" />
                        </span>
                        <h3>Acknowledgement of Country</h3>
                        <p>{ACKNOWLEDGEMENT}</p>
                    </Reveal>
                </div>
            </section>

            <PageNavigator />

            <CTASection />
        </Page>
    );
}
