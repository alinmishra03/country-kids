'use client';

/* "Discover Our Learning Spaces" — a home section built around the CircularGallery
   (OGL/WebGL). The gallery is loaded client-only (ssr:false) so WebGL never runs
   during SSR. Cards use the site's own room/gallery photos. Entrance animation is
   GSAP (fade-up header stagger + gallery fade + button), scoped and reduced-motion
   aware via the shared useGsap hook. */

import { useRef } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import Icon from '@/components/shared/Icon';
import useGsap from '@/hooks/useGsap';
import { img } from '@/lib/images';

const CircularGallery = dynamic(
    () => import('@/components/animations/CircularGallery/CircularGallery'),
    { ssr: false }
);

/* Real site imagery (Unsplash ids already used across the site) paired with the
   learning-space titles. */
const ITEMS = [
    { image: img('1444703686981-a3abbc4d4fe3', 800, 70), text: 'Nature Play' },
    { image: img('1541692641319-981cc79ee10a', 800, 70), text: 'Kindergarten' },
    { image: img('1596464716127-f2a82984de30', 800, 70), text: 'Creative Arts' },
    { image: img('1503454537195-1dcabb73ffb9', 800, 70), text: 'Outdoor Learning' },
    { image: img('1445633629932-0029acc44e88', 800, 70), text: 'Music' },
    { image: img('1481627834876-b7833e8f5570', 800, 70), text: 'Reading Corner' },
    { image: img('1509228468518-180dd4864904', 800, 70), text: 'STEM' },
    { image: img('1516627145497-ae6968895b74', 800, 70), text: 'Family Events' },
    { image: img('1560785496-3c9d27877182', 800, 70), text: 'Healthy Meals' },
    { image: img('1519689680058-324335c77eba', 800, 70), text: 'Sensory Play' },
    { image: img('1509062522246-3755977927d7', 800, 70), text: 'Community' },
    { image: img('1587654780291-39c9404d746b', 800, 70), text: 'Learning Through Play' },
];

export default function LearningSpaces() {
    const rootRef = useRef(null);

    useGsap(rootRef, (gsap: any) => {
        gsap.from('.ls-head > *', {
            y: 30,
            opacity: 0,
            duration: 0.7,
            ease: 'power3.out',
            stagger: 0.12,
            scrollTrigger: { trigger: '.ls-head', start: 'top 82%' },
        });
        gsap.from('.ls-gallery', {
            opacity: 0,
            scale: 0.97,
            duration: 0.9,
            ease: 'power2.out',
            scrollTrigger: { trigger: '.ls-gallery', start: 'top 88%' },
        });
        gsap.from('.ls-cta', {
            y: 20,
            opacity: 0,
            duration: 0.6,
            ease: 'power3.out',
            scrollTrigger: { trigger: '.ls-cta-wrap', start: 'top 92%' },
        });
    });

    return (
        <section className="section learning-spaces" id="learning-spaces" ref={rootRef}>
            <div className="container">
                <div className="ls-head section-head">
                    <span className="section-eyebrow">Explore</span>
                    <h2 className="section-title">
                        Discover Our <span>Learning Spaces</span>
                    </h2>
                    <p className="section-subtitle">
                        Experience seven unique learning environments designed to inspire
                        curiosity, creativity, and confidence.
                    </p>
                    <div className="divider-dots">
                        <span></span>
                        <span></span>
                        <span></span>
                    </div>
                </div>
            </div>

            <div className="ls-gallery">
                <CircularGallery
                    items={ITEMS}
                    bend={3}
                    textColor="#0B1B2B"
                    borderRadius={0.06}
                    font="600 26px Inter, system-ui, sans-serif"
                    scrollSpeed={2}
                    scrollEase={0.05}
                />
            </div>

            <div className="container ls-cta-wrap">
                <Link className="btn-gold ls-cta" href="/rooms">
                    <Icon name="sparkles" /> Explore Our Rooms
                </Link>
            </div>
        </section>
    );
}
