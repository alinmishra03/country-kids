/* Bakes one card face — photo, scrim, category pill, title, subtitle, glass
   sheen and inner border — onto a 2D canvas, once, and hands back a texture.

   Baking beats rendering 3D text (drei <Text> / troika) here for three reasons:
     · the brand fonts are used exactly as they appear everywhere else on the
       site, with no font atlas to ship or CDN to depend on;
     · it is ONE draw call and ONE texture per card instead of a mesh per glyph;
     · type, scrim and photo are composited in 2D, where a designer's controls
       (tracking, gradients, pill radii) actually exist.

   The trade is that text is not resolution-independent — see TEXTURE in
   hero-config for how the size was chosen. */

import * as THREE from 'three';
import { TEXTURE } from '@/lib/hero/hero-config';

/* Brand palette — the same values as css/base.css. */
const NAVY = '5, 32, 74';
const ACCENT = '#F0D28A';        /* gold accent — matches --gold-deep on dark */
const ACCENT_FILL = 'rgba(201, 162, 39, 0.92)';  /* gold pill fill */
/* A step lighter than the gold accent — on near-solid navy this clears AA at
   the subtitle's small size, which the mid gold alone does not. */
const SUBTITLE = '#F5E0A8';

export type BakeInput = {
    img: HTMLImageElement | null;
    category: string;
    title: string;
    subtitle: string;
};

export function bakeCardTexture({ img, category, title, subtitle }: BakeInput) {
    const W = TEXTURE.width;
    const H = TEXTURE.height;

    const canvas = document.createElement('canvas');
    canvas.width = W;
    canvas.height = H;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('2D context unavailable');

    /* ── Photo, cover-fitted ── */
    if (img) drawCover(ctx, img, W, H);
    else {
        const bg = ctx.createLinearGradient(0, 0, W, H);
        bg.addColorStop(0, '#123F55');
        bg.addColorStop(1, '#05204A');
        ctx.fillStyle = bg;
        ctx.fillRect(0, 0, W, H);
    }

    /* ── Legibility scrim: clear at the top, near-solid navy under the type ──
       Two stacked gradients rather than one. The first is the soft photo
       fade-out; the second is a short, much steeper ramp that sits only behind
       the text block, so the type gets a genuinely dark backing without the
       whole lower half of the photo going flat. */
    const scrim = ctx.createLinearGradient(0, H * 0.3, 0, H);
    scrim.addColorStop(0, `rgba(${NAVY}, 0)`);
    scrim.addColorStop(0.5, `rgba(${NAVY}, 0.66)`);
    scrim.addColorStop(1, `rgba(${NAVY}, 0.94)`);
    ctx.fillStyle = scrim;
    ctx.fillRect(0, H * 0.3, W, H * 0.7);

    const textPanel = ctx.createLinearGradient(0, H * 0.62, 0, H);
    textPanel.addColorStop(0, `rgba(${NAVY}, 0)`);
    textPanel.addColorStop(0.45, `rgba(${NAVY}, 0.7)`);
    textPanel.addColorStop(1, `rgba(${NAVY}, 0.97)`);
    ctx.fillStyle = textPanel;
    ctx.fillRect(0, H * 0.62, W, H * 0.38);

    /* A touch of navy over the whole card unifies 24 different photos into one
       object — without it the globe reads as a pile of stock images. */
    ctx.fillStyle = `rgba(${NAVY}, 0.14)`;
    ctx.fillRect(0, 0, W, H);

    /* ── Glass sheen: a single diagonal highlight, upper-left key ── */
    const sheen = ctx.createLinearGradient(0, 0, W * 0.9, H * 0.62);
    sheen.addColorStop(0, 'rgba(255,255,255,0.26)');
    sheen.addColorStop(0.34, 'rgba(255,255,255,0.05)');
    sheen.addColorStop(0.62, 'rgba(255,255,255,0)');
    ctx.fillStyle = sheen;
    ctx.fillRect(0, 0, W, H);

    /* ── Category pill, top-left ── */
    drawPill(ctx, category.toUpperCase(), 22, 22);

    /* ── Title + subtitle, bottom-left ──
       Both are drawn with a soft drop shadow. On a photo card that is what
       actually guarantees contrast: the scrim handles the average case, the
       shadow handles a bright patch landing right behind a letter. */
    const pad = 26;
    ctx.textBaseline = 'alphabetic';
    ctx.shadowColor = 'rgba(0, 0, 0, 0.65)';
    ctx.shadowBlur = 10;
    ctx.shadowOffsetY = 1;

    ctx.fillStyle = SUBTITLE;
    ctx.font = `500 15px "Plus Jakarta Sans", system-ui, sans-serif`;
    const subY = H - pad;
    ctx.fillText(clip(ctx, subtitle, W - pad * 2), pad, subY);

    /* Up to three lines: several room and series names wrap, and a clipped
       title is worse than a slightly taller block. */
    ctx.fillStyle = '#FFFFFF';
    ctx.font = `500 31px Newsreader, Georgia, serif`;
    wrapText(ctx, title, pad, subY - 30, W - pad * 2, 34, 3);

    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;
    ctx.shadowOffsetY = 0;

    /* ── Inner hairline, so the card has a visible edge even against a dark
          background where the bevel highlight has nothing to catch ── */
    ctx.strokeStyle = 'rgba(255,255,255,0.22)';
    ctx.lineWidth = 2;
    ctx.strokeRect(1, 1, W - 2, H - 2);

    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.anisotropy = TEXTURE.anisotropy;
    texture.generateMipmaps = true;
    texture.minFilter = THREE.LinearMipmapLinearFilter;
    texture.needsUpdate = true;

    return texture;
}

/* object-fit: cover, in canvas terms. */
function drawCover(ctx: CanvasRenderingContext2D, img: HTMLImageElement, w: number, h: number) {
    const target = w / h;
    const source = img.width / img.height;

    let sw = img.width;
    let sh = img.height;
    let sx = 0;
    let sy = 0;

    if (source > target) {
        sw = img.height * target;
        sx = (img.width - sw) / 2;
    } else {
        sh = img.width / target;
        sy = (img.height - sh) / 2;
    }
    ctx.drawImage(img, sx, sy, sw, sh, 0, 0, w, h);
}

/* Small gold capsule holding the category. */
function drawPill(ctx: CanvasRenderingContext2D, text: string, x: number, y: number) {
    ctx.font = `500 12px "Plus Jakarta Sans", system-ui, sans-serif`;
    const padX = 12;
    const w = ctx.measureText(text).width + padX * 2;
    const h = 26;
    const r = h / 2;

    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();

    ctx.fillStyle = ACCENT_FILL;
    ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,255,0.3)';
    ctx.lineWidth = 1;
    ctx.stroke();

    ctx.fillStyle = '#FFFFFF';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, x + padX, y + h / 2 + 1);
}

/* Word-wrap upward from a baseline, capped at `maxLines`. */
function wrapText(
    ctx: CanvasRenderingContext2D,
    text: string,
    x: number,
    baseline: number,
    maxWidth: number,
    lineHeight: number,
    maxLines: number
) {
    const words = text.split(' ');
    const lines: string[] = [];
    let line = '';

    for (const word of words) {
        const next = line ? `${line} ${word}` : word;
        if (ctx.measureText(next).width > maxWidth && line) {
            lines.push(line);
            line = word;
        } else {
            line = next;
        }
    }
    if (line) lines.push(line);

    const shown = lines.slice(0, maxLines);
    /* If the title genuinely does not fit, end on an ellipsis rather than
       silently dropping words — a truncated word reads as a bug. */
    if (lines.length > maxLines) {
        shown[maxLines - 1] = clip(ctx, `${shown[maxLines - 1]} ${lines[maxLines]}`, maxWidth);
    }
    /* Drawn bottom-up so the block always sits on the given baseline. */
    shown.reverse().forEach((l, i) => ctx.fillText(l, x, baseline - i * lineHeight));
}

/* Truncate with an ellipsis rather than letting a long line run off the card. */
function clip(ctx: CanvasRenderingContext2D, text: string, maxWidth: number) {
    if (ctx.measureText(text).width <= maxWidth) return text;
    let out = text;
    while (out.length > 1 && ctx.measureText(`${out}…`).width > maxWidth) {
        out = out.slice(0, -1);
    }
    return `${out}…`;
}

/* cardImageUrl lives in lib/hero/card-image.ts — it must stay importable
   WITHOUT dragging three.js in, because the DOM focus card needs it. */
