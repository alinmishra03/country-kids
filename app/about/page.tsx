'use client';

/* OUR STORY (app/about) — "A Dream, Rooted in Country".
   ────────────────────────────────────────────────────────────────────────────
   An editorial, image-led telling of the six-chapter origin narrative. EVERY
   word still comes from lib/story-data.ts and is rendered verbatim: nothing is
   shortened, re-ordered inside a chapter, summarised or invented. What changed
   is the composition around the words.

   Structure:
     · an editorial page hero with a scroll-parallaxed photograph;
     · a chapter rail that tracks reading position (components/story/
       SectionProgress) and hides itself outside the story;
     · six chapters, each a section of its own so css/surfaces.css alternates
       the cream / white band rhythm down the page, and each on a different
       composition — copy-left, copy-right, centred, and an overlapping panel;
     · Chapter Two's pull quote lifted out into a full-width navy band;
     · Chapter Four's three figures as count-up cards;
     · the closing message over a full-width photograph;
     · the existing tour call to action, given a split layout.

   The banding is positional (`.page > .section:nth-of-type(odd|even)` in
   css/surfaces.css), which is why every chapter is a direct child section of
   the page rather than one long section with dividers.

   Motion: chapter copy is a stagger container so its label, heading, rule and
   paragraphs arrive in sequence rather than as one block; headings use the
   masked word reveal; photographs wipe in and drift; the figures count up. All
   of it is skipped under prefers-reduced-motion by the shared Reveal /
   TextReveal / useGsap layer. */

import { Fragment, useRef } from 'react';
import Page from '@/components/shared/Page';
import PageHero from '@/components/shared/PageHero';
import CTASection from '@/components/shared/CTASection';
import Reveal from '@/components/shared/Reveal';
import ImageReveal from '@/components/story/ImageReveal';
import StoryChapter from '@/components/story/StoryChapter';
import EditorialQuote from '@/components/story/EditorialQuote';
import AnimatedStatCard from '@/components/story/AnimatedStatCard';
import SectionProgress, { type ProgressItem } from '@/components/story/SectionProgress';
import useCountUp from '@/hooks/useCountUp';
import { STORY_INTRO, STORY_CHAPTERS, STORY_CLOSING } from '@/lib/story-data';
import { CHAPTER_MEDIA, STORY_IMAGES } from '@/lib/story-media';

/* The rail's entries are derived from the chapters themselves, so adding or
   re-ordering a chapter can never leave the navigation out of step. */
const RAIL: ProgressItem[] = STORY_CHAPTERS.map((ch: any) => {
    const m = CHAPTER_MEDIA[ch.n];
    return { id: m.id, label: ch.n, short: ch.title, numeral: m.numeral };
});

export default function AboutPage() {
    const rootRef = useRef(null);

    /* Chapter Four's figures count up when they reach the viewport. The hook
       finds .stat-number[data-count] anywhere inside the page. */
    useCountUp(rootRef);

    return (
        <Page id="about" innerRef={rootRef}>
            <PageHero
                kicker={STORY_INTRO.kicker}
                title={STORY_INTRO.title}
                lead={STORY_INTRO.lead}
                image={STORY_IMAGES.hero.src}
                fallbackImage={STORY_IMAGES.hero.fallback}
                badges={['Not-for-Profit', 'Ravenhall, Victoria', 'Est. 2026']}
                variant="editorial"
                parallax
            />

            <SectionProgress items={RAIL} />

            {STORY_CHAPTERS.map((ch: any) => {
                const media = CHAPTER_MEDIA[ch.n];

                return (
                    /* A Fragment, NOT a wrapper element: css/surfaces.css bands
                       the page with `.page > .section:nth-of-type(...)`, so
                       every chapter has to stay a DIRECT child of the page
                       shell or the whole cream/white rhythm collapses. */
                    <Fragment key={ch.n}>
                        <StoryChapter chapter={ch} media={media}>
                            {ch.pillars ? (
                                <Reveal className="story-pillars" stagger>
                                    {ch.pillars.map((pl: any) => (
                                        <AnimatedStatCard pillar={pl} key={pl.title} />
                                    ))}
                                </Reveal>
                            ) : null}
                        </StoryChapter>

                        {/* Chapter Two's quote, presented as its own band. The
                            text is unchanged and still lives in story-data. */}
                        {media.quoteBand && ch.quote ? <EditorialQuote quote={ch.quote} /> : null}
                    </Fragment>
                );
            })}

            <section className="section story-closing-section" aria-label="Closing message">
                <ImageReveal
                    image={STORY_IMAGES.closing}
                    ratio="21 / 9"
                    className="story-closing-media"
                    strength={6}
                />

                <div className="container">
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
                image={STORY_IMAGES.cta}
            />
        </Page>
    );
}
