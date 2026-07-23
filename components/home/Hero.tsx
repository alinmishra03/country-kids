'use client';

/* Home hero — an editorial, asymmetric landing composition built AROUND the
   interactive 3D room sphere. The sphere layer (SphereGallery, variant
   "background") is deliberately untouched: same component, same full-bleed
   layer, same camera/fit/rotation/interaction. Everything else is the frame:

     · left ~52%  — badge → headline → stacked CTAs → stat cards
     · right ~48% — the sphere's stage, with the trust chips as a right rail
     · floating glass cards pinned to the outer right edge, clear of the globe
     · bottom-left scroll cue that scrolls to the next section
     · decorative dots / gold hairlines / soft orbs filling the negative space

   All motion is transform/opacity only (GPU-friendly) and respects
   prefers-reduced-motion. Nothing here changes layout after paint, so there is
   no CLS and the sphere's frame budget is untouched. */

import { useRef } from 'react';
import Link from 'next/link';
import Icon from '@/components/shared/Icon';
import SphereGallery from '@/components/home/SphereGallery';

/* Headline, wrapped as three deliberate lines. Only "belongs." takes the gold. */
const TITLE_LINES = [
    ['Rooted', 'in', 'Country.'],
    ['Where', 'every'],
    ['child', 'belongs.'],
];

/* The right-hand rail. Same glass-card shape as the floating cards below. */
const CHIPS = [
    { icon: 'badge', label: 'NQF Approved', sub: 'National Quality Framework' },
    { icon: 'graduation', label: 'Qualified Educators', sub: '100% of our team' },
    { icon: 'baby', label: '6 Weeks – 6 Years', sub: 'Seven purpose-named rooms' },
];

/* Small proof points under the CTAs. Copy is marketing placeholder — swap the
   numbers for the centre's real figures before launch. */
const STATS = [
    { value: '100+', label: 'Happy families' },
    { value: '7', label: 'Learning rooms' },
    { value: '2026', label: 'Open since' },
];

export default function Hero() {
    const sectionRef = useRef<HTMLElement>(null);

    /* Scroll cue → the section immediately after the hero, whatever it is. */
    const scrollToNext = () => {
        const next = sectionRef.current?.nextElementSibling;
        if (next) next.scrollIntoView({ behavior: 'smooth', block: 'start' });
        else window.scrollTo({ top: window.innerHeight, behavior: 'smooth' });
    };

    let d = 0;
    const word = (w: string, gold = false) => (
        <span className={`hero-word${gold ? ' gold' : ''}`} style={{ ['--d']: d++ } as any} key={`${w}-${d}`}>
            {w}
        </span>
    );

    return (
        <section className="hero" ref={sectionRef}>
            <div className="hero-bg" aria-hidden="true" />

            {/* ── Sphere layer — unchanged ── */}
            <div className="hero-sphere-layer">
                <SphereGallery variant="background" />
            </div>

            {/* Reading scrim: dark under the copy column, clear over the sphere. */}
            <div className="hero-scrim" aria-hidden="true" />

            {/* Negative-space decoration: dot field, gold hairlines, soft orbs. */}
            <div className="hero-decor" aria-hidden="true">
                <span className="hero-dots" />
                <span className="hero-rule hero-rule--top" />
                <span className="hero-orb hero-orb--gold" />
                <span className="hero-orb hero-orb--blue" />
                <span className="hero-spark" style={{ ['--i']: 0 } as any} />
                <span className="hero-spark" style={{ ['--i']: 1 } as any} />
                <span className="hero-spark" style={{ ['--i']: 2 } as any} />
                <span className="hero-spark" style={{ ['--i']: 3 } as any} />
            </div>

            <div className="hero-inner">
                <div className="hero-copy">
                    <div className="hero-eyebrow">
                        <Icon name="leaf" className="hero-eyebrow-icon" /> Not-for-Profit · Ravenhall, Victoria
                    </div>

                    <h1 className="hero-title" aria-label="Rooted in Country. Where every child belongs.">
                        {TITLE_LINES.map((line, i) => (
                            <span className="hero-line" aria-hidden="true" key={i}>
                                {line.map((w) => word(w, w.startsWith('belongs')))}
                            </span>
                        ))}
                    </h1>

                    <div className="hero-main-cta">
                        <Link className="btn-gold" href="/enroll">
                            Book a Free Tour
                        </Link>
                        <Link className="btn-outline" href="/rooms">
                            Explore Our Rooms <Icon name="arrow-right" />
                        </Link>
                    </div>

                    <div className="hero-stats">
                        {STATS.map((s) => (
                            <div className="hero-stat" key={s.label}>
                                <span className="hero-stat-value">{s.value}</span>
                                <span className="hero-stat-label">{s.label}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* The sphere's stage. Holds the right column open and carries the
                    trust chips as a right-aligned rail; when the grid collapses on
                    tablet/phone the chips fall straight in under the buttons. */}
                <div className="hero-stage">
                    <div className="hero-badges">
                        {CHIPS.map((c) => (
                            <div className="hero-badge" key={c.label}>
                                <span className="hero-card-icon"><Icon name={c.icon as any} /></span>
                                <span className="hero-card-text">
                                    <strong>{c.label}</strong>
                                    <small>{c.sub}</small>
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* ── Floating glass cards — pinned to the outer edges, clear of the globe.
                The wrapper owns the entrance + bob animation; the card inside owns the
                hover lift, so the two never fight over `transform`. ── */}
            <div className="hero-float hero-float--reviews">
                <div className="hero-float-card">
                    <span className="hero-card-stars" aria-hidden="true">
                        <Icon name="star" />
                        <Icon name="star" />
                        <Icon name="star" />
                        <Icon name="star" />
                        <Icon name="star" />
                    </span>
                    <span className="hero-card-text">
                        {/* Placeholder rating — replace with the centre's real Google score. */}
                        <strong>4.9 on Google</strong>
                        <small>Loved by local families</small>
                    </span>
                </div>
            </div>

            <div className="hero-float hero-float--learning">
                <div className="hero-float-card">
                    <span className="hero-card-icon"><Icon name="blocks" /></span>
                    <span className="hero-card-text">
                        <strong>Play-Based Learning</strong>
                        <small>In all seven rooms</small>
                    </span>
                </div>
            </div>

            {/* ── Scroll cue ── */}
            <button type="button" className="hero-scroll" onClick={scrollToNext}>
                <span className="hero-scroll-label">Scroll</span>
                <span className="hero-scroll-track" aria-hidden="true"><span /></span>
            </button>
        </section>
    );
}
