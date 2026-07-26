'use client';

/* EditorialQuote — the full-width navy band that carries Chapter Two's pull
   quote, lifted out of the prose and given a section of its own.

   The words are unchanged and still come from lib/story-data.ts; only their
   presentation moved. The band takes the site's existing `.section-alt` navy
   surface (css/surfaces.css owns that background at a specificity this
   stylesheet deliberately does not fight), and adds a seed-and-leaf botanical
   texture plus a gold hairline that draws itself open on entry.

   Marked up as <figure> + <blockquote>, so it is a quotation to assistive
   technology and not just large text. */

import Reveal from '@/components/shared/Reveal';
import Icon from '@/components/shared/Icon';

export default function EditorialQuote({ quote }: { quote: string }) {
    return (
        <section className="section section-alt story-quote-band" aria-label="Featured quote">
            <span className="story-quote-texture" aria-hidden="true" />
            <div className="container">
                <Reveal as="figure" className="story-quote-figure" stagger>
                    <Reveal as="span" variant="item" className="story-quote-seed" aria-hidden="true">
                        <Icon name="sprout" size={26} strokeWidth={1.25} />
                    </Reveal>

                    <Reveal as="span" variant="lineGrow" className="story-quote-rule" aria-hidden="true" />

                    <Reveal as="blockquote" variant="item" className="story-quote-text">
                        <p>{quote}</p>
                    </Reveal>
                </Reveal>
            </div>
        </section>
    );
}
