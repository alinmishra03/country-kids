'use client';

/* Home rooms preview — the seven purpose-named rooms in a responsive grid, each
   a shared <RoomCard>. Staggered reveal; links through to the /rooms page. */

import Link from 'next/link';
import SectionHeader from '@/components/shared/SectionHeader';
import Reveal from '@/components/shared/Reveal';
import Icon from '@/components/shared/Icon';
import RoomCard from '@/components/shared/RoomCard';
import { ROOMS } from '@/lib/rooms-data';

export default function RoomsPreview() {
    return (
        <section className="section section-alt rooms-section" id="rooms">
            <div className="container">
                <SectionHeader
                    kicker="Our 7 Rooms"
                    title={<>Every room has a <span>name &amp; a purpose</span></>}
                    lead="Each of our seven rooms is named after an iconic Australian animal — reflecting our connection to nature, Country, and the wonder of the world our children are just beginning to explore."
                />

                <Reveal className="rooms-grid" stagger amount={0.05}>
                    {ROOMS.map((room) => (
                        <Reveal as="div" variant="item" key={room.id}>
                            <RoomCard room={room} />
                        </Reveal>
                    ))}
                </Reveal>

                <div className="section-cta">
                    <Link className="btn-outline" href="/rooms">
                        View all rooms <Icon name="arrow-right" />
                    </Link>
                </div>
            </div>
        </section>
    );
}
