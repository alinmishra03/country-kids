'use client';

/* PHILOSOPHY — "Rooted in Country. Flourishing Together."
   Rebuilt to the editorial rhythm of the reference page: a cinematic hero, a
   single centred statement carrying the whole idea, the count-up stat strip,
   then Philosophy / Vision / Mission as full-width alternating rows of type
   against photography, and the seven values on a dark panel beside a picture.

   NO COPY CHANGED. Every string still comes from lib/philosophy-data.ts —
   the same kicker, title, lead, badges, quote, three PVM blocks and seven
   value labels, plus the values intro that used to sit on <SplitFeature>.
   What changed is how they are laid out and how they arrive.

   Motion is the site's existing system, not a new one: Reveal / TextReveal for
   copy and ImageReveal (which already carries its own scrubbed parallax) for
   every photograph, so this page animates exactly like the rest of the site
   and honours prefers-reduced-motion for free. */

import { useRef } from 'react';
import Page from '@/components/shared/Page';
import PageHero from '@/components/shared/PageHero';
import StatsBar from '@/components/home/StatsBar';
import CTASection from '@/components/shared/CTASection';
import Reveal from '@/components/shared/Reveal';
import TextReveal from '@/components/shared/TextReveal';
import ImageReveal from '@/components/story/ImageReveal';
import ValuesAccordion from '@/components/philosophy/ValuesAccordion';
import Icon from '@/components/shared/Icon';
import useCountUp from '@/hooks/useCountUp';
import { PHILOSOPHY_INTRO, PVM } from '@/lib/philosophy-data';
import { PAGE_MEDIA } from '@/lib/page-media';
import PageNavigator from '@/components/common/PageNavigator';

/* Row order matches PVM's order, so the pictures cannot drift away from the
   blocks they belong to even if the data is reordered. */
const ROW_MEDIA = [
    PAGE_MEDIA.philosophy.philosophyRow,
    PAGE_MEDIA.philosophy.visionRow,
    PAGE_MEDIA.philosophy.missionRow,
];

export default function PhilosophyPage() {
    const rootRef = useRef(null);
    useCountUp(rootRef);

    return (
        <Page id="philosophy" innerRef={rootRef}>
            <PageHero
                kicker={PHILOSOPHY_INTRO.kicker}
                title="Rooted in Country. Flourishing Together"
                lead={PHILOSOPHY_INTRO.lead}
                image={PAGE_MEDIA.philosophy.hero.src}
                badges={['Play-based Learning', 'First Nations Perspectives', 'Equity & Anti-Bias']}
                variant="editorial"
                parallax
            />

            {/* The statement. One idea, set large and centred with nothing
                competing for attention — the reference's opening move. The
                quote text is unchanged; it has simply stopped being a boxed
                pull-quote and become the section itself. */}
            <section className="section ph-statement">
                <div className="container">
                    <Reveal as="p" className="ph-statement-kicker" variant="fadeUp">
                        <Icon name="quote" />
                        Our Philosophy
                    </Reveal>
                    {/* Reveal, not TextReveal: the line-mask treatment is built
                        for a short heading, and on a 200-character sentence it
                        clips half the block while it plays. A fade-up is also
                        what the reference actually does here. */}
                    <Reveal as="p" className="ph-statement-body" variant="fadeUp" delay={0.05}>
                        {PHILOSOPHY_INTRO.quote}
                    </Reveal>
                </div>
            </section>

            <StatsBar />

            {/* Philosophy · Vision · Mission. Was a stack of icon cards; now one
                full-width row each, type against a photograph, alternating
                sides down the page. */}
            <section className="section ph-rows">
                <div className="container">
                    {PVM.map((item, i) => (
                        <article
                            className={`ph-row${i % 2 === 1 ? ' ph-row--flip' : ''}`}
                            key={item.id}
                            id={item.id}
                        >
                            <div className="ph-row-copy">
                                <Reveal as="span" className="ph-row-kicker" variant="fadeUp">
                                    <span className="ph-row-index" aria-hidden="true">
                                        {String(i + 1).padStart(2, '0')}
                                    </span>
                                    {item.kicker}
                                </Reveal>
                                <TextReveal as="h2" className="ph-row-title" delay={0.05}>
                                    {item.title}
                                </TextReveal>
                                <Reveal className="ph-row-text" variant="fadeUp" delay={0.1}>
                                    {item.paras.map((p, n) => (
                                        <p key={n}>{p}</p>
                                    ))}
                                </Reveal>
                            </div>

                            <div className="ph-row-media">
                                <ImageReveal image={ROW_MEDIA[i]} ratio="4 / 3" strength={8} />
                            </div>
                        </article>
                    ))}
                </div>
            </section>

            {/* What We Stand For — the seven values as a picture-paired
                accordion. Owns its own heading, lead and state, so it is a
                component rather than markup here. */}
            <ValuesAccordion />

            <PageNavigator />

            <CTASection
                title="See our philosophy in action"
                text="The best way to understand how we care is to visit. Book a free tour and meet the educators who make it real every day."
            />
        </Page>
    );
}
