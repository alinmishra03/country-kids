'use client';

/* Counts numeric stat labels up from 0 when they scroll into view. Preserves any
   non-digit suffix/prefix (e.g. "480+", "1:4"). Skipped under reduced motion. */

import { useEffect } from 'react';

export default function useCountUp(rootRef) {
    useEffect(() => {
        const root = rootRef.current;
        if (!root) return;

        const reduced =
            window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

        const nums = root.querySelectorAll('.stat-number[data-count]');
        if (!nums.length) return;

        if (reduced || !('IntersectionObserver' in window)) {
            nums.forEach((n) => (n.textContent = n.dataset.count));
            return;
        }

        const animate = (el) => {
            const raw = el.dataset.count;
            const match = raw.match(/\d+/);
            if (!match) {
                el.textContent = raw;
                return;
            }
            const target = parseInt(match[0], 10);
            const suffix = raw.slice(match.index + match[0].length);
            const prefix = raw.slice(0, match.index);
            const duration = 1200;
            const start = performance.now();
            const step = (now) => {
                const p = Math.min((now - start) / duration, 1);
                const eased = 1 - Math.pow(1 - p, 3);
                el.textContent = prefix + Math.round(target * eased) + suffix;
                if (p < 1) requestAnimationFrame(step);
            };
            requestAnimationFrame(step);
        };

        const obs = new IntersectionObserver(
            (entries, o) => {
                entries.forEach((entry) => {
                    if (!entry.isIntersecting) return;
                    animate(entry.target);
                    o.unobserve(entry.target);
                });
            },
            { threshold: 0.4 }
        );
        nums.forEach((n) => obs.observe(n));
        return () => obs.disconnect();
    }, [rootRef]);
}
