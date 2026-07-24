'use client';

/* Route transition: a brand-coloured panel wipes across, the route changes
   behind it, then it wipes away.

   WHY IT DOES NOT FLASH — the old version faded a translucent overlay in, then
   let it disappear the instant the new pathname landed. That leaves a frame or
   two of bare page between the two routes, which reads as a white blink. Here:

     · the panel is OPAQUE and covers the viewport before the route is pushed,
       so the swap itself is never visible;
     · on the new route the panel is still covering, and only then wipes out —
       an exit that starts from a known covered state rather than racing the
       first paint;
     · the scroll reset happens while covered, and goes through Lenis so the
       smooth-scroll loop is not left pointing at the old offset.

   The link interception is unchanged from the previous version: capture-phase,
   same-origin, honours modifier keys, downloads, targets and in-page hashes. */

import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { jumpToTop } from '@/lib/smooth-scroll';

/* Must match the transition durations in css/motion-system.css. */
const COVER_MS = 520;
const CLEAR_MS = 620;

type Phase = 'idle' | 'covering' | 'clearing';

export default function PageTransition() {
    const router = useRouter();
    const pathname = usePathname();
    const [phase, setPhase] = useState<Phase>('idle');
    const timer = useRef<any>(null);
    /* Guards the very first render: there is no transition to play on load. */
    const mounted = useRef(false);

    useEffect(() => {
        const onClick = (e: any) => {
            if (e.defaultPrevented) return;
            if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;

            const a = e.target.closest?.('a');
            if (!a) return;

            const href = a.getAttribute('href');
            if (!href || href.startsWith('#')) return;
            if (a.target && a.target !== '_self') return;
            if (a.hasAttribute('download')) return;

            let url;
            try {
                url = new URL(a.href, window.location.href);
            } catch {
                return;
            }
            if (url.origin !== window.location.origin) return;
            /* Same path (possibly with a hash) — let the anchor handler take it. */
            if (url.pathname === window.location.pathname) return;

            e.preventDefault();
            e.stopPropagation();

            setPhase('covering');
            clearTimeout(timer.current);
            /* Push only once the panel has actually covered the viewport. */
            timer.current = setTimeout(() => {
                router.push(url.pathname + url.search + url.hash);
            }, COVER_MS);
        };

        document.addEventListener('click', onClick, true);
        return () => {
            document.removeEventListener('click', onClick, true);
            clearTimeout(timer.current);
        };
    }, [router]);

    /* New route has rendered underneath the panel — reset scroll, then wipe. */
    useEffect(() => {
        if (!mounted.current) {
            mounted.current = true;
            return;
        }

        jumpToTop();
        setPhase('clearing');

        clearTimeout(timer.current);
        timer.current = setTimeout(() => setPhase('idle'), CLEAR_MS);
        return () => clearTimeout(timer.current);
    }, [pathname]);

    return (
        <div
            className={`page-transition is-${phase}`}
            id="pageTransition"
            aria-hidden="true"
            role="presentation"
        >
            <span className="page-transition-mark" />
        </div>
    );
}
