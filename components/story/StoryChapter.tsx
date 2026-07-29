'use client';

/* StoryChapter — one chapter of "A Dream, Rooted in Country", composed to the
   layout its entry in lib/story-media asks for.

   Four compositions share this component rather than four near-identical ones:
   the copy block and the media block are always the same two pieces, and only
   the grid around them changes. That keeps the variety in the data (where it is
   easy to re-order) instead of in the markup.

   Reading order is fixed regardless of composition: the copy is always FIRST in
   the DOM and the image follows, so a screen reader and a stacked phone layout
   both get heading → prose → picture. `split-left` moves the image visually with
   a grid `order`, which changes nothing for assistive technology.

   Content is passed straight through from lib/story-data.ts and never
   transformed — no truncation, no re-wording, no derived summaries. */

import Reveal from '@/components/shared/Reveal';
import TextReveal from '@/components/shared/TextReveal';
import Icon from '@/components/shared/Icon';
import ImageReveal from '@/components/story/ImageReveal';
import type { ChapterMedia } from '@/lib/story-media';

type Chapter = {
    n: string;
    title: string;
    paras: string[];
};

type Props = {
    chapter: Chapter;
    media: ChapterMedia;
    /** Rendered after the prose — Chapter Four's stat cards. */
    children?: React.ReactNode;
};

/* Crop per composition, where the asset's own ratio is not the right one for
   the slot. Set here rather than in CSS: ImageReveal writes the ratio as an
   INLINE custom property, which no stylesheet rule could override. */
const LAYOUT_RATIO: Record<string, string | undefined> = {
    'split-right': undefined,
    'split-left': undefined,
    centered: '16 / 10',
    overlap: '16 / 7',
};

export default function StoryChapter({ chapter, media, children }: Props) {
    const { layout } = media;

    /* Chapter Five is the compliance promise: its prose sits inside a bordered
       card with a shield mark, so the section reads as a formal undertaking
       rather than more narrative. Wording is untouched. */
    const copy = (
        <Reveal className={`story-copy${media.card ? ' story-copy--card' : ''}`} stagger>
            {media.card ? (
                <Reveal as="span" variant="item" className="story-copy-mark" aria-hidden="true">
                    <Icon name="shield" size={22} strokeWidth={1.5} />
                </Reveal>
            ) : null}

            {/* A div, not a p: the CSS lead-in rule keys off the first REAL
                paragraph of prose, and a <p> label here would claim that slot. */}
            <Reveal as="div" variant="item" className="story-chapter-index">
                <span className="story-chapter-numeral" aria-hidden="true">
                    {media.numeral}
                </span>
                <span className="story-chapter-label">{chapter.n}</span>
            </Reveal>

            <TextReveal as="h2" className="story-chapter-title">
                {chapter.title}
            </TextReveal>

            <Reveal as="span" variant="lineGrow" className="story-rule" aria-hidden="true" />

            {chapter.paras.map((p, i) => (
                <Reveal as="p" variant="item" key={i}>
                    {p}
                </Reveal>
            ))}
        </Reveal>
    );

    const media_ = (
        <div className="story-media">
            <ImageReveal
                image={media.image}
                ratio={LAYOUT_RATIO[layout]}
                strength={layout === 'centered' ? 6 : 8}
                className={`ir--${layout}`}
            />
        </div>
    );

    return (
        <section
            className={`section story-section story-section--${layout}`}
            id={media.id}
            data-chapter={media.id}
            /* Names the region without needing an id on the heading — the h2 is
               rendered by TextReveal, which owns its own markup. */
            aria-label={`${chapter.n}: ${chapter.title}`}
        >
            <div className="container story-layout">
                {copy}
                {media_}
                {children}
            </div>
        </section>
    );
}
