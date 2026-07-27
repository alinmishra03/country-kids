/* Philosophy, Vision & Mission + the seven values that run through everything.
   Faithful to the centre's own "Rooted in Country. Flourishing Together" content. */

export const PHILOSOPHY_INTRO = {
    kicker: 'Our Philosophy & Curriculum',
    title: 'Rooted in Country. Flourishing Together',
    lead:
        'Every child is a seed of boundless potential. Just as a seed holds everything it needs to flourish, every child arrives capable, unique, and deserving of respect, care, and opportunity — our role is to provide the right soil.',
    quote:
        'Like seeds in the right soil, children thrive when they are given the freedom to explore, question, and discover. Play is not a break from learning — it is the most powerful vehicle for learning we know.',
};

/* The seven values.
   `label` and `icon` are unchanged and are what components/home/
   PhilosophyTeaser.tsx reads — the two new fields are additive and it ignores
   them.

   ── About `headline` and `text` ──
   These are NEW sentences, written for the values accordion on /philosophy,
   which opens each value onto a heading and a short paragraph. Every one is
   drawn from wording already on this page — PHILOSOPHY_INTRO and the three
   PVM blocks below — rather than invented from nothing; several are close to
   verbatim. They still say something the centre has not literally signed off,
   so they are worth a read-through before launch. */
export const VALUES = [
    {
        label: 'Respect',
        icon: 'heart-handshake',
        headline: 'Heard, safe, and free to be themselves',
        text:
            'We place children at the heart of everything we do, recognising them as active participants in their own learning — with the right to be heard, to feel safe and secure, and to express themselves freely.',
    },
    {
        label: 'Inclusion',
        icon: 'users',
        headline: 'An environment with room for every child',
        text:
            "We are committed to an inclusive, nurturing environment that respects each child's identity, culture, and individual learning needs, celebrating diversity in every room.",
    },
    {
        label: 'Belonging',
        icon: 'home',
        headline: 'Rooted in belonging, connected to Country',
        text:
            'A community where every child is rooted in belonging, connected to Country and culture, and growing with confidence into a curious, capable, and compassionate lifelong learner.',
    },
    {
        label: 'Collaboration',
        icon: 'heart',
        headline: 'Genuine partnerships with families',
        text:
            'Children learn best when the adults around them work together. We build genuine partnerships with families and community, so that what happens here and what happens at home pull in the same direction.',
    },
    {
        label: 'Continuous Growth',
        icon: 'sprout',
        headline: 'Educators who never stop learning',
        text:
            'Our educators are reflective, dedicated professionals who continually strive for excellence — never finished learning, and never finished growing.',
    },
    {
        label: 'Equity & Anti-Bias',
        icon: 'scale',
        headline: 'The highest quality care, for every child',
        text:
            'We actively promote equity and anti-bias practice so that every child, without exception, has access to the highest quality education and care.',
    },
    {
        label: 'First Nations Perspectives',
        icon: 'leaf',
        headline: 'A living foundation, not a gesture',
        text:
            'We acknowledge the Traditional Custodians of the land on which we learn and grow, and pay our deepest respects to Elders past, present, and emerging — embedding First Nations perspectives as the living foundation of everything we do.',
    },
];

export const PVM = [
    {
        id: 'philosophy',
        kicker: 'Our Philosophy Statement',
        icon: 'sprout',
        title: 'Every Child Is a Seed of Boundless Potential',
        paras: [
            'At Country Kids Learning Centre Inc., we place children at the heart of everything we do — recognising them as active participants in their own learning, with the right to be heard, to feel safe and secure, and to express themselves freely. We support children’s agency through meaningful, play-based experiences that honour who they are.',
            "We are committed to an inclusive, nurturing environment that respects each child's identity, culture, and individual learning needs — celebrating diversity and actively promoting equity and anti-bias practice so every child has access to the highest quality education and care.",
        ],
    },
    {
        id: 'vision',
        kicker: 'Our Vision',
        icon: 'sun',
        title: 'A Community Where Every Child Belongs',
        paras: [
            'A community where every child is rooted in belonging, connected to Country and culture, and growing with confidence into a curious, capable, and compassionate lifelong learner.',
            'We acknowledge the Traditional Custodians of the land on which we learn and grow, and pay our deepest respects to Elders past, present, and emerging — embedding First Nations perspectives as the living foundation of everything we do, not a once-a-year gesture.',
        ],
    },
    {
        id: 'mission',
        kicker: 'Our Mission',
        icon: 'heart-handshake',
        title: 'Providing the Right Soil to Flourish',
        paras: [
            'To provide the right soil for every child to flourish — through play-based learning, genuine partnerships with families and community, embedded First Nations perspectives, and educators who never stop reflecting, learning, and growing.',
            'Our educators are reflective, dedicated professionals who continually strive for excellence. We hold high expectations for every child, because we believe deeply in each child’s capacity to surprise, grow, and achieve remarkable things.',
        ],
    },
];

/* Headline stats shown as a count-up strip. */
export const CENTRE_STATS = [
    { number: '6wks', label: 'Youngest Age' },
    { number: '6yrs', label: 'Oldest Age' },
    { number: '5', label: 'Meals Daily' },
    { number: '100%', label: 'Qualified Educators' },
    { number: '12hrs', label: 'Open Daily' },
    { number: '7', label: 'Specialised Rooms' },
];
