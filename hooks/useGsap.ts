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

        (async () => {
            const [{ gsap }, { ScrollTrigger }] = await Promise.all([
                import('gsap'),
                import('gsap/ScrollTrigger'),
            ]);
            if (cancelled) return;
            gsap.registerPlugin(ScrollTrigger);
            ctx = gsap.context(() => build(gsap, ScrollTrigger), el);
            // Recalculate positions once images/fonts have settled.
            ScrollTrigger.refresh();
        })();

        return () => {
            cancelled = true;
            if (ctx) ctx.revert();
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, deps);
}
