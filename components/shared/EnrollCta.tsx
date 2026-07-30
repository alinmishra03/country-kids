'use client';

/* Enrol CTA — the site's lead action, rendered in the navbar and in the mobile
   drawer. Label ("Enroll Now") and destination (/enroll) live here so the two
   placements can never drift apart.

   It is still the SHARED button: .btn-gold carries shape, size, padding, font,
   the hover wipe, the arrow slide and the press. .cta-enroll (css/enroll-cta.css)
   layers the premium finish, the 35s attention pulse and the ripple on top.

   The only reason this needs to be a component rather than a <Link> is the
   ripple: it starts at the pointer, so its origin has to be measured at
   press time and handed to CSS as --rx / --ry. Re-keying the span is what
   restarts the animation — cheaper and less brittle than removing a class,
   forcing a reflow and re-adding it. */

import Link from 'next/link';
import { useCallback, useRef, useState } from 'react';
import type { CSSProperties, PointerEvent as ReactPointerEvent } from 'react';
import Icon from '@/components/shared/Icon';

const ENROLL_HREF = '/enroll';
const ENROLL_LABEL = 'Enroll Now';

type Ripple = { id: number; x: number; y: number };

export default function EnrollCta({
    className = '',
    icon = 'arrow-right',
    iconPosition = 'end',
    onNavigate,
}: {
    className?: string;
    icon?: string;
    iconPosition?: 'start' | 'end';
    onNavigate?: () => void;
}) {
    const [ripple, setRipple] = useState<Ripple | null>(null);
    const nextId = useRef(0);

    /* pointerdown, not click: the press should answer the finger immediately,
       before navigation is decided. */
    const spawnRipple = useCallback((e: ReactPointerEvent<HTMLAnchorElement>) => {
        const rect = e.currentTarget.getBoundingClientRect();
        nextId.current += 1;
        setRipple({
            id: nextId.current,
            x: e.clientX - rect.left,
            y: e.clientY - rect.top,
        });
    }, []);

    return (
        <Link
            className={`btn-gold cta-enroll ${className}`.trim()}
            href={ENROLL_HREF}
            onPointerDown={spawnRipple}
            onClick={onNavigate}
        >
            {/* Purely decorative: the light band that rakes across the pill on
                each pulse. Ahead of the ripple in the DOM so a press still
                paints on top of it. */}
            <span className="cta-sheen" aria-hidden="true" />
            {iconPosition === 'start' && <Icon name={icon} />}
            {ENROLL_LABEL}
            {iconPosition === 'end' && <Icon name={icon} />}
            {ripple && (
                <span
                    key={ripple.id}
                    className="cta-ripple"
                    aria-hidden="true"
                    style={
                        {
                            '--rx': `${ripple.x}px`,
                            '--ry': `${ripple.y}px`,
                        } as CSSProperties
                    }
                    onAnimationEnd={() => setRipple(null)}
                />
            )}
        </Link>
    );
}
