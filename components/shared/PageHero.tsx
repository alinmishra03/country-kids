'use client';

/* Interior-page hero band. A photo background (via --page-hero-img) under a
   brand gradient overlay, with an eyebrow, title, lead and optional trust
   badges. Reuses the .page-hero styles in css/pages.css. */

import Reveal from '@/components/shared/Reveal';
import { img, PHOTOS } from '@/lib/images';

export default function PageHero({ kicker, title, lead, image, badges }: any) {
    const src = image ? img(image, 1920, 68) : img(PHOTOS.pageHeroAbout, 1920, 68);
    return (
        <section className="page-hero" style={{ '--page-hero-img': `url(${src})` } as any}>
            <div className="container page-hero-content">
                {kicker ? (
                    <Reveal as="div" variant="fadeUp" className="page-eyebrow">
                        {kicker}
                    </Reveal>
                ) : null}
                <Reveal as="h1" variant="fadeUp" delay={0.05}>
                    {title}
                </Reveal>
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
