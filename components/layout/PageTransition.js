'use client';

/* Full-screen fade overlay played between route changes. Intercepts internal
   link clicks in the capture phase, waits 300ms for the fade, then routes.
   Mirrors the reference project's PageTransition. */

import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';

const TRANSITION_MS = 300;

export default function PageTransition() {
    const router = useRouter();
    const pathname = usePathname();
    const [active, setActive] = useState(false);
    const timer = useRef(null);

    useEffect(() => {
        const onClick = (e) => {
            if (e.defaultPrevented) return;
            if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;

            const a = e.target.closest('a');
            if (!a) return;

            const href = a.getAttribute('href');
            if (!href || href.startsWith('#')) return;
            if (a.target && a.target !== '_self') return;
            if (a.hasAttribute('download')) return;

            let url;
            try {
                url = new URL(a.href, window.location.href);
            } catch (err) {
                return;
            }
            if (url.origin !== window.location.origin) return;

            // Same path (possibly with a hash) — let the browser/anchor handle it.
            if (url.pathname === window.location.pathname) return;

            e.preventDefault();
            e.stopPropagation();
            setActive(true);
            clearTimeout(timer.current);
            timer.current = setTimeout(() => {
                router.push(url.pathname + url.search + url.hash);
            }, TRANSITION_MS);
        };

        document.addEventListener('click', onClick, true);
        return () => {
            document.removeEventListener('click', onClick, true);
            clearTimeout(timer.current);
        };
    }, [router]);

    useEffect(() => {
        window.scrollTo(0, 0);
        setActive(false);
    }, [pathname]);

    return <div className={`page-transition${active ? ' active' : ''}`} id="pageTransition" />;
}
