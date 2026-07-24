'use client';

/* Lighting rig.

   The environment is built from drei <Lightformer> panels rather than an HDRI
   file. That is deliberate: a preset HDRI is a multi-megabyte download from a
   third-party CDN, and it would tint 24 brand-coloured cards with whatever room
   that HDRI was shot in. Lightformers are geometry rendered once into a small
   cube map (frames={1}), so they cost one render at startup, ship no assets,
   and let the reflections be brand colours — sage key, indigo fill, white rim.

   Nothing here is harsh: the key is a large soft panel, and the directional
   light exists mostly to give the card bevels a direction to catch. */

import { Environment, Lightformer } from '@react-three/drei';

export default function Lights({ shadows }: { shadows: boolean }) {
    return (
        <>
            {/* Base fill so no card face ever goes fully black. */}
            <ambientLight intensity={0.55} />

            {/* Key — upper left, matching the sheen baked into the card faces. */}
            <directionalLight
                position={[-6, 7, 6]}
                intensity={1.15}
                color="#EAF3F4"
                castShadow={shadows}
                shadow-mapSize={[1024, 1024]}
                shadow-bias={-0.0004}
            />

            {/* Cool counter-light, keeps the shadow side from dying. */}
            <directionalLight position={[7, -3, 4]} intensity={0.4} color="#8FA6D8" />

            {/* Warm rim from behind, separates the globe from the background. */}
            <pointLight position={[0, 1.5, -7]} intensity={22} distance={18} color="#6C969D" />

            <Environment resolution={256} frames={1}>
                {/* Large sage key panel. */}
                <Lightformer
                    form="rect"
                    intensity={2.6}
                    position={[-5, 4, 5]}
                    scale={[8, 8, 1]}
                    color="#9DBEC3"
                    target={[0, 0, 0]}
                />
                {/* Indigo fill on the opposite side. */}
                <Lightformer
                    form="rect"
                    intensity={1.5}
                    position={[6, -2, 3]}
                    scale={[6, 6, 1]}
                    color="#464D77"
                    target={[0, 0, 0]}
                />
                {/* Bright ring overhead — this is the highlight that travels
                    across the card bevels as the globe turns. */}
                <Lightformer
                    form="ring"
                    intensity={2.2}
                    position={[0, 6, -2]}
                    scale={5}
                    color="#FFFFFF"
                    target={[0, 0, 0]}
                />
                {/* Faint floor bounce. */}
                <Lightformer
                    form="rect"
                    intensity={0.7}
                    position={[0, -6, 2]}
                    scale={[10, 6, 1]}
                    color="#0A2E63"
                    target={[0, 0, 0]}
                />
            </Environment>
        </>
    );
}
