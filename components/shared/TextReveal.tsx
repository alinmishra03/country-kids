'use client';

/* TextReveal — masked, word-by-word heading reveal.

   Each word sits in an overflow-hidden box with the word itself translated
   below it; on entry the words slide up out of their masks on a stagger. It is
   the SplitText look without the plugin, and without the two problems a
   DOM-mutating splitter has:

     · The split happens at RENDER time, not in an effect. The words are in the
       server HTML, so the heading is complete for crawlers and for anyone with
       JS off — nothing is injected after paint, and there is no layout shift.
     · Markup inside the heading survives. The splitter walks React children
       recursively, so a <span> highlight or an <em> inside a title keeps its
       element (and its styling) while its text still splits into words.

   Descenders are the classic trap here: an overflow-hidden box clipped to the
   line box shears the tails off g, y and p. The mask carries bottom padding and
   an equal negative margin (see css/motion-system.css) so the box is taller
   than the glyphs without affecting layout.

   Reduced motion renders the plain element with no wrappers at all. */

import { Children, cloneElement, isValidElement, type ReactNode } from 'react';
import { motion, useReducedMotion } from 'framer-motion';

const EASE = [0.22, 1, 0.36, 1] as const;

const container = (stagger: number, delay: number) => ({
    hidden: {},
    show: { transition: { staggerChildren: stagger, delayChildren: delay } },
});

const word = {
    hidden: { y: '110%' },
    show: { y: '0%', transition: { duration: 0.85, ease: EASE } },
};

type Props = {
    children: ReactNode;
    /** Element to render — any tag Framer Motion supports. */
    as?: any;
    className?: string;
    stagger?: number;
    delay?: number;
    /** Replay each time it re-enters (matches the site's Reveal default). */
    once?: boolean;
};

/* Wrap one plain string's words in masks. A trailing space is kept inside the
   mask so words never run together when they wrap. */
function splitString(text: string, keyPrefix: string) {
    return text.split(/(\s+)/).map((chunk, i) => {
        if (!chunk) return null;
        /* Whitespace runs are emitted as-is: wrapping them would break the
           natural line-breaking opportunities the browser needs. */
        if (/^\s+$/.test(chunk)) return chunk;
        return (
            <span className="tr-mask" key={`${keyPrefix}-${i}`}>
                <motion.span className="tr-word" variants={word}>
                    {chunk}
                </motion.span>
            </span>
        );
    });
}

/* Walk the tree: strings get split, elements get cloned with split children. */
function splitNode(node: ReactNode, keyPrefix = 'w'): ReactNode {
    if (typeof node === 'string') return splitString(node, keyPrefix);
    if (typeof node === 'number') return splitString(String(node), keyPrefix);

    if (Array.isArray(node)) {
        return Children.map(node, (child, i) => splitNode(child, `${keyPrefix}-${i}`));
    }

    if (isValidElement(node)) {
        const el = node as any;
        /* Elements with no children (an <br />, an icon) pass straight through. */
        if (el.props?.children == null) return node;
        return cloneElement(el, {
            ...el.props,
            children: splitNode(el.props.children, `${keyPrefix}-c`),
        });
    }

    return node;
}

export default function TextReveal({
    children,
    as = 'h2',
    className = '',
    stagger = 0.045,
    delay = 0,
    once = false,
}: Props) {
    const reduced = useReducedMotion();
    const Tag = as;

    if (reduced) {
        return <Tag className={className}>{children}</Tag>;
    }

    const MotionTag = (motion as any)[as] || motion.div;

    return (
        <MotionTag
            className={`tr ${className}`.trim()}
            variants={container(stagger, delay)}
            initial="hidden"
            whileInView="show"
            viewport={{ once, amount: 0.25, margin: '0px 0px -12% 0px' }}
        >
            {splitNode(children)}
        </MotionTag>
    );
}
