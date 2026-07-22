'use client';

import Link from 'next/link';
import Icon from '@/components/shared/Icon';
import { img, PHOTOS } from '@/lib/images';

const TICKS = [
    'Certified early-childhood educators',
    'Low child-to-teacher ratios',
    'Secure, camera-monitored building',
    'Fresh, allergy-aware meals daily',
];

export default function AboutSection() {
    return (
        <section className="section" id="about">
            <div className="container">
                <div className="about-grid">
                    <div className="about-media">
                        <img
                            className="about-photo"
                            src={img(PHOTOS.aboutHome, 900, 65)}
                            alt="A CountryKids teacher playing and learning with young children"
                            loading="lazy"
                            decoding="async"
                            width="900"
                            height="680"
                        />
                        <div className="about-float one" aria-hidden="true"><Icon name="palette" /> Play-based learning</div>
                        <div className="about-float two" aria-hidden="true"><Icon name="heart" /> Loving care</div>
                    </div>

                    <div className="about-copy">
                        <div className="section-eyebrow">Why CountryKids</div>
                        <h2 className="section-title">A place that feels like <span>home</span></h2>
                        <p>
                            For over 15 years, families have trusted CountryKids to give their
                            children a safe, nurturing and stimulating start. Our teachers know
                            every child by name, temperament and giggle — and it shows.
                        </p>
                        <ul className="about-list">
                            {TICKS.map((t) => (
                                <li key={t}><span className="tick"><Icon name="check" strokeWidth={3} /></span> {t}</li>
                            ))}
                        </ul>
                        <div className="about-cta">
                            <Link className="btn-primary" href="/about">Our Story</Link>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
