/* Decor — reusable organic decorative primitives for the design-language layer.
   All are purely decorative (aria-hidden), use ONLY the existing navy/gold/green
   palette tokens, sit at z-index 0/1 behind content, and go still under
   prefers-reduced-motion (see css/decor.css). Drop them inside a
   position:relative section; they never affect layout or capture pointer events.

   Usage:
     <section className="section" style={{ position: 'relative', overflow: 'hidden' }}>
       <Blob variant="gold" className="decor-tr" />
       <FloatingDots className="decor-bl" />
       …content…
       <WaveDivider position="bottom" color="var(--surface-2)" />
     </section>
*/

import type { CSSProperties } from 'react';

type Base = { className?: string; style?: CSSProperties };

/* Soft organic blob (irregular radius + blurred gradient). */
export function Blob({
    variant = 'gold',
    className = '',
    style,
}: { variant?: 'gold' | 'navy' | 'green' } & Base) {
    return <span aria-hidden="true" className={`decor-blob decor-blob--${variant} ${className}`} style={style} />;
}

/* Faded dot grid (soft radial-masked). */
export function FloatingDots({ className = '', style }: Base) {
    return <span aria-hidden="true" className={`decor-dots ${className}`} style={style} />;
}

/* A small cluster of floating outline/solid circles. */
export function FloatingCircles({ className = '', style }: Base) {
    return (
        <span aria-hidden="true" className={`decor-circles ${className}`} style={style}>
            <span />
            <span />
            <span />
        </span>
    );
}

/* Wave separator between sections. `color` should match the ADJACENT section's
   background so the wave blends into it. */
export function WaveDivider({
    position = 'bottom',
    color = 'var(--surface-2)',
    className = '',
}: { position?: 'top' | 'bottom'; color?: string; className?: string }) {
    return (
        <div aria-hidden="true" className={`decor-wave decor-wave--${position} ${className}`} style={{ color }}>
            <svg viewBox="0 0 1440 120" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
                <path
                    fill="currentColor"
                    d="M0,64 C240,120 480,8 720,40 C960,72 1200,120 1440,68 L1440,120 L0,120 Z"
                />
            </svg>
        </div>
    );
}
