/* ─── INTERNAL PAGE MEDIA ────────────────────────────────────────────────
   One module owning every photograph on the interior pages, so swapping a
   picture is a one-line change and no page hard-codes an image URL.

   ── These are DUMMY photographs ──
   Every `src` below is stand-in stock imagery, present so the pages read as
   finished designs rather than as grey boxes. Each id was probed and verified
   to resolve before being used here — none of them 404. They are NOT Country
   Kids photography and must be replaced before launch.

   ── Replacing one with a real photo ──
   Change the first argument of `shot()` from an id to a local path:

       shot('/images/about/chapter-one-country.jpg', 1600, 2000, '…')

   `crop()` passes any string starting with "/" straight through, so nothing
   else has to change. The intended local filenames, dimensions and alt text
   for the Our Story page are listed in public/images/about/README.md, and the
   brand placeholder .svg for each still ships as the error fallback.

   ── width/height ──
   These are the dimensions requested from the CDN AND written onto the <img>.
   The frame reserves its box from the aspect ratio, so a slow photo can never
   shift the layout. */

import { crop } from '@/lib/images';

export type Media = {
    src: string;
    /** Shown by <ImageReveal> if `src` fails to load. */
    fallback?: string;
    alt: string;
    width: number;
    height: number;
};

function shot(id: string, width: number, height: number, alt: string, fallback?: string): Media {
    return { src: crop(id, width, height), fallback, alt, width, height };
}

/* Local brand placeholder art for the Our Story slots (see
   public/images/about/). Kept as the error fallback so the page degrades to
   designed art rather than to a broken-image icon. */
const ph = (name: string) => `/images/about/${name}.svg`;

/* ── Our Story (/about) ── */
export const STORY_IMAGES = {
    hero: shot(
        '1587616211892-f743fcca64f9',
        2000,
        1125,
        'Children and educators together in a bright, open early learning space',
        ph('about-hero')
    ),
    chapterOne: shot(
        '1500534314209-a25ddb2bd429',
        1200,
        1500,
        'Open grassland under a wide sky — the country that made room for us',
        ph('chapter-one-country')
    ),
    chapterTwo: shot(
        '1476514525535-07fb3b4ae5f1',
        1400,
        1050,
        'A long road winding through open country, standing for the journey taken the long way around',
        ph('chapter-two-journey')
    ),
    chapterThree: shot(
        '1516627145497-ae6968895b74',
        2000,
        1000,
        'An educator sitting with young children, listening closely as they talk',
        ph('chapter-three-educator-child')
    ),
    chapterFour: shot(
        '1509062522246-3755977927d7',
        1800,
        1013,
        'A light-filled learning room set up with open-ended play materials',
        ph('chapter-four-learning-space')
    ),
    chapterFive: shot(
        '1503676260728-1c00da094a0b',
        1200,
        1500,
        'An educator working attentively with a small group of children',
        ph('chapter-five-care')
    ),
    chapterSix: shot(
        '1541692641319-981cc79ee10a',
        1800,
        1350,
        'Children and adults gathered together around a shared story',
        ph('chapter-six-family-country')
    ),
    closing: shot(
        '1444927714506-8492d94b4e3d',
        2200,
        1100,
        'A path leading away through native grasses and open country',
        ph('closing-belonging')
    ),
    cta: shot(
        '1596464716127-f2a82984de30',
        1200,
        900,
        'Children busy together at an arts and crafts table',
        ph('cta-tour')
    ),
} satisfies Record<string, Media>;

/* ── Every other interior page ──
   `hero` is the page-hero background; `feature` is the image-led split section
   that sits inside the page. */
export const PAGE_MEDIA = {
    philosophy: {
        hero: shot(
            '1526634332515-d56c5fd16991',
            2000,
            1125,
            'A young child absorbed in building with wooden blocks'
        ),
        feature: shot(
            '1533228100845-08145b01de14',
            1300,
            1000,
            'Children playing together outdoors among trees and open ground'
        ),
    },
    rooms: {
        hero: shot(
            '1509062522246-3755977927d7',
            2000,
            1125,
            'A bright, calm early learning room prepared for the day'
        ),
        feature: shot(
            '1497486751825-1233686d5d80',
            1300,
            1000,
            'A quiet corner of a learning room with natural materials within a child’s reach'
        ),
    },
    curriculum: {
        hero: shot(
            '1541692641319-981cc79ee10a',
            2000,
            1125,
            'Children gathered closely around a book being read aloud'
        ),
        feature: shot(
            '1470071459604-3b5ec3a7fe05',
            1300,
            1000,
            'Mist over open bushland — the landscape the curriculum series are named for'
        ),
    },
    compliance: {
        hero: shot(
            '1503676260728-1c00da094a0b',
            2000,
            1125,
            'An educator supervising attentively while children work'
        ),
        feature: shot(
            '1587654780291-39c9404d746b',
            1300,
            1000,
            'A safe, well-kept outdoor play area seen from the shade'
        ),
    },
    fees: {
        hero: shot(
            '1596464716127-f2a82984de30',
            2000,
            1125,
            'Children working side by side at a craft table'
        ),
        feature: shot(
            '1522661067900-ab829854a57f',
            1300,
            1000,
            'A family sitting together working through paperwork at a kitchen table'
        ),
    },
    families: {
        hero: shot(
            '1516627145497-ae6968895b74',
            2000,
            1125,
            'An educator and children sharing a moment together'
        ),
        feature: shot(
            '1503919545889-aef636e10ad4',
            1300,
            1000,
            'A parent and child arriving together, hand in hand'
        ),
    },
    contact: {
        hero: shot(
            '1587616211892-f743fcca64f9',
            2000,
            1125,
            'The welcoming entrance to a bright early learning centre'
        ),
        feature: shot(
            '1425913397330-cf8af2ff40a1',
            1300,
            1000,
            'Native foliage and textured bark, close up'
        ),
    },
    enroll: {
        hero: shot(
            '1503454537195-1dcabb73ffb9',
            2000,
            1125,
            'A child settling happily into a new learning space'
        ),
        feature: shot(
            '1596464716127-f2a82984de30',
            1300,
            1000,
            'Children busy with arts and crafts at Country Kids'
        ),
    },
} satisfies Record<string, { hero: Media; feature: Media }>;
