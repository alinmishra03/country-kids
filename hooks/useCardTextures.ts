'use client';

/* Loads every card photo, bakes each card face to a texture, reports progress
   for the loader, and — importantly — DISPOSES the whole set on unmount.

   Textures are GPU memory that React knows nothing about: without the cleanup
   below, navigating away from the home page and back would leak ~20 MB of VRAM
   per visit. The effect is keyed on the card list, which is a module-level
   constant, so in practice this runs exactly once. */

import { useEffect, useRef, useState } from 'react';
import type * as THREE from 'three';
import type { HeroCard } from '@/lib/hero/hero-cards';
import { bakeCardTexture } from '@/lib/hero/card-texture';
import { cardImageUrl } from '@/lib/hero/card-image';

type Result = {
    textures: THREE.CanvasTexture[] | null;
    /** 0 … 1 — photos fetched, not yet baked. */
    progress: number;
};

export default function useCardTextures(cards: HeroCard[]): Result {
    const [textures, setTextures] = useState<THREE.CanvasTexture[] | null>(null);
    const [progress, setProgress] = useState(0);
    /* Held separately from state so cleanup can reach them even if the effect
       tears down before setState lands. */
    const madeRef = useRef<THREE.CanvasTexture[]>([]);

    useEffect(() => {
        let alive = true;
        let done = 0;

        const load = (url: string) =>
            new Promise<HTMLImageElement | null>((resolve) => {
                const image = new Image();
                image.crossOrigin = 'anonymous';
                image.decoding = 'async';
                const finish = (value: HTMLImageElement | null) => {
                    done += 1;
                    if (alive) setProgress(done / cards.length);
                    resolve(value);
                };
                image.onload = () => finish(image);
                /* A dead photo must not take the whole globe down — that card
                   bakes onto the navy gradient fallback instead. */
                image.onerror = () => finish(null);
                image.src = cardImageUrl(url);
            });

        (async () => {
            const images = await Promise.all(cards.map((c) => load(c.img)));
            if (!alive) return;

            /* Bake AFTER webfonts settle, or the first cards render in Times. */
            try {
                await (document as any).fonts?.ready;
            } catch {
                /* font loading API is optional */
            }
            if (!alive) return;

            const baked = cards.map((card, i) =>
                bakeCardTexture({
                    img: images[i],
                    category: card.category,
                    title: card.title,
                    subtitle: card.subtitle,
                })
            );

            madeRef.current = baked;
            setTextures(baked);
        })();

        return () => {
            alive = false;
            madeRef.current.forEach((t) => t.dispose());
            madeRef.current = [];
        };
    }, [cards]);

    return { textures, progress };
}
