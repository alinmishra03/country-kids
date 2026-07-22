'use client';

/* Home rooms preview — the seven purpose-named rooms as a ScrollStack: each room
   card pins and stacks over the one before it as you scroll, scaling down as it
   goes. Falls back to the plain .rooms-grid when the visitor prefers reduced
   motion (the stack is entirely scroll-driven, so there is nothing to soften).
   Styles live in css/scroll-stack.css (.rooms-stack skin). */

import dynamic from 'next/dynamic';
import Link from 'next/link';
import { useReducedMotion } from 'framer-motion';
import SectionHeader from '@/components/shared/SectionHeader';
import Reveal from '@/components/shared/Reveal';
import Icon from '@/components/shared/Icon';
import RoomCard from '@/components/shared/RoomCard';
import { ROOMS } from '@/lib/rooms-data';

/* Lenis touches window/document on construction — keep it out of the SSR pass.
   ONE dynamic boundary around the whole stack (see RoomsStack for why). */
const RoomsStack = dynamic(() => import('@/components/home/RoomsStack'), { ssr: false });

export default function RoomsPreview() {
    const reduced = useReducedMotion();

    return (
        <section className="section section-alt rooms-section" id="rooms">
            <div className="container">
                <SectionHeader
                    kicker="Our 7 Rooms"
                    title={<>Every room has a <span>name &amp; a purpose</span></>}
                    lead="Each of our seven rooms is named after an iconic Australian animal — reflecting our connection to nature, Country, and the wonder of the world our children are just beginning to explore."
                />

                {reduced ? (
                    <Reveal className="rooms-grid" stagger amount={0.05}>
                        {ROOMS.map((room) => (
                            <Reveal as="div" variant="item" key={room.id}>
                                <RoomCard room={room} />
                            </Reveal>
                        ))}
                    </Reveal>
                ) : (
                    <RoomsStack />
                )}

                <div className="section-cta">
                    <Link className="btn-outline" href="/rooms">
                        View all rooms <Icon name="arrow-right" />
                    </Link>
                </div>
            </div>
        </section>
    );
}
