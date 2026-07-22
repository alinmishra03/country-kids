'use client';

/* Shared room card — used on the home rooms preview and the /rooms page. Photo
   with an animal-icon badge, name, age, an optional funding badge, a short blurb
   and a link. Accent tint driven by the room's `accent` (class .accent-<key>). */

import Link from 'next/link';
import Icon from '@/components/shared/Icon';
import { img } from '@/lib/images';

export default function RoomCard({ room, href }: any) {
    const to = href || `/rooms#${room.id}`;
    return (
        <article className={`room-card accent-${room.accent}`} id={room.id}>
            <div className="room-media">
                <img
                    src={img(room.img, 640, 62)}
                    alt={`${room.name} — ${room.animal}`}
                    loading="lazy"
                    decoding="async"
                    width="640"
                    height="420"
                />
                <span className="room-icon" aria-hidden="true"><Icon name={room.icon} /></span>
                {room.badge ? <span className="room-badge">{room.badge}</span> : null}
            </div>
            <div className="room-body">
                <div className="room-heading">
                    <h3>{room.name}</h3>
                    <span className="room-age">{room.age}</span>
                </div>
                <span className="room-stage">{room.animal}</span>
                <p>{room.blurb}</p>
                <Link className="room-link" href={to}>
                    Discover this room <Icon name="arrow-right" />
                </Link>
            </div>
        </article>
    );
}
