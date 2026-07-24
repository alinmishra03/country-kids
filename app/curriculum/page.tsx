'use client';

/* CURRICULUM — "Five Landscapes of Country Kids", a card deck. A row of series
   tabs switches the visible panel of practice cards, each mapped to the NQS,
   VEYLDF/EYLF, ACECQA principles, National Law and the Child Safe Standards.
   Content from lib/curriculum-data.js. */

import { useRef, useState } from 'react';
import Page from '@/components/shared/Page';
import PageHero from '@/components/shared/PageHero';
import SectionHeader from '@/components/shared/SectionHeader';
import CTASection from '@/components/shared/CTASection';
import Reveal from '@/components/shared/Reveal';
import Icon from '@/components/shared/Icon';
import { CURRICULUM_INTRO, CURRICULUM_SERIES } from '@/lib/curriculum-data';
import { PHOTOS } from '@/lib/images';

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
                image={PHOTOS.pageHeroEnroll}
                badges={['15 cards · 5 series', 'NQS · VEYLDF · EYLF', 'Child Safe Standards 1–11']}
            />

            <section className="section">
                <div className="container">
                    <p className="curric-frameworks">{CURRICULUM_INTRO.frameworks}</p>

                    <div className="curric-tabs" role="tablist" aria-label="Curriculum series">
                        {CURRICULUM_SERIES.map((s) => (
                            <button
                                key={s.id}
                                type="button"
                                role="tab"
                                aria-selected={s.id === activeId}
                                className={`curric-tab accent-${s.accent}${s.id === activeId ? ' is-active' : ''}`}
                                onClick={() => setActiveId(s.id)}
                            >
                                <Icon name={s.icon} /> {s.name}
                            </button>
                        ))}
                    </div>

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
