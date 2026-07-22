/* Shared Framer Motion variants — one vocabulary of entrance animations used
   across the whole site so motion feels consistent and premium. Every variant is
   opacity/transform only (never layout), and the <Reveal> wrapper disables them
   entirely under prefers-reduced-motion. */

const EASE = [0.22, 1, 0.36, 1]; // gentle "ease-out-expo" feel

export const fadeUp = {
    hidden: { opacity: 0, y: 28 },
    show: { opacity: 1, y: 0, transition: { duration: 0.7, ease: EASE } },
};

export const fadeIn = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { duration: 0.8, ease: EASE } },
};

export const slideUp = {
    hidden: { opacity: 0, y: 48 },
    show: { opacity: 1, y: 0, transition: { duration: 0.8, ease: EASE } },
};

export const slideInLeft = {
    hidden: { opacity: 0, x: -40 },
    show: { opacity: 1, x: 0, transition: { duration: 0.7, ease: EASE } },
};

export const slideInRight = {
    hidden: { opacity: 0, x: 40 },
    show: { opacity: 1, x: 0, transition: { duration: 0.7, ease: EASE } },
};

export const scaleIn = {
    hidden: { opacity: 0, scale: 0.92 },
    show: { opacity: 1, scale: 1, transition: { duration: 0.6, ease: EASE } },
};

/* Springy rise + scale — a professional "pop" for grid items / chips. */
export const popIn = {
    hidden: { opacity: 0, y: 22, scale: 0.9 },
    show: {
        opacity: 1,
        y: 0,
        scale: 1,
        transition: { duration: 0.55, ease: [0.34, 1.56, 0.64, 1] },
    },
};

/* Image reveal — a soft clip + zoom-settle. */
export const imageReveal = {
    hidden: { opacity: 0, scale: 1.08, clipPath: 'inset(12% 12% 12% 12% round 18px)' },
    show: {
        opacity: 1,
        scale: 1,
        clipPath: 'inset(0% 0% 0% 0% round 18px)',
        transition: { duration: 0.9, ease: EASE },
    },
};

/* Stagger container + item — spread <Reveal variant="item"> children inside a
   <Reveal variant="container">. */
export const staggerContainer = {
    hidden: {},
    show: { transition: { staggerChildren: 0.1, delayChildren: 0.05 } },
};

export const staggerItem = fadeUp;

export const VARIANTS = {
    fadeUp,
    fadeIn,
    slideUp,
    slideInLeft,
    slideInRight,
    scaleIn,
    popIn,
    imageReveal,
    container: staggerContainer,
    item: staggerItem,
};

export const EASE_OUT = EASE;
