/* Site-wide facts for Country Kids Learning Centre Inc — a single source of truth
   for contact details, opening hours, socials and the Acknowledgement of Country.
   Every value comes from the centre's own content. The email address was
   obfuscated in the source and is a sensible PLACEHOLDER until confirmed. */

export const SITE = {
    name: 'Country Kids',
    legalName: 'Country Kids Learning Centre Inc',
    tagline: 'Where Every Child Belongs',
    kicker: 'Rooted in Country. Flourishing Together.',
    established: 2026,
    suburb: 'Ravenhall',
    state: 'Victoria',
};

export const PHONE = '03 9360 5409';
export const PHONE_HREF = 'tel:+61393605409';
export const EMAIL = 'hello@countrykidslearning.org.au'; // placeholder — confirm
export const EMAIL_HREF = 'mailto:hello@countrykidslearning.org.au';

export const ADDRESS = {
    line1: '3 Nexus Street',
    line2: 'Ravenhall VIC 3023',
    full: '3 Nexus Street, Ravenhall VIC 3023',
    mapsHref:
        'https://www.google.com/maps/search/?api=1&query=3+Nexus+Street+Ravenhall+VIC+3023',
};

export const HOURS = [
    { day: 'Monday', time: '6:30am – 6:30pm', open: true },
    { day: 'Tuesday', time: '6:30am – 6:30pm', open: true },
    { day: 'Wednesday', time: '6:30am – 6:30pm', open: true },
    { day: 'Thursday', time: '6:30am – 6:30pm', open: true },
    { day: 'Friday', time: '6:30am – 6:30pm', open: true },
    { day: 'Saturday', time: 'Closed', open: false },
    { day: 'Sunday', time: 'Closed', open: false },
    { day: 'Public Holidays', time: 'Closed', open: false },
];

export const SOCIALS = [
    { label: 'Facebook', brand: 'facebook', href: '#' },
    { label: 'Instagram', brand: 'instagram', href: '#' },
    { label: 'TikTok', brand: 'tiktok', href: '#' },
];

/* Trust badges shown in the hero, compliance strip and footer. */
export const TRUST_BADGES = [
    'NQF Approved Provider',
    'Victorian Kinder Funding',
    'Child Safe Organisation',
    'Not-for-Profit Organisation',
    'National Worker Register Compliant',
];

export const ACKNOWLEDGEMENT =
    'Country Kids Learning Centre Inc respectfully acknowledges the Traditional Custodians of the land on which our centre is located, the Wurundjeri Woi Wurrung people of the Kulin Nation. We pay our respects to their Elders past, present and emerging, and recognise their enduring connection to land, waters and culture.';

export const STARTING_BLOCKS_HREF = 'https://www.startingblocks.gov.au';
