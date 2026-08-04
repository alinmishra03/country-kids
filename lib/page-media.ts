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
        '1613794713137-a78aba4be84a',
        2000,
        1125,
        'Three young children playing together in a sandpit under shade',
        ph('about-hero')
    ),
    chapterOne: shot(
        '1578011166201-83d553ed495f',
        1200,
        1500,
        'A single gum standing in open parkland under a wide blue sky',
        ph('chapter-one-country')
    ),
    chapterTwo: shot(
        '1676776295419-815b0fbe1c3c',
        1400,
        1050,
        'A gum leaning over open country, the valley falling away beyond it',
        ph('chapter-two-journey')
    ),
    chapterThree: shot(
        '1583468991267-3f068b607ae1',
        1800,
        1125,
        'An educator sitting with a young child, working through a book together',
        ph('chapter-three-educator-child')
    ),
    chapterFour: shot(
        '1567746455504-cb3213f8f5b8',
        1800,
        1125,
        'A light-filled learning room set up with open-ended play materials',
        ph('chapter-four-learning-space')
    ),
    chapterFive: shot(
        '1771765754567-e7b5bbf6a3b3',
        1200,
        1500,
        'An educator working attentively with a small group of children',
        ph('chapter-five-care')
    ),
    chapterSix: shot(
        '1583468991267-3f068b607ae1',
        1800,
        1350,
        'An adult and children gathered together around a shared story',
        ph('chapter-six-family-country')
    ),
    closing: shot(
        '1676776295520-065802f5659a',
        2200,
        1100,
        'Gum canopy opening out over open country',
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
   that sits inside the page.

   A page may also carry extra slots beyond those two — /philosophy has one
   photograph per editorial row and an array of seven for the values accordion.
   The index signature is what lets it, while `hero` and `feature` stay
   REQUIRED, so the constraint still catches a page that forgets either. Both
   declared keys are Media, which conforms to the signature's Media | Media[].

   Without the index signature this is an excess-property error under
   `satisfies` — and one that only `next build` reports, since `next dev` does
   not run the full type check. */
/* What an extra slot is allowed to be: one photograph, an ordered list of them
   (the philosophy values accordion), or a map keyed by something the page owns
   (the curriculum series, keyed by series id). */
type MediaSlot = Media | Media[] | Record<string, Media>;

type PageMedia = {
    hero: Media;
    feature: Media;
    [slot: string]: MediaSlot;
};

export const PAGE_MEDIA = {
    philosophy: {
        hero: shot(
            '1761208663763-c4d30657c910',
            2000,
            1125,
            'Children absorbed in building together on the floor of a learning room'
        ),
        /* Was id 1533228100845, captioned "children playing outdoors among
           trees". That id is a photograph of a phone showing a Google search —
           it had been sitting on this page behind an alt text describing
           something else entirely. Replaced with a picture that matches its
           caption, and the caption checked against the pixels. */
        feature: shot(
            '1581861181562-34284733005a',
            1200,
            1500,
            'Children working side by side at a table of coloured materials'
        ),
        /* One photograph per Philosophy / Vision / Mission row, chosen to carry
           that row's idea rather than to decorate it: play as the vehicle for
           learning, Country as the ground everything is rooted in, and growth
           as what the right soil produces. Each id was loaded and looked at
           before being written here — several candidates resolved fine and
           showed adults, a yoga pose and a tray of strawberries. */
        philosophyRow: shot(
            '1560421683-6856ea585c78',
            1400,
            1050,
            'A child painting freely with bright colours, hands busy in the work'
        ),
        visionRow: shot(
            '1676776295419-815b0fbe1c3c',
            1400,
            1050,
            'A wide valley of open country seen through the branches of a gum'
        ),
        missionRow: shot(
            '1518831959646-742c3a14ebf7',
            1400,
            1050,
            'A young child reaching into a wall of flowers in bloom'
        ),
        /* One photograph per value, in VALUES order — the accordion cross-fades
           between them as each value opens, so the array is positional and must
           stay the same length as VALUES. Every caption below was written after
           looking at the image, not from its filename: the ids already in this
           file proved unreliable that way (one captioned "children playing
           outdoors" is a phone showing a Google search). */
        valueShots: [
            shot('1503454537195-1dcabb73ffb9', 1200, 1400, 'A child laughing, face and hands covered in paint'),
            shot('1607453998825-f3f36da5ab18', 1200, 1400, 'Two young children sitting arm in arm, laughing together'),
            shot('1581861181562-34284733005a', 1200, 1400, 'Children working side by side at a table of coloured materials'),
            shot('1587654780291-39c9404d746b', 1200, 1400, 'A deep pile of coloured building bricks waiting to be used'),
            shot('1509414556967-312906f278a0', 1200, 1400, 'Tall straight gums in bushland, lit from behind'),
            shot('1780844824360-6fced13c828f', 1200, 1400, 'A child writing carefully on a large blackboard'),
            shot('1668119208053-1545bcc49e4a', 1200, 1400, 'Ghost gums standing in open bushland'),
        ],
    },
    rooms: {
        hero: shot(
            '1567746455504-cb3213f8f5b8',
            2000,
            1125,
            'A bright, calm early learning room prepared for the day'
        ),
        feature: shot(
            '1564429238817-393bd4286b2d',
            1300,
            1000,
            'A quiet corner of a learning room with natural materials within a child’s reach'
        ),
    },
    curriculum: {
        hero: shot(
            '1583468991267-3f068b607ae1',
            2000,
            1125,
            'A child following the words closely as a book is read aloud'
        ),
        feature: shot(
            '1509414556967-312906f278a0',
            1300,
            1000,
            'Tall gums standing close together in Victorian bushland'
        ),
        /* One landscape per series, keyed by CURRICULUM_SERIES id so a series
           and its picture cannot drift apart. All five are the centre's own
           photography.

           crop() passes any path starting with "/" straight through, so local
           files need no CDN handling — but they also get NO resizing, so the
           file on disk is the file the visitor downloads. See the note on
           river.jpg below.

           `country` takes "Five landscapes, one curriculum.jpg". That file is
           named for the section above, but the centre supplied exactly five
           photographs for five series and this is the one left over — and an
           aerial of open coastal country suits the series about land and
           connection. The section above goes back to the stock landscape it had
           before, so no photograph appears twice on the page. */
        series: {
            seeds: {
                src: '/images/about/curriculum/seeds.jpeg',
                alt: 'A child’s hands settling a green seedling into dark soil',
                width: 2560,
                height: 1707,
            },
            country: {
                src: '/images/about/curriculum/Five%20landscapes,%20one%20curriculum.jpg',
                alt: 'A road winding along a forested coastline, seen from above',
                width: 949,
                height: 530,
            },
            river: {
                src: '/images/about/curriculum/river.jpg',
                alt: 'A still river running between banks of dense bush',
                width: 8064,
                height: 5379,
            },
            seasons: {
                src: '/images/about/curriculum/seasons.jpg',
                alt: 'Four seasons side by side — summer coast, green forest, autumn leaves and snow',
                width: 1344,
                height: 768,
            },
            'high-country': {
                src: '/images/about/curriculum/high%20country.jpg',
                alt: 'A country town street lined with trees in full autumn colour',
                width: 900,
                height: 600,
            },
        } as Record<string, Media>,
    },
    compliance: {
        hero: shot(
            '1616089804390-b2daa80dbf02',
            2000,
            1125,
            'An educator supervising attentively while children work'
        ),
        feature: shot(
            '1495131292899-bc096577e8f5',
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
            '1583468991267-3f068b607ae1',
            1300,
            1000,
            'An educator sitting with a child, going through a book side by side'
        ),
    },
    families: {
        hero: shot(
            '1613794713137-a78aba4be84a',
            2000,
            1125,
            'Three young children playing side by side in a sandpit'
        ),
        feature: shot(
            '1761208663763-c4d30657c910',
            1300,
            1000,
            'Educators and children together on the floor of a learning room'
        ),
        highlights: [
            shot(
                '1578349035260-9f3d4042f1f7',
                1200,
                900,
                'Children and educators sharing daily moments and learning'
            ),
            shot(
                '1498837167922-ddd27525d352',
                1200,
                900,
                'Freshly prepared healthy meals for children'
            ),
            shot(
                '1771765754567-e7b5bbf6a3b3',
                1200,
                900,
                'Educators and parents working together in genuine partnership'
            ),
            shot(
                '1607453998825-f3f36da5ab18',
                1200,
                900,
                'Children standing together in a supportive community'
            ),
        ],
    },
    contact: {
        hero: shot(
            '1567746455504-cb3213f8f5b8',
            2000,
            1125,
            'The welcoming entrance to a bright early learning centre'
        ),
        feature: shot(
            '1668119208053-1545bcc49e4a',
            1300,
            1000,
            'Native foliage and textured bark, close up'
        ),
        /* ── REAL photographs, not the stock dummies above ──
           Sourced from the files already in the repo (public/images/about/
           "other images"), which were sitting unreferenced. Converted to WebP
           at 900px on the long edge before being wired in: the originals are
           1.2–1.8MB PNGs, and crop() passes a local path straight through with
           NO resizing, so the file on disk is the file the visitor downloads.
           As PNGs these seven were 10.4MB; as WebP they are 297KB.

           Every caption below was written after LOOKING at the file, not from
           its filename — the numbered originals carry no clue as to content,
           and this module's own history (see the philosophy notes above) is
           what happens when captions are guessed.

           Licensing is UNVERIFIED. They arrived with no attribution and no
           README, unlike the Story slots, and they read as commercial stock.
           Confirm the licence before this page goes near production. */
        highlights: [
            {
                src: '/images/contact/story-circle.webp',
                alt: 'Young children sitting in a row, each looking through a picture book',
                width: 900,
                height: 720,
            },
            {
                src: '/images/contact/block-table.webp',
                alt: 'Two toddlers building together at a table of wooden letter blocks',
                width: 900,
                height: 720,
            },
            {
                src: '/images/contact/playground-slide.webp',
                alt: 'A child coming down a bright playground tunnel slide with arms outstretched',
                width: 900,
                height: 720,
            },
            {
                src: '/images/contact/hands-up.webp',
                alt: 'Four children at a desk with their hands in the air, mid-cheer',
                width: 900,
                height: 720,
            },
        ] as Media[],

        /* The rest of the converted set, for the sections below the hero. */
        gallery: [
            {
                src: '/images/contact/alphabet-puzzle.webp',
                alt: 'Three children on the floor fitting foam alphabet tiles together',
                width: 900,
                height: 720,
            },
            {
                src: '/images/contact/wooden-blocks.webp',
                alt: 'Two toddlers building with coloured wooden blocks in a bright room',
                width: 900,
                height: 720,
            },
            {
                src: '/images/contact/colouring-outdoors.webp',
                alt: 'A group of children coloring with crayons around a shared sheet of paper',
                width: 900,
                height: 720,
            },
        ] as Media[],

        /* Australian country, reused from the curriculum set — the only
           genuinely Australian photography in the repo. Already web-sized
           JPEGs, so they are referenced in place rather than duplicated. */
        country: {
            coast: {
                src: '/images/about/curriculum/Five%20landscapes,%20one%20curriculum.jpg',
                alt: 'An Australian coastline seen from above, road winding between bush and beach',
                width: 949,
                height: 530,
            },
            /* Kept as-is: these two are the centre's own Australian photography
               and were never part of the stock set replaced above. */
            town: {
                src: '/images/about/curriculum/high%20country.jpg',
                alt: 'A Victorian high-country town street lined with trees in autumn colour',
                width: 900,
                height: 600,
            },
        } as Record<string, Media>,
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
} satisfies Record<string, PageMedia>;
