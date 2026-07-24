'use client';

/* The WebGL layer: canvas, quality tier, and the loading gate.

   Client-only (Hero imports it with next/dynamic ssr:false) so nothing here is
   ever asked to render without a GPU. It draws BEHIND the overlay copy and is
   pointer-transparent to nothing — the drag surface is the canvas itself, and
   the overlay above it passes pointer events through except on its buttons. */

import { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { QUALITY, CAMERA, GLOBE } from '@/lib/hero/hero-config';
import type { HeroCard } from '@/lib/hero/hero-cards';
import type { GlobeApi } from '@/hooks/useGlobeControls';
import type { FocusOrigin } from '@/components/home/hero/FocusCard';
import useCardTextures from '@/hooks/useCardTextures';
import useMediaQuery from '@/hooks/useMediaQuery';
import CameraRig from '@/components/home/hero/CameraRig';
import Effects from '@/components/home/hero/Effects';
import Globe from '@/components/home/hero/Globe';
import Lights from '@/components/home/hero/Lights';
import Loader from '@/components/home/hero/Loader';
import Particles from '@/components/home/hero/Particles';

type Props = {
    cards: HeroCard[];
    selectedIndex: number | null;
    onSelect: (index: number, origin: FocusOrigin) => void;
    onClear: () => void;
    apiRef: React.MutableRefObject<GlobeApi | null>;
    reduced: boolean;
    /** Pushes the whole globe back — blur + fade — behind the focus card. */
    dimmed: boolean;
};

export default function Scene({
    cards,
    selectedIndex,
    onSelect,
    onClear,
    apiRef,
    reduced,
    dimmed,
}: Props) {
    const { textures, progress } = useCardTextures(cards);

    const isMobile = useMediaQuery(`(max-width: ${QUALITY.mobileBreakpoint - 1}px)`);
    const isNarrow = useMediaQuery('(max-width: 600px)');
    const isTablet = useMediaQuery('(max-width: 1200px)');

    /* How much of the world the camera has to frame. A LARGER value pulls the
       camera back, so the globe reads smaller — which is the tablet step. The
       phone value goes the other way on purpose: the camera comes in and the
       ball bleeds past the edges, so the front face fills the screen instead of
       shrinking to a marble. An active card is always rotated to front centre
       there, so it is never the one hanging off the edge. */
    const fitRadius = isNarrow
        ? 3.1
        : isMobile
          ? 3.8
          : isTablet
            ? 4.1
            : CAMERA.fit;

    /* Postprocessing and shadow maps are the two real costs. Both are desktop-
       only, and both are off entirely under reduced motion. */
    const heavy = !isMobile && !reduced;

    return (
        <div className={`hero-canvas${dimmed ? ' is-dimmed' : ''}`}>
            <Canvas
                dpr={isMobile ? QUALITY.dprMobile : QUALITY.dprDesktop}
                shadows={heavy ? 'soft' : false}
                gl={{
                    antialias: !heavy, // the composer handles AA when it runs
                    alpha: true,
                    powerPreference: 'high-performance',
                    stencil: false,
                    depth: true,
                }}
                camera={{
                    fov: CAMERA.fov,
                    near: CAMERA.near,
                    far: CAMERA.far,
                    position: [0, 0, CAMERA.z],
                }}
                /* Transparent, so the CSS gradient below shows through — but the
                   clear COLOUR is the hero's own base navy, not black, so if a
                   postprocessing pass ever flattens the alpha the canvas still
                   matches the background instead of punching a black hole. */
                onCreated={({ gl }) => gl.setClearColor(0x02030a, 0)}
            >
                <Suspense fallback={null}>
                    <Lights shadows={heavy} />
                    <Particles reduced={reduced} />

                    {textures && (
                        <Globe
                            cards={cards}
                            textures={textures}
                            selectedIndex={selectedIndex}
                            onSelect={onSelect}
                            onClear={onClear}
                            apiRef={apiRef}
                            reduced={reduced}
                            scale={1}
                        />
                    )}

                    <CameraRig
                        /* The globe's own half-extent is its radius plus half a
                           card; `fitRadius` is the framing target on top of it. */
                        fitRadius={Math.min(fitRadius, GLOBE.radius + GLOBE.cardH)}
                        selected={selectedIndex !== null}
                        reduced={reduced}
                    />

                    {heavy && <Effects />}
                </Suspense>
            </Canvas>

            <Loader progress={progress} ready={Boolean(textures)} />
        </div>
    );
}
