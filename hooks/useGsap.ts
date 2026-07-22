'use client';

/* useGsap — lazily loads GSAP + ScrollTrigger (so they stay out of the initial
   bundle and never hurt first paint / Lighthouse), then runs `build` inside a
   gsap.context() scoped to `scopeRef`. The context is reverted on cleanup, which
   also kills any ScrollTriggers created inside it. Entirely skipped under
   prefers-reduced-motion.

   Usage:
     const scope = useRef(null);
     useGsap(scope, (gsap) => {
         gsap.to('.parallax', { yPercent: -12, scrollTrigger: { ... } });
     });
     return <section ref={scope}> … </section>;
*/

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
            const [{ gsap }, { ScrollTrigger }] = await Promise.all([
                import('gsap'),
                import('gsap/ScrollTrigger'),
            ]);
            if (cancelled) return;
            gsap.registerPlugin(ScrollTrigger);
            ctx = gsap.context(() => build(gsap, ScrollTrigger), el);

            // Trigger positions can be stale: this hook (and GSAP itself) load
            // async, images above the section stream in, and some sections mount
            // client-only WebGL below the fold — every one of these shifts layout
            // AFTER the initial measure, which can leave a `.from` reveal stuck at
            // opacity:0 because its ScrollTrigger start never lines up. Re-measure
            // once now and again after the page fully loads / settles.
            const refresh = () => {
                if (!cancelled) ScrollTrigger.refresh();
            };
            refresh();
            const t = setTimeout(refresh, 600);
            const loaded = document.readyState === 'complete';
            if (!loaded) window.addEventListener('load', refresh);
            cleanupRefresh = () => {
                clearTimeout(t);
                if (!loaded) window.removeEventListener('load', refresh);
            };
        })();

        return () => {
            cancelled = true;
            cleanupRefresh();
            if (ctx) ctx.revert();
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, deps);
}
