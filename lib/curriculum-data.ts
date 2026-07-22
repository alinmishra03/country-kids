/* "Five Landscapes of Country Kids" — the curriculum card deck: five series, each
   with representative practice cards. The source describes 15 cards across 5
   series, each linked to the NQS, VEYLDF/EYLF, ACECQA principles & practices,
   National Law and the 11 Victorian Child Safe Standards. */

export const CURRICULUM_INTRO = {
    kicker: 'Our Curriculum — The Card Deck',
    title: 'Five Landscapes of Country Kids',
    lead:
        'Our curriculum is a deck of 15 cards across five series — each card linking everyday practice to the National Quality Standard, the VEYLDF/EYLF outcomes, the ACECQA principles & practices, National Law, and all 11 Victorian Child Safe Standards. Select any series below, then open a card to see it in full.',
    frameworks:
        '15 cards · 5 series · NQS QA1–7 · VEYLDF O1–O5 · ACECQA 5 principles + 8 practices · National Law & Regulations · Child Safe Standards (Vic) 1–11',
};

export const CURRICULUM_SERIES = [
    {
        id: 'seeds',
        name: 'Seeds',
        icon: 'sprout',
        accent: 'gold',
        tagline: 'Where every child begins',
        blurb:
            'Secure attachment, agency and identity for our youngest learners — responsive, relationship-based practice that honours who each child already is.',
        cards: [
            { title: 'Secure Beginnings', outcome: 'VEYLDF O1 · NQS QA5', text: 'Responsive, attachment-focused care that builds a strong sense of identity from the very first day.' },
            { title: 'Voice & Agency', outcome: 'VEYLDF O2 · NQS QA1', text: "Honouring children's cues, choices and communication as active participants in their own learning." },
            { title: 'Sensory Wonder', outcome: 'VEYLDF O4 · NQS QA1', text: 'Rich, open-ended sensory experiences that spark curiosity and lay foundations for lifelong learning.' },
        ],
    },
    {
        id: 'country',
        name: 'Country',
        icon: 'leaf',
        accent: 'green',
        tagline: 'Connected to land and culture',
        blurb:
            'First Nations perspectives woven through everyday practice — story, care, and connection to Country as a living part of every day.',
        cards: [
            { title: 'Walking Together', outcome: 'Child Safe Std 1 · NQS QA6', text: 'Embedding First Nations perspectives and reconciliation as a living, everyday practice.' },
            { title: 'Story & Place', outcome: 'VEYLDF O2 · NQS QA1', text: 'Learning the creatures, seasons and stories of the Country our children belong to.' },
            { title: 'Belonging for All', outcome: 'Child Safe Std 5 · NQS QA6', text: 'Equity and anti-bias practice so every child, family and culture is seen and celebrated.' },
        ],
    },
    {
        id: 'river',
        name: 'River',
        icon: 'waves',
        accent: 'blue',
        tagline: 'Flow, movement and discovery',
        blurb:
            'Play-based inquiry that flows with children’s interests — problem-solving, movement and friendship as the truest ways to learn.',
        cards: [
            { title: 'Play as Learning', outcome: 'VEYLDF O4 · NQS QA1', text: 'Wonder, curiosity and friendship treated as the most powerful learning there is.' },
            { title: 'Inquiry in Motion', outcome: 'VEYLDF O4 · NQS QA1', text: 'Following children’s questions with intentional, responsive teaching.' },
            { title: 'Physical Confidence', outcome: 'VEYLDF O3 · NQS QA2', text: 'Active, outdoor play that builds strength, coordination and healthy habits.' },
        ],
    },
    {
        id: 'seasons',
        name: 'Seasons',
        icon: 'sun',
        accent: 'orange',
        tagline: 'Rhythm, change and growth',
        blurb:
            'Learning that turns with the year — routines, transitions and wellbeing that give children security through every change.',
        cards: [
            { title: 'Rhythms & Routines', outcome: 'VEYLDF O3 · NQS QA5', text: 'Predictable, calm routines that help children feel safe, settled and ready to grow.' },
            { title: 'Wellbeing First', outcome: 'VEYLDF O3 · NQS QA2', text: 'Nutrition, rest and emotional literacy at the heart of every day.' },
            { title: 'Gentle Transitions', outcome: 'VEYLDF O1 · NQS QA6', text: 'Thoughtful orientation and room transitions in genuine partnership with families.' },
        ],
    },
    {
        id: 'high-country',
        name: 'High Country',
        icon: 'graduation',
        accent: 'teal',
        tagline: 'Ready to leap into the world',
        blurb:
            'Funded kindergarten and school-readiness — literacy, numeracy and the confidence to step out strong.',
        cards: [
            { title: 'School Readiness', outcome: 'VEYLDF O5 · NQS QA1', text: 'Funded 3 & 4 year old kindergarten building literacy, numeracy and independence.' },
            { title: 'Confident Communicators', outcome: 'VEYLDF O5 · NQS QA1', text: 'Language-rich programs led by VIT-registered Early Childhood Teachers.' },
            { title: 'Ready to Leap', outcome: 'VEYLDF O1 · NQS QA6', text: 'Social-emotional skills for a strong, confident transition to school.' },
        ],
    },
];
