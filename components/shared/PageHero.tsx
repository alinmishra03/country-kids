'use client';

/* Interior-page hero band. A photo background (via --page-hero-img) under a
   brand gradient overlay, with an eyebrow, title, lead and optional trust
   badges. Reuses the .page-hero styles in css/pages.css.

   ── The editorial variant ────────────────────────────────────────────────
   Two OPT-IN props were added for the Our Story page and are off by default,
   so every other page that renders this component gets exactly the markup and
   the CSS it got before:

     variant="editorial"  taller band, deeper multi-stop overlay, tighter
                          measure on the lead — see .page-hero--editorial.
     parallax             the photograph moves against the scroll.

   The parallax needs a real element. The default band paints its picture in a
   ::before, which GSAP cannot touch, so the variant renders the photo as its
   own layer and css/pages.css drops the pseudo-element's image in that case,
   leaving it to carry the overlay alone. Below 768px the layer is never
   animated at all — parallax on a phone buys nothing and costs frames. */

import { useRef } from 'react';
import Reveal from '@/components/shared/Reveal';
import TextReveal from '@/components/shared/TextReveal';
import useGsap from '@/hooks/useGsap';
import useMediaQuery from '@/hooks/useMediaQuery';
import { img, PHOTOS } from '@/lib/images';

export default function PageHero({
    kicker,
    title,
    lead,
    image,
    /* Optional second background layer, painted BEHIND the first. A background
       image that 404s simply does not paint, so stacking the shipped brand
       placeholder underneath the real photograph means a missing asset falls
       back to designed art instead of to a bare gradient — the same guarantee
       <ImageReveal> gives content photos, done the way backgrounds allow. */
    fallbackImage,
    badges,
    variant,
    parallax = false,
}: any) {
    const src = image ? img(image, 1920, 68) : img(PHOTOS.pageHeroAbout, 1920, 68);
    const stack = fallbackImage ? `url(${src}), url(${img(fallbackImage)})` : `url(${src})`;
    const scope = useRef<HTMLElement>(null);
    const wide = useMediaQuery('(min-width: 768px)', true);
    const animate = parallax && wide;

    useGsap(
        scope,
        (gsap: any) => {
            if (!animate) return;
            const layer = scope.current?.querySelector('.page-hero-layer');
            if (!layer) return;

            /* Scrubbed, so the drift is tied to the scroll position rather
               than a clock. The layer is over-sized in CSS (110% tall, offset
               −5%) so moving it can never expose an edge. */
            gsap.fromTo(
                layer,
                { yPercent: -4 },
                {
                    yPercent: 8,
                    ease: 'none',
                    scrollTrigger: {
                        trigger: scope.current,
                        start: 'top top',
                        end: 'bottom top',
                        scrub: true,
                    },
                }
            );
        },
        [animate]
    );

    const cls = [
        'page-hero',
        variant === 'editorial' ? 'page-hero--editorial' : '',
        parallax ? 'page-hero--parallax' : '',
    ]
        .filter(Boolean)
        .join(' ');

    return (
        <section
            ref={scope}
            className={cls}
            style={{ '--page-hero-img': stack } as any}
        >
            {parallax ? (
                <span className="page-hero-media" aria-hidden="true">
                    <span className="page-hero-layer" style={{ backgroundImage: stack }} />
                </span>
            ) : null}

            <div className="container page-hero-content">
                {kicker ? (
                    <Reveal as="div" variant="fadeUp" className="page-eyebrow">
                        {kicker}
                    </Reveal>
                ) : null}
                {/* The h1 on every interior page. `once` so the headline does
                    not replay if the user scrolls back to the top of a page. */}
                <TextReveal as="h1" delay={0.05} once>
                    {title}
                </TextReveal>
                {lead ? (
                    <Reveal as="p" variant="fadeUp" delay={0.12}>
                        {lead}
                    </Reveal>
                ) : null}
                {badges && badges.length ? (
                    <Reveal className="page-hero-badges" variant="fadeUp" delay={0.18}>
                        {badges.map((b) => (
                            <span className="page-hero-badge" key={b}>
                                {b}
                            </span>
                        ))}
                    </Reveal>
                ) : null}
            </div>
        </section>
    );
}
