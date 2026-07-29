'use client';

/* ROOMS — the seven purpose-named rooms, each named for an iconic Australian
   animal. Cards carry an id so the nav dropdown / footer can deep-link to a room
   (e.g. /rooms#kingfisher). Content from lib/rooms-data.js. */

import { useRef } from 'react';
import Page from '@/components/shared/Page';
import PageHero from '@/components/shared/PageHero';
import RoomCard from '@/components/shared/RoomCard';
import CTASection from '@/components/shared/CTASection';
import SplitFeature from '@/components/shared/SplitFeature';
import Reveal from '@/components/shared/Reveal';
import { ROOMS } from '@/lib/rooms-data';
import { PAGE_MEDIA } from '@/lib/page-media';

export default function RoomsPage() {
    const rootRef = useRef(null);

    return (
        <Page id="rooms" innerRef={rootRef}>
            <PageHero
                kicker="Our 7 Rooms"
                title={<>A room for every age &amp; stage</>}
                lead="From six weeks to six years, every child has a room named for an iconic Australian animal — a place to belong, grow, and discover the Country they are part of."
                image={PAGE_MEDIA.rooms.hero.src}
                badges={['6 weeks – 6 years', '3 & 4 yr Kinder · FREE', 'Small, nurturing groups']}
                variant="editorial"
                parallax
            />

            {/* The section's existing kicker, title and lead, now set beside a
                photograph rather than centred above the grid. The seven cards
                are unchanged and still sit below it. */}
            <SplitFeature
                kicker="Named for this land"
                title={<>Every room has a <span>name &amp; a purpose</span></>}
                paras={[
                    'Joey, Koala, Kookaburra, Cockatoo, Kingfisher, Kangaroo and Bunjil — each room reflects our connection to nature, Country, and the wonder of the world our children are just beginning to explore.',
                ]}
                image={PAGE_MEDIA.rooms.feature}
                badge={{ stat: '7', label: 'Rooms, six weeks to six years' }}
            >
                {/* Cards arrive alternately from the left and the right rather
                    than all rising together — the same seven cards, but the
                    grid reads as a composition being assembled instead of a
                    block fading in. */}
                <Reveal className="rooms-grid" stagger amount={0.05}>
                    {ROOMS.map((room, i) => (
                        <Reveal
                            as="div"
                            variant={i % 2 === 0 ? 'fadeLeft' : 'fadeRight'}
                            key={room.id}
                        >
                            <RoomCard room={room} href={`#${room.id}`} />
                        </Reveal>
                    ))}
                </Reveal>
            </SplitFeature>

            <CTASection
                title="Find the right room for your child"
                text="Not sure which room suits your child's age and stage? Book a free tour and we'll walk you through every space and answer all your questions."
            />
        </Page>
    );
}
