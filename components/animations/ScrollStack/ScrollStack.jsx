'use client';

/* ScrollStack (React Bits) — cards that pin and stack on top of one another as
   you scroll, each one scaling down slightly as the next slides over it.

   Two scroll sources:
     useWindowScroll={false} (default) — the component owns an internal scroller
       (needs an explicit height on .scroll-stack-scroller).
     useWindowScroll={true}            — driven by the page scroll. Lenis is
       attached to the window, so smooth scrolling applies to the whole page for
       as long as this component is mounted. See css/scroll-stack.css for the
       `scroll-behavior: auto` override Lenis requires.

   Note: in window mode the card list is collected via a document-wide query for
   `.scroll-stack-card`, so only mount ONE instance per page. */

import { useLayoutEffect, useRef, useCallback } from 'react';
import Lenis from 'lenis';

export const ScrollStackItem = ({ children, itemClassName = '' }) => (
    <div className={`scroll-stack-card ${itemClassName}`.trim()}>{children}</div>
);

const ScrollStack = ({
    children,
    className = '',
    itemDistance = 100,
    itemScale = 0.03,
    itemStackDistance = 30,
    stackPosition = '20%',
    scaleEndPosition = '10%',
    baseScale = 0.85,
    scaleDuration = 0.5,
    rotationAmount = 0,
    blurAmount = 0,
    useWindowScroll = false,
    /* defaulted so TS's inferred prop type keeps it optional at call sites */
    onStackComplete = undefined,
}) => {
    const scrollerRef = useRef(null);
    const stackCompletedRef = useRef(false);
    const animationFrameRef = useRef(null);
    const lenisRef = useRef(null);
    const cardsRef = useRef([]);
    const lastTransformsRef = useRef(new Map());
    const isUpdatingRef = useRef(false);
    /* Cached LAYOUT offsets of each card (and the end spacer). See measure(). */
    const cardOffsetsRef = useRef([]);
    const endOffsetRef = useRef(0);

    const calculateProgress = useCallback((scrollTop, start, end) => {
        if (scrollTop < start) return 0;
        if (scrollTop > end) return 1;
        return (scrollTop - start) / (end - start);
    }, []);

    const parsePercentage = useCallback((value, containerHeight) => {
        if (typeof value === 'string' && value.includes('%')) {
            return (parseFloat(value) / 100) * containerHeight;
        }
        return parseFloat(value);
    }, []);

    const getScrollData = useCallback(() => {
        if (useWindowScroll) {
            return {
                scrollTop: window.scrollY,
                containerHeight: window.innerHeight,
                scrollContainer: document.documentElement,
            };
        }
        const scroller = scrollerRef.current;
        return {
            scrollTop: scroller.scrollTop,
            containerHeight: scroller.clientHeight,
            scrollContainer: scroller,
        };
    }, [useWindowScroll]);

    /* Measure every card's position ONCE per layout, not per frame.

       getBoundingClientRect() reports the *transformed* box, and these cards are
       transformed every frame — reading it inside the scroll handler feeds the
       previous frame's translate/scale back into the next frame's maths, which
       shows up as a visible shiver. Transforms don't affect layout, so we clear
       them for the duration of the read and restore them immediately; the cached
       numbers are then stable for the whole scroll. Re-run on resize and
       whenever content reflows (late-loading images change card heights). */
    const measure = useCallback(() => {
        const cards = cardsRef.current;
        if (!cards.length) return;

        if (useWindowScroll) {
            const previous = cards.map((card) => card.style.transform);
            cards.forEach((card) => {
                card.style.transform = 'none';
            });

            const scrollY = window.scrollY;
            cardOffsetsRef.current = cards.map((card) => card.getBoundingClientRect().top + scrollY);

            const endElement = document.querySelector('.scroll-stack-end');
            endOffsetRef.current = endElement
                ? endElement.getBoundingClientRect().top + scrollY
                : 0;

            cards.forEach((card, i) => {
                card.style.transform = previous[i];
            });
        } else {
            cardOffsetsRef.current = cards.map((card) => card.offsetTop);
            const endElement = scrollerRef.current?.querySelector('.scroll-stack-end');
            endOffsetRef.current = endElement ? endElement.offsetTop : 0;
        }
    }, [useWindowScroll]);

    const updateCardTransforms = useCallback(() => {
        if (!cardsRef.current.length || isUpdatingRef.current) return;

        isUpdatingRef.current = true;

        const { scrollTop, containerHeight } = getScrollData();
        const stackPositionPx = parsePercentage(stackPosition, containerHeight);
        const scaleEndPositionPx = parsePercentage(scaleEndPosition, containerHeight);

        const offsets = cardOffsetsRef.current;
        const endElementTop = endOffsetRef.current;

        cardsRef.current.forEach((card, i) => {
            if (!card) return;

            const cardTop = offsets[i];
            if (cardTop === undefined) return;
            const triggerStart = cardTop - stackPositionPx - itemStackDistance * i;
            const triggerEnd = cardTop - scaleEndPositionPx;
            const pinStart = cardTop - stackPositionPx - itemStackDistance * i;
            const pinEnd = endElementTop - containerHeight / 2;

            const scaleProgress = calculateProgress(scrollTop, triggerStart, triggerEnd);
            const targetScale = baseScale + i * itemScale;
            const scale = 1 - scaleProgress * (1 - targetScale);
            const rotation = rotationAmount ? i * rotationAmount * scaleProgress : 0;

            let blur = 0;
            if (blurAmount) {
                let topCardIndex = 0;
                for (let j = 0; j < cardsRef.current.length; j++) {
                    const jCardTop = offsets[j];
                    if (jCardTop === undefined) continue;
                    const jTriggerStart = jCardTop - stackPositionPx - itemStackDistance * j;
                    if (scrollTop >= jTriggerStart) {
                        topCardIndex = j;
                    }
                }

                if (i < topCardIndex) {
                    const depthInStack = topCardIndex - i;
                    blur = Math.max(0, depthInStack * blurAmount);
                }
            }

            let translateY = 0;
            const isPinned = scrollTop >= pinStart && scrollTop <= pinEnd;

            if (isPinned) {
                translateY = scrollTop - cardTop + stackPositionPx + itemStackDistance * i;
            } else if (scrollTop > pinEnd) {
                translateY = pinEnd - cardTop + stackPositionPx + itemStackDistance * i;
            }

            const newTransform = {
                translateY: Math.round(translateY * 100) / 100,
                scale: Math.round(scale * 1000) / 1000,
                rotation: Math.round(rotation * 100) / 100,
                blur: Math.round(blur * 100) / 100,
            };

            const lastTransform = lastTransformsRef.current.get(i);
            const hasChanged =
                !lastTransform ||
                Math.abs(lastTransform.translateY - newTransform.translateY) > 0.1 ||
                Math.abs(lastTransform.scale - newTransform.scale) > 0.001 ||
                Math.abs(lastTransform.rotation - newTransform.rotation) > 0.1 ||
                Math.abs(lastTransform.blur - newTransform.blur) > 0.1;

            if (hasChanged) {
                const transform = `translate3d(0, ${newTransform.translateY}px, 0) scale(${newTransform.scale}) rotate(${newTransform.rotation}deg)`;
                const filter = newTransform.blur > 0 ? `blur(${newTransform.blur}px)` : '';

                card.style.transform = transform;
                card.style.filter = filter;

                lastTransformsRef.current.set(i, newTransform);
            }

            if (i === cardsRef.current.length - 1) {
                const isInView = scrollTop >= pinStart && scrollTop <= pinEnd;
                if (isInView && !stackCompletedRef.current) {
                    stackCompletedRef.current = true;
                    onStackComplete?.();
                } else if (!isInView && stackCompletedRef.current) {
                    stackCompletedRef.current = false;
                }
            }
        });

        isUpdatingRef.current = false;
    }, [
        itemScale,
        itemStackDistance,
        stackPosition,
        scaleEndPosition,
        baseScale,
        rotationAmount,
        blurAmount,
        useWindowScroll,
        onStackComplete,
        calculateProgress,
        parsePercentage,
        getScrollData,
    ]);

    const handleScroll = useCallback(() => {
        updateCardTransforms();
    }, [updateCardTransforms]);

    const setupLenis = useCallback(() => {
        if (useWindowScroll) {
            const lenis = new Lenis({
                duration: 1.2,
                easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
                smoothWheel: true,
                touchMultiplier: 2,
                infinite: false,
                wheelMultiplier: 1,
                lerp: 0.1,
                syncTouch: true,
                syncTouchLerp: 0.075,
            });

            lenis.on('scroll', handleScroll);

            const raf = (time) => {
                lenis.raf(time);
                animationFrameRef.current = requestAnimationFrame(raf);
            };
            animationFrameRef.current = requestAnimationFrame(raf);

            lenisRef.current = lenis;
            return lenis;
        }

        const scroller = scrollerRef.current;
        if (!scroller) return;

        const lenis = new Lenis({
            wrapper: scroller,
            content: scroller.querySelector('.scroll-stack-inner'),
            duration: 1.2,
            easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
            smoothWheel: true,
            touchMultiplier: 2,
            infinite: false,
            gestureOrientationHandler: true,
            normalizeWheel: true,
            wheelMultiplier: 1,
            touchInertiaMultiplier: 35,
            lerp: 0.1,
            syncTouch: true,
            syncTouchLerp: 0.075,
            touchInertia: 0.6,
        });

        lenis.on('scroll', handleScroll);

        const raf = (time) => {
            lenis.raf(time);
            animationFrameRef.current = requestAnimationFrame(raf);
        };
        animationFrameRef.current = requestAnimationFrame(raf);

        lenisRef.current = lenis;
        return lenis;
    }, [handleScroll, useWindowScroll]);

    useLayoutEffect(() => {
        const scroller = scrollerRef.current;
        if (!scroller) return;

        const transformsCache = lastTransformsRef.current;
        let resizeObserver;

        /* Collect the cards and prime their style. Re-runnable: a card that
           mounts late (lazy child, conditional render) would otherwise never be
           picked up and would sit untransformed in normal flow, poking out from
           under the stack. */
        const collect = () => {
            const cards = Array.from(
                useWindowScroll
                    ? document.querySelectorAll('.scroll-stack-card')
                    : scroller.querySelectorAll('.scroll-stack-card')
            );

            cardsRef.current = cards;

            cards.forEach((card, i) => {
                card.style.marginBottom = i < cards.length - 1 ? `${itemDistance}px` : '';
                card.style.willChange = 'transform, filter';
                card.style.transformOrigin = 'top center';
                card.style.backfaceVisibility = 'hidden';
                card.style.perspective = '1000px';
                card.style.webkitPerspective = '1000px';
                if (!card.style.transform) {
                    card.style.transform = 'translateZ(0)';
                }
                resizeObserver?.observe(card);
            });

            return cards;
        };

        const remeasure = () => {
            measure();
            updateCardTransforms();
        };

        if (typeof ResizeObserver !== 'undefined') {
            resizeObserver = new ResizeObserver(remeasure);
            resizeObserver.observe(scroller);
        }

        collect();
        setupLenis();
        remeasure();

        window.addEventListener('resize', remeasure);

        /* Re-collect if the card list itself changes. */
        const mutationObserver = new MutationObserver(() => {
            const before = cardsRef.current.length;
            if (collect().length !== before) {
                transformsCache.clear();
                remeasure();
            }
        });
        mutationObserver.observe(scroller, { childList: true, subtree: true });

        return () => {
            window.removeEventListener('resize', remeasure);
            resizeObserver?.disconnect();
            mutationObserver.disconnect();
            if (animationFrameRef.current) {
                cancelAnimationFrame(animationFrameRef.current);
            }
            if (lenisRef.current) {
                lenisRef.current.destroy();
            }
            cardOffsetsRef.current = [];
            endOffsetRef.current = 0;
            stackCompletedRef.current = false;
            cardsRef.current = [];
            transformsCache.clear();
            isUpdatingRef.current = false;
        };
    }, [
        itemDistance,
        itemScale,
        itemStackDistance,
        stackPosition,
        scaleEndPosition,
        baseScale,
        scaleDuration,
        rotationAmount,
        blurAmount,
        useWindowScroll,
        onStackComplete,
        setupLenis,
        updateCardTransforms,
        measure,
    ]);

    return (
        <div
            className={`scroll-stack-scroller${useWindowScroll ? ' scroll-stack-window' : ''} ${className}`.trim()}
            ref={scrollerRef}
        >
            <div className="scroll-stack-inner">
                {children}
                {/* Spacer so the last pin can release cleanly */}
                <div className="scroll-stack-end" />
            </div>
        </div>
    );
};

export default ScrollStack;
