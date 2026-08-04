/* Program (age-group) data. Rendered on the home ProgramsGrid and the
   /programs page. Single source of truth. */

export const PROGRAMS = [
    {
        id: 'infants',
        icon: 'baby',
        img: '1495131292899-bc096577e8f5',
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
        img: '1578349035260-9f3d4042f1f7',
        name: 'Preschool',
        age: '3 – 4 years',
        blurb:
            'A play-based curriculum introducing early letters, numbers and social-emotional skills to spark a lifelong love of learning.',
    },
    {
        id: 'prek',
        icon: 'graduation',
        img: '1501686637-b7aa9c48a882',
        name: 'Pre-Kindergarten',
        age: '4 – 5 years',
        blurb:
            'Kindergarten-readiness with confidence — reading foundations, STEM discovery and independence built through hands-on projects.',
    },
    {
        id: 'afterschool',
        icon: 'backpack',
        img: '1583468991267-3f068b607ae1',
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
    { icon: 'palette', label: 'Art & Crafts', img: '1607211851821-8be3cd6146f0' },
    { icon: 'blocks', label: 'Building', img: '1587654780291-39c9404d746b' },
    { icon: 'book', label: 'Story Time', img: '1599689868384-59cb2b01bb21' },
    { icon: 'bike', label: 'Active Play', img: '1593893513213-0ecc2ea282c5' },
    { icon: 'music', label: 'Music', img: '1509781827353-fb95c262fc40' },
    { icon: 'leaf', label: 'Nature', img: '1509414556967-312906f278a0' },
    { icon: 'sun', label: 'Outdoors', img: '1503454537195-1dcabb73ffb9' },
    { icon: 'calculator', label: 'Early Math', img: '1501686637-b7aa9c48a882' },
];

export const STATS = [
    { number: '15+', label: 'Years of Care' },
    { number: '480+', label: 'Happy Families' },
    { number: '1:4', label: 'Infant Ratio' },
    { number: '25', label: 'Certified Teachers' },
];
