/* Singleton handle on the Lenis instance.

   The provider owns the lifecycle; everything else (page transitions, anchor
   links, "scroll to next section" affordances) reaches the instance through
   here. Kept in a module rather than React context on purpose: the consumers
   are mostly imperative event handlers, and a context would force them to be
   components. */

type LenisLike = {
    raf: (time: number) => void;
    scrollTo: (target: any, options?: any) => void;
    destroy: () => void;
    on: (event: string, handler: (...args: any[]) => void) => void;
    resize: () => void;
};

let instance: LenisLike | null = null;

export function setLenis(next: LenisLike | null) {
    instance = next;
}

export function getLenis() {
    return instance;
}

/* Jump to the top with no animation — what a route change wants. Falls back to
   the native call when smooth scrolling is off (reduced motion, or before the
   provider has finished loading). */
export function jumpToTop() {
    if (instance) {
        instance.scrollTo(0, { immediate: true });
        return;
    }
    window.scrollTo(0, 0);
}

/* Smoothly scroll to an element or offset. Used by in-page anchor links, which
   would otherwise jump instantly and fight the smooth-scroll loop. */
export function scrollTo(target: string | number | HTMLElement, offset = 0) {
    if (instance) {
        instance.scrollTo(target, { offset, duration: 1.2 });
        return;
    }
    if (typeof target === 'number') {
        window.scrollTo({ top: target, behavior: 'smooth' });
    } else if (typeof target !== 'string') {
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
}
