'use client';

/* AnimatedStatCard — one of Chapter Four's "what we planted" figures (7 rooms,
   5 curriculum series, ∞ play).

   The figure counts up from zero when the card reaches the viewport. That is
   driven by the site's existing hooks/useCountUp, which the About page runs
   over the whole story: this component only has to emit the two things the hook
   looks for — the `.stat-number` class and a `data-count` attribute. The final
   value is ALSO the server-rendered text, so with JS off (or motion reduced)
   the number is simply correct rather than stuck at zero.

   `∞` has no digits in it; useCountUp writes such values straight through
   instead of trying to animate them, so the third card reads correctly.

   No tabindex. The card is not interactive — there is nothing to activate — and
   putting a static panel in the tab order gives keyboard and screen-reader users
   a stop with no action behind it. The hover lift is mirrored on :focus-within,
   so if a link is ever added inside, the focus treatment is already correct. */

import Reveal from '@/components/shared/Reveal';
import Icon from '@/components/shared/Icon';
import { PILLAR_ICONS } from '@/lib/story-media';

type Pillar = { stat: string; title: string; text: string };

export default function AnimatedStatCard({ pillar }: { pillar: Pillar }) {
    return (
        <Reveal as="article" variant="item" className="story-pillar">
            <span className="story-pillar-icon" aria-hidden="true">
                <Icon name={PILLAR_ICONS[pillar.stat] || 'sparkles'} size={22} strokeWidth={1.4} />
            </span>

            <p className="story-pillar-stat stat-number" data-count={pillar.stat}>
                {pillar.stat}
            </p>

            <h3>{pillar.title}</h3>
            <p className="story-pillar-text">{pillar.text}</p>

            {/* Nature-inspired hairline that grows on hover — a quiet, cheap
                affordance that needs no extra markup weight. */}
            <span className="story-pillar-sprig" aria-hidden="true" />
        </Reveal>
    );
}
