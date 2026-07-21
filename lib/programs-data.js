/* Program (age-group) data. Rendered on the home ProgramsGrid and the
   /programs page. Single source of truth. */

export const PROGRAMS = [
    {
        id: 'infants',
        icon: '\u{1F476}',
        name: 'Infant Care',
        age: '6 weeks – 18 months',
        blurb:
            'Nurturing one-on-one care with feeding, napping and sensory play on your baby’s own schedule. Daily photo & report updates for every parent.',
    },
    {
        id: 'toddlers',
        icon: '\u{1F9F8}',
        name: 'Toddlers',
        age: '18 months – 3 years',
        blurb:
            'Busy little explorers build language, motor skills and friendships through music, art and plenty of joyful, supervised free play.',
    },
    {
        id: 'preschool',
        icon: '\u{1F3A8}',
        name: 'Preschool',
        age: '3 – 4 years',
        blurb:
            'A play-based curriculum introducing early letters, numbers and social-emotional skills to spark a lifelong love of learning.',
    },
    {
        id: 'prek',
        icon: '\u{1F393}',
        name: 'Pre-Kindergarten',
        age: '4 – 5 years',
        blurb:
            'Kindergarten-readiness with confidence — reading foundations, STEM discovery and independence built through hands-on projects.',
    },
    {
        id: 'afterschool',
        icon: '\u{26BD}',
        name: 'After-School Club',
        age: '5 – 10 years',
        blurb:
            'Homework help, healthy snacks, sports and enrichment clubs in a safe, supervised space until you finish your workday.',
    },
    {
        id: 'summer',
        icon: '\u{2600}\u{FE0F}',
        name: 'Summer Camp',
        age: '3 – 10 years',
        blurb:
            'Themed weeks of splash days, field trips, science and crafts keep summer full of adventure and brand-new friends.',
    },
];

export const FEATURES = [
    { icon: '\u{1F6E1}\u{FE0F}', title: 'Safe & Secure', text: 'Keypad entry, CCTV, and background-checked staff keep every child protected.' },
    { icon: '\u{1F34E}', title: 'Healthy Meals', text: 'Freshly prepared, nut-free breakfast, lunch and snacks planned by a nutritionist.' },
    { icon: '\u{1F9D1}\u{200D}\u{1F3EB}', title: 'Caring Teachers', text: 'Certified early-childhood educators with low child-to-teacher ratios.' },
    { icon: '\u{1F4F1}', title: 'Daily Updates', text: 'Photos, meals, naps and milestones sent straight to your phone every day.' },
];

export const STATS = [
    { number: '15+', label: 'Years of Care' },
    { number: '480+', label: 'Happy Families' },
    { number: '1:4', label: 'Infant Ratio' },
    { number: '25', label: 'Certified Teachers' },
];
