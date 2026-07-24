'use client';

/* Post-processing: bloom, film grain, vignette.

   This is the single most expensive thing in the scene — a full-screen pass per
   effect, every frame — so it is gated. Phones and reduced-motion users get the
   raw render, which still looks correct because the lighting and the baked card
   faces carry the look; the passes are polish, not the design.

   The composer owns antialiasing when it runs: once a scene is rendered into an
   offscreen buffer, the canvas's own `antialias: true` does nothing, so MSAA has
   to be requested HERE or the card edges alias badly. The normal pass is off —
   no effect in this stack reads normals. */

import { Bloom, EffectComposer, Noise, Vignette } from '@react-three/postprocessing';
import { BlendFunction } from 'postprocessing';

export default function Effects() {
    return (
        <EffectComposer enableNormalPass={false} multisampling={4}>
            {/* Only the card glow and the brightest specular highlights cross the
                threshold — this is a sheen, not a haze. */}
            <Bloom
                intensity={0.62}
                luminanceThreshold={0.62}
                luminanceSmoothing={0.28}
                mipmapBlur
                radius={0.72}
            />
            {/* Very fine grain, so the dark gradient never bands. */}
            <Noise premultiply blendFunction={BlendFunction.OVERLAY} opacity={0.032} />
            <Vignette offset={0.3} darkness={0.72} blendFunction={BlendFunction.NORMAL} />
        </EffectComposer>
    );
}
