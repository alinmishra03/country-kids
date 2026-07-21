'use client';

/* The .page wrapper every route renders. Applies .fx-page-in on mount (skipped
   under prefers-reduced-motion) to drive the staggered section entrance, and
   runs useAnimations so every route gets the scroll-reveal / image-fade layer.
   innerRef is exposed so page-level hooks can scope queries to this element.
   Mirrors the reference project's shared/Page.js. */

import { useEffect, useRef, useState } from 'react';
import useAnimations from '@/hooks/useAnimations';

export default function Page({ id, children, innerRef }) {
    const [animate, setAnimate] = useState(false);
    const localRef = useRef(null);

    const setRef = (node) => {
        localRef.current = node;
        if (innerRef) innerRef.current = node;
    };

    useAnimations(localRef);

    useEffect(() => {
        const reduced =
            window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        if (!reduced) setAnimate(true);
    }, []);

    return (
        <div ref={setRef} className={`page active${animate ? ' fx-page-in' : ''}`} id={`page-${id}`}>
            {children}
        </div>
    );
}
