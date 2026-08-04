/* Central image source. One place to manage every photo on the site so the look
   stays consistent and swapping a picture is a one-line change. All URLs point at
   Unsplash's on-the-fly CDN (auto format + crop), so images arrive already
   optimized and correctly sized per use. Drop-in local replacements: put a file
   in /public/images and pass its path instead of an id to <img src>. */

const BASE = 'https://images.unsplash.com/photo-';

/* Build a sized, optimized image URL from an Unsplash photo id. */
export function img(id, w = 800, q = 60) {
    // Already a local/absolute path? return as-is.
    if (id.startsWith('/') || id.startsWith('http')) return id;
    return `${BASE}${id}?auto=format&fit=crop&w=${w}&q=${q}`;
}

/* As img(), but asks for an EXACT w×h crop rather than the photo's own ratio.
   Editorial layouts pin a frame to a known aspect and cover-fit inside it, so
   letting the CDN do the crop means the bytes that arrive are the bytes that
   are shown — no downloading a tall photo to display a letterbox strip of it.
   Local paths still pass straight through. */
export function crop(id, w = 1200, h = 900, q = 68) {
    if (id.startsWith('/') || id.startsWith('http')) return id;
    return `${BASE}${id}?auto=format&fit=crop&crop=entropy&w=${w}&h=${h}&q=${q}`;
}

/* Named photos used by page heroes and standalone sections (all verified). */
export const PHOTOS = {
    heroPoster: '1613794713137-a78aba4be84a',    // three children in the sandpit
    aboutHome: '1583468991267-3f068b607ae1',     // educator reading with a child
    pageHeroAbout: '1567746455504-cb3213f8f5b8', // bright early learning room
    pageHeroPrograms: '1761208663763-c4d30657c910', // children building together
    pageHeroContact: '1616089804390-b2daa80dbf02',  // educator with young children
    pageHeroEnroll: '1599689868384-59cb2b01bb21',   // child absorbed in a book
    contact: '1583468991267-3f068b607ae1',       // educator reading with a child
    enroll: '1596464716127-f2a82984de30',        // arts & crafts table
};
