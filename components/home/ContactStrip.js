'use client';

import Link from 'next/link';

export default function ContactStrip() {
    return (
        <section className="contact-strip">
            <div className="container">
                <h2>Ready to give your child a joyful start?</h2>
                <p>
                    Spots fill quickly each season. Book a free tour today and see the
                    CountryKids difference for yourself.
                </p>
                <div className="contact-actions">
                    <Link className="btn-gold" href="/enroll">Book a Free Tour</Link>
                    <Link className="btn-outline" href="/contact">Contact Us</Link>
                </div>
            </div>
        </section>
    );
}
