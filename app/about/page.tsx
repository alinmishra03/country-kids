'use client';

/* OUR STORY (app/about) — "A Dream, Rooted in Country". The six-chapter origin
   narrative with a timeline rail, pull-quotes, the "what we planted" pillars and
   a signed closing. Content from lib/story-data.js.

   Motion (all content and copy unchanged):
     · chapter headings use the masked word reveal;
     · each chapter is a stagger container, so its index, paragraphs, quote and
       pillars arrive in sequence rather than as one block;
     · the vertical rail linking the chapters DRAWS ITSELF as you scroll. The
       rail is a ::before pseudo-element and cannot be targeted by GSAP, so the
       tween scrubs a --rail custom property on the chapter and CSS scales the
       rail from it. */

import { useRef } from 'react';
import Page from '@/components/shared/Page';
import PageHero from '@/components/shared/PageHero';
import CTASection from '@/components/shared/CTASection';
import Reveal from '@/components/shared/Reveal';
import TextReveal from '@/components/shared/TextReveal';
import useGsap from '@/hooks/useGsap';
import { STORY_INTRO, STORY_CHAPTERS, STORY_CLOSING } from '@/lib/story-data';
import { PHOTOS } from '@/lib/images';

export default function AboutPage() {
    const rootRef = useRef(null);

    /* Draw the timeline rail as each chapter passes through the viewport. */
    useGsap(rootRef, (gsap: any) => {
        gsap.utils.toArray('.story-chapter').forEach((chapter: any) => {
            gsap.fromTo(
                chapter,
                { '--rail': 0 },
                {
                    '--rail': 1,
                    ease: 'none',
                    scrollTrigger: {
                        trigger: chapter,
                        start: 'top 78%',
                        end: 'bottom 60%',
                        scrub: 0.6,
                    },
                }
            );
        });
    });

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
                        <Reveal as="article" className="story-chapter" stagger key={ch.n}>
                            <Reveal as="span" variant="item" className="story-chapter-index">
                                {ch.n}
                            </Reveal>

                            <TextReveal as="h2">{ch.title}</TextReveal>

                            {ch.paras.map((p: string, i: number) => (
                                <Reveal as="p" variant="item" key={i}>
                                    {p}
                                </Reveal>
                            ))}

                            {ch.quote ? (
                                <Reveal as="blockquote" variant="item" className="story-quote">
                                    {ch.quote}
                                </Reveal>
                            ) : null}

                            {ch.pillars ? (
                                <Reveal className="story-pillars" stagger>
                                    {ch.pillars.map((pl: any) => (
                                        <Reveal
                                            as="div"
                                            variant="item"
                                            className="story-pillar"
                                            key={pl.title}
                                        >
                                            <div className="story-pillar-stat">{pl.stat}</div>
                                            <h3>{pl.title}</h3>
                                            <p>{pl.text}</p>
                                        </Reveal>
                                    ))}
                                </Reveal>
                            ) : null}
                        </Reveal>
                    ))}

                    <Reveal className="story-closing" stagger>
                        {STORY_CLOSING.paras.map((p: string, i: number) => (
                            <Reveal as="p" variant="item" key={i}>
                                {p}
                            </Reveal>
                        ))}
                        <Reveal as="span" variant="item" className="story-sign">
                            {STORY_CLOSING.sign}
                        </Reveal>
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
