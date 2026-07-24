/* Where each card sits on the globe, and the angle maths the controls need.

   Cards are laid out in latitude BANDS rather than on a Fibonacci spiral. That
   is a deliberate trade: a spiral distributes more evenly, but bands give every
   card a well-defined azimuth, which is what makes "snap to the nearest card"
   and "rotate this card to front centre" exact instead of approximate. Odd
   bands are offset half a column so the result still reads as an organic ball
   rather than a grid wrapped round a cylinder. */

import { GLOBE } from '@/lib/hero/hero-config';

export const TAU = Math.PI * 2;

export type CardSlot = {
    index: number;
    col: number;
    row: number;
    /** Angle around Y, radians. 0 = facing the camera when rotation is 0. */
    azimuth: number;
    /** World position on the sphere. */
    position: [number, number, number];
    /** Phase offset so the idle bob is desynchronised card to card. */
    floatPhase: number;
};

/* Build one slot per card. `count` may be lower than columns × rows (a short
   final band is simply left unfilled) but never higher. */
export function buildSlots(count: number): CardSlot[] {
    const { columns, radius, latitude, stagger } = GLOBE;
    /* Widened from the config's literal type — the single-band case below is a
       real branch, not dead code, if the rig is ever re-tuned to one ring. */
    const rows: number = GLOBE.rows;
    const latRad = (latitude * Math.PI) / 180;
    const slots: CardSlot[] = [];

    for (let i = 0; i < count; i++) {
        const row = Math.floor(i / columns);
        const col = i % columns;
        if (row >= rows) break;

        /* Rows spread from +latitude (top) to −latitude (bottom). A single row
           sits on the equator. */
        const t = rows === 1 ? 0 : row / (rows - 1);       // 0 … 1
        const lat = latRad - t * (2 * latRad);              // +lat … −lat

        const bandRadius = radius * Math.cos(lat);
        const y = radius * Math.sin(lat);

        const half = stagger && row % 2 === 1 ? TAU / columns / 2 : 0;
        const azimuth = (col / columns) * TAU + half;

        slots.push({
            index: i,
            col,
            row,
            azimuth,
            /* az measured from +Z, so azimuth 0 puts the card nearest the camera. */
            position: [
                bandRadius * Math.sin(azimuth),
                y,
                bandRadius * Math.cos(azimuth),
            ],
            floatPhase: i * 1.37,
        });
    }

    return slots;
}

/* Every distinct azimuth on the globe, sorted — the set the globe snaps to. */
export function snapAngles(slots: CardSlot[]): number[] {
    const set = new Set(slots.map((s) => Number(s.azimuth.toFixed(5))));
    return Array.from(set).sort((a, b) => a - b);
}

/* Wrap an angle into (−π, π]. Used everywhere a rotation has to take the SHORT
   way round — without it, a snap from 350° to 10° spins the long way. */
export function shortestAngle(delta: number) {
    let d = delta % TAU;
    if (d > Math.PI) d -= TAU;
    if (d < -Math.PI) d += TAU;
    return d;
}

/* The globe rotation that brings `azimuth` to front centre.
   A card's world angle is (azimuth + rotationY); front centre is 0. */
export function rotationForAzimuth(azimuth: number, from: number) {
    return from + shortestAngle(-azimuth - from);
}

/* Nearest snap target to the current rotation, taking the short way round. */
export function nearestSnap(rotationY: number, angles: number[]) {
    let best = rotationY;
    let bestDist = Infinity;

    for (const a of angles) {
        const target = rotationForAzimuth(a, rotationY);
        const dist = Math.abs(target - rotationY);
        if (dist < bestDist) {
            bestDist = dist;
            best = target;
        }
    }
    return best;
}

/* Which card is currently closest to front centre — drives the overlay's
   "now showing" state and the prev/next keyboard controls. */
export function frontIndex(rotationY: number, slots: CardSlot[]) {
    let best = 0;
    let bestDist = Infinity;

    for (const s of slots) {
        const dist = Math.abs(shortestAngle(s.azimuth + rotationY));
        if (dist < bestDist) {
            bestDist = dist;
            best = s.index;
        }
    }
    return best;
}
