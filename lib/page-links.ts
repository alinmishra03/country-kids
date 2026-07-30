/* ─── PAGE DIRECTORY ─────────────────────────────────────────────────────
   The single source of truth for the "Explore More" navigator
   (components/common/PageNavigator.tsx).

   ADDING A PAGE: add one entry here and it appears in the navigator on every
   other page automatically, and excludes itself from its own. Nothing else has
   to change — no page file, no CSS.

   Order matters: it is the order the cards render in, and it deliberately
   follows the site's own information architecture (the PRIMARY_NAV order in
   lib/nav-data.ts) so a visitor meets the pages in the same sequence wherever
   they are.

   `id` MUST match the route ids in lib/routes.ts, because the navigator
   resolves the current page through routeIdFromPathname() rather than by
   string-matching the URL — that way a nested route like /rooms/koala still
   correctly hides the Rooms card.

   The summaries are drawn from each page's own hero copy and content, not
   written fresh: the card has to promise what the page actually delivers, or
   it is a bounce waiting to happen. Two lines each, present tense, no
   marketing filler.

   HOME is deliberately absent. It is the pre-entry globe experience rather
   than a content page — a visitor who wants it has the logo in the header, and
   a card promising "Home" alongside eight real destinations is noise. */

export type PageLink = {
    /** Must match a route id in lib/routes.ts. */
    id: string;
    href: string;
    /** Card heading. Matches the nav label so the two never disagree. */
    title: string;
    /** 2 lines, drawn from the page's own content. */
    summary: string;
    /** Key in components/shared/Icon.tsx. */
    icon: string;
    /** Reads as the destination when the link text alone would not — used for
        the accessible name, never shown. */
    ariaLabel: string;
};

export const PAGE_LINKS: PageLink[] = [
    {
        id: 'about',
        href: '/about',
        title: 'Our Story',
        summary:
            'How a lifetime of lessons, carried across the world, became a centre where every child belongs.',
        icon: 'book',
        ariaLabel: 'Read our story',
    },
    {
        id: 'philosophy',
        href: '/philosophy',
        title: 'Philosophy',
        summary:
            'Every child arrives capable and unique. Our role is to provide the right soil — play as the most powerful vehicle for learning we know.',
        icon: 'sprout',
        ariaLabel: 'Read our philosophy',
    },
    {
        id: 'rooms',
        href: '/rooms',
        title: 'Rooms',
        summary:
            'Seven rooms from six weeks to six years, each named for an iconic Australian animal — a place to belong at every age and stage.',
        icon: 'home',
        ariaLabel: 'Explore our seven rooms',
    },
    {
        id: 'curriculum',
        href: '/curriculum',
        title: 'Curriculum',
        summary:
            'Fifteen cards across five series, each linking everyday practice to the National Quality Standard and the VEYLDF learning outcomes.',
        icon: 'graduation',
        ariaLabel: 'Explore our curriculum',
    },
    {
        id: 'compliance',
        href: '/compliance',
        title: 'Compliance',
        summary:
            'Operating within Australia’s National Quality Framework, registered on Starting Blocks and compliant with the 2025–2026 reforms.',
        icon: 'shield',
        ariaLabel: 'See our quality and compliance record',
    },
    {
        id: 'fees',
        href: '/fees',
        title: 'Fees & CCS',
        summary:
            'Child Care Subsidy and Victorian Kinder Funding explained, including the three subsidised days per fortnight guaranteed from 2026.',
        icon: 'calculator',
        ariaLabel: 'View fees and subsidy information',
    },
    {
        id: 'families',
        href: '/families',
        title: 'Families',
        summary:
            'A child cannot be raised by a centre alone. How we keep families close, informed and part of everything we do.',
        icon: 'users',
        ariaLabel: 'See how we work with families',
    },
    {
        id: 'contact',
        href: '/contact',
        title: 'Contact',
        summary:
            'Reach our centre team directly, any weekday between 6:30am and 6:30pm, or find us in Ravenhall.',
        icon: 'mail',
        ariaLabel: 'Get in touch with us',
    },
    {
        id: 'enroll',
        href: '/enroll',
        title: 'Enrol',
        summary:
            'A simple, supported process from your first tour to your child’s first day, with our team guiding every step.',
        icon: 'clipboard-check',
        ariaLabel: 'Start the enrolment process',
    },
];

/* Per-page section heading. The brief asked for a title that fits the page
   context rather than one label repeated nine times, so each page frames the
   others in its own terms. Falls back to the generic heading for any page not
   listed, which is what keeps adding a page a one-line change. */
export const NAVIGATOR_HEADINGS: Record<string, { kicker: string; title: string }> = {
    about: { kicker: 'Keep Reading', title: 'More of the Country Kids story' },
    philosophy: { kicker: 'Keep Reading', title: 'See the philosophy in practice' },
    rooms: { kicker: 'Explore More', title: 'Beyond the rooms' },
    curriculum: { kicker: 'Explore More', title: 'How the curriculum fits together' },
    compliance: { kicker: 'Explore More', title: 'More about how we operate' },
    fees: { kicker: 'Next Steps', title: 'Everything else you may be weighing up' },
    families: { kicker: 'Explore More', title: 'More for your family' },
    contact: { kicker: 'Before You Go', title: 'Learn more about Country Kids' },
    enroll: { kicker: 'Before You Enrol', title: 'Everything worth knowing first' },
};

export const NAVIGATOR_FALLBACK = {
    kicker: 'Explore More',
    title: 'Learn more about Country Kids',
};
