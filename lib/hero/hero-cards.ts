/* The 24 cards on the hero globe — ALL of it real Country Kids content, pulled
   from the same data files the rest of the site renders from, so nothing here
   can drift out of sync with the pages it links to.

   Four categories, each a real part of the centre:
     · Our Rooms       — the seven purpose-named rooms          → /rooms#id
     · Our Curriculum  — the five "Landscapes" series           → /curriculum
     · A Day Here      — the eight everyday-life activities     → /
     · The Centre      — four things families ask about first   → various

   Each card carries the copy the overlay shows when it is selected: a title, a
   category, a short subtitle and a one-line description, plus the CTA the button
   points at while that card is in focus. */

import { ROOMS } from '@/lib/rooms-data';
import { GALLERY } from '@/lib/programs-data';
import { CURRICULUM_SERIES } from '@/lib/curriculum-data';

export type HeroCard = {
    id: string;
    /** Unsplash id (or a /public path) — resolved by lib/hero/card-texture. */
    img: string;
    category: string;
    title: string;
    subtitle: string;
    description: string;
    href: string;
    cta: string;
};

/* Photos for the content that has none of its own. */
const CURRICULUM_IMG: Record<string, string> = {
    seeds: '1519689680058-324335c77eba',
    country: '1444703686981-a3abbc4d4fe3',
    river: '1503919545889-aef636e10ad4',
    seasons: '1481627834876-b7833e8f5570',
    'high-country': '1509228468518-180dd4864904',
};

/* ── Our Rooms (7) ── */
const ROOM_CARDS: HeroCard[] = ROOMS.map((r: any) => ({
    id: `room-${r.id}`,
    img: r.img,
    category: 'Our Rooms',
    title: r.name,
    subtitle: `${r.age} · ${r.stage}`,
    /* The room blurbs are a paragraph each — the overlay wants one clean line. */
    description: r.blurb.split('. ')[0] + '.',
    href: `/rooms#${r.id}`,
    cta: `Explore the ${r.name}`,
}));

/* ── Our Curriculum (5) ── */
const CURRICULUM_CARDS: HeroCard[] = CURRICULUM_SERIES.map((s: any) => ({
    id: `series-${s.id}`,
    img: CURRICULUM_IMG[s.id] ?? '1596464716127-f2a82984de30',
    category: 'Our Curriculum',
    title: s.name,
    subtitle: s.tagline,
    description: s.blurb,
    href: '/curriculum',
    cta: 'See the Five Landscapes',
}));

/* ── A Day Here (8) ── */
const DAY_COPY: Record<string, string> = {
    'Art & Crafts': 'Open-ended making, where the process matters far more than the product.',
    Building: 'Blocks, ramps and problem-solving — early engineering, disguised as play.',
    'Story Time': 'Shared books and oral storytelling that build language long before school.',
    'Active Play': 'Climbing, balancing and running — the gross-motor work every young body needs.',
    Music: 'Song, rhythm and movement, woven through the whole day rather than timetabled.',
    Nature: 'Time on Country: gardens, weather, creatures and the seasons that shape them.',
    Outdoors: 'Our outdoor program runs in every weather, because children learn in all of it.',
    'Early Math': 'Counting, sorting and pattern-making, found in everyday routines.',
};

const DAY_CARDS: HeroCard[] = GALLERY.map((g: any) => ({
    id: `day-${g.label.toLowerCase().replace(/[^a-z]+/g, '-')}`,
    img: g.img,
    category: 'A Day Here',
    title: g.label,
    subtitle: 'Everyday learning',
    description: DAY_COPY[g.label] ?? 'Play-based learning, every day, in every room.',
    href: '/curriculum',
    cta: 'See how we learn',
}));

/* ── The Centre (4) ── */
const CENTRE_CARDS: HeroCard[] = [
    {
        id: 'centre-kinder',
        img: '1541692641319-981cc79ee10a',
        category: 'The Centre',
        title: 'Free Kinder',
        subtitle: '3 & 4-year-old programs',
        description:
            'Victorian Government funded kindergarten, delivered on site by VIT-registered Early Childhood Teachers.',
        href: '/fees',
        cta: 'See fees & subsidies',
    },
    {
        id: 'centre-educators',
        img: '1516627145497-ae6968895b74',
        category: 'The Centre',
        title: 'Our Educators',
        subtitle: '100% qualified team',
        description:
            'Every educator is qualified, and every room is staffed above the ratios the National Quality Framework requires.',
        href: '/philosophy',
        cta: 'Read our philosophy',
    },
    {
        id: 'centre-safety',
        img: '1503676260728-1c00da094a0b',
        category: 'The Centre',
        title: 'Child Safety',
        subtitle: 'All 11 Victorian standards',
        description:
            'Child safety is a practice, not a policy — embedded in every routine and reviewed continuously.',
        href: '/compliance',
        cta: 'See our compliance',
    },
    {
        id: 'centre-families',
        img: '1509062522246-3755977927d7',
        category: 'The Centre',
        title: 'Our Families',
        subtitle: 'Partnership from day one',
        description:
            'Families are the first and most enduring teachers in a child’s life. We build around that, not beside it.',
        href: '/families',
        cta: 'For families',
    },
];

/* 7 + 5 + 8 + 4 = 24 — exactly GLOBE.columns × GLOBE.rows.
   INTERLEAVED by category so a single ring is never all one topic: spinning the
   globe should reveal variety, not a block of seven room cards in a row. */
export const HERO_CARDS: HeroCard[] = interleave([
    ROOM_CARDS,
    DAY_CARDS,
    CURRICULUM_CARDS,
    CENTRE_CARDS,
]);

/* Round-robin merge: take one from each group in turn until all are drained. */
function interleave(groups: HeroCard[][]): HeroCard[] {
    const out: HeroCard[] = [];
    const longest = Math.max(...groups.map((g) => g.length));
    for (let i = 0; i < longest; i++) {
        for (const g of groups) if (g[i]) out.push(g[i]);
    }
    return out;
}

/* The copy the overlay shows when NOTHING is selected — the hero's real
   headline, and the site's actual primary actions. Heading and buttons only:
   the hero carries no description, by design. */
export const HERO_INTRO = {
    eyebrow: 'Not-for-Profit · Ravenhall, Victoria',
    title: 'Rooted in Country.',
    titleAccent: 'Where every child belongs.',
    primary: { label: 'Book a Free Tour', href: '/enroll' },
    secondary: { label: 'Explore Our Rooms', href: '/rooms' },
};
