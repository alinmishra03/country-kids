'use client';

/* SphereGallery — hero wrapper for the WebGL photo sphere. Loads the Three.js
   scene client-only (SSR would have no WebGL), renders the soft glow + particle
   backdrop, and picks the card count for the current breakpoint. A visually
   hidden list of real room links keeps the sphere keyboard/screen-reader
   accessible (the canvas itself is decorative).

   Two variants:
   • "inline"     — sits in a layout column at its own clamped height.
   • "background" — fills its positioned parent edge-to-edge (the hero uses this),
                    with more cards and the camera pulled back so the whole globe
                    reads behind the copy. */

import dynamic from 'next/dynamic';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { ROOMS } from '@/lib/rooms-data';

const SphereScene = dynamic(() => import('@/components/home/SphereScene'), {
    ssr: false,
    loading: () => <div className="sphere-loading" aria-hidden="true" />,
});

type Variant = 'inline' | 'background';

function countForWidth(w: number, variant: Variant) {
    const bg = variant === 'background';
    if (w < 768) return bg ? 26 : 22;
    if (w < 1200) return bg ? 44 : 36;
    return bg ? 64 : 50;
}

export default function SphereGallery({ variant = 'inline' }: { variant?: Variant }) {
    const [count, setCount] = useState(() => countForWidth(1400, variant));
    const router = useRouter();

    useEffect(() => {
        const apply = () => setCount(countForWidth(window.innerWidth, variant));
        apply();
        window.addEventListener('resize', apply);
        return () => window.removeEventListener('resize', apply);
    }, [variant]);

    return (
        <div className={`sphere-gallery${variant === 'background' ? ' is-background' : ''}`}>
            <div className="sphere-glow" aria-hidden="true" />
            <div className="sphere-particles" aria-hidden="true">
                {Array.from({ length: 7 }).map((_, i) => (
                    <span key={i} style={{ ['--i']: i } as any} />
                ))}
            </div>

            <div className="sphere-canvas-wrap">
                <SphereScene
                    count={count}
                    /* Background: frame the whole globe (radius 2.75 + card + margin)
                       whatever the section's aspect ratio turns out to be. */
                    fit={variant === 'background' ? 3.5 : undefined}
                    onSelect={(id: string) => router.push(`/rooms#${id}`)}
                />
            </div>

            {/* Accessible, non-visual route into every room. */}
            <nav className="sphere-sr" aria-label="Our rooms">
                <ul>
                    {ROOMS.map((r) => (
                        <li key={r.id}>
                            <Link href={`/rooms#${r.id}`}>
                                {r.name} — {r.age}
                            </Link>
                        </li>
                    ))}
                </ul>
            </nav>
        </div>
    );
}
