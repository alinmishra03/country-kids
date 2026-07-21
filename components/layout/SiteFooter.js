'use client';

/* Site footer. Mirrors the reference project's SiteFooter structure. */

import Link from 'next/link';
import T from '@/components/shared/T';
import { PHONE, PHONE_HREF, EMAIL } from '@/lib/nav-data';

export default function SiteFooter() {
    return (
        <footer id="site-footer">
            <div className="container">
                <div className="footer-grid">
                    <div className="footer-brand">
                        <div className="footer-logo">
                            <span className="logo-mark" aria-hidden="true">{'\u{1F9F8}'}</span>
                            <span>CountryKids</span>
                        </div>
                        <div className="footer-desc">
                            A warm, safe and joyful home away from home where little ones learn,
                            play and grow. Call{' '}
                            <a href={PHONE_HREF}>{PHONE}</a> or email{' '}
                            <a href={`mailto:${EMAIL}`}>{EMAIL}</a>.
                        </div>
                        <div className="footer-social">
                            <a href="#" aria-label="Facebook">{'\u{1F4D8}'}</a>
                            <a href="#" aria-label="Instagram">{'\u{1F4F7}'}</a>
                            <a href="#" aria-label="YouTube">{'\u{1F4FA}'}</a>
                        </div>
                    </div>

                    <div>
                        <T k="footer-programs" as="div" className="footer-col-title">Programs</T>
                        <ul className="footer-links">
                            <li><Link href="/programs#infants">Infant Care</Link></li>
                            <li><Link href="/programs#toddlers">Toddlers</Link></li>
                            <li><Link href="/programs#preschool">Preschool</Link></li>
                            <li><Link href="/programs#prek">Pre-Kindergarten</Link></li>
                        </ul>
                    </div>

                    <div>
                        <T k="footer-about" as="div" className="footer-col-title">About</T>
                        <ul className="footer-links">
                            <li><Link href="/about">Our Story</Link></li>
                            <li><Link href="/about#team">Our Teachers</Link></li>
                            <li><Link href="/about#safety">Health &amp; Safety</Link></li>
                            <li><Link href="/contact">Book a Tour</Link></li>
                        </ul>
                    </div>

                    <div>
                        <T k="footer-visit" as="div" className="footer-col-title">Visit Us</T>
                        <ul className="footer-links">
                            <li>123 Meadow Lane</li>
                            <li>Springfield, USA</li>
                            <li>Mon–Fri · 6:30am–6:30pm</li>
                            <li><Link href="/enroll">Enroll Today</Link></li>
                        </ul>
                    </div>
                </div>

                <div className="footer-bottom">
                    &copy; 2026 CountryKids Daycare. All rights reserved. · Licensed &amp; insured childcare.
                </div>
            </div>
        </footer>
    );
}
