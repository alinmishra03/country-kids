'use client';

/* OUR STORY (app/about) — "A Dream, Rooted in Country". The six-chapter origin
   narrative with a timeline rail, pull-quotes, the "what we planted" pillars and
   a signed closing. Content from lib/story-data.js. */

import { useRef } from 'react';
import Page from '@/components/shared/Page';
import PageHero from '@/components/shared/PageHero';
import CTASection from '@/components/shared/CTASection';
import Reveal from '@/components/shared/Reveal';
import { STORY_INTRO, STORY_CHAPTERS, STORY_CLOSING } from '@/lib/story-data';
import { PHOTOS } from '@/lib/images';

export default function AboutPage() {
    const rootRef = useRef(null);

    return (
        <Page id="about" innerRef={rootRef}>
            <PageHero
                kicker={STORY_INTRO.kicker}
                title={STORY_INTRO.title}
                lead={STORY_INTRO.lead}
                image={PHOTOS.pageHeroAbout}
                badges={['Not-for-Profit', 'Ravenhall, Victoria', 'Est. 2026']}
            />

            <section className="section">
                <div className="container story">
                    {STORY_CHAPTERS.map((ch: any) => (
                        <Reveal as="article" className="story-chapter" variant="fadeUp" key={ch.n}>
                            <span className="story-chapter-index">{ch.n}</span>
                            <h2>{ch.title}</h2>
                            {ch.paras.map((p, i) => (
                                <p key={i}>{p}</p>
                            ))}
                            {ch.quote ? <blockquote className="story-quote">{ch.quote}</blockquote> : null}
                            {ch.pillars ? (
                                <div className="story-pillars">
                                    {ch.pillars.map((pl) => (
                                        <div className="story-pillar" key={pl.title}>
                                            <div className="story-pillar-stat">{pl.stat}</div>
                                            <h3>{pl.title}</h3>
                                            <p>{pl.text}</p>
                                        </div>
                                    ))}
                                </div>
                            ) : null}
                        </Reveal>
                    ))}

                    <Reveal className="story-closing" variant="fadeUp">
                        {STORY_CLOSING.paras.map((p, i) => (
                            <p key={i}>{p}</p>
                        ))}
                        <span className="story-sign">{STORY_CLOSING.sign}</span>
                    </Reveal>
                </div>
            </section>

            <CTASection
                title="Come and be part of the story"
                text="Every family adds a new chapter. Book a free tour and see where your child's story could begin."
            />
        </Page>
    );
}
