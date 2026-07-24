'use client';

/* One card on the globe.

   Three nested transforms, each owned by exactly one thing, so they never
   fight:
     · <group>     the slot's fixed position on the sphere, plus the idle bob
     · <Billboard> orientation only — always square to the camera
     · <mesh>      the interaction spring: scale, push toward camera, glow

   FOCUS MODEL — the active card (hovered on desktop, tapped on mobile) has to
   be the clear focal point:
     · it scales and lifts along its own normal, straight at the camera;
     · `depthTest = false` + a high `renderOrder` is the 3D equivalent of a
       higher z-index — it guarantees the card draws over every other card even
       when it sits on the FAR side of the globe, which a lift alone can never
       do. Without this an active card at the back is simply occluded;
     · every other card fades back, so the focus is contrast, not just size.

   Hover state deliberately never touches React state: it lives in one shared
   ref that every card reads in its own frame callback. A pointer crossing the
   globe would otherwise re-render the whole canvas subtree dozens of times a
   second, and dimming 23 siblings would make that 24 re-renders each time. */

import { useEffect, useMemo, useRef } from 'react';
import { Billboard } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { CARD_MOTION, GLOBE } from '@/lib/hero/hero-config';
import type { CardSlot } from '@/lib/hero/sphere-layout';
import type { HeroCard } from '@/lib/hero/hero-cards';
import type { FocusOrigin } from '@/components/home/hero/FocusCard';

/* Scratch vectors — module scope so the per-frame maths allocates nothing. */
const _world = new THREE.Vector3();
const _depth = new THREE.Vector3();

type Props = {
    slot: CardSlot;
    card: HeroCard;
    texture: THREE.Texture;
    geometry: THREE.BufferGeometry;
    edgeMaterial: THREE.Material;
    isSelected: boolean;
    /** True when ANY card is selected — this one dims unless it is the one. */
    anySelected: boolean;
    /** Index of the hovered card, or null. Shared, mutable, never in state. */
    activeRef: React.MutableRefObject<number | null>;
    reduced: boolean;
    /** `origin` is where this card was on screen, so the DOM focus card can
        fly out of exactly this spot. */
    onSelect: (index: number, origin: FocusOrigin) => void;
    /** Returns true if the pointer travelled far enough to be a drag. */
    wasDragged: () => boolean;
};

export default function Card({
    slot,
    card,
    texture,
    geometry,
    edgeMaterial,
    isSelected,
    anySelected,
    activeRef,
    reduced,
    onSelect,
    wasDragged,
}: Props) {
    const groupRef = useRef<THREE.Group>(null);
    const meshRef = useRef<THREE.Mesh>(null);
    /* Last applied render state, so depthTest/renderOrder are written on
       CHANGE rather than every frame. */
    const onTop = useRef(false);
    /* Camera + viewport, refreshed each frame, so the click handler can project
       this card to screen space without calling a hook inside the event. */
    const view = useRef<{ camera: THREE.PerspectiveCamera; w: number; h: number } | null>(null);

    /* Where this card is on screen right now, and how tall it appears in px.
       The DOM focus card animates out of exactly this rect. */
    const projectToScreen = (): FocusOrigin => {
        const mesh = meshRef.current;
        const v = view.current;
        if (!mesh || !v) return { x: 0, y: 0, size: 0 };

        mesh.getWorldPosition(_world);
        const distance = v.camera.position.distanceTo(_world);

        /* World units per screen pixel at this depth — the standard perspective
           relation, which is all that is needed to size the handoff. */
        const worldPerPx =
            (2 * Math.tan((v.camera.fov * Math.PI) / 360) * distance) / v.h;

        _world.project(v.camera);

        return {
            x: (_world.x * 0.5 + 0.5) * v.w,
            y: (-_world.y * 0.5 + 0.5) * v.h,
            size: (GLOBE.cardH * mesh.scale.y) / worldPerPx,
        };
    };

    /* The photo face. One material per card — they differ only by map, but a
       map IS the material as far as the GPU is concerned, so there is nothing
       to share here. The geometry and the rim template are shared. */
    const faceMaterial = useMemo(
        () =>
            new THREE.MeshPhysicalMaterial({
                map: texture,
                color: new THREE.Color('#ffffff'),
                emissive: new THREE.Color('#ffffff'),
                emissiveMap: texture,
                emissiveIntensity: 0,
                roughness: 0.44,
                metalness: 0,
                clearcoat: 0.85,
                clearcoatRoughness: 0.28,
                envMapIntensity: 0.85,
                transparent: true,
                opacity: 1,
            }),
        [texture]
    );

    /* The bevel arrives as a shared template and is CLONED per card. It has to
       be per-card because it fades and lights up with the face — a shared
       material would leave 23 fully-opaque bright outlines floating around the
       one active card. Cloning is cheap: same material type and defines, so
       three reuses the already-compiled shader program. */
    const edge = useMemo(
        () => (edgeMaterial as THREE.MeshPhysicalMaterial).clone(),
        [edgeMaterial]
    );

    useEffect(
        () => () => {
            faceMaterial.dispose();
            edge.dispose();
        },
        [faceMaterial, edge]
    );

    /* Indexed by the geometry's groups: 0 = front/back face, 1 = bevelled sides. */
    const materials = useMemo(() => [faceMaterial, edge], [faceMaterial, edge]);

    const setHover = (value: boolean) => {
        if (value) {
            activeRef.current = slot.index;
            document.body.style.cursor = 'pointer';
            /* Signals the CSS scrim to ease off so the focused card stays
               readable. A DOM write, not React state — hover must not re-render
               the canvas subtree. */
            document.body.dataset.heroHover = '1';
        } else if (activeRef.current === slot.index) {
            activeRef.current = null;
            document.body.style.cursor = '';
            delete document.body.dataset.heroHover;
        }
    };

    /* Release the cursor and the shared slot if this card unmounts mid-hover. */
    useEffect(
        () => () => {
            if (activeRef.current === slot.index) {
                activeRef.current = null;
                document.body.style.cursor = '';
                delete document.body.dataset.heroHover;
            }
        },
        [activeRef, slot.index]
    );

    useFrame((state, rawDelta) => {
        const mesh = meshRef.current;
        const group = groupRef.current;
        if (!mesh || !group) return;

        const dt = Math.min(rawDelta, 0.05);
        /* Frame-rate independent lerp: the same visual spring at 60 and 144 Hz,
           and an inherently ease-out curve. */
        const k = 1 - Math.pow(1 - CARD_MOTION.ease, dt * 60);

        view.current = {
            camera: state.camera as THREE.PerspectiveCamera,
            w: state.size.width,
            h: state.size.height,
        };

        const hoveredIndex = activeRef.current;
        const isHovered = hoveredIndex === slot.index;
        const someoneHovered = hoveredIndex !== null;

        /* A selection outranks a hover: while a card is focused, hovering a
           background sibling must not steal the focus out from under it. */
        const isActive = isHovered && !anySelected;

        const targetScale = isActive ? CARD_MOTION.hoverScale : 1;
        const targetLift = isActive ? CARD_MOTION.hoverLift : 0;
        const targetGlow = isActive ? CARD_MOTION.hoverGlow : 0;

        /* The SELECTED card fades out completely: the DOM focus card has taken
           over as its representation, and leaving the 3D one visible would show
           the same card twice. The rest keep full opacity — while a card is
           focused the whole canvas is dimmed and blurred in CSS, so dimming
           them here as well would multiply down to nothing. */
        const targetOpacity = isSelected
            ? 0
            : !isActive && someoneHovered && !anySelected
              ? CARD_MOTION.hoverDimOpacity
              : 1;

        /* ── Depth cueing ──
           How far round the globe this card currently is, 0 (back) … 1 (front),
           taken from its world position. The rotor's rotation is already baked
           into that, so this needs no knowledge of the rotation itself.

           It drives brightness and size: the far side recedes instead of
           reading as a flat ring. Both are interpolated through the same lerp
           as everything else, so there is never a step change. */
        mesh.getWorldPosition(_depth);
        const depth = THREE.MathUtils.clamp(
            (_depth.z + GLOBE.radius) / (2 * GLOBE.radius),
            0,
            1
        );
        const depthTint = CARD_MOTION.depthDim + (1 - CARD_MOTION.depthDim) * depth;
        const depthScale = 1 - CARD_MOTION.depthShrink * (1 - depth);

        /* Lift the map's own brightness too, so the baked text gains contrast
           rather than only the card's edges catching more light. An active card
           is exempt from depth dimming — it is the subject. */
        const targetTint = isActive ? CARD_MOTION.activeBrightness : depthTint;

        mesh.scale.setScalar(
            mesh.scale.x + (targetScale * (isActive ? 1 : depthScale) - mesh.scale.x) * k
        );
        /* +Z inside a billboard is straight at the camera. */
        mesh.position.z += (targetLift - mesh.position.z) * k;

        const [face, rim] = mesh.material as THREE.MeshPhysicalMaterial[];
        face.emissiveIntensity += (targetGlow - face.emissiveIntensity) * k;
        face.opacity += (targetOpacity - face.opacity) * k;
        face.color.r += (targetTint - face.color.r) * k;
        face.color.g = face.color.r;
        face.color.b = face.color.r;

        /* The rim tracks the face: dims with it, brightens with it. */
        rim.opacity = face.opacity;
        rim.emissiveIntensity +=
            ((isActive ? CARD_MOTION.rimGlow : 0) - rim.emissiveIntensity) * k;

        /* ── The "z-index" ──
           Written only when the state flips, not every frame. */
        if (isActive !== onTop.current) {
            onTop.current = isActive;
            mesh.renderOrder = isActive ? 10 : 0;
            face.depthTest = !isActive;
            rim.depthTest = !isActive;
            /* depthTest is a render state, not a shader define — no recompile,
               but three still needs to be told the material changed. */
            face.needsUpdate = true;
            rim.needsUpdate = true;
        }

        /* Idle bob — desynchronised per card by its own phase. Skipped under
           reduced motion, and while this card is the focus (a focused card must
           be still enough to read). */
        if (!reduced && !isActive) {
            const t = state.clock.elapsedTime;
            group.position.y =
                slot.position[1] +
                Math.sin(t * CARD_MOTION.floatSpeed + slot.floatPhase) * CARD_MOTION.floatAmp;
        }
    });

    return (
        <group ref={groupRef} position={slot.position}>
            <Billboard>
                <mesh
                    ref={meshRef}
                    geometry={geometry}
                    material={materials}
                    /* No-ops when the renderer has shadows off (mobile / reduced
                       motion), so this needs no quality branch of its own. */
                    castShadow
                    receiveShadow
                    /* Touch is excluded from hover on purpose. A tap fires
                       pointerover but there is no dependable pointerout to
                       match it, so a touch device would latch the hover state
                       on and leave the orbit crawling for good. On touch the
                       tap becomes a SELECT instead — see onClick. */
                    onPointerOver={(e) => {
                        if (e.pointerType === 'touch') return;
                        e.stopPropagation();
                        setHover(true);
                    }}
                    onPointerOut={(e) => {
                        if (e.pointerType === 'touch') return;
                        setHover(false);
                    }}
                    onClick={(e) => {
                        e.stopPropagation();
                        /* A drag that happens to end on a card is not a click. */
                        if (wasDragged()) return;
                        onSelect(slot.index, projectToScreen());
                    }}
                />
            </Billboard>
        </group>
    );
}
