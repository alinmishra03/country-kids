'use client';

/* One card on the globe.

   Three nested transforms, each owned by exactly one thing, so they never
   fight:
     · <group>  the slot's fixed position on the sphere, plus the idle bob
     · <group>  tangent orientation — the card lies flat on the sphere so it
                curves with the surface (its normal points out from the centre)
     · <mesh>   the interaction spring: scale, push along the normal, glow

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
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { CARD_MOTION, FLATTEN, GLOBE } from '@/lib/hero/hero-config';
import {
    FLAT_K,
    FLAT_SPAN_Y,
    shortestAngle,
    wrapCentered,
    type CardSlot,
} from '@/lib/hero/sphere-layout';
import type { HeroCard } from '@/lib/hero/hero-cards';
import type { FocusOrigin } from '@/components/home/hero/FocusCard';

/* Scratch objects — module scope so the per-frame maths allocates nothing. */
const _world = new THREE.Vector3();
const _depth = new THREE.Vector3();
const _flat = new THREE.Vector3();
const _globe = new THREE.Vector3();
const _euler = new THREE.Euler();
const _qInv = new THREE.Quaternion();

type Props = {
    slot: CardSlot;
    /** The card this slot shows (0…cardCount−1). Slots outnumber cards, so this
        is what the click reports upward — the overlay/focus UI is card-indexed. */
    cardIndex: number;
    card: HeroCard;
    texture: THREE.Texture;
    geometry: THREE.BufferGeometry;
    edgeMaterial: THREE.Material;
    isSelected: boolean;
    /** True when ANY card is selected — this one dims unless it is the one. */
    anySelected: boolean;
    /** Index of the hovered card, or null. Shared, mutable, never in state. */
    activeRef: React.MutableRefObject<number | null>;
    /** Entrance multiplier on the slot position: >1 while the cards converge on
        load, 1 at rest. Shared and animated outside React (see Globe). */
    spreadRef: React.MutableRefObject<{ value: number }>;
    /** The rotor group — its live rotation drives BOTH the globe spin and the
        flat wall's horizontal pan, read here per frame so the two stay in
        lockstep. */
    rotorRef: React.RefObject<THREE.Group | null>;
    /** Globe → wall morph, 0 (sphere) … 1 (flat wall). Shared, animated in
        Globe outside React. */
    morphRef: React.MutableRefObject<{ value: number }>;
    /** The flat wall's VERTICAL pan offset (world units). Horizontal pan rides
        on the rotor rotation; this adds the second axis so the wall drags in any
        direction. Shared, written by the controls. */
    flatPanRef: React.MutableRefObject<{ v: number }>;
    reduced: boolean;
    /** `origin` is where this card was on screen, so the DOM focus card can
        fly out of exactly this spot. */
    onSelect: (index: number, origin: FocusOrigin) => void;
    /** Returns true if the pointer travelled far enough to be a drag. */
    wasDragged: () => boolean;
};

export default function Card({
    slot,
    cardIndex,
    card,
    texture,
    geometry,
    edgeMaterial,
    isSelected,
    anySelected,
    activeRef,
    spreadRef,
    rotorRef,
    morphRef,
    flatPanRef,
    reduced,
    onSelect,
    wasDragged,
}: Props) {
    const groupRef = useRef<THREE.Group>(null);
    /* The tangent-orientation group. Its quaternion is written each frame so it
       can slerp between the curved sphere basis and the flat wall's square-on. */
    const orientRef = useRef<THREE.Group>(null);
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

    /* ── Tangent orientation ──
       The card lies FLAT on the sphere: its face normal (+Z) points straight out
       from the globe's centre, so the card curves with the surface instead of
       turning to face the camera. This — not a scatter of billboards — is what
       makes the ball read as a wrapped globe. Built once per slot from the slot's
       own position; because the card is a child of the rotating rotor, this fixed
       orientation spins with the globe for free.

       The basis is kept upright (local +Y ≈ world up) so no card ends up rolled;
       the outer bands never reach the poles, so `up × normal` is never
       degenerate. For a front-and-centre card the normal points at the camera,
       so it presents square — which is exactly the card the showcase flies out. */
    const orientation = useMemo(() => {
        const normal = new THREE.Vector3(...slot.position).normalize();
        const up = new THREE.Vector3(0, 1, 0);
        const xAxis = new THREE.Vector3().crossVectors(up, normal).normalize();
        const yAxis = new THREE.Vector3().crossVectors(normal, xAxis).normalize();
        const basis = new THREE.Matrix4().makeBasis(xAxis, yAxis, normal);
        return new THREE.Quaternion().setFromRotationMatrix(basis);
    }, [slot.position]);

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

        /* Globe → flat-wall morph, 0 … 1. Drives both the geometry blend below
           and the fade-out of the sphere's depth cueing (a flat wall has no
           near/far side to cue). */
        const m = morphRef.current.value;

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
        const depthTint = THREE.MathUtils.lerp(
            CARD_MOTION.depthDim + (1 - CARD_MOTION.depthDim) * depth,
            1,
            m
        );
        const depthScale = THREE.MathUtils.lerp(
            1 - CARD_MOTION.depthShrink * (1 - depth),
            1,
            m
        );

        /* Lift the map's own brightness too, so the baked text gains contrast
           rather than only the card's edges catching more light. An active card
           is exempt from depth dimming — it is the subject. */
        const targetTint = isActive ? CARD_MOTION.activeBrightness : depthTint;

        mesh.scale.setScalar(
            mesh.scale.x + (targetScale * (isActive ? 1 : depthScale) - mesh.scale.x) * k
        );
        /* +Z is the card's outward normal — for a front card that is straight at
           the camera, so a hovered card still lifts toward the viewer. */
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
           Drawing the active card with depthTest off lets it sit over cards on
           the FAR side of the globe — essential there. On the flat wall every
           card shares one depth plane, so that override just makes the hovered
           card fight its neighbours as the pointer sweeps across during a drag.
           It is therefore only used on the globe (m below half). Written on
           change, not every frame. */
        const wantTop = isActive && m < 0.5;
        if (wantTop !== onTop.current) {
            onTop.current = wantTop;
            mesh.renderOrder = wantTop ? 10 : 0;
            face.depthTest = !wantTop;
            rim.depthTest = !wantTop;
            /* depthTest is a render state, not a shader define — no recompile,
               but three still needs to be told the material changed. */
            face.needsUpdate = true;
            rim.needsUpdate = true;
        }

        /* ── Position & orientation: sphere ⇄ flat wall ──
           Two targets, blended by the morph:

           GLOBE (m=0) — the slot on the sphere, scaled by the entrance spread
           (>1 while the cards converge on load, 1 at rest) with the idle bob on
           top. The rotor group's own rotation spins this, exactly as before.

           WALL (m=1) — a flat ribbon the user drags in ANY direction. HORIZONTAL
           pan rides on the rotor rotation (azimuth + rotor.rotation.y), so it
           wraps off screen the way the globe wraps round its back. VERTICAL pan
           is the shared flatPan.v, wrapped over the row ribbon so up/down is
           endless too. Both are periodic, so the wall never runs out. The target
           is computed in WORLD space, then pushed into the rotor's local frame by
           the inverse of the rotor's rotation — so when the rotor re-applies that
           rotation the card lands exactly on the flat wall, upright and facing
           the camera, no matter how far it has been dragged. */
        const rotor = rotorRef.current;
        const ry = rotor ? rotor.rotation.y : 0;
        const rx = rotor ? rotor.rotation.x : 0;
        _euler.set(rx, ry, 0);
        _qInv.setFromEuler(_euler).invert();

        const spread = spreadRef.current.value;
        const bob =
            !reduced && !isActive
                ? Math.sin(state.clock.elapsedTime * CARD_MOTION.floatSpeed + slot.floatPhase) *
                  CARD_MOTION.floatAmp
                : 0;
        _globe.set(
            slot.position[0] * spread,
            slot.position[1] * spread + bob,
            slot.position[2] * spread
        );

        /* Flat target in world space, then counter-rotated into rotor-local. */
        _flat.set(
            shortestAngle(slot.azimuth + ry) * FLAT_K,
            wrapCentered(
                ((GLOBE.rows - 1) / 2 - slot.row) * FLATTEN.rowGap + flatPanRef.current.v,
                FLAT_SPAN_Y
            ),
            FLATTEN.z
        );
        _flat.applyQuaternion(_qInv);

        group.position.set(
            THREE.MathUtils.lerp(_globe.x, _flat.x, m),
            THREE.MathUtils.lerp(_globe.y, _flat.y, m),
            THREE.MathUtils.lerp(_globe.z, _flat.z, m)
        );

        /* Orientation blends from the fixed tangent basis (curved onto the ball)
           to the rotor's inverse (which the rotor cancels back to square-on). */
        const orient = orientRef.current;
        if (orient) orient.quaternion.copy(orientation).slerp(_qInv, m);
    });

    return (
        <group ref={groupRef} position={slot.position}>
            <group ref={orientRef} quaternion={orientation}>
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
                        /* Report the CARD, not the slot — the overlay/focus UI is
                           card-indexed, and several slots may share this card. */
                        onSelect(cardIndex, projectToScreen());
                    }}
                />
            </group>
        </group>
    );
}
