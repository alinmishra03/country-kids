'use client';

/* Branded loading state for the globe.

   It sits over the canvas, not over the hero copy — the headline, description
   and CTAs are real DOM and are readable and clickable from the first paint, so
   the page is never blocked on WebGL. The loader only covers the area the globe
   is about to occupy. */

import { useEffect, useRef, useState } from 'react';

export default function Loader({ progress, ready }: { progress: number; ready: boolean }) {
    const [hidden, setHidden] = useState(false);
    const timer = useRef<number | undefined>(undefined);

    /* Hold the element in the tree until the fade-out has finished, so the
       transition actually plays instead of the node vanishing mid-way. */
    useEffect(() => {
        if (!ready) return;
        timer.current = window.setTimeout(() => setHidden(true), 700);
        return () => window.clearTimeout(timer.current);
    }, [ready]);

    if (hidden) return null;

    const percent = Math.round(Math.min(1, progress) * 100);

    return (
        <div
            className={`hero-loader${ready ? ' is-done' : ''}`}
            role="status"
            aria-live="polite"
            aria-label={ready ? 'Ready' : `Loading, ${percent} percent`}
        >
            <div className="hero-loader-inner">
                <span className="hero-loader-mark" aria-hidden="true" />
                <span className="hero-loader-bar" aria-hidden="true">
                    <span style={{ transform: `scaleX(${Math.min(1, progress)})` }} />
                </span>
                <span className="hero-loader-text">{percent}%</span>
            </div>
        </div>
    );
}
