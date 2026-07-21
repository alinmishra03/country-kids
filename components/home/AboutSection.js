'use client';

import Link from 'next/link';

export default function AboutSection() {
    return (
        <section className="section" id="about">
            <div className="container">
                <div className="about-grid">
                    <div className="about-media" aria-hidden="true">
                        <span className="about-emoji">{'\u{1F9F8}'}</span>
                        <div className="about-float one">{'\u{1F308}'} Play-based learning</div>
                        <div className="about-float two">{'\u{2764}\u{FE0F}'} Loving care</div>
                    </div>

                    <div className="about-copy">
                        <div className="section-eyebrow">Why CountryKids</div>
                        <h2>A place that feels like <span style={{ color: 'var(--blue)' }}>home</span></h2>
                        <p>
                            For over 15 years, families have trusted CountryKids to give their
                            children a safe, nurturing and stimulating start. Our teachers know
                            every child by name, temperament and giggle — and it shows.
                        </p>
                        <ul className="about-list">
                            <li><span className="tick">{'✓'}</span> Certified early-childhood educators</li>
                            <li><span className="tick">{'✓'}</span> Low child-to-teacher ratios</li>
                            <li><span className="tick">{'✓'}</span> Secure, camera-monitored building</li>
                            <li><span className="tick">{'✓'}</span> Fresh, allergy-aware meals daily</li>
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
