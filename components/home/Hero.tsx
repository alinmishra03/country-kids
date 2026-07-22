'use client';

/* Home hero — an image-free GridMotion animated background (dark glass cards,
   abstract shapes, brand icons + typography) under a dark readability overlay,
   with left-aligned copy + CTAs and a frosted-glass summary card. Entrance is
   CSS-driven (hero-rise, respects reduced motion); GSAP adds a subtle background
   parallax on scroll. GridMotion is SSR-safe (browser access is confined to
   useEffect) so it renders server-side too and is always visible. */

import { useRef } from 'react';
import Link from 'next/link';
import Icon from '@/components/shared/Icon';
import useGsap from '@/hooks/useGsap';
import GridMotion from '@/components/home/GridMotion';

export default function Hero() {
    const heroRef = useRef(null);

    /* Gentle parallax: the background drifts slower than the page as you scroll. */
    useGsap(heroRef, (gsap) => {
        gsap.to('.hero-media', {
            yPercent: 14,
            ease: 'none',
            scrollTrigger: {
                trigger: '.hero',
                start: 'top top',
                end: 'bottom top',
                scrub: true,
            },
        });
    });

    return (
        <section className="hero" ref={heroRef}>
            <div className="hero-media" aria-hidden="true">
                <GridMotion />
                <div className="hero-overlay" />
            </div>

            <div className="hero-content">
                <div className="hero-eyebrow">
                    <Icon name="leaf" className="hero-eyebrow-icon" /> Not-for-Profit · Ravenhall, Victoria
                </div>
                <h1 className="hero-title">
                    Rooted in Country.<br />
                    Where every child{' '}
                    <span className="gold">belongs</span>.
                </h1>
                <p className="hero-subtitle">
                    A not-for-profit early learning centre — seven purpose-named rooms for children
                    6 weeks to 6 years, where play is the truest way to learn and every child is a
                    seed of boundless potential.
                </p>

                <div className="hero-badges">
                    <span className="hero-badge"><Icon name="badge" /> NQF Approved</span>
                    <span className="hero-badge"><Icon name="home" /> 7 Specialised Rooms</span>
                    <span className="hero-badge"><Icon name="baby" /> 6 Weeks – 6 Years</span>
                    <span className="hero-badge"><Icon name="heart" /> Not-for-Profit</span>
                </div>

                <div className="hero-main-cta">
                    <Link className="btn-gold" href="/enroll">
                        <Icon name="sparkles" /> Book a Free Tour
                    </Link>
                    <Link className="btn-outline hero-btn-ghost" href="/rooms">
                        Explore Our Rooms
                    </Link>
                </div>
            </div>
        </section>
    );
}
