'use client';

/* Floating dust — a single Points object in a spherical shell around the globe.

   700 points is one draw call and one buffer that is written ONCE, at build
   time; the drift is the whole object rotating, not per-particle CPU work. The
   sprite is a canvas-generated radial fade, so there is no image to load. */

import { useEffect, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { PARTICLES } from '@/lib/hero/hero-config';

export default function Particles({ reduced }: { reduced: boolean }) {
    const ref = useRef<THREE.Points>(null);

    /* Points spread through a shell, biased outward so the middle stays clear
       for the globe. */
    const geometry = useMemo(() => {
        const positions = new Float32Array(PARTICLES.count * 3);
        const scales = new Float32Array(PARTICLES.count);

        for (let i = 0; i < PARTICLES.count; i++) {
            /* Uniform direction on the unit sphere. */
            const u = Math.random() * 2 - 1;
            const theta = Math.random() * Math.PI * 2;
            const r = Math.sqrt(1 - u * u);

            /* Cube-root keeps the density even through the shell's volume
               instead of piling everything against the inner wall. */
            const t = Math.cbrt(Math.random());
            const radius =
                PARTICLES.innerRadius + t * (PARTICLES.outerRadius - PARTICLES.innerRadius);

            positions[i * 3] = r * Math.cos(theta) * radius;
            positions[i * 3 + 1] = u * radius * 0.75;
            positions[i * 3 + 2] = r * Math.sin(theta) * radius;
            scales[i] = 0.5 + Math.random() * 0.5;
        }

        const g = new THREE.BufferGeometry();
        g.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        g.setAttribute('aScale', new THREE.BufferAttribute(scales, 1));
        return g;
    }, []);

    /* Soft round sprite, drawn once into a 64px canvas. */
    const sprite = useMemo(() => {
        const size = 64;
        const canvas = document.createElement('canvas');
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext('2d')!;

        const gradient = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
        gradient.addColorStop(0, 'rgba(255,255,255,0.9)');
        gradient.addColorStop(0.35, 'rgba(200,225,229,0.35)');
        gradient.addColorStop(1, 'rgba(255,255,255,0)');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, size, size);

        const texture = new THREE.CanvasTexture(canvas);
        texture.colorSpace = THREE.SRGBColorSpace;
        return texture;
    }, []);

    const material = useMemo(
        () =>
            new THREE.PointsMaterial({
                size: PARTICLES.size,
                map: sprite,
                transparent: true,
                opacity: 0.55,
                depthWrite: false,
                blending: THREE.AdditiveBlending,
                sizeAttenuation: true,
                toneMapped: false,
            }),
        [sprite]
    );

    useEffect(
        () => () => {
            geometry.dispose();
            material.dispose();
            sprite.dispose();
        },
        [geometry, material, sprite]
    );

    useFrame((_, delta) => {
        if (reduced || !ref.current) return;
        const dt = Math.min(delta, 0.05);
        /* Counter-rotating on two axes at different rates reads as drifting
           dust rather than a spinning shell. */
        ref.current.rotation.y += PARTICLES.driftSpeed * dt;
        ref.current.rotation.x -= PARTICLES.driftSpeed * 0.4 * dt;
    });

    return <points ref={ref} geometry={geometry} material={material} frustumCulled={false} />;
}
