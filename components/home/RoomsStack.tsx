'use client';

/* The rooms ScrollStack, kept in its own module so RoomsPreview can lazy-load
   the whole thing behind a SINGLE dynamic boundary.

   This matters: ScrollStack collects its cards in a layout effect via
   document.querySelectorAll('.scroll-stack-card'). If the stack and its items
   were lazy-loaded separately, the parent's effect could run before the item
   chunk resolved, collect an empty list, and leave cards untransformed in normal
   flow. Static imports here guarantee the children exist when the effect runs. */

import ScrollStack, { ScrollStackItem } from '@/components/animations/ScrollStack/ScrollStack';
import RoomCard from '@/components/shared/RoomCard';
import { ROOMS } from '@/lib/rooms-data';

export default function RoomsStack() {
    return (
        <ScrollStack
            className="rooms-stack"
            useWindowScroll
            itemDistance={90}
            itemStackDistance={26}
            itemScale={0.025}
            /* baseScale + itemScale * (ROOMS.length - 1) === 1, so the topmost
               card lands at natural size — scaled-up text renders soft. */
            baseScale={1 - 0.025 * (ROOMS.length - 1)}
            stackPosition="18%"
            scaleEndPosition="8%"
        >
            {ROOMS.map((room) => (
                <ScrollStackItem key={room.id} itemClassName={`accent-${room.accent}`}>
                    <RoomCard room={room} />
                </ScrollStackItem>
            ))}
        </ScrollStack>
    );
}
