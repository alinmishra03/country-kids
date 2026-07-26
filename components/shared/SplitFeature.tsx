'use client';

/* SplitFeature — the image-led section the Our Story page is built from,
   generalised so every interior page can use it.

   One section, two columns: an editorial copy block and a photograph. Pass
   `reverse` to put the picture on the left. On tablet and below it stacks, copy
   first, which is both the correct reading order and the order the DOM is
   already in — the reverse is a CSS `order`, so assistive technology never sees
   the flip.

   It composes the pieces that already exist (Reveal, TextReveal, ImageReveal,
   Icon) rather than introducing another motion or media path, so a section
   dropped onto any page inherits the site's timing, easing, reduced-motion
   behaviour and image fallback for free.

   Everything except `title` and `image` is optional, so a page can use it as a
   plain image + prose block or as a full feature with a checklist, a floating
   figure badge and its own call to action. */

import type { ReactNode } from 'react';
import Reveal from '@/components/shared/Reveal';
import TextReveal from '@/components/shared/TextReveal';
import Icon from '@/components/shared/Icon';
import ImageReveal from '@/components/story/ImageReveal';
import type { Media } from '@/lib/page-media';

type Props = {
    kicker?: string;
    title: ReactNode;
    paras?: string[];
    /** Ticked list under the prose. */
    bullets?: string[];
    /** Buttons or links, rendered after the copy. */
    actions?: ReactNode;
    image: Media;
    /** Small figure that sits over a corner of the photograph. */
    badge?: { stat: string; label: string };
    /** Picture on the left instead of the right. */
    reverse?: boolean;
    /** Navy band — pass alongside the section's own `.section-alt`. */
    invert?: boolean;
    id?: string;
    className?: string;
    /** Crop for the frame. Defaults to the asset's own ratio. */
    ratio?: string;
    /** Rendered full-width beneath both columns — the section's own grid. */
    children?: ReactNode;
};

export default function SplitFeature({
    kicker,
    title,
    paras = [],
    bullets,
    actions,
    image,
    badge,
    reverse = false,
    invert = false,
    id,
    className = '',
    ratio,
    children,
}: Props) {
    const cls = [
        'section',
        'ef',
        reverse ? 'ef--reverse' : '',
        invert ? 'section-alt ef--invert' : '',
        className,
    ]
        .filter(Boolean)
        .join(' ');

    return (
        <section className={cls} id={id}>
            <div className="container ef-layout">
                <Reveal className="ef-copy" stagger>
                    {kicker ? (
                        <Reveal as="span" variant="item" className="ef-kicker">
                            {kicker}
                        </Reveal>
                    ) : null}

                    <TextReveal as="h2" className="ef-title">
                        {title}
                    </TextReveal>

                    <Reveal as="span" variant="lineGrow" className="ef-rule" aria-hidden="true" />

                    {paras.map((p, i) => (
                        <Reveal as="p" variant="item" key={i}>
                            {p}
                        </Reveal>
                    ))}

                    {bullets && bullets.length ? (
                        <Reveal as="ul" variant="item" className="ef-list">
                            {bullets.map((b) => (
                                <li key={b}>
                                    <span className="ef-tick" aria-hidden="true">
                                        <Icon name="check" size={14} strokeWidth={2.4} />
                                    </span>
                                    {b}
                                </li>
                            ))}
                        </Reveal>
                    ) : null}

                    {actions ? (
                        <Reveal variant="item" className="ef-actions">
                            {actions}
                        </Reveal>
                    ) : null}
                </Reveal>

                <div className="ef-media">
                    <ImageReveal image={image} ratio={ratio} strength={7} />
                    {badge ? (
                        <Reveal as="div" variant="popIn" className="ef-badge" delay={0.2}>
                            <span className="ef-badge-stat">{badge.stat}</span>
                            <span className="ef-badge-label">{badge.label}</span>
                        </Reveal>
                    ) : null}
                </div>

                {children ? <div className="ef-extra">{children}</div> : null}
            </div>
        </section>
    );
}
