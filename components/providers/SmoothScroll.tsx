'use client';

/* Site-wide smooth scrolling: Lenis, driven by GSAP's ticker and wired into
   ScrollTrigger.

   The three lines that actually matter, and why:

     lenis.on('scroll', ScrollTrigger.update)
        Lenis moves the page with a transform-free scroll of its own, so
        ScrollTrigger's native scroll listener never fires at the right moment.
        Without this every scrub and pin lags a frame or more behind the page.

     gsap.ticker.add(t => lenis.raf(t * 1000))
        One rAF loop for both libraries instead of two competing ones. GSAP's
        ticker is already running; giving Lenis the same heartbeat is what keeps
        scrubbed animations locked to the scroll position rather than jittering
        between two clocks. (GSAP's ticker reports seconds; Lenis wants ms.)

     gsap.ticker.lagSmoothing(0)
        GSAP normally "catches up" after a slow frame by faking elapsed time.
        With a scroll-driven timeline that produces a visible jump. Disabling it
        keeps scroll and animation in lockstep.

   ACCESSIBILITY — the whole thing is skipped under prefers-reduced-motion, and
   the page falls back to plain native scrolling. Touch devices keep native
   scrolling too: hijacking momentum on a phone reliably feels worse than the
   platform's own, and it breaks pull-to-refresh and the URL-bar collapse.

   Everything loads dynamically, so Lenis and ScrollTrigger stay out of the
   initial bundle. */

import { useEffect } from 'react';
import { setLenis, scrollTo } from '@/lib/smooth-scroll';

export default function SmoothScroll() {
    useEffect(() => {
        if (typeof window === 'undefined') return;

        const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        /* Coarse pointer === touch. Native scrolling wins there. */
        const coarse = window.matchMedia('(pointer: coarse)').matches;
        if (reduced || coarse) return;

        let cancelled = false;
        let lenis: any = null;
        let tickerFn: ((time: number) => void) | null = null;
        let gsapRef: any = null;
        let stopAnchors = () => {};

        (async () => {
            const [{ default: Lenis }, { gsap }, { ScrollTrigger }] = await Promise.all([
                import('lenis'),
                import('gsap'),
                import('gsap/ScrollTrigger'),
            ]);
            if (cancelled) return;

            gsap.registerPlugin(ScrollTrigger);
            gsapRef = gsap;

            lenis = new Lenis({
                duration: 1.05,
                /* Exponential ease-out — long tail, no visible settle step. */
                easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
                smoothWheel: true,
                /* Leave touch alone; see the note above. */
                syncTouch: false,
                wheelMultiplier: 1,
                touchMultiplier: 1.6,
            });

            setLenis(lenis);
            /* Disables `html { scroll-behavior: smooth }`, which would otherwise
               fight Lenis for control of every programmatic scroll. */
            document.documentElement.classList.add('lenis-active');

            lenis.on('scroll', ScrollTrigger.update);

            tickerFn = (time: number) => lenis.raf(time * 1000);
            gsap.ticker.add(tickerFn);
            gsap.ticker.lagSmoothing(0);

            /* In-page anchors have to be routed through Lenis or they jump
               instantly and yank the smooth loop to a new position. */
            const onAnchorClick = (e: MouseEvent) => {
                if (e.defaultPrevented || e.button !== 0) return;
                if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;

                const link = (e.target as HTMLElement)?.closest?.('a');
                if (!link) return;

                const href = link.getAttribute('href');
                if (!href || !href.startsWith('#') || href === '#') return;

                const target = document.querySelector(href);
                if (!target) return;

                e.preventDefault();
                /* Offset by the fixed header so the target is not hidden under it. */
                const navHeight =
                    parseInt(
                        getComputedStyle(document.documentElement).getPropertyValue('--nav-h'),
                        10
                    ) || 80;
                scrollTo(target as HTMLElement, -navHeight - 16);
                history.pushState(null, '', href);
            };

            document.addEventListener('click', onAnchorClick);
            stopAnchors = () => document.removeEventListener('click', onAnchorClick);

            /* Fonts and lazy images change document height after first measure. */
            const refresh = () => ScrollTrigger.refresh();
            const settle = window.setTimeout(refresh, 700);
            window.addEventListener('load', refresh);

            const prevStop = stopAnchors;
            stopAnchors = () => {
                prevStop();
                window.clearTimeout(settle);
                window.removeEventListener('load', refresh);
            };
        })();

        return () => {
            cancelled = true;
            stopAnchors();
            if (gsapRef && tickerFn) gsapRef.ticker.remove(tickerFn);
            if (lenis) lenis.destroy();
            setLenis(null);
            document.documentElement.classList.remove('lenis-active');
        };
    }, []);

    return null;
}
