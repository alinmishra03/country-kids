'use client';

/* OUR STORY (app/about) — "A Dream, Rooted in Country".
   Dynamically connected to CMS & Backend API. */

import { Fragment, useRef, useState, useEffect } from 'react';
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
import { fetchPublishedAboutSections } from '@/lib/api-client';
import PageNavigator from '@/components/common/PageNavigator';

function parseParas(htmlContent: string): string[] {
    if (!htmlContent) return [];
    const pMatches = htmlContent.match(/<p[^>]*>(.*?)<\/p>/gi);
    if (pMatches && pMatches.length > 0) {
        const parsed = pMatches
            .map((m) => m.replace(/<[^>]*>?/gm, '').trim())
            .filter(Boolean);
        if (parsed.length > 0) return parsed;
    }
    const cleanText = htmlContent.replace(/<[^>]*>?/gm, '\n').trim();
    return cleanText
        .split('\n')
        .map((s) => s.trim())
        .filter(Boolean);
}

const RAIL: ProgressItem[] = STORY_CHAPTERS.map((ch: any) => {
    const m = CHAPTER_MEDIA[ch.n];
    return { id: m.id, label: ch.n, short: ch.title, numeral: m.numeral };
});

export default function AboutPage() {
    const rootRef = useRef(null);
    const [chapters, setChapters] = useState<any[]>(STORY_CHAPTERS);
    const [customMedia, setCustomMedia] = useState<Record<string, any>>({});

    useCountUp(rootRef);

    useEffect(() => {
        let isMounted = true;
        fetchPublishedAboutSections().then((dynamicSections) => {
            if (isMounted && dynamicSections && dynamicSections.length > 0) {
                const updatedMediaMap: Record<string, any> = {};

                setChapters((prev) =>
                    prev.map((ch: any, idx: number) => {
                        const matched = dynamicSections.find(
                            (sec: any) =>
                                sec.chapterNumber === idx + 1 ||
                                sec.sectionKey === `chapter-${idx + 1}` ||
                                (sec.chapterLabel && sec.chapterLabel.toLowerCase().includes(ch.n.toLowerCase()))
                        );

                        if (matched) {
                            const parsedParas = parseParas(matched.content);
                            if (matched.image) {
                                updatedMediaMap[ch.n] = {
                                    src: matched.image,
                                    alt: matched.heading,
                                    width: 1200,
                                    height: 1500
                                };
                            }

                            return {
                                ...ch,
                                title: matched.heading || ch.title,
                                paras: parsedParas.length > 0 ? parsedParas : ch.paras
                            };
                        }
                        return ch;
                    })
                );

                setCustomMedia(updatedMediaMap);
            }
        });
        return () => {
            isMounted = false;
        };
    }, []);

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

            {chapters.map((ch: any) => {
                const defaultMedia = CHAPTER_MEDIA[ch.n];
                const media = {
                    ...defaultMedia,
                    image: customMedia[ch.n] || defaultMedia.image
                };

                return (
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

            <PageNavigator />

            <CTASection
                title="Come and be part of the story"
                text="Every family adds a new chapter. Book a free tour and see where your child's story could begin."
                image={STORY_IMAGES.cta}
            />
        </Page>
    );
}
