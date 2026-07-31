# Intro video

The fullscreen clip that plays on the home page after the logo beat, driven by
`components/layout/IntroLoader.tsx`. There are **two cuts**, and the player
picks one on mount from `matchMedia('(max-width: 768px)')`:

| Viewport      | File                        | Frame        |
| ------------- | --------------------------- | ------------ |
| > 768px       | `/videos/intronew.mp4`      | 1920×1080    |
| ≤ 768px       | `/videos/intromobile.mp4`   | 1080×1920    |

**These exact paths** — the filenames are a constant in that file, so a clip
uploaded under any other name will not be found and the scripted CSS fallback
will play instead. Lowercase, always: the dev server on Windows does not care
about case but the Linux host serving production does.

Current files: both 10.2s, H.264 High / yuv420p @ 30fps, no audio track,
faststart. 2.87 MB / 2.35 Mbps landscape, 2.52 MB / 2.06 Mbps portrait.

`intro.mp4` is the retired single-cut clip, kept only as a reference encode.
Nothing loads it.

## Every replacement must be re-encoded

Both cuts were delivered as heavy exports — the landscape one at 12.05 MB /
9.47 Mbps with its `moov` box at the END of the file, which makes the intro
hang: a browser cannot start playback until it has read that box, so it has to
fetch the whole tail before it can begin. Both were re-encoded with:

    ffmpeg -i in.mp4 -c:v libx264 -crf 23 -preset slow \
           -profile:v high -level 4.0 -pix_fmt yuv420p \
           -an -movflags +faststart out.mp4

4.2× and 2.1× smaller at SSIM 0.9936 and 0.9909 against the originals. **Any
replacement clip must be run through that same command**, `+faststart`
especially. Check it landed with:

    ffprobe -v error -show_entries format=size,bit_rate -of default=nw=1 out.mp4

and confirm `moov` precedes `mdat`.

Guidelines:

- **Format:** MP4 (H.264). Optionally add a `.webm` for smaller size.
- **Length:** any. The player reads the real duration from the file's metadata
  and sizes its stall guard from that, so there is no length limit to keep
  under. Remember the viewer waits `LOGO_MS` (1.8s) _plus_ the clip before they
  reach the page, on every home-page load — there is no once-per-session gate.
- **Audio:** none needed, and none used — autoplay is only permitted muted. An
  audio track on these is pure weight; `-an` strips it.
- **Weight:** the one number worth caring about. The clip is `preload="auto"`,
  but it sits behind an opaque overlay holding the home page. Keep each cut
  near the current ~2.5–3 MB.
- **First frame:** there is no `poster`, so frame one arrives on a 0.6s fade.
  Make it something deliberate rather than a black or half-exposed frame.
- **Both cuts should be the same length.** Nothing enforces it, but the two are
  the same film and a viewer switching devices should not get a different beat.

Unlike the old single-cut setup, the `<video>` now ships from the server with
**no `src`** and receives one on mount, because the server cannot know the
viewport. The download therefore starts at hydration rather than at HTML parse
— still comfortably inside the 1.8s logo beat, and much cheaper than guessing
wrong and fetching megabytes of the wrong cut.

Falls back with zero errors to a scripted CSS cinematic (built from the centre's
mark and taglines) if the file is missing, unplayable, or autoplay is refused.
Reduced motion skips the intro entirely; Escape and the "Skip intro" button exit
at any point.

The old `hero.mp4` background-video pipeline this file used to document is
retired — the hero is now the WebGL card globe.
