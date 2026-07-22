/* ──────────────────────────────────────────────────────────────────────────
   ROUTE MANIFEST

   Explicit list of valid routes. `id` is the route id used for active-nav
   highlighting; `path` is the URL. The nav mirrors the source site:
   Our Story · Philosophy · Rooms · Curriculum · Compliance · Fees & CCS ·
   Families · Contact · Enrol Now.
   ────────────────────────────────────────────────────────────────────────── */

export const ROUTES = [
    { id: 'home', path: '/' },
    { id: 'about', path: '/about' },        // Our Story
    { id: 'philosophy', path: '/philosophy' },
    { id: 'rooms', path: '/rooms' },
    { id: 'curriculum', path: '/curriculum' },
    { id: 'compliance', path: '/compliance' },
    { id: 'fees', path: '/fees' },
    { id: 'families', path: '/families' },
    { id: 'contact', path: '/contact' },
    { id: 'enroll', path: '/enroll' },
];

const BY_ID = Object.fromEntries(ROUTES.map((r) => [r.id, r]));

export function pathFor(id) {
    return BY_ID[id] ? BY_ID[id].path : '/';
}

/* Which top-level nav item highlights for a given route. The enrol CTA is not a
   highlighted nav group. */
export const NAV_GROUP_FOR_ROUTE = {
    home: 'home',
    about: 'about',
    philosophy: 'philosophy',
    rooms: 'rooms',
    curriculum: 'curriculum',
    compliance: 'compliance',
    fees: 'fees',
    families: 'families',
    contact: 'contact',
    enroll: null,
};

export function routeIdFromPathname(pathname) {
    if (!pathname || pathname === '/') return 'home';
    const slug = pathname.replace(/^\/+|\/+$/g, '');
    return BY_ID[slug] ? slug : 'home';
}
