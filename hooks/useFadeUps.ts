'use client';

/* React wrapper around lib/fade-ups.js. Scoped to the page root and disconnects
   on unmount. Mirrors the reference project. */

import { useEffect } from 'react';
import { initFadeUps } from '@/lib/fade-ups';

export default function useFadeUps(rootRef) {
    useEffect(() => initFadeUps(rootRef.current), [rootRef]);
}
