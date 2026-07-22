/* IntersectionObserver-driven reveal for .fade-up elements. Kept as a plain
   module (not a hook) so it can also be invoked imperatively. Mirrors the
   reference project's lib/fade-ups.js. */

export function initFadeUps(root) {
    if (!root) return () => {};

    const els = root.querySelectorAll('.fade-up');
    if (!els.length) return () => {};

    const reduced =
        window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (reduced || !('IntersectionObserver' in window)) {
        els.forEach((el) => el.classList.add('fade-in'));
        return () => {};
    }

    const obs = new IntersectionObserver(
        (entries, o) => {
            entries.forEach((entry) => {
                if (!entry.isIntersecting) return;
                entry.target.classList.add('fade-in');
                o.unobserve(entry.target);
            });
        },
        { root: null, rootMargin: '0px 0px -8% 0px', threshold: 0.1 }
    );

    els.forEach((el) => obs.observe(el));
    return () => obs.disconnect();
}
