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
        autoplaying, no controls, object-fit: cover. It is committed to this
        repo, so this is the path that runs today.
     2. If it is missing, fails, or autoplay is refused, a scripted CINEMATIC
        built from the centre's own mark and taglines plays instead, for the
        same few seconds.

   Every exit — ended, error, refused autoplay, stall timeout, skip, Escape —
   converges on one guarded finish(). */

import { useCallback, useEffect, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';
import { SITE } from '@/lib/site-data';
import { markIntroDone } from '@/lib/intro-signal';

const INTRO_VIDEO = '/videos/intro.mp4';

/* Logo beat, then the film. */
const LOGO_MS = 1800;
/* Length of the scripted cinematic — matches the intro-film keyframes. */
const FILM_MS = 4200;
/* How long a video gets to tell us how long it is. This covers the case the
   `ended` event cannot: a file that never loads metadata at all, because the
   network died or the container is unreadable. It is NOT the play limit —
   that used to be a flat 6s, which silently truncated any clip longer than
   that (the current intro is 10s, so it lost the last four seconds). */
const VIDEO_START_TIMEOUT_MS = 6000;
/* Grace on top of the real duration once we know it, to absorb rebuffering
   without cutting the last frames off. `ended` normally fires first. */
const VIDEO_OVERRUN_MS = 2500;

type Phase = 'logo' | 'video' | 'film' | 'out' | 'done';
/* What is filling the screen. Deliberately NOT derived from `phase`, because
   the overlay's own 700ms fade-out is a phase of its own and the film step has
   to stay mounted right through it. Keying the <video> off `phase === 'video'`
   meant it unmounted the instant the clip ended, uncovering the logo stage
   underneath — so every intro finished by flashing the mark back up for the
   last 700ms. `content` only ever moves forwards. */
type Content = 'none' | 'video' | 'film';

export default function IntroLoader() {
    const pathname = usePathname();
    const [phase, setPhase] = useState<Phase>('logo');
    const [content, setContent] = useState<Content>('none');
    const videoRef = useRef<HTMLVideoElement>(null);
    const timers = useRef<number[]>([]);
    /* The video is mounted from the very first frame so its download starts
       with the page instead of LOGO_MS later — on a clip this size that head
       start is the difference between the film beginning on time and the
       viewer watching a logo wait for it. The consequence is that a missing or
       broken file reports its error during the LOGO phase, long before we want
       to act on it; recording it here and reading it when the video's turn
       comes keeps the logo beat intact. */
    const videoFailed = useRef(false);
    /* The single timer that decides "this video has had long enough". It is
       REPLACED when the real duration arrives rather than added alongside the
       startup guard, which is why it needs its own handle instead of a slot in
       `timers` — two live ceilings would mean the shorter one always wins and
       the whole exercise would be pointless. */
    const ceiling = useRef<number | null>(null);
    /* Guards against finish() running twice — the video can fire `ended` and
       the timeout can land in the same tick. */
    const finished = useRef(false);

    const clearTimers = () => {
        timers.current.forEach((t) => window.clearTimeout(t));
        timers.current = [];
        if (ceiling.current !== null) {
            window.clearTimeout(ceiling.current);
            ceiling.current = null;
        }
    };

    const finish = useCallback(() => {
        if (finished.current) return;
        finished.current = true;
        clearTimers();

        /* Fade the overlay, then unmount so it can never trap a click. */
        setPhase('out');
        document.documentElement.classList.remove('intro-locked');
        /* Release the globe's entrance convergence NOW, as the intro begins to
           fade, so the cards draw in as the intro reveals them rather than
           finishing hidden behind it. */
        markIntroDone();
        timers.current.push(window.setTimeout(() => setPhase('done'), 700));
    }, []);

    /* Skip immediately when it should not play at all.
       `finished.current` is part of that test, not just the pathname. This
       effect re-runs on every route change, so navigating away from home and
       back used to re-arm the whole sequence — and because every exit path is
       guarded by finish(), which had already run, the phase advanced to `video`
       and then STUCK there: the mark on screen forever, with `intro-locked`
       still holding the page. The intro is a page-load event, so once it is
       done it is done for the life of this document. */
    useEffect(() => {
        if (pathname !== '/' || finished.current) {
            setPhase('done');
            document.documentElement.classList.remove('intro-locked');
            return;
        }

        /* No session gate: the intro is wanted on every load of the home page.
           Reduced motion is still respected — it skips straight through. */
        const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

        if (reduced) {
            finished.current = true;
            setPhase('done');
            document.documentElement.classList.remove('intro-locked');
            markIntroDone();
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

    /* Fall through from a failed/absent video to the scripted cinematic.
       Before the video's turn this only RECORDS the failure — jumping to the
       cinematic the moment a 404 comes back would cut the logo beat short. */
    const toFilm = useCallback(() => {
        if (finished.current) return;
        videoFailed.current = true;
        clearTimers();
        setPhase('film');
        setContent('film');
    }, []);

    const noteVideoError = useCallback(() => {
        videoFailed.current = true;
    }, []);

    /* Arm (or re-arm) the one ceiling. */
    const armCeiling = useCallback(
        (ms: number) => {
            if (ceiling.current !== null) window.clearTimeout(ceiling.current);
            ceiling.current = window.setTimeout(finish, ms);
        },
        [finish]
    );

    /* The moment the browser knows the duration, the guard stops being a guess
       and becomes the clip's own length. Until then the startup ceiling stands,
       so a file that never loads at all still cannot hold the page. */
    const onMeta = useCallback(() => {
        const video = videoRef.current;
        if (!video) return;
        const seconds = video.duration;
        /* A stream, or a container with a broken header, reports Infinity or
           NaN. Keep the startup ceiling rather than arming a nonsensical one. */
        if (!Number.isFinite(seconds) || seconds <= 0) return;
        armCeiling(seconds * 1000 + VIDEO_OVERRUN_MS);
    }, [armCeiling]);

    /* Video step: try to play; any failure hands over to the film. */
    useEffect(() => {
        if (phase !== 'video') return;

        const video = videoRef.current;
        /* Already known to be unplayable — it has had the whole logo beat to
           load and reported an error instead. */
        if (!video || videoFailed.current) {
            toFilm();
            return;
        }

        setContent('video');

        /* Autoplay is only permitted muted, and can still be refused. */
        const attempt = video.play();
        if (attempt && typeof attempt.catch === 'function') {
            attempt.catch(toFilm);
        }

        /* Metadata can already be in hand by the time this runs (a cached file
           fires loadedmetadata before the effect), in which case the handler
           never fires and the startup guard would truncate the clip. */
        if (video.readyState >= 1) onMeta();
        else armCeiling(VIDEO_START_TIMEOUT_MS);
    }, [phase, toFilm, armCeiling, onMeta]);

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
            className={`intro is-${phase}${content === 'none' ? '' : ' has-content'}`}
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

            {/* Mounted from the first frame, not when its turn comes: the file
                has to be downloading during the logo beat, or the beat is just
                dead time before the download even starts. `is-playing` is what
                reveals it. Dropped once the cinematic has taken over, so a
                broken file is not left fetching behind it. */}
            {content !== 'film' ? (
                <video
                    ref={videoRef}
                    className={`intro-video${content === 'video' ? ' is-playing' : ''}`}
                    src={INTRO_VIDEO}
                    muted
                    playsInline
                    preload="auto"
                    onLoadedMetadata={onMeta}
                    onEnded={finish}
                    /* A missing or unplayable file is not a failure — it just
                       means the scripted cinematic plays instead. Before the
                       video's turn this only records the fact; acting on it
                       immediately would cut the logo beat short. */
                    onError={phase === 'video' ? toFilm : noteVideoError}
                    aria-hidden="true"
                />
            ) : null}

            {content === 'film' ? (
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
