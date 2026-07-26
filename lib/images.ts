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
    heroPoster: '1587616211892-f743fcca64f9',   // bright classroom of children
    aboutHome: '1516627145497-ae6968895b74',     // teacher with children
    pageHeroAbout: '1509062522246-3755977927d7', // colourful classroom
    pageHeroPrograms: '1526634332515-d56c5fd16991', // child with blocks
    pageHeroContact: '1503676260728-1c00da094a0b',  // teacher at board
    pageHeroEnroll: '1541692641319-981cc79ee10a',   // reading group
    contact: '1516627145497-ae6968895b74',       // welcoming teacher & kids
    enroll: '1596464716127-f2a82984de30',        // arts & crafts table
};
