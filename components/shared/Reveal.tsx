'use client';

/* Reveal — a thin Framer Motion wrapper that animates its children in on scroll
   using the shared variants in lib/motion.js. Honors prefers-reduced-motion by
   rendering a plain element with no animation. Use it anywhere a section, card,
   heading or image should enter smoothly.

   Props:
     variant   — key in VARIANTS ('fadeUp' default, 'container', 'item', …)
     as        — element/tag to render ('div' default; pass motion-friendly tags)
     delay     — extra delay (seconds) layered on the variant transition
     amount    — viewport intersection ratio before triggering (default 0.2)
     once      — true = animate only the first time it enters; false (default) =
                 replay every time it re-enters, scrolling up or down
     stagger   — when true, uses the container variant and staggers children that
                 are themselves <Reveal variant="item"> (or motion elements)      */

import { motion, useReducedMotion } from 'framer-motion';
import { VARIANTS } from '@/lib/motion';

export default function Reveal({
    children,
    variant = 'fadeUp',
    as = 'div',
    delay = 0,
    amount = 0.2,
    /* false → the animation replays every time the element (re)enters the
       viewport, scrolling up or down; true → only the first time. */
    once = false,
    stagger = false,
    /* Negative bottom margin shrinks the trigger zone at the bottom of the
       viewport, so a reveal only fires once the element is genuinely on screen
       (not the moment its first pixel crosses the fold). Follows Intersection
       Observer rootMargin: "top right bottom left". */
    margin = '0px 0px -15% 0px',
    className,
    style,
    ...rest
}: any) {
    const reduced = useReducedMotion();
    const MotionTag = motion[as] || motion.div;

    if (reduced) {
        const Plain = as;
        return (
            <Plain className={className} style={style} {...rest}>
                {children}
            </Plain>
        );
    }

    const v = stagger ? VARIANTS.container : VARIANTS[variant] || VARIANTS.fadeUp;

    const transition =
        delay && v.show?.transition
            ? { ...v.show.transition, delay: (v.show.transition.delay || 0) + delay }
            : delay
            ? { delay }
            : undefined;

    return (
        <MotionTag
            className={className}
            style={style}
            variants={v}
            initial="hidden"
            whileInView="show"
            viewport={{ once, amount, margin }}
            transition={transition}
            {...rest}
        >
            {children}
        </MotionTag>
    );
}
