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
import { GLOBE } from '@/lib/hero/hero-config';
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
}: Props) {
    const groupRef = useRef<THREE.Group>(null);
    /* Which card is hovered, or null. A ref, not state — it changes on every
       pointer move across the globe, and each card reads it in its own frame
       callback, so a hover costs zero React renders even though it restyles all
       24 cards. */
    const activeRef = useRef<number | null>(null);

    const slots = useMemo(() => buildSlots(cards.length), [cards.length]);

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
                emissive: new THREE.Color('#9DBEC3'),
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
                {slots.map((slot) => (
                    <Card
                        key={cards[slot.index].id}
                        slot={slot}
                        card={cards[slot.index]}
                        texture={textures[slot.index]}
                        geometry={geometry}
                        edgeMaterial={edgeMaterial}
                        isSelected={selectedIndex === slot.index}
                        anySelected={selectedIndex !== null}
                        activeRef={activeRef}
                        reduced={reduced}
                        onSelect={onSelect}
                        wasDragged={wasDragged}
                    />
                ))}
            </group>
        </group>
    );
}
