'use client';

/* PHILOSOPHY — "Rooted in Country. Flourishing Together." The centre's headline
   stats, a large pull-quote, the Philosophy / Vision / Mission cards, and the
   seven values. Content from lib/philosophy-data.js. */

import { useRef } from 'react';
import Page from '@/components/shared/Page';
import PageHero from '@/components/shared/PageHero';
import StatsBar from '@/components/home/StatsBar';
import CTASection from '@/components/shared/CTASection';
import SplitFeature from '@/components/shared/SplitFeature';
import Reveal from '@/components/shared/Reveal';
import Icon from '@/components/shared/Icon';
import useCountUp from '@/hooks/useCountUp';
import { PHILOSOPHY_INTRO, PVM, VALUES } from '@/lib/philosophy-data';
import { PAGE_MEDIA } from '@/lib/page-media';

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

            <StatsBar />

            <section className="section">
                <div className="container">
                    <Reveal className="philosophy-quote-band" variant="fadeUp">
                        <Icon name="quote" />
                        {PHILOSOPHY_INTRO.quote}
                    </Reveal>

                    <div className="pvm-grid">
                        {PVM.map((item) => (
                            <Reveal as="article" className="pvm-card" variant="fadeUp" key={item.id}>
                                <span className="pvm-icon" aria-hidden="true"><Icon name={item.icon} /></span>
                                <div className="pvm-body">
                                    <span className="pvm-kicker">{item.kicker}</span>
                                    <h2>{item.title}</h2>
                                    {item.paras.map((p, i) => (
                                        <p key={i}>{p}</p>
                                    ))}
                                </div>
                            </Reveal>
                        ))}
                    </div>
                </div>
            </section>

            {/* The same kicker, title and lead this section always carried —
                laid out beside a photograph instead of centred above the grid,
                with the values themselves still below. No copy changed. */}
            <SplitFeature
                kicker="What We Stand For"
                title={<>Seven values, <span>woven through everything</span></>}
                paras={[
                    'These are not words on a wall. They run through every room, every routine, and every relationship we build with children and families.',
                ]}
                image={PAGE_MEDIA.philosophy.feature}
                badge={{ stat: '7', label: 'Values, lived daily' }}
                reverse
                invert
            >
                <Reveal className="values-grid" stagger amount={0.1}>
                    {VALUES.map((v) => (
                        <Reveal as="div" variant="item" className="value-chip" key={v.label}>
                            <span className="value-chip-icon" aria-hidden="true"><Icon name={v.icon} /></span>
                            <span className="value-chip-label">{v.label}</span>
                        </Reveal>
                    ))}
                </Reveal>
            </SplitFeature>

            <CTASection
                title="See our philosophy in action"
                text="The best way to understand how we care is to visit. Book a free tour and meet the educators who make it real every day."
            />
        </Page>
    );
}
