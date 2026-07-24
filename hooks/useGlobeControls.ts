'use client';

/* The globe's rotation state machine: idle orbit → drag → inertia → snap →
   hold → idle, with "selected" as a separate branch that overrides all of it.

   One rotation object is the single source of truth. Nothing else writes to the
   group's transform, so drag, inertia, the snap tween and the idle orbit can
   never end up fighting for it — each mode simply owns the object while it is
   active. GSAP drives the two tweened modes (snap, select); the frame loop
   drives the two continuous ones (idle, inertia).

   Runs INSIDE the R3F canvas — it needs useFrame and the canvas DOM element. */

import { useEffect, useMemo, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import gsap from 'gsap';
import { IDLE, MOTION } from '@/lib/hero/hero-config';
import { frontIndex, nearestSnap, snapAngles, type CardSlot } from '@/lib/hero/sphere-layout';

type Mode = 'idle' | 'drag' | 'inertia' | 'snapping' | 'selected';

/* The imperative handle the DOM side (overlay buttons, keyboard) drives the
   globe through — deliberately imperative so a rotation never costs a React
   render. */
export type GlobeApi = {
    /** The card currently nearest front centre — the starting point for
        keyboard prev/next, so the arrows continue from what is on screen. */
    front: () => number;
};

type Options = {
    groupRef: React.RefObject<any>;
    slots: CardSlot[];
    selectedIndex: number | null;
    /** Index of the hovered card, or null — slows the idle orbit while set. */
    activeRef: React.MutableRefObject<number | null>;
    apiRef: React.MutableRefObject<GlobeApi | null>;
    reduced: boolean;
};

const clamp = (v: number, lo: number, hi: number) => (v < lo ? lo : v > hi ? hi : v);

export default function useGlobeControls({
    groupRef,
    slots,
    selectedIndex,
    activeRef,
    apiRef,
    reduced,
}: Options) {
    const gl = useThree((s) => s.gl);

    const angles = useMemo(() => snapAngles(slots), [slots]);
    const rot = useRef({ y: 0, x: 0 });
    const state = useRef({
        mode: 'idle' as Mode,
        vy: 0,
        vx: 0,
        autoBlend: 1,
        hold: 0,
        lastX: 0,
        lastY: 0,
        lastT: 0,
        moved: 0,
        pointerId: -1,
    });

    /* ── Tween helpers ─────────────────────────────────────────────────── */
    const tweenTo = (targetY: number, duration: number, onDone?: () => void) => {
        gsap.killTweensOf(rot.current);
        gsap.to(rot.current, {
            y: targetY,
            x: 0,
            duration: reduced ? 0 : duration,
            ease: 'power3.out',
            overwrite: true,
            onComplete: onDone,
        });
    };

    const startSnap = () => {
        const s = state.current;
        s.mode = 'snapping';
        s.vy = 0;
        s.vx = 0;
        tweenTo(nearestSnap(rot.current.y, angles), MOTION.snapDuration, () => {
            /* Rest on the card for a beat, then let the idle orbit fade back. */
            state.current.hold = MOTION.snapHold;
            state.current.autoBlend = 0;
            state.current.mode = 'idle';
        });
    };

    /* ── Selection ─────────────────────────────────────────────────────── */
    useEffect(() => {
        const s = state.current;
        if (selectedIndex == null) {
            /* Deselecting hands control straight back to the idle orbit. */
            if (s.mode === 'selected') {
                s.mode = 'idle';
                s.autoBlend = 0;
                s.hold = MOTION.snapHold * 0.5;
            }
            return;
        }
        const slot = slots[selectedIndex];
        if (!slot) return;

        /* Freeze where it stands. The globe deliberately does NOT rotate the
           selected card to the front any more: the DOM focus card flies out of
           wherever the 3D card actually was, so rotating underneath it would
           drag the whole background sideways for no reason — and a hard pause
           is what a focus state should feel like. */
        gsap.killTweensOf(rot.current);
        s.mode = 'selected';
        s.vy = 0;
        s.vx = 0;
    }, [selectedIndex, slots]);

    /* ── Imperative API for the DOM controls ───────────────────────────── */
    useEffect(() => {
        apiRef.current = { front: () => frontIndex(rot.current.y, slots) };
        return () => {
            apiRef.current = null;
        };
    }, [apiRef, slots]);

    /* ── Pointer drag: mouse, pen and touch through one Pointer Events path ── */
    useEffect(() => {
        const canvas = gl.domElement;

        const down = (e: PointerEvent) => {
            if (e.pointerType === 'mouse' && e.button !== 0) return;
            const s = state.current;
            gsap.killTweensOf(rot.current);
            s.mode = 'drag';
            s.pointerId = e.pointerId;
            s.lastX = e.clientX;
            s.lastY = e.clientY;
            s.lastT = e.timeStamp;
            s.moved = 0;
            s.vy = 0;
            s.vx = 0;
            s.autoBlend = 0;
            canvas.setPointerCapture?.(e.pointerId);
            canvas.classList.add('is-grabbing');
        };

        const move = (e: PointerEvent) => {
            const s = state.current;
            if (s.mode !== 'drag' || e.pointerId !== s.pointerId) return;

            const dx = e.clientX - s.lastX;
            const dy = e.clientY - s.lastY;
            /* Guard against a 0ms delta producing an infinite velocity. */
            const dt = Math.max(8, e.timeStamp - s.lastT) / 1000;

            s.lastX = e.clientX;
            s.lastY = e.clientY;
            s.lastT = e.timeStamp;
            s.moved += Math.abs(dx) + Math.abs(dy);

            const ry = dx * MOTION.dragSensX;
            const rx = dy * MOTION.dragSensY;
            rot.current.y += ry;
            rot.current.x = clamp(rot.current.x + rx, -MOTION.maxTilt, MOTION.maxTilt);

            /* Smoothed, so one jittery sample can't define the throw. */
            s.vy = s.vy * 0.62 + (ry / dt) * 0.38;
            s.vx = s.vx * 0.62 + (rx / dt) * 0.38;
        };

        const up = (e: PointerEvent) => {
            const s = state.current;
            if (s.mode !== 'drag' || e.pointerId !== s.pointerId) return;
            s.pointerId = -1;
            canvas.classList.remove('is-grabbing');

            if (reduced) {
                s.mode = 'idle';
                s.autoBlend = 1;
                return;
            }
            /* Cap the throw so a hard flick can't spin the globe into a blur. */
            s.vy = clamp(s.vy, -5.5, 5.5);
            s.vx = clamp(s.vx, -3, 3);
            s.mode = 'inertia';
        };

        canvas.addEventListener('pointerdown', down);
        canvas.addEventListener('pointermove', move);
        canvas.addEventListener('pointerup', up);
        canvas.addEventListener('pointercancel', up);

        return () => {
            canvas.removeEventListener('pointerdown', down);
            canvas.removeEventListener('pointermove', move);
            canvas.removeEventListener('pointerup', up);
            canvas.removeEventListener('pointercancel', up);
            canvas.classList.remove('is-grabbing');
        };
    }, [gl, reduced]);

    /* ── The frame loop ────────────────────────────────────────────────── */
    useFrame((frameState, rawDelta) => {
        const group = groupRef.current;
        if (!group) return;

        /* A tab returning from the background can hand us a huge delta. */
        const dt = Math.min(rawDelta, 0.05);
        const s = state.current;

        if (s.mode === 'inertia') {
            rot.current.y += s.vy * dt;
            rot.current.x = clamp(rot.current.x + s.vx * dt, -MOTION.maxTilt, MOTION.maxTilt);

            const decay = Math.pow(MOTION.friction, dt * 60);
            s.vy *= decay;
            s.vx *= decay;

            if (Math.abs(s.vy) < MOTION.snapBelow) startSnap();
        } else if (s.mode === 'idle' && !reduced) {
            if (s.hold > 0) {
                s.hold -= dt;
            } else {
                s.autoBlend = Math.min(1, s.autoBlend + dt * MOTION.resume);
                /* Hovering a card all but stops the orbit so it can be read. */
                const hoverFactor = activeRef.current !== null ? MOTION.hoverSpeed : 1;
                rot.current.y += MOTION.autoSpeed * s.autoBlend * hoverFactor * dt;
            }
            /* Any tilt the user left behind eases back to level. */
            rot.current.x += (0 - rot.current.x) * Math.min(1, dt * 1.2);
        }

        group.rotation.y = rot.current.y;
        group.rotation.x = rot.current.x;

        /* ── Idle life ──
           A breathing scale and a slow vertical drift, so the globe is never
           completely still even when nothing is happening. Both are tiny and
           both are transform-only. Skipped under reduced motion, where the
           globe should genuinely rest.

           Applied here rather than in a separate tween because this is the one
           place that already owns the group's transform — a second animator on
           the same object is exactly how the earlier fights started. */
        if (!reduced) {
            const t = frameState.clock.elapsedTime;
            const breathe = 1 + Math.sin(t * IDLE.breatheSpeed) * IDLE.breatheAmp;
            group.scale.setScalar(breathe);
            group.position.y = Math.sin(t * IDLE.driftSpeed) * IDLE.driftAmp;
        }
    });

    /* True while the pointer has travelled far enough that the gesture is a
       drag, not a click — the Card uses it to swallow the click. */
    return {
        wasDragged: () => state.current.moved > 8,
    };
}
