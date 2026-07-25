'use client';

/* Owns ONE piece of cross-tree state: has the site's real navbar been revealed?

   The home page opens on a pre-entry experience — the hero globe plus a
   LineSidebar — and the normal navbar is concealed until the user presses
   "Continue". The hero renders inside {children} while the navbar renders as a
   sibling in the root layout, so the flag has to live above both of them.

   Two details are load-bearing:

   · The initial value is derived from the pathname rather than defaulting to
     false. `usePathname()` resolves during SSR, so a non-home route ships its
     HTML with the navbar already visible and home ships it concealed — the
     correct state is painted on the first frame, with no flash either way.

   · It resets on every route change. Coming back to home replays the entry
     experience, which is the intent: the launch layer is the home page, not a
     one-time onboarding.

   The flag tracks the hero's two modes rather than latching once: the navbar
   belongs to the browse wall the same way the LineSidebar belongs to the globe,
   so "Back to globe" takes it away again. Only one of the two is ever on
   screen. */

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { usePathname } from 'next/navigation';

type HeroNavValue = {
    /** True once the real navbar is on screen (always true away from home). */
    navRevealed: boolean;
    /** Called by the hero's Continue button. Idempotent. */
    revealNav: () => void;
    /** Called by "Back to globe" — the pre-entry layer takes navigation back. */
    concealNav: () => void;
};

/* The default matters: anything rendered outside the provider (or in a test)
   behaves like the site always has — navbar visible. */
const HeroNavContext = createContext<HeroNavValue>({
    navRevealed: true,
    revealNav: () => {},
    concealNav: () => {},
});

export function useHeroNav() {
    return useContext(HeroNavContext);
}

export function HeroNavProvider({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const isHome = pathname === '/';
    const [revealed, setRevealed] = useState(!isHome);

    useEffect(() => {
        setRevealed(!isHome);
    }, [isHome]);

    const revealNav = useCallback(() => setRevealed(true), []);
    /* Guarded by the route: away from home there is no pre-entry layer to hand
       navigation back to, so nothing may take the navbar away. */
    const concealNav = useCallback(() => {
        if (isHome) setRevealed(false);
    }, [isHome]);

    const value = useMemo<HeroNavValue>(
        () => ({ navRevealed: revealed, revealNav, concealNav }),
        [revealed, revealNav, concealNav]
    );

    return <HeroNavContext.Provider value={value}>{children}</HeroNavContext.Provider>;
}

export default HeroNavProvider;
