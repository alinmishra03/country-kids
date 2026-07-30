'use client';

/* ─── EXPLORE MORE ────────────────────────────────────────────────────────
   The site's internal-linking section: one card per page, minus the page you
   are on. Rendered near the foot of every content page.

   Route awareness goes through routeIdFromPathname() rather than comparing the
   pathname to each href. That is what makes a nested route behave: on
   /rooms/koala the id still resolves to `rooms`, so the Rooms card correctly
   hides itself instead of inviting a visitor to the page they are reading.

   SEO shape, deliberately:
     · one real <Link> per card, wrapping the whole card — a crawler follows a
       genuine anchor, and a visitor gets the entire card as the hit target
       rather than a 60px "Learn more" stub
     · the anchor's accessible name is the page's ariaLabel ("Explore our seven
       rooms"), not "Learn more" nine times over, which is what a screen reader
       user hears when they list the links on the page
     · the visible heading inside the card is the real page title, so the
       anchor text a crawler reads is descriptive on its own

   Keyboard: the card IS the anchor, so it is in the tab order once, focus is
   visible on the whole card, and the arrow reacts to :focus-visible exactly as
   it does to hover. There is no nested interactive content — a button inside
   an anchor would be invalid and would trap a second tab stop per card. */

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Reveal from '@/components/shared/Reveal';
import Icon from '@/components/shared/Icon';
import { routeIdFromPathname } from '@/lib/routes';
import {
    PAGE_LINKS,
    NAVIGATOR_HEADINGS,
    NAVIGATOR_FALLBACK,
    CARD_IMAGE_SIZE,
} from '@/lib/page-links';

export default function PageNavigator({
    /** Override the band's surface when the page below it is already tinted. */
    className = '',
}: {
    className?: string;
}) {
    const pathname = usePathname();
    const currentId = routeIdFromPathname(pathname);

    const links = PAGE_LINKS.filter((page) => page.id !== currentId);

    /* Nothing to link to. Cannot happen with the current directory, but a
       one-page site should render nothing rather than an empty heading. */
    if (links.length === 0) return null;

    const heading = NAVIGATOR_HEADINGS[currentId] ?? NAVIGATOR_FALLBACK;

    return (
        <section
            className={`section page-navigator ${className}`.trim()}
            aria-labelledby="explore-more-heading"
        >
            <div className="container">
                <Reveal className="page-navigator-head">
                    <p className="page-navigator-kicker">{heading.kicker}</p>
                    <h2 id="explore-more-heading">{heading.title}</h2>
                </Reveal>

                <Reveal as="ul" className="page-navigator-grid" stagger amount={0.08}>
                    {links.map((page) => (
                        <Reveal as="li" variant="item" key={page.id} className="pn-card">
                            <Link
                                href={page.href}
                                className="pn-card-link"
                                aria-label={page.ariaLabel}
                            >
                                {/* Decorative: the card already carries the page
                                    title and the anchor an accessible label, so
                                    alt="" keeps a screen reader from announcing
                                    the same destination a third time. The scrim
                                    is a sibling rather than a background-image so
                                    the photograph can zoom underneath it while
                                    the scrim holds still — a scrim that scales
                                    with the image would let its dark end drift
                                    off the text it exists to protect. */}
                                <span className="pn-card-media" aria-hidden="true">
                                    <img
                                        src={page.image}
                                        alt=""
                                        width={CARD_IMAGE_SIZE.width}
                                        height={CARD_IMAGE_SIZE.height}
                                        loading="lazy"
                                        decoding="async"
                                    />
                                </span>
                                <span className="pn-card-scrim" aria-hidden="true" />

                                <span className="pn-card-icon" aria-hidden="true">
                                    <Icon name={page.icon} />
                                </span>
                                <span className="pn-card-body">
                                    <span className="pn-card-title">{page.title}</span>
                                    <span className="pn-card-summary">{page.summary}</span>
                                    <span className="pn-card-cue" aria-hidden="true">
                                        Learn more
                                        <Icon name="arrow-right" />
                                    </span>
                                </span>
                            </Link>
                        </Reveal>
                    ))}
                </Reveal>
            </div>
        </section>
    );
}
