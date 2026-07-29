'use client';

/* useGsap — lazily loads GSAP + ScrollTrigger with error boundary fallback for dev mode chunk reloading. */

import { useEffect } from 'react';

export default function useGsap(scopeRef, build, deps = []) {
    useEffect(() => {
        const el = scopeRef.current;
        if (!el || typeof build !== 'function') return;

        const reduced =
            typeof window !== 'undefined' &&
            window.matchMedia &&
            window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        if (reduced) return;

        let ctx;
        let cancelled = false;
        let cleanupRefresh = () => {};

        (async () => {
            try {
                const [{ gsap }, { ScrollTrigger }] = await Promise.all([
                    import('gsap'),
                    import('gsap/ScrollTrigger'),
                ]);
                if (cancelled) return;
                gsap.registerPlugin(ScrollTrigger);
                ctx = gsap.context(() => build(gsap, ScrollTrigger), el);

                const refresh = () => {
                    if (!cancelled && ScrollTrigger) ScrollTrigger.refresh();
                };
                refresh();
                const t = setTimeout(refresh, 600);
                const loaded = document.readyState === 'complete';
                if (!loaded) window.addEventListener('load', refresh);
                cleanupRefresh = () => {
                    clearTimeout(t);
                    if (!loaded) window.removeEventListener('load', refresh);
                };
            } catch (err) {
                console.warn('[useGsap] Webpack GSAP chunk load notice:', err);
            }
        })();

        return () => {
            cancelled = true;
            cleanupRefresh();
            if (ctx) ctx.revert();
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, deps);
}
