/* Program (age-group) data. Rendered on the home ProgramsGrid and the
   /programs page. Single source of truth. */

export const PROGRAMS = [
    {
        id: 'infants',
        icon: 'baby',
        img: '1519689680058-324335c77eba',
        name: 'Infant Care',
        age: '6 weeks – 18 months',
        blurb:
            'Nurturing one-on-one care with feeding, napping and sensory play on your baby’s own schedule. Daily photo & report updates for every parent.',
    },
    {
        id: 'toddlers',
        icon: 'blocks',
        img: '1526634332515-d56c5fd16991',
        name: 'Toddlers',
        age: '18 months – 3 years',
        blurb:
            'Busy little explorers build language, motor skills and friendships through music, art and plenty of joyful, supervised free play.',
    },
    {
        id: 'preschool',
        icon: 'palette',
        img: '1560785496-3c9d27877182',
        name: 'Preschool',
        age: '3 – 4 years',
        blurb:
            'A play-based curriculum introducing early letters, numbers and social-emotional skills to spark a lifelong love of learning.',
    },
    {
        id: 'prek',
        icon: 'graduation',
        img: '1541692641319-981cc79ee10a',
        name: 'Pre-Kindergarten',
        age: '4 – 5 years',
        blurb:
            'Kindergarten-readiness with confidence — reading foundations, STEM discovery and independence built through hands-on projects.',
    },
    {
        id: 'afterschool',
        icon: 'backpack',
        img: '1516627145497-ae6968895b74',
        name: 'After-School Club',
        age: '5 – 10 years',
        blurb:
            'Homework help, healthy snacks, sports and enrichment clubs in a safe, supervised space until you finish your workday.',
    },
    {
        id: 'summer',
        icon: 'sun',
        img: '1472162072942-cd5147eb3902',
        name: 'Summer Camp',
        age: '3 – 10 years',
        blurb:
            'Themed weeks of splash days, field trips, science and crafts keep summer full of adventure and brand-new friends.',
    },
];

export const FEATURES = [
    { icon: 'shield', title: 'Safe & Secure', text: 'Keypad entry, CCTV, and background-checked staff keep every child protected.' },
    { icon: 'apple', title: 'Healthy Meals', text: 'Freshly prepared, nut-free breakfast, lunch and snacks planned by a nutritionist.' },
    { icon: 'users', title: 'Caring Teachers', text: 'Certified early-childhood educators with low child-to-teacher ratios.' },
    { icon: 'smartphone', title: 'Daily Updates', text: 'Photos, meals, naps and milestones sent straight to your phone every day.' },
];

/* Home gallery — icon-led activity tiles (replaces the old emoji placeholders).
   Each tile pairs a Lucide activity icon with a short caption. */
export const GALLERY = [
    { icon: 'palette', label: 'Art & Crafts', img: '1596464716127-f2a82984de30' },
    { icon: 'blocks', label: 'Building', img: '1587654780291-39c9404d746b' },
    { icon: 'book', label: 'Story Time', img: '1481627834876-b7833e8f5570' },
    { icon: 'bike', label: 'Active Play', img: '1503919545889-aef636e10ad4' },
    { icon: 'music', label: 'Music', img: '1445633629932-0029acc44e88' },
    { icon: 'leaf', label: 'Nature', img: '1444703686981-a3abbc4d4fe3' },
    { icon: 'sun', label: 'Outdoors', img: '1503454537195-1dcabb73ffb9' },
    { icon: 'calculator', label: 'Early Math', img: '1509228468518-180dd4864904' },
];

export const STATS = [
    { number: '15+', label: 'Years of Care' },
    { number: '480+', label: 'Happy Families' },
    { number: '1:4', label: 'Infant Ratio' },
    { number: '25', label: 'Certified Teachers' },
];
