'use client';

/* Playful placeholder gallery. Swap the emoji tiles for real photos in
   public/images when available. */

const TILES = ['\u{1F3A8}', '\u{1F9F1}', '\u{1F4DA}', '\u{26BD}', '\u{1F3B5}', '\u{1F996}', '\u{1F31E}', '\u{1F9EE}'];

export default function Gallery() {
    return (
        <section className="section">
            <div className="container">
                <div className="section-head">
                    <div className="section-eyebrow">A Peek Inside</div>
                    <h2 className="section-title">Days full of <span>discovery</span></h2>
                    <div className="divider-dots"><span></span><span></span><span></span></div>
                </div>
                <div className="gallery-grid">
                    {TILES.map((t, i) => (
                        <div className="gallery-tile" key={i} aria-hidden="true">{t}</div>
                    ))}
                </div>
            </div>
        </section>
    );
}
