'use client';

/* Closing call-to-action band — "Ready to Give Your Child the Best Start?".
   Reused at the foot of most pages. Props allow per-page overrides but default to
   the site-wide message + phone.

   The optional `image` prop turns the band into a split composition: copy on one
   side, a photograph on the other. It is opt-in and defaults to undefined, so
   every page that does not pass it renders precisely the centred band it always
   has — same markup, same classes, same styles. Phone number, route and wording
   are untouched in both forms. */

import Link from 'next/link';
import Reveal from '@/components/shared/Reveal';
import Icon from '@/components/shared/Icon';
import ImageReveal from '@/components/story/ImageReveal';
import { PHONE, PHONE_HREF } from '@/lib/site-data';
import type { StoryImage } from '@/lib/story-media';

export default function CTASection({
    title = 'Ready to Give Your Child the Best Start?',
    text = "Join the Country Kids family in Ravenhall. Book a free tour today and discover why our community of families wouldn't be anywhere else.",
    primaryLabel = 'Book a Free Tour',
    primaryHref = '/enroll',
    image,
}: {
    title?: string;
    text?: string;
    primaryLabel?: string;
    primaryHref?: string;
    image?: StoryImage;
}) {
    return (
        <section className="cta-band">
            <div className={`cta-band-inner container${image ? ' cta-band--split' : ''}`}>
                <div className="cta-band-glow" aria-hidden="true" />
                <Reveal className="cta-band-content" stagger>
                    <Reveal as="h2" variant="item" className="cta-band-title">
                        {title}
                    </Reveal>
                    <Reveal as="p" variant="item" className="cta-band-text">
                        {text}
                    </Reveal>
                    <Reveal className="cta-band-actions" variant="item">
                        <Link className="btn-gold" href={primaryHref}>
                            <Icon name="sparkles" /> {primaryLabel}
                        </Link>
                        <a className="cta-band-phone" href={PHONE_HREF}>
                            <Icon name="phone" /> {PHONE}
                        </a>
                    </Reveal>
                </Reveal>

                {image ? (
                    <div className="cta-band-media">
                        <ImageReveal image={image} ratio="4 / 3" strength={5} />
                    </div>
                ) : null}
            </div>
        </section>
    );
}
