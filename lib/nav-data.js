/* Nav link data — single source of truth rendered by both the desktop dropdowns
   and the mobile accordion, so the two can never drift apart. Mirrors the
   reference project's lib/nav-data.js shape. */

export const PROGRAM_LINKS = [
    { href: '/programs#infants', label: 'Infant Care (6wk–18mo)' },
    { href: '/programs#toddlers', label: 'Toddlers (18mo–3yr)' },
    { href: '/programs#preschool', label: 'Preschool (3–4yr)' },
    { href: '/programs#prek', label: 'Pre-K (4–5yr)' },
    { href: '/programs#afterschool', label: 'After-School Club' },
];

export const ABOUT_LINKS = [
    { href: '/about', label: 'Our Story' },
    { href: '/about#team', label: 'Meet the Teachers' },
    { href: '/about#safety', label: 'Health & Safety' },
    { href: '/contact', label: 'Visit & Tour' },
];

export const PHONE = '+1 (555) 264-KIDS';
export const PHONE_HREF = 'tel:+15552645437';
export const EMAIL = 'hello@countrykids.example';
