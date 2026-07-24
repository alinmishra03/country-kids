'use client';

/* Camera behaviour: fit, parallax and the select dolly.

   FIT — the resting distance is solved, not guessed. Given the camera's vertical
   FOV and the viewport aspect, it works out the distance at which a sphere of
   `fitRadius` clears BOTH axes, so the globe is never cropped on a tall phone or
   a short landscape window. This is what makes the hero responsive without a
   single breakpoint in the 3D layer.

   PARALLAX — the camera drifts a little against the pointer. It is the camera
   that moves, not the globe, so it reads as depth rather than as the globe
   wobbling, and it never interferes with the drag rotation.

   Everything is lerped in useFrame rather than tweened, because the target moves
   continuously with the pointer; a tween would be permanently restarting. */

import { useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { CAMERA } from '@/lib/hero/hero-config';

type Props = {
    /** Half-extent the camera must frame — the globe's radius plus a card. */
    fitRadius: number;
    selected: boolean;
    reduced: boolean;
};

export default function CameraRig({ fitRadius, selected, reduced }: Props) {
    const target = useRef(new THREE.Vector3(0, 0, CAMERA.z));

    useFrame(({ camera, size, pointer }, rawDelta) => {
        const cam = camera as THREE.PerspectiveCamera;
        const dt = Math.min(rawDelta, 0.05);

        /* ── Solve the resting distance for this viewport ── */
        const halfFov = (cam.fov * Math.PI) / 360;
        const aspect = size.width / Math.max(1, size.height);
        const distV = fitRadius / Math.tan(halfFov);
        const distH = fitRadius / (Math.tan(halfFov) * aspect);
        /* Whichever axis is tighter wins, so nothing is ever cut off. */
        const base = Math.max(distV, distH);

        /* Selecting pulls in by the same proportion the config asks for at the
           default distance, so the dolly feels identical at every viewport. */
        const dollyRatio = selected ? CAMERA.zSelected / CAMERA.z : 1;
        target.current.z = base * dollyRatio;

        /* ── Pointer parallax ── */
        if (!reduced) {
            target.current.x = pointer.x * CAMERA.parallax;
            target.current.y = pointer.y * CAMERA.parallax * 0.6;
        } else {
            target.current.x = 0;
            target.current.y = 0;
        }

        const k = 1 - Math.pow(1 - CAMERA.parallaxEase, dt * 60);
        cam.position.lerp(target.current, k);
        cam.lookAt(0, 0, 0);
        cam.updateProjectionMatrix();
    });

    return null;
}
