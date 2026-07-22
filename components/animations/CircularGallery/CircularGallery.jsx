'use client';

/* CircularGallery — an OGL/WebGL curved, infinite, draggable image gallery
   (React-Bits pattern), adapted for Next.js App Router. It is imported client-only
   (ssr:false) from the section, so `window`/WebGL are never touched during SSR.
   The renderer, geometry, textures, listeners and RAF loop are all torn down in
   destroy() on unmount — no leaks, no duplicate canvases. Respects
   prefers-reduced-motion (skips the idle wobble/auto-motion). */

import { useEffect, useRef } from 'react';
import { Renderer, Camera, Transform, Plane, Mesh, Program, Texture } from 'ogl';
import './CircularGallery.css';

function debounce(func, wait) {
    let timeout;
    return function (...args) {
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(this, args), wait);
    };
}

function lerp(p1, p2, t) {
    return p1 + (p2 - p1) * t;
}

function autoBind(instance) {
    const proto = Object.getPrototypeOf(instance);
    Object.getOwnPropertyNames(proto).forEach((key) => {
        if (key !== 'constructor' && typeof instance[key] === 'function') {
            instance[key] = instance[key].bind(instance);
        }
    });
}

function createTextTexture(gl, text, font = '600 30px sans-serif', color = '#0B1B2B') {
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    context.font = font;
    const metrics = context.measureText(text);
    const textWidth = Math.ceil(metrics.width);
    const textHeight = Math.ceil(parseInt(font, 10) * 1.35);
    canvas.width = textWidth + 24;
    canvas.height = textHeight + 24;
    context.font = font;
    context.fillStyle = color;
    context.textBaseline = 'middle';
    context.textAlign = 'center';
    context.clearRect(0, 0, canvas.width, canvas.height);
    context.fillText(text, canvas.width / 2, canvas.height / 2);
    const texture = new Texture(gl, { generateMipmaps: false });
    texture.image = canvas;
    return { texture, width: canvas.width, height: canvas.height };
}

class Title {
    constructor({ gl, plane, text, textColor = '#0B1B2B', font = '600 30px sans-serif' }) {
        autoBind(this);
        this.gl = gl;
        this.plane = plane;
        this.text = text;
        this.textColor = textColor;
        this.font = font;
        this.createMesh();
    }
    createMesh() {
        const { texture, width, height } = createTextTexture(
            this.gl,
            this.text,
            this.font,
            this.textColor
        );
        const geometry = new Plane(this.gl);
        const program = new Program(this.gl, {
            transparent: true,
            depthTest: false,
            depthWrite: false,
            vertex: `
                attribute vec3 position;
                attribute vec2 uv;
                uniform mat4 modelViewMatrix;
                uniform mat4 projectionMatrix;
                varying vec2 vUv;
                void main() {
                    vUv = uv;
                    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
                }
            `,
            fragment: `
                precision highp float;
                uniform sampler2D tMap;
                varying vec2 vUv;
                void main() {
                    vec4 color = texture2D(tMap, vUv);
                    if (color.a < 0.1) discard;
                    gl_FragColor = color;
                }
            `,
            uniforms: { tMap: { value: texture } },
        });
        this.mesh = new Mesh(this.gl, { geometry, program });
        const aspect = width / height;
        const textHeightScaled = this.plane.scale.y * 0.15;
        const textWidthScaled = textHeightScaled * aspect;
        this.mesh.scale.set(textWidthScaled, textHeightScaled, 1);
        this.mesh.position.y = -this.plane.scale.y * 0.5 - textHeightScaled * 0.5 - 0.05;
        this.mesh.setParent(this.plane);
    }
}

class Media {
    constructor({
        geometry,
        gl,
        image,
        index,
        length,
        scene,
        screen,
        text,
        viewport,
        bend,
        textColor,
        borderRadius = 0,
        font,
        reduced,
    }) {
        this.geometry = geometry;
        this.gl = gl;
        this.image = image;
        this.index = index;
        this.length = length;
        this.scene = scene;
        this.screen = screen;
        this.text = text;
        this.viewport = viewport;
        this.bend = bend;
        this.textColor = textColor;
        this.borderRadius = borderRadius;
        this.font = font;
        this.reduced = reduced;
        this.extra = 0;
        this.createShader();
        this.createMesh();
        this.createTitle();
        this.onResize();
    }
    createShader() {
        const texture = new Texture(this.gl, { generateMipmaps: true });
        this.program = new Program(this.gl, {
            depthTest: false,
            depthWrite: false,
            vertex: `
                precision highp float;
                attribute vec3 position;
                attribute vec2 uv;
                uniform mat4 modelViewMatrix;
                uniform mat4 projectionMatrix;
                uniform float uTime;
                uniform float uSpeed;
                varying vec2 vUv;
                void main() {
                    vUv = uv;
                    vec3 p = position;
                    p.z = (sin(p.x * 4.0 + uTime) * 1.5 + cos(p.y * 2.0 + uTime) * 1.5) * (0.1 + uSpeed * 0.5);
                    gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
                }
            `,
            fragment: `
                precision highp float;
                uniform vec2 uImageSizes;
                uniform vec2 uPlaneSizes;
                uniform sampler2D tMap;
                uniform float uBorderRadius;
                varying vec2 vUv;
                float roundedBoxSDF(vec2 p, vec2 b, float r) {
                    vec2 d = abs(p) - b + vec2(r);
                    return length(max(d, 0.0)) + min(max(d.x, d.y), 0.0) - r;
                }
                void main() {
                    vec2 ratio = vec2(
                        min((uPlaneSizes.x / uPlaneSizes.y) / (uImageSizes.x / uImageSizes.y), 1.0),
                        min((uPlaneSizes.y / uPlaneSizes.x) / (uImageSizes.y / uImageSizes.x), 1.0)
                    );
                    vec2 uv = vec2(
                        vUv.x * ratio.x + (1.0 - ratio.x) * 0.5,
                        vUv.y * ratio.y + (1.0 - ratio.y) * 0.5
                    );
                    vec4 color = texture2D(tMap, uv);
                    float d = roundedBoxSDF(vUv - 0.5, vec2(0.5 - uBorderRadius), uBorderRadius);
                    float edge = 0.002;
                    float alpha = 1.0 - smoothstep(-edge, edge, d);
                    if (alpha < 0.01) discard;
                    gl_FragColor = vec4(color.rgb, alpha);
                }
            `,
            uniforms: {
                tMap: { value: texture },
                uImageSizes: { value: [0, 0] },
                uPlaneSizes: { value: [0, 0] },
                uSpeed: { value: 0 },
                uTime: { value: 100 * Math.random() },
                uBorderRadius: { value: this.borderRadius },
            },
            transparent: true,
        });
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.src = this.image;
        img.onload = () => {
            texture.image = img;
            this.program.uniforms.uImageSizes.value = [img.naturalWidth, img.naturalHeight];
        };
    }
    createMesh() {
        this.plane = new Mesh(this.gl, { geometry: this.geometry, program: this.program });
        this.plane.setParent(this.scene);
    }
    createTitle() {
        this.title = new Title({
            gl: this.gl,
            plane: this.plane,
            text: this.text,
            textColor: this.textColor,
            font: this.font,
        });
    }
    update(scroll, direction) {
        this.plane.position.x = this.x - scroll.current - this.extra;

        const x = this.plane.position.x;
        const H = this.viewport.width / 2;

        if (this.bend === 0) {
            this.plane.position.y = 0;
            this.plane.rotation.z = 0;
        } else {
            const B_abs = Math.abs(this.bend);
            const R = (H * H + B_abs * B_abs) / (2 * B_abs);
            const effectiveX = Math.min(Math.abs(x), H);
            const arc = R - Math.sqrt(R * R - effectiveX * effectiveX);
            if (this.bend > 0) {
                this.plane.position.y = -arc;
                this.plane.rotation.z = -Math.sign(x) * Math.asin(effectiveX / R);
            } else {
                this.plane.position.y = arc;
                this.plane.rotation.z = Math.sign(x) * Math.asin(effectiveX / R);
            }
        }

        this.speed = scroll.current - scroll.last;
        if (!this.reduced) {
            this.program.uniforms.uTime.value += 0.04;
            this.program.uniforms.uSpeed.value = this.speed;
        }

        const planeOffset = this.plane.scale.x / 2;
        const viewportOffset = this.viewport.width / 2;
        this.isBefore = this.plane.position.x + planeOffset < -viewportOffset;
        this.isAfter = this.plane.position.x - planeOffset > viewportOffset;
        if (direction === 'right' && this.isBefore) {
            this.extra -= this.widthTotal;
            this.isBefore = this.isAfter = false;
        }
        if (direction === 'left' && this.isAfter) {
            this.extra += this.widthTotal;
            this.isBefore = this.isAfter = false;
        }
    }
    onResize({ screen, viewport } = {}) {
        if (screen) this.screen = screen;
        if (viewport) this.viewport = viewport;
        this.scale = this.screen.height / 1500;
        this.plane.scale.y = (this.viewport.height * (900 * this.scale)) / this.screen.height;
        this.plane.scale.x = (this.viewport.width * (700 * this.scale)) / this.screen.width;
        this.plane.program.uniforms.uPlaneSizes.value = [this.plane.scale.x, this.plane.scale.y];
        this.padding = 2;
        this.width = this.plane.scale.x + this.padding;
        this.widthTotal = this.width * this.length;
        this.x = this.width * this.index;
    }
}

class App {
    constructor(
        container,
        { items, bend = 3, textColor = '#0B1B2B', borderRadius = 0, font = '600 30px sans-serif', scrollSpeed = 2, scrollEase = 0.05, reduced = false } = {}
    ) {
        this.container = container;
        this.scrollSpeed = scrollSpeed;
        this.scroll = { ease: scrollEase, current: 0, target: 0, last: 0 };
        this.reduced = reduced;
        autoBind(this);
        this.createRenderer();
        this.createCamera();
        this.createScene();
        this.onResize();
        this.createGeometry();
        this.createMedias(items, bend, textColor, borderRadius, font);
        this.update();
        this.addEventListeners();
    }
    createRenderer() {
        this.renderer = new Renderer({ alpha: true, antialias: true, dpr: Math.min(window.devicePixelRatio || 1, 2) });
        this.gl = this.renderer.gl;
        this.gl.clearColor(0, 0, 0, 0);
        this.container.appendChild(this.gl.canvas);
    }
    createCamera() {
        this.camera = new Camera(this.gl);
        this.camera.fov = 45;
        this.camera.position.z = 20;
    }
    createScene() {
        this.scene = new Transform();
    }
    createGeometry() {
        this.planeGeometry = new Plane(this.gl, {
            heightSegments: 50,
            widthSegments: 100,
        });
    }
    createMedias(items, bend, textColor, borderRadius, font) {
        this.mediasImages = items.concat(items);
        this.medias = this.mediasImages.map((data, index) => {
            return new Media({
                geometry: this.planeGeometry,
                gl: this.gl,
                image: data.image,
                index,
                length: this.mediasImages.length,
                scene: this.scene,
                screen: this.screen,
                text: data.text,
                viewport: this.viewport,
                bend,
                textColor,
                borderRadius,
                font,
                reduced: this.reduced,
            });
        });
    }
    onTouchDown(e) {
        this.isDown = true;
        this.scroll.position = this.scroll.current;
        this.start = e.touches ? e.touches[0].clientX : e.clientX;
    }
    onTouchMove(e) {
        if (!this.isDown) return;
        const x = e.touches ? e.touches[0].clientX : e.clientX;
        const distance = (this.start - x) * (this.scrollSpeed * 0.025);
        this.scroll.target = this.scroll.position + distance;
    }
    onTouchUp() {
        this.isDown = false;
        this.onCheck();
    }
    onWheel(e) {
        const delta = e.deltaY || e.wheelDelta || e.detail;
        this.scroll.target += (delta > 0 ? this.scrollSpeed : -this.scrollSpeed) * 0.2;
        this.onCheckDebounce();
    }
    onKeyDown(e) {
        if (!this.medias || !this.medias[0]) return;
        const width = this.medias[0].width;
        if (e.key === 'ArrowLeft') {
            this.scroll.target -= width;
            this.onCheck();
        } else if (e.key === 'ArrowRight') {
            this.scroll.target += width;
            this.onCheck();
        }
    }
    onCheck() {
        if (!this.medias || !this.medias[0]) return;
        const width = this.medias[0].width;
        const itemIndex = Math.round(Math.abs(this.scroll.target) / width);
        const item = width * itemIndex;
        this.scroll.target = this.scroll.target < 0 ? -item : item;
    }
    onResize() {
        this.screen = {
            width: this.container.clientWidth,
            height: this.container.clientHeight,
        };
        this.renderer.setSize(this.screen.width, this.screen.height);
        this.camera.perspective({ aspect: this.gl.canvas.width / this.gl.canvas.height });
        const fov = (this.camera.fov * Math.PI) / 180;
        const height = 2 * Math.tan(fov / 2) * this.camera.position.z;
        const width = height * this.camera.aspect;
        this.viewport = { width, height };
        if (this.medias) {
            this.medias.forEach((media) =>
                media.onResize({ screen: this.screen, viewport: this.viewport })
            );
        }
    }
    update() {
        this.scroll.current = lerp(this.scroll.current, this.scroll.target, this.scroll.ease);
        const direction = this.scroll.current > this.scroll.last ? 'right' : 'left';
        if (this.medias) {
            this.medias.forEach((media) => media.update(this.scroll, direction));
        }
        this.renderer.render({ scene: this.scene, camera: this.camera });
        this.scroll.last = this.scroll.current;
        this.raf = window.requestAnimationFrame(this.update);
    }
    addEventListeners() {
        this.boundResize = debounce(this.onResize, 200);
        window.addEventListener('resize', this.boundResize);
        this.onCheckDebounce = debounce(this.onCheck, 200);
        const el = this.container;
        el.addEventListener('wheel', this.onWheel, { passive: true });
        el.addEventListener('keydown', this.onKeyDown);
        el.addEventListener('mousedown', this.onTouchDown);
        window.addEventListener('mousemove', this.onTouchMove);
        window.addEventListener('mouseup', this.onTouchUp);
        el.addEventListener('touchstart', this.onTouchDown, { passive: true });
        el.addEventListener('touchmove', this.onTouchMove, { passive: true });
        window.addEventListener('touchend', this.onTouchUp);
    }
    destroy() {
        window.cancelAnimationFrame(this.raf);
        window.removeEventListener('resize', this.boundResize);
        const el = this.container;
        if (el) {
            el.removeEventListener('wheel', this.onWheel);
            el.removeEventListener('keydown', this.onKeyDown);
            el.removeEventListener('mousedown', this.onTouchDown);
            el.removeEventListener('touchstart', this.onTouchDown);
            el.removeEventListener('touchmove', this.onTouchMove);
        }
        window.removeEventListener('mousemove', this.onTouchMove);
        window.removeEventListener('mouseup', this.onTouchUp);
        window.removeEventListener('touchend', this.onTouchUp);
        // Release WebGL context + remove the canvas so no duplicate ever lingers.
        if (this.renderer && this.gl && this.gl.canvas) {
            const ext = this.gl.getExtension('WEBGL_lose_context');
            if (ext) ext.loseContext();
            if (this.gl.canvas.parentNode) {
                this.gl.canvas.parentNode.removeChild(this.gl.canvas);
            }
        }
    }
}

export default function CircularGallery({
    items = [],
    bend = 3,
    textColor = '#0B1B2B',
    borderRadius = 0.05,
    font = '600 28px Inter, system-ui, sans-serif',
    scrollSpeed = 2,
    scrollEase = 0.05,
}) {
    const containerRef = useRef(null);

    useEffect(() => {
        const container = containerRef.current;
        if (!container || !items.length) return;
        const reduced =
            window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        const app = new App(container, {
            items,
            bend,
            textColor,
            borderRadius,
            font,
            scrollSpeed,
            scrollEase,
            reduced,
        });
        return () => app.destroy();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [items, bend, textColor, borderRadius, font, scrollSpeed, scrollEase]);

    return (
        <div
            className="circular-gallery"
            ref={containerRef}
            role="region"
            aria-label="Learning spaces gallery — drag, swipe or scroll to explore"
            tabIndex={0}
        />
    );
}
