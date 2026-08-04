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
    { image: img('1495131292899-bc096577e8f5', 800, 70), text: 'Nature Play' },
    { image: img('1578349035260-9f3d4042f1f7', 800, 70), text: 'Kindergarten' },
    { image: img('1596464716127-f2a82984de30', 800, 70), text: 'Creative Arts' },
    { image: img('1503454537195-1dcabb73ffb9', 800, 70), text: 'Outdoor Learning' },
    { image: img('1509781827353-fb95c262fc40', 800, 70), text: 'Music' },
    { image: img('1599689868384-59cb2b01bb21', 800, 70), text: 'Reading Corner' },
    { image: img('1501686637-b7aa9c48a882', 800, 70), text: 'STEM' },
    { image: img('1761208663763-c4d30657c910', 800, 70), text: 'Family Events' },
    { image: img('1498837167922-ddd27525d352', 800, 70), text: 'Healthy Meals' },
    { image: img('1613794713137-a78aba4be84a', 800, 70), text: 'Sensory Play' },
    { image: img('1607453998825-f3f36da5ab18', 800, 70), text: 'Community' },
    { image: img('1587654780291-39c9404d746b', 800, 70), text: 'Learning Through Play' },
];

export default function LearningSpaces() {
    const rootRef = useRef(null);

    useGsap(rootRef, (gsap: any) => {
        // NOTE: the header (`.ls-head`) is intentionally NOT animated here. Its
        // children match the site-wide reveal selectors (`.section-head > *`,
        // `.section-title`, `.section-subtitle`) and are already faded in by the
        // CSS-based system in hooks/useAnimations (`.fx-reveal`/`.fx-in`). A GSAP
        // `.from` on the same elements wrote inline `opacity:0`, which outranks the
        // `.fx-in` class — so when the tween didn't complete the heading stayed
        // invisible. One reveal system per element only.
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
