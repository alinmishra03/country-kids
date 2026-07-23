'use client';

/* SphereScene — a REAL 3D WebGL photo sphere (React Three Fiber + drei).

   • PerspectiveCamera + ambient/directional lights.
   • OrbitControls (rotation only, damped = inertia).
   • A group of cards on a Fibonacci sphere; the group auto-rotates on X and Y
     forever and gently follows the pointer. Hover slows it down.
   • Every card is BILLBOARDED (drei <Billboard>) so it always faces the camera.
   • Each card is baked to a canvas texture (photo + dark gradient + glass sheen +
     gold icon + room name + age, in the brand fonts) → rendered as a rounded
     plane (rounded corners via the texture's alpha + alphaTest, so depth sorting
     stays correct). Depth dims far cards; near cards stay bright.
   • Load-in: the whole globe scales up from ~0 and settles, then rotates forever.

   Loaded client-only (dynamic ssr:false) from SphereGallery. */

import { useEffect, useMemo, useRef, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Billboard, OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import { ROOMS } from '@/lib/rooms-data';

/* ── Geometry / layout constants (world units) ── */
const RADIUS = 2.75;
const CARD_W = 0.8;
const CARD_H = 1.03;

/* Every unique childcare photo in the project. */
const IMAGE_POOL = [
    '1519689680058-324335c77eba',
    '1526634332515-d56c5fd16991',
    '1503454537195-1dcabb73ffb9',
    '1560785496-3c9d27877182',
    '1544005313-94ddf0286df2',
    '1541692641319-981cc79ee10a',
    '1587616211892-f743fcca64f9',
    '1516627145497-ae6968895b74',
    '1509062522246-3755977927d7',
    '1503676260728-1c00da094a0b',
    '1596464716127-f2a82984de30',
];
const CROPS = ['faces', 'entropy', 'edges', 'center'];
const unsplash = (id: string, crop: string) =>
    `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&crop=${crop}&w=420&q=60`;

/* Even points on a sphere (Fibonacci spiral). */
function fibSphere(n: number, r: number) {
    const pts: THREE.Vector3[] = [];
    const golden = Math.PI * (3 - Math.sqrt(5));
    for (let i = 0; i < n; i++) {
        const phi = Math.acos(1 - (2 * (i + 0.5)) / n);
        const theta = golden * i;
        pts.push(
            new THREE.Vector3(
                r * Math.sin(phi) * Math.cos(theta),
                r * Math.cos(phi),
                r * Math.sin(phi) * Math.sin(theta)
            )
        );
    }
    return pts;
}

/* ── Canvas helpers ── */
function roundRect(ctx: any, x: number, y: number, w: number, h: number, r: number) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
}
function drawCover(ctx: any, img: any, w: number, h: number) {
    const ir = img.width / img.height;
    const r = w / h;
    let sw = img.width;
    let sh = img.height;
    let sx = 0;
    let sy = 0;
    if (ir > r) {
        sw = img.height * r;
        sx = (img.width - sw) / 2;
    } else {
        sh = img.width / r;
        sy = (img.height - sh) / 2;
    }
    ctx.drawImage(img, sx, sy, sw, sh, 0, 0, w, h);
}

/* Bake one premium card (photo + gradient + glass + icon + title + age). */
function bakeCard(img: any, room: any, bri: number) {
    const W = 220;
    const H = 284;
    const S = 1.8;
    const c = document.createElement('canvas');
    c.width = W * S;
    c.height = H * S;
    const ctx: any = c.getContext('2d');
    ctx.scale(S, S);

    roundRect(ctx, 0, 0, W, H, 18);
    ctx.clip();

    if (img) drawCover(ctx, img, W, H);
    else {
        ctx.fillStyle = '#123F55';
        ctx.fillRect(0, 0, W, H);
    }

    // brightness variation so repeats don't read as identical
    if (bri) {
        ctx.fillStyle = bri > 0 ? `rgba(255,255,255,${bri / 120})` : `rgba(0,0,0,${-bri / 120})`;
        ctx.fillRect(0, 0, W, H);
    }

    // dark gradient at the bottom for legibility
    const g = ctx.createLinearGradient(0, H * 0.45, 0, H);
    g.addColorStop(0, 'rgba(11,27,43,0)');
    g.addColorStop(1, 'rgba(11,27,43,0.92)');
    ctx.fillStyle = g;
    ctx.fillRect(0, H * 0.4, W, H * 0.6);

    // subtle glass sheen
    const sheen = ctx.createLinearGradient(0, 0, W, H * 0.5);
    sheen.addColorStop(0, 'rgba(255,255,255,0.16)');
    sheen.addColorStop(0.42, 'rgba(255,255,255,0)');
    ctx.fillStyle = sheen;
    ctx.fillRect(0, 0, W, H * 0.5);

    // gold icon chip
    ctx.fillStyle = '#D8A23A';
    roundRect(ctx, 14, H - 52, 24, 24, 7);
    ctx.fill();

    // room name + age (brand fonts)
    ctx.fillStyle = '#fff';
    ctx.font = '500 17px Newsreader, Georgia, serif';
    ctx.fillText(room.name, 46, H - 33);
    ctx.fillStyle = 'rgba(255,255,255,0.86)';
    ctx.font = '500 12px "Plus Jakarta Sans", system-ui, sans-serif';
    ctx.fillText(room.age, 46, H - 17);

    const tex = new THREE.CanvasTexture(c);
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.anisotropy = 4;
    tex.needsUpdate = true;
    return tex;
}

/* Shared rounded-gold texture for the hover border. */
function makeGoldTexture() {
    const W = 220;
    const H = 284;
    const S = 1.4;
    const c = document.createElement('canvas');
    c.width = W * S;
    c.height = H * S;
    const ctx: any = c.getContext('2d');
    ctx.scale(S, S);
    ctx.fillStyle = '#D8A23A';
    roundRect(ctx, 0, 0, W, H, 20);
    ctx.fill();
    const tex = new THREE.CanvasTexture(c);
    tex.colorSpace = THREE.SRGBColorSpace;
    return tex;
}

function loadImg(src: string): Promise<any> {
    return new Promise((resolve, reject) => {
        const i = new Image();
        i.crossOrigin = 'anonymous';
        i.onload = () => resolve(i);
        i.onerror = reject;
        i.src = src;
    });
}

type Meta = { pos: THREE.Vector3; room: any; url: string; bri: number };

function buildMeta(count: number): Meta[] {
    const pos = fibSphere(count, RADIUS);
    return Array.from({ length: count }, (_, i) => {
        const room = ROOMS[i % ROOMS.length];
        const id = IMAGE_POOL[i % IMAGE_POOL.length];
        const v = Math.floor(i / IMAGE_POOL.length);
        return {
            pos: pos[i],
            room,
            url: unsplash(id, CROPS[v % CROPS.length]),
            bri: ((i * 13) % 24) - 12,
        };
    });
}

async function bakeAll(meta: Meta[]) {
    const urls = Array.from(new Set(meta.map((m) => m.url)));
    const imgs = new Map<string, any>();
    await Promise.all(
        urls.map((u) =>
            loadImg(u)
                .then((img) => imgs.set(u, img))
                .catch(() => imgs.set(u, null))
        )
    );
    if (typeof document !== 'undefined' && (document as any).fonts?.ready) {
        try {
            await (document as any).fonts.ready;
        } catch {
            /* ignore */
        }
    }
    return meta.map((m) => bakeCard(imgs.get(m.url), m.room, m.bri));
}

/* ── One card ── */
const _wp = new THREE.Vector3();

function CardTile({ meta, texture, goldTex, onHover, onSelect }: any) {
    const meshRef = useRef<any>(null);
    const borderRef = useRef<any>(null);
    const st = useRef({ hover: false, active: false });

    useFrame(() => {
        const mesh = meshRef.current;
        const border = borderRef.current;
        if (!mesh || !border) return;
        const s = st.current;
        const tz = s.active ? 0.6 : s.hover ? 0.32 : 0;
        const ts = s.active ? 1.16 : s.hover ? 1.08 : 1;
        mesh.position.z += (tz - mesh.position.z) * 0.15;
        const cs = mesh.scale.x + (ts - mesh.scale.x) * 0.15;
        mesh.scale.setScalar(cs);
        border.scale.setScalar(cs);
        const bo = s.hover || s.active ? 1 : 0;
        border.material.opacity += (bo - border.material.opacity) * 0.15;
        border.position.z = mesh.position.z - 0.012;
        // depth dimming — near bright, far dim
        mesh.getWorldPosition(_wp);
        const d = THREE.MathUtils.clamp((_wp.z + RADIUS) / (2 * RADIUS), 0, 1);
        mesh.material.color.setScalar(0.56 + d * 0.44);
    });

    return (
        <Billboard position={meta.pos}>
            <mesh ref={borderRef} position={[0, 0, -0.012]}>
                <planeGeometry args={[CARD_W * 1.07, CARD_H * 1.055]} />
                <meshBasicMaterial map={goldTex} transparent alphaTest={0.5} opacity={0} toneMapped={false} />
            </mesh>
            <mesh
                ref={meshRef}
                onPointerOver={(e: any) => {
                    e.stopPropagation();
                    st.current.hover = true;
                    onHover(true);
                    document.body.style.cursor = 'pointer';
                }}
                onPointerOut={() => {
                    st.current.hover = false;
                    onHover(false);
                    document.body.style.cursor = 'auto';
                }}
                onClick={(e: any) => {
                    e.stopPropagation();
                    st.current.active = true;
                    onSelect();
                }}
            >
                <planeGeometry args={[CARD_W, CARD_H]} />
                <meshBasicMaterial map={texture} transparent alphaTest={0.5} toneMapped={false} />
            </mesh>
        </Billboard>
    );
}

/* ── The rotating globe ── */
function PhotoGlobe({ count, onSelect }: any) {
    const group = useRef<any>(null);
    const [textures, setTextures] = useState<any[] | null>(null);
    const meta = useMemo(() => buildMeta(count), [count]);
    const goldTex = useMemo(() => makeGoldTexture(), []);
    const anim = useRef({ scale: 0.02, autoX: -0.1, autoY: 0, tiltX: 0, tiltY: 0, speed: 1, target: 1 });

    useEffect(() => {
        let alive = true;
        bakeAll(meta).then((t) => {
            if (alive) setTextures(t);
        });
        return () => {
            alive = false;
        };
    }, [meta]);

    useFrame((state, delta) => {
        const g = group.current;
        if (!g) return;
        const a = anim.current;
        const dt = Math.min(delta, 0.05);
        a.scale += (1 - a.scale) * Math.min(1, dt * 2.4); // load-in
        g.scale.setScalar(a.scale);
        a.speed += (a.target - a.speed) * 0.05; // hover slows
        a.autoY += dt * 0.16 * a.speed;
        a.autoX += dt * 0.06 * a.speed;
        a.tiltY += (state.pointer.x * 0.25 - a.tiltY) * 0.04; // gentle pointer follow
        a.tiltX += (-state.pointer.y * 0.18 - a.tiltX) * 0.04;
        g.rotation.y = a.autoY + a.tiltY;
        g.rotation.x = a.autoX + a.tiltX;
    });

    if (!textures) return null;

    return (
        <group ref={group}>
            {meta.map((m, i) => (
                <CardTile
                    key={i}
                    meta={m}
                    texture={textures[i]}
                    goldTex={goldTex}
                    onHover={(h: boolean) => {
                        anim.current.target = h ? 0.18 : 1;
                    }}
                    onSelect={() => {
                        // Enlarge (handled in the tile), then navigate via the
                        // DOM-tree callback (router context isn't inside <Canvas>).
                        window.setTimeout(() => onSelect?.(m.room.id), 420);
                    }}
                />
            ))}
        </group>
    );
}

/* Pulls the camera back until a sphere of `fit` half-extent is fully inside the
   frame on BOTH axes — needed when the canvas is a full-section background, where
   the viewport can be tall and narrow (mobile) or short and wide. */
function FitCamera({ fit }: { fit: number }) {
    const camera = useThree((s) => s.camera) as THREE.PerspectiveCamera;
    const width = useThree((s) => s.size.width);
    const height = useThree((s) => s.size.height);

    useEffect(() => {
        if (!height) return;
        const halfV = Math.tan((camera.fov * Math.PI) / 360);
        const aspect = width / height;
        camera.position.z = Math.max(fit / halfV, fit / (halfV * aspect));
        camera.updateProjectionMatrix();
    }, [camera, width, height, fit]);

    return null;
}

export default function SphereScene({ count = 50, onSelect, cameraZ = 6.4, fit }: any) {
    return (
        <Canvas
            className="sphere-canvas"
            dpr={[1, 1.8]}
            gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
            camera={{ position: [0, 0, cameraZ], fov: 42 }}
            onCreated={({ gl }) => gl.setClearColor(0x000000, 0)}
        >
            <ambientLight intensity={0.9} />
            <directionalLight position={[3, 4, 5]} intensity={0.6} />
            {fit ? <FitCamera fit={fit} /> : null}
            <PhotoGlobe count={count} onSelect={onSelect} />
            <OrbitControls
                makeDefault
                enableZoom={false}
                enablePan={false}
                enableDamping
                dampingFactor={0.08}
                rotateSpeed={0.5}
            />
        </Canvas>
    );
}
