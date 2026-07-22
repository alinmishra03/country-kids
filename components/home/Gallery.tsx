'use client';

/* "A peek inside" — a full-bleed, continuously drifting photo marquee (the old
   static grid of the same photos was removed as a duplicate). Motion is layered:
     • constant horizontal drift that also responds to page scroll — scroll
       velocity adds momentum and a slight skew, then eases back to the base drift;
     • the drift pauses while a tile is hovered so it can be inspected;
     • per-tile hover — image zoom, a diagonal gloss sweep, a gold glow ring and a
       caption reveal (ported from the previous grid tiles).
   Every photo appears twice so a translate of exactly half the track loops with
   no seam. Fully reduced-motion aware (see css/gallery.css). */

import { useEffect, useRef } from 'react';
import Icon from '@/components/shared/Icon';
import { GALLERY } from '@/lib/programs-data';
import { img } from '@/lib/images';

/* Doubled so the track can wrap seamlessly at exactly 50%. */
const MARQUEE = [...GALLERY, ...GALLERY];

export default function Gallery() {
    const trackRef = useRef<HTMLDivElement>(null);
    const pausedRef = useRef(false);

    useEffect(() => {
        const track = trackRef.current;
        if (!track) return;
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

        const BASE = 0.6; // constant drift, px per frame
        let offset = 0;
        let velocity = 0; // accumulated from scroll, decays each frame
        let lastScroll = window.scrollY;
        let raf = 0;

        const onScroll = () => {
            const y = window.scrollY;
            velocity += y - lastScroll;
            lastScroll = y;
        };

        const tick = () => {
            velocity *= 0.9; // decay so momentum eases back to the base drift
            const drift = pausedRef.current ? 0 : BASE; // hold still while hovering
            offset += drift + velocity * 0.35;
            const half = track.scrollWidth / 2;
            if (half > 0) {
                offset = ((offset % half) + half) % half; // seamless wrap, both ways
                const skew = Math.max(-8, Math.min(8, velocity * 0.15));
                track.style.transform = `translate3d(${-offset}px, 0, 0) skewX(${skew}deg)`;
            }
            raf = requestAnimationFrame(tick);
        };

        window.addEventListener('scroll', onScroll, { passive: true });
        raf = requestAnimationFrame(tick);
        return () => {
            cancelAnimationFrame(raf);
            window.removeEventListener('scroll', onScroll);
        };
    }, []);

    return (
        <section className="section">
            <div className="container">
                <div className="section-head">
                    <div className="section-eyebrow">A Peek Inside</div>
                    <h2 className="section-title">Days full of <span>discovery</span></h2>
                    <p className="section-subtitle">
                        Every day blends creativity, movement and gentle learning — here&apos;s a
                        glimpse of what fills our little ones&apos; hours.
                    </p>
                    <div className="divider-dots"><span></span><span></span><span></span></div>
                </div>
            </div>

            {/* Full-bleed continuous photo marquee (scroll-reactive, pauses on hover). */}
            <div
                className="gallery-marquee"
                onPointerEnter={() => {
                    pausedRef.current = true;
                }}
                onPointerLeave={() => {
                    pausedRef.current = false;
                }}
            >
                <div className="gallery-marquee-track" ref={trackRef}>
                    {MARQUEE.map((tile, i) => (
                        <figure className="gallery-marquee-item" key={`${tile.label}-${i}`}>
                            <div className="gallery-marquee-media">
                                <img
                                    src={img(tile.img, 480, 60)}
                                    alt={`${tile.label} at CountryKids`}
                                    loading="lazy"
                                    decoding="async"
                                    width="320"
                                    height="240"
                                />
                            </div>
                            <span className="gallery-marquee-shine" aria-hidden="true"></span>
                            <figcaption className="gallery-marquee-label">
                                <Icon name={tile.icon} /> {tile.label}
                            </figcaption>
                        </figure>
                    ))}
                </div>
            </div>
        </section>
    );
}
