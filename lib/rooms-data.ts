/* The seven purpose-named rooms. Each is named after an iconic Australian animal.
   `icon` maps to components/shared/Icon.js; `accent` is a theme key used to tint
   the card (maps to CSS classes .accent-*); `img` is an Unsplash id (see
   lib/images.js). Content is faithful to the centre's own descriptions. */

export const ROOMS = [
    {
        id: 'joey',
        name: 'Joey Room',
        animal: 'Joey — Baby Kangaroo',
        age: '0 – 1 Year',
        stage: 'Infants',
        icon: 'baby',
        accent: 'gold',
        img: '1519689680058-324335c77eba',
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
        img: '1560785496-3c9d27877182',
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
        img: '1544005313-94ddf0286df2',
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
        img: '1541692641319-981cc79ee10a',
        blurb:
            'Strong, fast and ready to leap into the world. The Kangaroo Room delivers our funded 4-year-old kindergarten program — 15 hours per week — developing literacy, numeracy and the social-emotional skills needed for a confident school transition.',
    },
    {
        id: 'emu',
        name: 'Emu Room',
        animal: 'Emu',
        age: '3 – 5 Years',
        stage: 'Integrated Learning',
        icon: 'egg',
        accent: 'green',
        img: '1587616211892-f743fcca64f9',
        blurb:
            "Australia's tallest bird — strong, curious and never able to fly backwards. The Emu Room is our flexible integrated learning space for 3–5 year olds, supporting mixed-age groups, children with additional needs, and specialised learning programs.",
    },
];

/* Compact list used by nav dropdowns and the footer. */
export const ROOM_LINKS = ROOMS.map((r) => ({
    href: `/rooms#${r.id}`,
    label: `${r.name} (${r.age.replace(/\s/g, '')})`,
}));
