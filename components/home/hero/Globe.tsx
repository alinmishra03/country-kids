'use client';

/* The rotating body of cards.

   Owns the three things every card shares — the geometry, the edge material and
   the slot layout — and builds each exactly once. 24 meshes therefore cost 1
   geometry upload and 1 shared edge material, with only the photo face material
   differing per card.

   On instancing: an InstancedMesh would collapse the 24 draw calls into one,
   but every card carries a DIFFERENT baked texture, so instancing would require
   packing all 24 faces into an atlas and driving per-instance UV offsets — and
   it would put the per-card hover/select springs and the raycast hit-testing
   into attribute updates. At 24 objects the draw calls are not the bottleneck
   (the postprocessing pass is), so shared geometry + shared edge material is
   the better trade. Revisit if the card count ever passes ~150. */

import { useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import gsap from 'gsap';
import { ENTRANCE, FLATTEN, GLOBE } from '@/lib/hero/hero-config';
import { createCardGeometry } from '@/lib/hero/card-geometry';
import { buildSlots } from '@/lib/hero/sphere-layout';
import type { HeroCard } from '@/lib/hero/hero-cards';
import useGlobeControls, { type GlobeApi } from '@/hooks/useGlobeControls';
import Card from '@/components/home/hero/Card';
import type { FocusOrigin } from '@/components/home/hero/FocusCard';

type Props = {
    cards: HeroCard[];
    textures: THREE.Texture[];
    selectedIndex: number | null;
    onSelect: (index: number, origin: FocusOrigin) => void;
    /** Tapping/clicking past the globe clears the selection. */
    onClear: () => void;
    apiRef: React.MutableRefObject<GlobeApi | null>;
    reduced: boolean;
    /** Uniform scale — CameraRig shrinks the globe on narrow viewports. */
    scale: number;
    /** Flips true once the loader has cleared the globe — the cue to run the
        entrance convergence, so its extended start is actually on screen. */
    play: boolean;
    /** True while the "Continue" wall is showing — the sphere morphs to a flat,
        pannable wall and back. */
    flat: boolean;
};

export default function Globe({
    cards,
    textures,
    selectedIndex,
    onSelect,
    onClear,
    apiRef,
    reduced,
    scale,
    play,
    flat,
}: Props) {
    const groupRef = useRef<THREE.Group>(null);
    /* Which card is hovered, or null. A ref, not state — it changes on every
       pointer move across the globe, and each card reads it in its own frame
       callback, so a hover costs zero React renders even though it restyles all
       24 cards. */
    const activeRef = useRef<number | null>(null);

    /* SLOTS vs CARDS — the sphere carries more slots (columns × rows) than there
       are unique cards, so the ball reads as a dense, wrapped surface. Each slot
       borrows a card by index modulo the card count; a card therefore appears in
       two or three places, which is exactly the decorative repetition the
       reference globe has. Everything DOWNSTREAM of the click (overlay, focus
       card, keyboard) works in card-index space, so a slot reports the CARD it
       is showing — never its own index — when selected. */
    const slots = useMemo(
        () => buildSlots(GLOBE.columns * GLOBE.rows),
        []
    );

    /* ENTRANCE SPREAD — a single scalar multiplying every card's slot position.
       It holds at ENTRANCE.spread (the ball spread wide) until `play` turns true,
       then tweens to 1 (the final, resting layout) exactly once, so the cards
       converge toward the globe. `play` is gated on the loader clearing, or the
       whole convergence would run behind the loading veil and never be seen.

       A ref, not state: each card reads it in its own frame callback, so the
       convergence costs zero React renders. It only multiplies POSITION, never
       card scale, so the cards keep their size and simply draw inward. Under
       reduced motion it sits at 1 from the start — no entrance. */
    const spread = useRef({ value: reduced ? 1 : ENTRANCE.spread });
    useEffect(() => {
        if (reduced) {
            spread.current.value = 1;
            return;
        }
        if (!play) return;

        /* fromTo, not to: the convergence is FORCED to begin fully extended every
           time, so it can never start from a half-settled value and read as "no
           animation". */
        const run = () =>
            gsap.fromTo(
                spread.current,
                { value: ENTRANCE.spread },
                {
                    value: 1,
                    duration: ENTRANCE.duration,
                    delay: ENTRANCE.delay,
                    ease: 'power3.out',
                    overwrite: true,
                }
            );

        let tween = run();

        /* Some browsers restore this page from the back/forward cache instead of
           re-executing it — the React mount never runs again, so replay the
           entrance by hand when that happens. */
        const onShow = (e: PageTransitionEvent) => {
            if (!e.persisted) return;
            tween.kill();
            tween = run();
        };
        window.addEventListener('pageshow', onShow);

        return () => {
            tween.kill();
            window.removeEventListener('pageshow', onShow);
        };
    }, [reduced, play]);

    /* MORPH — 0 = sphere, 1 = flat wall. Each Card reads it per frame and blends
       its own geometry (see Card). Animated here, outside React, so the whole
       transition is one GSAP tween and costs no renders. */
    const morph = useRef({ value: 0 });
    useEffect(() => {
        const tween = gsap.to(morph.current, {
            value: flat ? 1 : 0,
            duration: reduced ? 0 : FLATTEN.duration,
            ease: 'power3.inOut',
            overwrite: true,
        });
        return () => {
            tween.kill();
        };
    }, [flat, reduced]);

    /* Read by the controls each frame — the pan replaces the idle orbit while
       flat, and the wheel scrolls the wall. A ref so toggling never re-runs the
       control effects. */
    const flatRef = useRef(flat);
    flatRef.current = flat;

    /* The flat wall's VERTICAL pan offset. The controls write it; each Card
       reads it (horizontal pan rides on the rotor rotation instead). */
    const flatPan = useRef({ v: 0 });

    const geometry = useMemo(
        () =>
            createCardGeometry(
                GLOBE.cardW,
                GLOBE.cardH,
                GLOBE.cardDepth,
                GLOBE.cardRadius
            ),
        []
    );

    /* The bevelled rim. Metallic and smooth so it picks up the lightformers as
       a bright hairline — this is what reads as "glass edge". */
    const edgeMaterial = useMemo(
        () =>
            new THREE.MeshPhysicalMaterial({
                color: new THREE.Color('#12315e'),
                /* Unlit at rest; Card lerps the intensity up on the active card
                   so its border brightens with it. */
                emissive: new THREE.Color('#E3BC63'),
                emissiveIntensity: 0,
                roughness: 0.22,
                metalness: 0.65,
                clearcoat: 1,
                clearcoatRoughness: 0.15,
                envMapIntensity: 1.35,
                transparent: true,
            }),
        []
    );

    /* GPU resources React does not track — released explicitly. */
    useEffect(
        () => () => {
            geometry.dispose();
            edgeMaterial.dispose();
        },
        [geometry, edgeMaterial]
    );

    const { wasDragged } = useGlobeControls({
        groupRef,
        slots,
        selectedIndex,
        activeRef,
        apiRef,
        reduced,
        flatRef,
        flatPanRef: flatPan,
    });

    return (
        <group scale={scale}>
            {/* Invisible backdrop behind the globe: a click that reaches it is a
                click that missed every card, which is how "tap outside to
                deselect" is detected. It is opacity-0 rather than visible={false}
                because an invisible object is not raycast at all. Cards sit in
                front of it and stopPropagation, so they always win. */}
            <mesh position={[0, 0, -8]} onClick={() => !wasDragged() && onClear()}>
                <planeGeometry args={[80, 80]} />
                <meshBasicMaterial transparent opacity={0} depthWrite={false} />
            </mesh>

            <group ref={groupRef}>
                {slots.map((slot) => {
                    /* The card this slot shows. Multiple slots can share one. */
                    const cardIndex = slot.index % cards.length;
                    return (
                        <Card
                            /* Keyed by the SLOT, not the card — the card repeats. */
                            key={slot.index}
                            slot={slot}
                            cardIndex={cardIndex}
                            card={cards[cardIndex]}
                            texture={textures[cardIndex]}
                            geometry={geometry}
                            edgeMaterial={edgeMaterial}
                            isSelected={selectedIndex === cardIndex}
                            anySelected={selectedIndex !== null}
                            activeRef={activeRef}
                            spreadRef={spread}
                            rotorRef={groupRef}
                            morphRef={morph}
                            flatPanRef={flatPan}
                            reduced={reduced}
                            onSelect={onSelect}
                            wasDragged={wasDragged}
                        />
                    );
                })}
            </group>
        </group>
    );
}
