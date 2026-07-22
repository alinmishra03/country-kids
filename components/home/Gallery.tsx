'use client';

/* "A peek inside" — icon-led activity tiles. Each tile represents a daily
   activity with a consistent Lucide icon and caption. Swap these for real
   photos in public/images when available (keep the .gallery-tile shell). */

import Icon from '@/components/shared/Icon';
import { GALLERY } from '@/lib/programs-data';
import { img } from '@/lib/images';

export default function Gallery() {
    return (
        <section className="section">
            <div className="container">
                <div className="section-head">
                    <div className="section-eyebrow">A Peek Inside</div>
                    <h2 className="section-title">Days full of <span>discovery</span></h2>
                    <p className="section-subtitle">
                        Every day blends creativity, movement and gentle learning — here&apos;s a
                        glimpse of what fills our little ones&apos; hours.
                    </p>
                    <div className="divider-dots"><span></span><span></span><span></span></div>
                </div>
                <div className="gallery-grid">
                    {GALLERY.map((tile) => (
                        <figure className="gallery-tile" key={tile.label}>
                            <img
                                className="gallery-tile-img"
                                src={img(tile.img, 500, 60)}
                                alt={`${tile.label} at CountryKids`}
                                loading="lazy"
                                decoding="async"
                                width="400"
                                height="400"
                            />
                            <figcaption className="gallery-tile-label">
                                <Icon name={tile.icon} /> {tile.label}
                            </figcaption>
                        </figure>
                    ))}
                </div>
            </div>
        </section>
    );
}
