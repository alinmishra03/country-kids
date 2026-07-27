'use client';

/* VALUES ACCORDION — the "What We Stand For" section on /philosophy.

   A picture on the left, a list of the seven values on the right. Opening a
   value expands its heading and paragraph and cross-fades the picture to the
   one that belongs to it. One value is always open, so the panel is never an
   empty column beside a photograph.

   ── Why the markup is shaped this way ──
   Every value's copy is in the DOM at all times, closed ones collapsed to zero
   height by a `grid-template-rows: 0fr → 1fr` transition. That is the same
   mechanism the mobile nav accordion uses (css/nav.css), and it is here for the
   same two reasons: it animates to the content's real height without measuring
   anything in JS, and it leaves the text in the page for search engines and for
   a reader who never opens a panel.

   All seven photographs are also mounted at once, stacked and cross-faded on
   opacity. Swapping a single <img src> would show a blank frame on every change
   until the next file decoded; stacking means the outgoing and incoming frames
   are both already painted, so the fade has something to fade between.

   Buttons, not links: this changes what is shown on the page, it does not
   navigate. The pair of aria-expanded / aria-controls plus the region's
   aria-labelledby is what makes that legible to a screen reader. */

import { useState } from 'react';
import Reveal from '@/components/shared/Reveal';
import TextReveal from '@/components/shared/TextReveal';
import { VALUES } from '@/lib/philosophy-data';
import { PAGE_MEDIA } from '@/lib/page-media';

const SHOTS = PAGE_MEDIA.philosophy.valueShots;

export default function ValuesAccordion() {
    const [open, setOpen] = useState(0);

    return (
        <section className="section ph-stand">
            <div className="container">
                <Reveal as="span" className="ph-stand-kicker" variant="fadeUp">
                    What We Stand For
                </Reveal>
                <TextReveal as="h2" className="ph-stand-title" delay={0.05}>
                    Seven values, woven through everything
                </TextReveal>
                <Reveal as="p" className="ph-stand-lead" variant="fadeUp" delay={0.1}>
                    These are not words on a wall. They run through every room, every routine,
                    and every relationship we build with children and families.
                </Reveal>

                <Reveal className="ph-stand-layout" variant="fadeUp" amount={0.12}>
                    {/* The stack. aria-hidden throughout: the open value's photo
                        adds nothing a screen reader has not already been told by
                        the panel it illustrates. */}
                    <div className="ph-stand-media" aria-hidden="true">
                        {SHOTS.map((shot, i) => (
                            <img
                                key={shot.src}
                                className={`ph-stand-shot${i === open ? ' is-current' : ''}`}
                                src={shot.src}
                                alt=""
                                width={shot.width}
                                height={shot.height}
                                loading={i === 0 ? 'eager' : 'lazy'}
                                decoding="async"
                            />
                        ))}
                    </div>

                    <ul className="ph-stand-list">
                        {VALUES.map((v: any, i: number) => {
                            const isOpen = i === open;
                            return (
                                <li
                                    className={`ph-stand-item${isOpen ? ' is-open' : ''}`}
                                    key={v.label}
                                >
                                    <h3>
                                        <button
                                            type="button"
                                            className="ph-stand-trigger"
                                            id={`value-tab-${i}`}
                                            aria-expanded={isOpen}
                                            aria-controls={`value-panel-${i}`}
                                            /* Clicking the open one does not close
                                               it — an empty column beside the
                                               photograph is not a state worth
                                               being able to reach. */
                                            onClick={() => setOpen(i)}
                                        >
                                            <span className="ph-stand-label">{v.label}</span>
                                            <span className="ph-stand-mark" aria-hidden="true" />
                                        </button>
                                    </h3>

                                    <div
                                        className="ph-stand-panel"
                                        id={`value-panel-${i}`}
                                        role="region"
                                        aria-labelledby={`value-tab-${i}`}
                                    >
                                        <div className="ph-stand-panel-inner">
                                            <p className="ph-stand-headline">{v.headline}</p>
                                            <p className="ph-stand-text">{v.text}</p>
                                        </div>
                                    </div>
                                </li>
                            );
                        })}
                    </ul>
                </Reveal>
            </div>
        </section>
    );
}
