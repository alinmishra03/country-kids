'use client';

/* CURRICULUM — "Five Landscapes of Country Kids", a card deck. A row of series
   tabs switches the visible panel of practice cards, each mapped to the NQS,
   VEYLDF/EYLF, ACECQA principles, National Law and the Child Safe Standards.
   Content from lib/curriculum-data.js. */

import { useRef, useState } from 'react';
import Page from '@/components/shared/Page';
import PageHero from '@/components/shared/PageHero';
import CTASection from '@/components/shared/CTASection';
import SplitFeature from '@/components/shared/SplitFeature';
import Reveal from '@/components/shared/Reveal';
import Icon from '@/components/shared/Icon';
import { CURRICULUM_INTRO, CURRICULUM_SERIES } from '@/lib/curriculum-data';
import { PAGE_MEDIA } from '@/lib/page-media';

export default function CurriculumPage() {
    const rootRef = useRef(null);
    const [activeId, setActiveId] = useState(CURRICULUM_SERIES[0].id);
    const active = CURRICULUM_SERIES.find((s) => s.id === activeId) || CURRICULUM_SERIES[0];

    return (
        <Page id="curriculum" innerRef={rootRef}>
            <PageHero
                kicker={CURRICULUM_INTRO.kicker}
                title="Five Landscapes of Country Kids"
                lead={CURRICULUM_INTRO.lead}
                image={PAGE_MEDIA.curriculum.hero.src}
                badges={['15 cards · 5 series', 'NQS · VEYLDF · EYLF', 'Child Safe Standards 1–11']}
                variant="editorial"
                parallax
            />

            {/* The intro lead and the frameworks note this page already
                carried, now set beside the landscape the five series are named
                for. Both strings are unchanged. */}
            <SplitFeature
                kicker={CURRICULUM_INTRO.kicker}
                title={<>Five landscapes, <span>one curriculum</span></>}
                paras={[CURRICULUM_INTRO.lead]}
                image={PAGE_MEDIA.curriculum.feature}
                badge={{ stat: '5', label: 'Series · 15 practice cards' }}
                reverse
            />

            <section className="section">
                <div className="container">
                    <p className="curric-frameworks">{CURRICULUM_INTRO.frameworks}</p>

                    {/* The five series, as photo cards rather than pills. Still
                        a real tablist with aria-selected — the styling changed,
                        not the semantics, so keyboard and screen-reader
                        behaviour is exactly what it was.

                        The landscape lives on the card, which is why the panel
                        below no longer repeats it: one photograph per series,
                        visible in one place. */}
                    <Reveal className="curric-picker" stagger amount={0.1}>
                        <div role="tablist" aria-label="Curriculum series" className="curric-picker-row">
                            {CURRICULUM_SERIES.map((s) => {
                                const media = PAGE_MEDIA.curriculum.series[s.id];
                                const selected = s.id === activeId;
                                return (
                                    <Reveal as="div" variant="item" className="curric-pick-slot" key={s.id}>
                                        <button
                                            type="button"
                                            role="tab"
                                            aria-selected={selected}
                                            className={`curric-pick accent-${s.accent}${selected ? ' is-active' : ''}`}
                                            onClick={() => setActiveId(s.id)}
                                        >
                                            <span className="curric-pick-media" aria-hidden="true">
                                                {media ? (
                                                    <img
                                                        src={media.src}
                                                        alt=""
                                                        width={media.width}
                                                        height={media.height}
                                                        loading="lazy"
                                                        decoding="async"
                                                    />
                                                ) : null}
                                            </span>
                                            <span className="curric-pick-body">
                                                <span className="curric-pick-icon" aria-hidden="true">
                                                    <Icon name={s.icon} />
                                                </span>
                                                <span className="curric-pick-name">{s.name}</span>
                                                <span className="curric-pick-tagline">{s.tagline}</span>
                                            </span>
                                        </button>
                                    </Reveal>
                                );
                            })}
                        </div>
                    </Reveal>

                    <Reveal className={`curric-panel accent-${active.accent}`} variant="fadeUp" key={active.id}>
                        <div className="curric-panel-head">
                            <div className="curric-tagline">{active.tagline}</div>
                            <p>{active.blurb}</p>
                        </div>
                        {/* The panel is keyed on the active series, so switching
                            tabs remounts this and the cards deal in one after
                            another — the tab change reads as the deck being
                            re-dealt rather than the text swapping in place. */}
                        <Reveal className="curric-cards" stagger amount={0.05}>
                            {active.cards.map((c) => (
                                <Reveal
                                    as="article"
                                    variant="item"
                                    className="curric-card"
                                    key={c.title}
                                >
                                    <span className="curric-outcome">{c.outcome}</span>
                                    <h3>{c.title}</h3>
                                    <p>{c.text}</p>
                                </Reveal>
                            ))}
                        </Reveal>
                    </Reveal>
                </div>
            </section>

            <CTASection
                title="Learning grown in this soil"
                text="Our curriculum was not borrowed from somewhere far away — it was grown here, under this sky. Come and see a day unfold."
            />
        </Page>
    );
}
