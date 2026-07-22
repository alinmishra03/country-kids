/* Nav link data — single source of truth rendered by both the desktop nav and
   the mobile menu, so the two can never drift apart. The primary nav mirrors the
   source site's information architecture (flat items). "Rooms" additionally
   exposes a dropdown of the seven rooms as a premium enhancement. */

import { ROOM_LINKS } from '@/lib/rooms-data';

/* Primary top-level nav (flat, matching the source). An item with `children`
   also renders a dropdown; `group` lists the route ids it should highlight for. */
type NavChild = { href: string; label: string };
type NavItem = { id: string; href: string; label: string; children?: NavChild[] };

export const PRIMARY_NAV: NavItem[] = [
    { id: 'about', href: '/about', label: 'Our Story' },
    { id: 'philosophy', href: '/philosophy', label: 'Philosophy' },
    { id: 'rooms', href: '/rooms', label: 'Rooms', children: ROOM_LINKS },
    { id: 'curriculum', href: '/curriculum', label: 'Curriculum' },
    { id: 'compliance', href: '/compliance', label: 'Compliance' },
    { id: 'fees', href: '/fees', label: 'Fees & CCS' },
    { id: 'families', href: '/families', label: 'Families' },
    { id: 'contact', href: '/contact', label: 'Contact' },
];

/* Re-exported for the footer / rooms dropdown. */
export { ROOM_LINKS };

/* Kept for backwards-compat with any older imports. */
export { PHONE, PHONE_HREF, EMAIL, EMAIL_HREF } from '@/lib/site-data';
