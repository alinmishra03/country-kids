'use client';

/* Home welcome / story teaser. Two columns: a revealed photograph beside the
   opening of the centre's story, with a signature and a link to the full story. */

import Link from 'next/link';
import Reveal from '@/components/shared/Reveal';
import Icon from '@/components/shared/Icon';
import { Blob, FloatingDots } from '@/components/shared/Decor';
import { img, PHOTOS } from '@/lib/images';
import { STORY_INTRO } from '@/lib/story-data';

export default function WelcomeSection() {
    return (
        <section className="section welcome" id="welcome">
            <Blob variant="gold" className="decor-tr" />
            <Blob variant="navy" className="decor-bl" />
            <FloatingDots className="welcome-dots" />
            <div className="container welcome-grid">
                <Reveal className="welcome-media" variant="imageReveal">
                    <img
                        src={img(PHOTOS.aboutHome, 900, 66)}
                        alt="Educators and children together at Country Kids"
                        loading="lazy"
                        decoding="async"
                        width="900"
                        height="1040"
                    />
                    <div className="welcome-media-badge">
                        <Icon name="heart-handshake" />
                        <span><b>Est. 2026</b>Not-for-profit, Ravenhall</span>
                    </div>
                </Reveal>

                <Reveal className="welcome-copy" stagger>
                    <Reveal as="span" variant="item" className="section-eyebrow">{STORY_INTRO.kicker}</Reveal>
                    <Reveal as="h2" variant="item" className="section-title">
                        A dream, <span>rooted in Country</span>
                    </Reveal>
                    <Reveal as="p" variant="item" className="welcome-lead">{STORY_INTRO.lead}</Reveal>
                    <Reveal as="p" variant="item" className="welcome-text">
                        We came to Australia carrying different languages and the same quiet hope — that
                        here, our children might grow into all they were meant to be. Country Kids was
                        born out of gratitude, and a longing to give something back to the country that
                        gave us everything.
                    </Reveal>
                    <Reveal as="blockquote" variant="item" className="welcome-quote">
                        “Every child is a seed of boundless potential. Our only task is to provide the
                        right soil.”
                    </Reveal>
                    <Reveal variant="item">
                        <Link className="btn-primary" href="/about">
                            Read Our Story <Icon name="arrow-right" />
                        </Link>
                    </Reveal>
                </Reveal>
            </div>
        </section>
    );
}
