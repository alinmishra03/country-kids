/* The seven purpose-named rooms. Each is named after an iconic Australian animal.
   `icon` maps to components/shared/Icon.js; `accent` is a theme key used to tint
   the card (maps to CSS classes .accent-*); `img` is an Unsplash id (see
   lib/images.js). `art` is the room's own commissioned animal illustration in
   /public/images/about/rooms — the room CARDS show it; `img` stays as the photo
   the hero globe bakes into its card faces. Content is faithful to the centre's
   own descriptions. */

export const ROOMS = [
    {
        id: 'joey',
        name: 'Joey Room',
        animal: 'Joey — Baby Kangaroo',
        age: '0 – 1 Year',
        stage: 'Infants',
        icon: 'baby',
        accent: 'gold',
        img: '1495131292899-bc096577e8f5',
        art: '/images/about/rooms/joey.png',
        blurb:
            'A gentle sanctuary for our youngest members. Named after the baby kangaroo — small, precious and cradled with care. Our Joey Room educators provide responsive, attachment-focused care in a sensory-rich environment, building secure foundations for all future learning.',
    },
    {
        id: 'koala',
        name: 'Koala Room',
        animal: 'Koala',
        age: '1 – 2 Years',
        stage: 'Young Toddlers',
        icon: 'leaf',
        accent: 'green',
        img: '1526634332515-d56c5fd16991',
        art: '/images/about/rooms/koala.png',
        blurb:
            "Named after Australia's most beloved marsupial — calm, steady and full of quiet wonder. The Koala Room nurtures independence, language development and social confidence through guided play, music and sensory exploration.",
    },
    {
        id: 'kookaburra',
        name: 'Kookaburra Room',
        animal: 'Kookaburra',
        age: '2 – 3 Years',
        stage: 'Toddlers',
        icon: 'bird',
        accent: 'orange',
        img: '1503454537195-1dcabb73ffb9',
        art: '/images/about/rooms/kuckaboora.png',
        blurb:
            "Named after Australia's laughing bird — joyful, social and always making noise! Kookaburra children explore creativity, problem-solving and friendship-building in a language-rich, stimulating environment full of discovery.",
    },
    {
        id: 'cockatoo',
        name: 'Cockatoo Room',
        animal: 'Cockatoo',
        age: '2 – 3 Years',
        stage: 'Toddlers',
        icon: 'feather',
        accent: 'blue',
        img: '1578349035260-9f3d4042f1f7',
        art: '/images/about/rooms/cockatoo.png',
        blurb:
            'Bold, bright and expressive — just like the cockatoo. The Cockatoo Room fosters emotional literacy, creative arts and collaborative play, building confident and resilient young learners who love to express themselves.',
    },
    {
        id: 'kingfisher',
        name: 'Kingfisher Room',
        animal: 'Kingfisher',
        age: '3 – 4 Years',
        stage: '3yr Kinder · FREE',
        badge: '3yr Kinder · FREE',
        icon: 'fish',
        accent: 'teal',
        img: '1613794713137-a78aba4be84a',
        art: '/images/about/rooms/kingfisher.png',
        blurb:
            'Precise, colourful and always darting toward new discoveries — like the kingfisher in flight. Children engage in our 3-year-old kindergarten program, Victorian Government funded, led by a VIT-registered Early Childhood Teacher.',
    },
    {
        id: 'kangaroo',
        name: 'Kangaroo Room',
        animal: 'Kangaroo',
        age: '4 – 5 Years',
        stage: '4yr Kinder · FREE',
        badge: '4yr Kinder · FREE',
        icon: 'rabbit',
        accent: 'gold',
        img: '1607453998825-f3f36da5ab18',
        art: '/images/about/rooms/kangaroo.png',
        blurb:
            'Strong, fast and ready to leap into the world. The Kangaroo Room delivers our funded 4-year-old kindergarten program — 15 hours per week — developing literacy, numeracy and the social-emotional skills needed for a confident school transition.',
    },
    {
        id: 'emu',
        name: 'Bunjil Room',
        animal: 'Bunjil',
        age: '3 – 5 Years',
        stage: 'Integrated Learning',
        icon: 'egg',
        accent: 'green',
        img: '1761208663763-c4d30657c910',
        art: '/images/about/rooms/bunjil.png',
        blurb:
            "Australia's tallest bird — strong, curious and never able to fly backwards. The Bunjil Room is our flexible integrated learning space for 3–5 year olds, supporting mixed-age groups, children with additional needs, and specialised learning programs.",
    },
];

/* Compact list used by nav dropdowns and the footer. */
export const ROOM_LINKS = ROOMS.map((r) => ({
    href: `/rooms#${r.id}`,
    label: `${r.name} (${r.age.replace(/\s/g, '')})`,
}));
