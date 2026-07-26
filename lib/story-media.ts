/* Layout map for Our Story (app/about).
   ────────────────────────────────────────────────────────────────────────────
   Deliberately SEPARATE from lib/story-data.ts. That file is the centre's own
   words and is the single source of truth for content; this file only decides
   how each chapter is composed and which photograph sits beside it. Nothing
   here is copy.

   The photographs themselves now live in lib/page-media.ts alongside every
   other interior page's imagery, so there is one place to swap a picture for
   the whole site. They are re-exported here because that is where the About
   page already looks for them. */

import { STORY_IMAGES, type Media } from '@/lib/page-media';

export type StoryImage = Media;
export { STORY_IMAGES };

/* ── Layout map ──────────────────────────────────────────────────────────
   Keyed by the chapter's own `n` label so re-ordering STORY_CHAPTERS can never
   silently shift a photograph onto the wrong chapter.

   layout:
     split-right  copy left, image right
     split-left   image left, copy right
     centered     centred editorial column, wide image beneath
     overlap      large image with a navy panel overlapping it

   The variety is the point — the brief explicitly rules out forcing every
   chapter through the same template. */

export type StoryLayout = 'split-right' | 'split-left' | 'centered' | 'overlap';

export type ChapterMedia = {
    /** Anchor id — also what the chapter rail scrolls to. */
    id: string;
    /** Short label for the chapter rail (the full title stays in story-data). */
    short: string;
    layout: StoryLayout;
    image: StoryImage;
    /** Decorative numeral rendered behind the chapter label. */
    numeral: string;
    /** Pull the chapter's quote out into the standalone quote band below it. */
    quoteBand?: boolean;
    /** Chapter Five's compliance treatment: copy sits in a bordered card. */
    card?: boolean;
};

export const CHAPTER_MEDIA: Record<string, ChapterMedia> = {
    'Chapter One': {
        id: 'chapter-one',
        short: 'The country that held us',
        layout: 'split-right',
        image: STORY_IMAGES.chapterOne,
        numeral: '01',
    },
    'Chapter Two': {
        id: 'chapter-two',
        short: 'The long way around',
        layout: 'split-left',
        image: STORY_IMAGES.chapterTwo,
        numeral: '02',
        quoteBand: true,
    },
    'Chapter Three': {
        id: 'chapter-three',
        short: 'The day the dream had a name',
        layout: 'centered',
        image: STORY_IMAGES.chapterThree,
        numeral: '03',
    },
    'Chapter Four': {
        id: 'chapter-four',
        short: 'What we planted',
        layout: 'centered',
        image: STORY_IMAGES.chapterFour,
        numeral: '04',
    },
    'Chapter Five': {
        id: 'chapter-five',
        short: 'A promise we make in writing',
        layout: 'split-left',
        image: STORY_IMAGES.chapterFive,
        numeral: '05',
        card: true,
    },
    'Chapter Six': {
        id: 'chapter-six',
        short: 'Walking together',
        layout: 'overlap',
        image: STORY_IMAGES.chapterSix,
        numeral: '06',
    },
};

/* Icons for Chapter Four's "what we planted" figures, keyed by the stat itself
   so the icon follows the pillar rather than its position in the array. */
export const PILLAR_ICONS: Record<string, string> = {
    '7': 'home',
    '5': 'sprout',
    '∞': 'sparkles',
};
