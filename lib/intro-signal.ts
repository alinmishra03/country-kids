/* Cross-component signal: has the home intro finished for THIS page load?

   The globe's entrance convergence must not begin until the fullscreen intro
   (components/layout/IntroLoader) has handed the screen over — otherwise it
   plays behind the opaque intro and is never seen. IntroLoader and the globe
   Scene live in different parts of the tree with no shared parent state, so a
   tiny module-level signal is the seam between them.

   Module state, deliberately: it is re-initialised on every full page load
   (which is when a fresh intro plays), so the entrance replays on every refresh.
   `onIntroDone` fires immediately if the intro has ALREADY finished, so a late
   subscriber (the Scene chunk is loaded async) can never miss the hand-off. */

let done = false;
const listeners = new Set<() => void>();

/** Called by IntroLoader the moment it begins dismissing — the cue for the
    globe to start converging, so the two cross-fade together. */
export function markIntroDone() {
    if (done) return;
    done = true;
    listeners.forEach((l) => l());
}

/** Subscribe. Fires right away if the intro is already gone. Returns an
    unsubscribe. */
export function onIntroDone(cb: () => void) {
    if (done) {
        cb();
        return () => {};
    }
    listeners.add(cb);
    return () => {
        listeners.delete(cb);
    };
}
