'use client';

/* Shared centered section header — eyebrow (kicker) + title + optional lead,
   with a soft divider. Animates in with the shared Reveal wrapper. `title` may
   contain inline markup (e.g. a <span> highlight). Set align="start" for a
   left-aligned header. */

import Reveal from '@/components/shared/Reveal';
import TextReveal from '@/components/shared/TextReveal';

export default function SectionHeader({
    kicker,
    title,
    lead,
    align = 'center',
    dots = true,
    className = '',
}: any) {
    return (
        <Reveal
            stagger
            className={`section-head${align === 'start' ? ' section-head-start' : ''} ${className}`}
        >
            {kicker ? (
                <Reveal as="span" variant="item" className="section-eyebrow">
                    {kicker}
                </Reveal>
            ) : null}
            {/* The one heading on every section of every page — upgrading it
                here gives the whole site the masked word reveal in one place. */}
            <TextReveal as="h2" className="section-title">
                {title}
            </TextReveal>
            {lead ? (
                <Reveal as="p" variant="item" className="section-subtitle">
                    {lead}
                </Reveal>
            ) : null}
            {dots ? (
                <Reveal as="div" variant="item" className="divider-dots">
                    <span></span>
                    <span></span>
                    <span></span>
                </Reveal>
            ) : null}
        </Reveal>
    );
}
