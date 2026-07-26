'use client';

/* ImageReveal — the one way a photograph enters an editorial page.

   It is a thin composition layer, not a new engine: the clip-path wipe and the
   scroll-scrubbed drift both come from the existing <ParallaxMedia>. What this
   adds is the three things a content image on a real site needs and that a bare
   <img> keeps getting wrong:

     · a reserved box. width/height come from lib/story-media and the frame
       carries the matching aspect-ratio, so the layout never shifts when the
       file lands. This is the whole of the page's CLS budget.
     · a graceful miss. If the photograph has not been shot yet (or a deploy
       drops it), onError swaps to the brand placeholder that ships with the
       repo. The section still reads as a designed panel.
     · less motion on small screens. Parallax on a phone is mostly jank, so the
       drift is cut to a token amount below 768px.

   Plain <img>, deliberately, not next/image: next.config.js sets
   images.unoptimized, under which next/image emits a single un-srcset <img>
   anyway — the same bytes, plus a wrapper. The benefits it would otherwise
   bring (reserved box, lazy, async decode) are all set explicitly here. */

import { useState } from 'react';
import ParallaxMedia from '@/components/shared/ParallaxMedia';
import useMediaQuery from '@/hooks/useMediaQuery';
import type { Media } from '@/lib/page-media';

type Props = {
    image: Media;
    /** CSS aspect-ratio for the frame. Defaults to the asset's own ratio. */
    ratio?: string;
    className?: string;
    /** Above the fold: load eagerly and skip the wipe (nothing to reveal yet). */
    priority?: boolean;
    /** Drift distance in % of height. Kept small — see ParallaxMedia. */
    strength?: number;
    caption?: string;
};

export default function ImageReveal({
    image,
    ratio,
    className = '',
    priority = false,
    strength = 7,
    caption,
}: Props) {
    const [src, setSrc] = useState(image.src);
    /* `true` as the initial value so the server and the desktop first paint
       agree; the hook corrects it on mount for real phones. */
    const wide = useMediaQuery('(min-width: 768px)', true);

    return (
        <figure
            className={`ir ${className}`.trim()}
            style={{ '--ir-ratio': ratio || `${image.width} / ${image.height}` } as any}
        >
            <ParallaxMedia
                className="ir-frame"
                strength={wide ? strength : 2}
                reveal={!priority}
            >
                <img
                    src={src}
                    alt={image.alt}
                    width={image.width}
                    height={image.height}
                    loading={priority ? 'eager' : 'lazy'}
                    decoding="async"
                    /* One swap only — the guard stops a missing placeholder
                       from looping the error handler forever. Slots with no
                       fallback simply keep the broken src rather than
                       repeatedly re-requesting it. */
                    onError={() =>
                        setSrc((cur) =>
                            image.fallback && cur === image.src ? image.fallback : cur
                        )
                    }
                />
            </ParallaxMedia>
            {caption ? <figcaption className="ir-caption">{caption}</figcaption> : null}
        </figure>
    );
}
