/* ──────────────────────────────────────────────────────────────────────────
   ROUTE MANIFEST

   Explicit list of valid routes, mirroring the reference project. `id` is the
   route id used for active-nav highlighting; `path` is the URL.
   ────────────────────────────────────────────────────────────────────────── */

export const ROUTES = [
    { id: 'home', path: '/' },
    { id: 'about', path: '/about' },
    { id: 'programs', path: '/programs' },
    { id: 'contact', path: '/contact' },
    { id: 'enroll', path: '/enroll' },
];

const BY_ID = Object.fromEntries(ROUTES.map((r) => [r.id, r]));

export function pathFor(id) {
    return BY_ID[id] ? BY_ID[id].path : '/';
}

/* Which top-level nav item highlights for a given route. */
export const NAV_GROUP_FOR_ROUTE = {
    home: 'home',
    about: 'about',
    programs: 'programs',
    contact: 'contact',
    enroll: null,
};

export function routeIdFromPathname(pathname) {
    if (!pathname || pathname === '/') return 'home';
    const slug = pathname.replace(/^\/+|\/+$/g, '');
    return BY_ID[slug] ? slug : 'home';
}
