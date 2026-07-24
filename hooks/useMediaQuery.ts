'use client';

/* Tiny SSR-safe matchMedia hook. Starts at `initial` (so server and first client
   render agree — no hydration mismatch), then syncs on mount and on change. */

import { useEffect, useState } from 'react';

export default function useMediaQuery(query: string, initial = false) {
    const [matches, setMatches] = useState(initial);

    useEffect(() => {
        if (typeof window === 'undefined' || !window.matchMedia) return;
        const mq = window.matchMedia(query);
        const sync = () => setMatches(mq.matches);
        sync();
        mq.addEventListener('change', sync);
        return () => mq.removeEventListener('change', sync);
    }, [query]);

    return matches;
}

/* The accessibility switch every animated component on the site reads. */
export function usePrefersReducedMotion() {
    return useMediaQuery('(prefers-reduced-motion: reduce)');
}
