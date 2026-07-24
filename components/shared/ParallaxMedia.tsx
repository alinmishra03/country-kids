'use client';

/* ParallaxMedia — an image that reveals behind a clip-path wipe, then drifts
   against the scroll for the rest of its time on screen.

   This one IS GSAP ScrollTrigger rather than Framer Motion, deliberately: the
   drift is scroll-SCRUBBED (its progress is the scroll position, not a
   duration), which is exactly what ScrollTrigger's scrub does well and what a
   whileInView animation cannot do at all.

   The image is over-scaled slightly so that drifting it never exposes an edge —
   the single most common bug in a parallax image.

   Loading and sizing come from the caller; the wrapper only owns motion, so a
   caller can put any <img> inside and keep its own aspect ratio, object-fit and
   loading strategy. */

import { useRef, type ReactNode } from 'react';
import useGsap from '@/hooks/useGsap';

type Props = {
    children: ReactNode;
    className?: string;
    /** Drift distance as a percentage of the element's height. Keep it small. */
    strength?: number;
    /** Skip the clip-path wipe and only drift (for images already on screen). */
    reveal?: boolean;
};

export default function ParallaxMedia({
    children,
    className = '',
    strength = 8,
    reveal = true,
}: Props) {
    const scope = useRef<HTMLDivElement>(null);

    useGsap(
        scope,
        (gsap: any) => {
            const inner = scope.current?.querySelector('.pm-inner');
            if (!inner) return;

            /* Wipe in. clip-path is compositor-friendly and, unlike a width or
               height animation, cannot reflow anything around it. */
            if (reveal) {
                gsap.fromTo(
                    scope.current,
                    { clipPath: 'inset(0% 0% 100% 0%)' },
                    {
                        clipPath: 'inset(0% 0% 0% 0%)',
                        duration: 1.15,
                        ease: 'power3.out',
                        scrollTrigger: {
                            trigger: scope.current,
                            start: 'top 85%',
                            once: true,
                        },
                    }
                );
            }

            /* Scrubbed drift. Runs from the moment the element enters to the
               moment it leaves, so the movement is tied to scroll position
               rather than to a clock. */
            gsap.fromTo(
                inner,
                { yPercent: -strength },
                {
                    yPercent: strength,
                    ease: 'none',
                    scrollTrigger: {
                        trigger: scope.current,
                        start: 'top bottom',
                        end: 'bottom top',
                        scrub: true,
                    },
                }
            );
        },
        [strength, reveal]
    );

    return (
        <div ref={scope} className={`pm ${className}`.trim()}>
            <div className="pm-inner">{children}</div>
        </div>
    );
}
