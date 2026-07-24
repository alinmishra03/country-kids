/* Card photo URLs.

   Deliberately its own module with NO three.js import. The DOM focus card needs
   this helper, and if it lived in card-texture.ts (which imports three) then
   importing it from a DOM component would pull the entire 3D engine into the
   main bundle instead of the lazy canvas chunk — ~100 kB of first-load JS for
   one string builder. Keep it dependency-free. */

/* Mirrors lib/images.img(), with the smart-crop hint the card faces rely on. */
export function cardImageUrl(id: string, w = 520) {
    if (id.startsWith('/') || id.startsWith('http')) return id;
    return `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&crop=faces&w=${w}&q=62`;
}
