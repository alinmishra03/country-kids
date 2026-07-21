'use client';

/* Home hero. Floating bubble particles (CSS-animated), a headline, CTAs and a
   summary card. Mirrors the reference project's Hero structure (particles +
   left copy + right card). */

import Link from 'next/link';
import T from '@/components/shared/T';

const PARTICLES = [
    { left: '8%', top: '20%', delay: '0s' },
    { left: '22%', top: '65%', delay: '1.5s' },
    { left: '40%', top: '30%', delay: '0.8s' },
    { left: '58%', top: '72%', delay: '2.2s' },
    { left: '70%', top: '18%', delay: '1.1s' },
    { left: '85%', top: '55%', delay: '3s' },
    { left: '15%', top: '85%', delay: '2.6s' },
    { left: '92%', top: '30%', delay: '0.4s' },
];

export default function Hero() {
    return (
        <section className="hero">
            <div className="hero-bg" aria-hidden="true"></div>
            <div className="hero-particles" aria-hidden="true">
                {PARTICLES.map((p, i) => (
                    <span key={i} style={{ left: p.left, top: p.top, animationDelay: p.delay }} />
                ))}
            </div>

            <div className="hero-content">
                <div className="hero-left">
                    <T k="hero-eyebrow" as="div" className="hero-eyebrow">
                        {'\u{2B50}'} Licensed &amp; loved since 2010
                    </T>
                    <h1 className="hero-title">
                        Where little ones <span>learn</span>,<br />
                        play &amp; <span className="gold">grow</span>.
                    </h1>
                    <p className="hero-subtitle">
                        Warm, safe, and joyful daycare for babies through pre-K — with caring
                        teachers, nutritious meals, and daily updates that keep you close.
                    </p>

                    <div className="hero-badges">
                        <span className="hero-badge">{'\u{1F476}'} Ages 6 weeks–10 yrs</span>
                        <span className="hero-badge">{'\u{1F55C}'} Open 6:30am–6:30pm</span>
                        <span className="hero-badge">{'\u{1F34E}'} Fresh meals daily</span>
                    </div>

                    <div className="hero-main-cta">
                        <Link className="btn-gold" href="/enroll">Book a Free Tour</Link>
                        <Link className="btn-outline" href="/programs">Explore Programs</Link>
                    </div>
                </div>

                <div className="hero-right">
                    <div className="hero-card">
                        <span className="hero-card-emoji" aria-hidden="true">{'\u{1F9F8}'}</span>
                        <h3>A second home for your child</h3>
                        <p>Small groups, big hearts, endless discovery.</p>
                        <div className="hero-card-stats">
                            <div className="hero-card-stat"><b>1:4</b><span>Infant ratio</span></div>
                            <div className="hero-card-stat"><b>25</b><span>Certified teachers</span></div>
                            <div className="hero-card-stat"><b>480+</b><span>Happy families</span></div>
                            <div className="hero-card-stat"><b>15+</b><span>Years of care</span></div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
