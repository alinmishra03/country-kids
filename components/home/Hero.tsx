'use client';

/* Home hero — an editorial, asymmetric landing composition built AROUND the
   interactive 3D room sphere. The sphere layer (SphereGallery, variant
   "background") is deliberately untouched: same component, same full-bleed
   layer, same camera/fit/rotation/interaction. Everything else is the frame:

     · three desktop bands — copy (0–29%) | centred sphere (29–71%) | rail (71%+)
     · left band  — badge → headline → stacked CTAs → stat cards; it always ENDS
                    before the sphere layer begins, so no text ever sits on the
                    globe. Narrow, which is the cost of centring the sphere.
     · right band — one rail flush to the section's right edge: reviews card,
                    trust chips, learning card, all the same width and edge
     · bottom-left scroll cue that scrolls to the next section
     · decorative dots / gold hairlines / soft orbs filling the negative space

   All motion is transform/opacity only (GPU-friendly) and respects
   prefers-reduced-motion. Nothing here changes layout after paint, so there is
   no CLS and the sphere's frame budget is untouched. */

import { useRef } from 'react';
import Link from 'next/link';
import Icon from '@/components/shared/Icon';
import SphereGallery from '@/components/home/SphereGallery';
import useMagnetic from '@/hooks/useMagnetic';

/* Headline, wrapped as four short lines. Only "belongs." takes the gold.
   The lines are deliberately kept short so the longest one ("child belongs.")
   still fits the copy column at the largest type size — the headline can never
   run past the column and onto the sphere. */
const TITLE_LINES = [
    ['Rooted', 'in'],
    ['Country.'],
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

    /* Pointer-follow on the two CTAs. Writes --mx/--my, which the shared button
       transform composes with its hover lift — see css/base.css. */
    useMagnetic(sectionRef);

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
                        <Link className="btn-gold" href="/enroll" data-magnetic>
                            Book a Free Tour <Icon name="arrow-right" />
                        </Link>
                        <Link className="btn-outline" href="/rooms" data-magnetic>
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

                {/* The sphere's stage. On desktop it just holds the right column
                    open — the chips inside are lifted out to the absolute right
                    rail. When the grid collapses on tablet/phone they drop back
                    into flow, straight under the buttons. */}
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

            {/* ── Floating glass cards — top and bottom of the same right rail as the
                trust chips (same width, same right edge, see --hero-rail-* in
                hero.css). The wrapper owns the entrance + bob animation; the card
                inside owns the hover lift, so the two never fight over
                `transform`. ── */}
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
