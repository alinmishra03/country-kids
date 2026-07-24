'use client';

/* Intro sequence: the mark, then a fullscreen film, then away.
   Plays on EVERY page load of the home route.

   HYDRATION — the overlay is rendered on the SERVER too, opaque, for the home
   route. That is deliberate. Deciding client-side whether to show it would
   either mismatch hydration (server says no, client says yes) or let the
   homepage paint for a frame before the overlay mounts on top of it. Rendering
   it always and DISMISSING it in an effect means the markup matches and the
   page is never briefly visible underneath.

   THE FILM STEP has two implementations and prefers the real one:

     1. If public/videos/intro.mp4 exists it is played — muted, inline,
        autoplaying, no controls, object-fit: cover.
     2. If it is missing, fails, or autoplay is refused, a scripted CINEMATIC
        built from the centre's own mark and taglines plays instead, for the
        same few seconds. No mp4 is committed to this repo, so the fallback is
        what runs today; dropping a file at that path takes over with no code
        change.

   Every exit — ended, error, refused autoplay, stall timeout, skip, Escape —
   converges on one guarded finish(). */

import { useCallback, useEffect, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';
import { SITE } from '@/lib/site-data';

const INTRO_VIDEO = '/videos/intro.mp4';

/* Logo beat, then the film. */
const LOGO_MS = 1800;
/* Length of the scripted cinematic — matches the intro-film keyframes. */
const FILM_MS = 4200;
/* Hard ceiling on a real video — if it stalls buffering we leave anyway. */
const VIDEO_TIMEOUT_MS = 6000;

type Phase = 'logo' | 'video' | 'film' | 'out' | 'done';

export default function IntroLoader() {
    const pathname = usePathname();
    const [phase, setPhase] = useState<Phase>('logo');
    const videoRef = useRef<HTMLVideoElement>(null);
    const timers = useRef<number[]>([]);
    /* Guards against finish() running twice — the video can fire `ended` and
       the timeout can land in the same tick. */
    const finished = useRef(false);

    const clearTimers = () => {
        timers.current.forEach((t) => window.clearTimeout(t));
        timers.current = [];
    };

    const finish = useCallback(() => {
        if (finished.current) return;
        finished.current = true;
        clearTimers();

        /* Fade the overlay, then unmount so it can never trap a click. */
        setPhase('out');
        document.documentElement.classList.remove('intro-locked');
        timers.current.push(window.setTimeout(() => setPhase('done'), 700));
    }, []);

    /* Skip immediately when it should not play at all. */
    useEffect(() => {
        if (pathname !== '/') {
            setPhase('done');
            return;
        }

        /* No session gate: the intro is wanted on every load of the home page.
           Reduced motion is still respected — it skips straight through. */
        const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

        if (reduced) {
            finished.current = true;
            setPhase('done');
            document.documentElement.classList.remove('intro-locked');
            return;
        }

        /* Hold the page still while the intro owns the screen. */
        document.documentElement.classList.add('intro-locked');

        timers.current.push(window.setTimeout(() => setPhase('video'), LOGO_MS));

        return () => {
            clearTimers();
            document.documentElement.classList.remove('intro-locked');
        };
    }, [pathname]);

    /* Fall through from a failed/absent video to the scripted cinematic. */
    const toFilm = useCallback(() => {
        if (finished.current) return;
        clearTimers();
        setPhase('film');
    }, []);

    /* Video step: try to play; any failure hands over to the film. */
    useEffect(() => {
        if (phase !== 'video') return;

        const video = videoRef.current;
        if (!video) {
            toFilm();
            return;
        }

        /* Autoplay is only permitted muted, and can still be refused. */
        const attempt = video.play();
        if (attempt && typeof attempt.catch === 'function') {
            attempt.catch(toFilm);
        }

        /* A video that never starts must not hold the page hostage. */
        timers.current.push(window.setTimeout(finish, VIDEO_TIMEOUT_MS));
    }, [phase, finish, toFilm]);

    /* The scripted cinematic runs on a fixed clock. */
    useEffect(() => {
        if (phase !== 'film') return;
        timers.current.push(window.setTimeout(finish, FILM_MS));
    }, [phase, finish]);

    /* Escape skips, like the button. */
    useEffect(() => {
        if (phase === 'done') return;
        const onKey = (e: KeyboardEvent) => {
            if (e.key === 'Escape') finish();
        };
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, [phase, finish]);

    if (pathname !== '/' || phase === 'done') return null;

    return (
        <div
            className={`intro is-${phase}`}
            role="status"
            aria-live="polite"
            aria-label="Loading Country Kids"
        >
            <div className="intro-stage" aria-hidden="true">
                <span className="intro-glow" />
                <span className="intro-mark logo-img" />
                <span className="intro-bar">
                    <span />
                </span>
            </div>

            {phase === 'video' ? (
                <video
                    ref={videoRef}
                    className="intro-video"
                    src={INTRO_VIDEO}
                    muted
                    playsInline
                    autoPlay
                    preload="auto"
                    onEnded={finish}
                    /* A missing or unplayable file is not a failure — it just
                       means the scripted cinematic plays instead. */
                    onError={toFilm}
                    aria-hidden="true"
                />
            ) : null}

            {phase === 'film' ? (
                <div className="intro-film" aria-hidden="true">
                    <span className="intro-film-sweep" />
                    <div className="intro-film-inner">
                        <span className="intro-film-mark logo-img" />
                        <p className="intro-film-kicker">{SITE.kicker}</p>
                        <p className="intro-film-tagline">{SITE.tagline}</p>
                    </div>
                </div>
            ) : null}

            <button type="button" className="intro-skip" onClick={finish}>
                Skip intro
            </button>
        </div>
    );
}
