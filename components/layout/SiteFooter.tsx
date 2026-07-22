'use client';

/* Site footer. Brand + trust badges + socials, three link columns (Rooms, For
   Families, About Us), an Acknowledgement of Country, and the legal row. All
   content comes from the site + rooms data. */

import { useState } from 'react';
import Link from 'next/link';
import Icon from '@/components/shared/Icon';
import Reveal from '@/components/shared/Reveal';
import { ROOM_LINKS } from '@/lib/rooms-data';
import {
    SITE,
    PHONE,
    PHONE_HREF,
    EMAIL,
    EMAIL_HREF,
    ADDRESS,
    TRUST_BADGES,
    ACKNOWLEDGEMENT,
    SOCIALS,
    STARTING_BLOCKS_HREF,
} from '@/lib/site-data';

/* Brand marks inlined as monochrome paths (inherit currentColor). */
const SOCIAL_PATHS = {
    facebook:
        'M22 12a10 10 0 1 0-11.56 9.88v-6.99H7.9V12h2.54V9.8c0-2.5 1.49-3.89 3.78-3.89 1.09 0 2.24.2 2.24.2v2.46h-1.26c-1.24 0-1.63.77-1.63 1.56V12h2.78l-.44 2.89h-2.34v6.99A10 10 0 0 0 22 12Z',
    instagram:
        'M12 2.16c3.2 0 3.58.01 4.85.07 1.17.05 1.8.25 2.23.41.56.22.96.48 1.38.9.42.42.68.82.9 1.38.16.42.36 1.06.41 2.23.06 1.27.07 1.65.07 4.85s-.01 3.58-.07 4.85c-.05 1.17-.25 1.8-.41 2.23-.22.56-.48.96-.9 1.38-.42.42-.82.68-1.38.9-.42.16-1.06.36-2.23.41-1.27.06-1.65.07-4.85.07s-3.58-.01-4.85-.07c-1.17-.05-1.8-.25-2.23-.41a3.72 3.72 0 0 1-1.38-.9 3.72 3.72 0 0 1-.9-1.38c-.16-.42-.36-1.06-.41-2.23C2.17 15.58 2.16 15.2 2.16 12s.01-3.58.07-4.85c.05-1.17.25-1.8.41-2.23.22-.56.48-.96.9-1.38.42-.42.82-.68 1.38-.9.42-.16 1.06-.36 2.23-.41C8.42 2.17 8.8 2.16 12 2.16Zm0 3.68A6.16 6.16 0 1 0 18.16 12 6.16 6.16 0 0 0 12 5.84Zm0 10.16A4 4 0 1 1 16 12a4 4 0 0 1-4 4Zm6.4-10.4a1.44 1.44 0 1 0 1.44 1.44 1.44 1.44 0 0 0-1.44-1.44Z',
    tiktok:
        'M16.6 5.82A4.28 4.28 0 0 1 15.54 3h-3.09v12.4a2.59 2.59 0 0 1-2.59 2.5 2.59 2.59 0 0 1-.58-5.11v-3.2a5.66 5.66 0 0 0-5 5.62A5.66 5.66 0 0 0 9.94 21a5.66 5.66 0 0 0 5.66-5.66V9.01a7.34 7.34 0 0 0 4.29 1.37V7.3a4.28 4.28 0 0 1-3.29-1.48Z',
};

function SocialIcon({ brand }) {
    return (
        <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor" aria-hidden="true" focusable="false">
            <path d={SOCIAL_PATHS[brand]} />
        </svg>
    );
}

const FAMILY_LINKS = [
    { href: '/enroll', label: 'Book a Tour' },
    { href: '/enroll', label: 'Enroll Now' },
    { href: '/fees', label: 'Fees & CCS' },
    { href: '/curriculum', label: 'Our Curriculum' },
    { href: '/compliance', label: 'Quality & Compliance' },
    { href: '/contact#faqs', label: 'FAQs' },
];

const ABOUT_LINKS = [
    { href: '/philosophy#philosophy', label: 'Our Philosophy' },
    { href: '/philosophy#vision', label: 'Our Vision' },
    { href: '/philosophy#mission', label: 'Our Mission' },
    { href: '/families', label: 'Family Stories' },
    { href: '/contact', label: 'Contact Us' },
];

/* Benefit badges shown under the description (navy glass + gold icon + white). */
const NEWSLETTER_BENEFITS = [
    { icon: 'clipboard-check', label: 'Enrolment Updates' },
    { icon: 'users', label: 'Community News' },
    { icon: 'heart-handshake', label: 'Parenting Tips' },
];

/* Newsletter CTA. Client-side only (no backend wired yet) — validates the email,
   shows a loading state, then swaps to a success confirmation. The submit handler
   currently simulates the request; wire it to your email service where noted
   without changing the surrounding UI/validation flow. */
function NewsletterBand() {
    const [email, setEmail] = useState('');
    const [status, setStatus] = useState('idle'); // 'idle' | 'loading' | 'success'
    const [error, setError] = useState('');

    const isValidEmail = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim());

    const handleSubmit = (e) => {
        e.preventDefault();
        if (status === 'loading') return;
        if (!isValidEmail(email)) {
            setError('Please enter a valid email address.');
            return;
        }
        setError('');
        setStatus('loading');
        // TODO: POST the email to your newsletter service here, then setStatus on
        // its resolution. The timeout only simulates that round-trip.
        window.setTimeout(() => setStatus('success'), 900);
    };

    return (
        <Reveal
            as="section"
            variant="fadeUp"
            once
            className="newsletter-cta"
            aria-labelledby="newsletter-heading"
        >
            <div className="newsletter-cta-glow" aria-hidden="true" />
            <div className="newsletter-cta-inner container">
                    <span className="newsletter-eyebrow">Stay Connected</span>
                    <h2 id="newsletter-heading" className="newsletter-title">
                        Stay in the loop with Country Kids
                    </h2>
                    <span className="newsletter-title-accent" aria-hidden="true" />
                    <p className="newsletter-desc">
                        Receive occasional updates about tours, enrolments, community events
                        and parenting resources.
                    </p>

                    <ul className="newsletter-badges">
                        {NEWSLETTER_BENEFITS.map((b) => (
                            <li className="newsletter-badge" key={b.label}>
                                <Icon name={b.icon} /> {b.label}
                            </li>
                        ))}
                    </ul>

                    {status === 'success' ? (
                        <p className="newsletter-success" role="status">
                            <Icon name="circle-check" />
                            <span>
                                <b>Thanks for subscribing!</b> You&rsquo;ll receive occasional
                                updates from Country Kids.
                            </span>
                        </p>
                    ) : (
                        <form className="newsletter-form" onSubmit={handleSubmit} noValidate>
                            <label className="newsletter-label" htmlFor="newsletter-email">
                                Email address
                            </label>
                            <div className="newsletter-pill">
                                <input
                                    id="newsletter-email"
                                    className="newsletter-input"
                                    name="email"
                                    type="email"
                                    inputMode="email"
                                    autoComplete="email"
                                    placeholder="Enter your email address"
                                    value={email}
                                    onChange={(e) => {
                                        setEmail(e.target.value);
                                        if (error) setError('');
                                    }}
                                    aria-invalid={error ? 'true' : 'false'}
                                    aria-describedby={error ? 'newsletter-error' : undefined}
                                    disabled={status === 'loading'}
                                    required
                                />
                                <button
                                    type="submit"
                                    className="newsletter-submit"
                                    disabled={status === 'loading'}
                                >
                                    {status === 'loading' ? (
                                        <>
                                            <span className="btn-spinner" aria-hidden="true" />
                                            Subscribing…
                                        </>
                                    ) : (
                                        <>
                                            <Icon name="send" /> Subscribe
                                        </>
                                    )}
                                </button>
                            </div>
                            {error && (
                                <p className="newsletter-error" id="newsletter-error" role="alert">
                                    {error}
                                </p>
                            )}
                        </form>
                    )}

                    <p className="newsletter-trust">No spam · Unsubscribe anytime</p>
                </div>
            </Reveal>
    );
}

export default function SiteFooter() {
    return (
        <footer id="site-footer">
            <NewsletterBand />
            <div className="container">
                <div className="footer-grid">
                    <div className="footer-brand">
                        <div className="footer-logo">
                            <span
                                className="logo-img footer-logo-img"
                                role="img"
                                aria-label={`${SITE.name} — ${SITE.legalName}`}
                            />
                        </div>
                        <p className="footer-desc">
                            A not-for-profit early learning organisation in {SITE.suburb}, {SITE.state}.
                            Where every child belongs — from 6 weeks to 6 years, across 7 purpose-named rooms.
                        </p>
                        <ul className="footer-badges">
                            {TRUST_BADGES.map((b) => (
                                <li key={b}><Icon name="badge" /> {b}</li>
                            ))}
                        </ul>
                        <div className="footer-social">
                            {SOCIALS.map((s) => (
                                <a href={s.href} key={s.label} aria-label={s.label}>
                                    <SocialIcon brand={s.brand} />
                                </a>
                            ))}
                        </div>
                    </div>

                    <div className="footer-col">
                        <div className="footer-col-title">Our Rooms</div>
                        <ul className="footer-links">
                            {ROOM_LINKS.map((l) => (
                                <li key={l.href}><Link href={l.href}>{l.label}</Link></li>
                            ))}
                        </ul>
                    </div>

                    <div className="footer-col">
                        <div className="footer-col-title">For Families</div>
                        <ul className="footer-links">
                            {FAMILY_LINKS.map((l, i) => (
                                <li key={i}><Link href={l.href}>{l.label}</Link></li>
                            ))}
                        </ul>
                    </div>

                    <div className="footer-col">
                        <div className="footer-col-title">About Us</div>
                        <ul className="footer-links">
                            {ABOUT_LINKS.map((l, i) => (
                                <li key={i}><Link href={l.href}>{l.label}</Link></li>
                            ))}
                            <li>
                                <a href={STARTING_BLOCKS_HREF} target="_blank" rel="noopener noreferrer">
                                    View on Starting Blocks <Icon name="arrow-up-right" />
                                </a>
                            </li>
                        </ul>
                        <address className="footer-contact">
                            <a href={PHONE_HREF}><Icon name="phone" /> {PHONE}</a>
                            <a href={EMAIL_HREF}><Icon name="mail" /> {EMAIL}</a>
                            <span><Icon name="map-pin" /> {ADDRESS.full}</span>
                        </address>
                    </div>
                </div>

                <div className="footer-acknowledgement">
                    <Icon name="leaf" />
                    <p>{ACKNOWLEDGEMENT}</p>
                </div>

                <div className="footer-bottom">
                    <span>© {SITE.established} {SITE.legalName} · {ADDRESS.full} · ABN: Registered Not-for-Profit</span>
                    <span className="footer-policies">Privacy Policy · Child Safety Policy · Terms of Use</span>
                </div>
            </div>
        </footer>
    );
}
