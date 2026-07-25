# Intro video

`intro.mp4` is the fullscreen clip that plays on the home page after the logo
beat, driven by `components/layout/IntroLoader.tsx`. **This exact path:**
`/public/videos/intro.mp4` — the filename is a constant in that file, so a clip
uploaded under any other name will not be found and the scripted CSS fallback
will play instead.

Current file: 10.2s, 2.80 MB, H.264 High / yuv420p, 1920×1080 @ 30fps, 2.31 Mbps,
no audio track, faststart.

It was delivered as an 11.13 MB / 9.18 Mbps export with `moov` at the END of the
file, which made the intro hang: a browser cannot start playback until it has
read that box, so it had to fetch the tail before it could begin. Re-encoded
with:

    ffmpeg -i in.mp4 -c:v libx264 -crf 23 -preset slow \
           -profile:v high -level 4.0 -pix_fmt yuv420p \
           -an -movflags +faststart intro.mp4

4× smaller at SSIM 0.9930 against the original (CRF 20 was tried too: 4.14 MB
for SSIM 0.9945 — not worth 48% more weight on a clip that blocks the page).
**Any replacement clip must be run through that same command**, `+faststart`
especially.

Guidelines:

- **Format:** MP4 (H.264). Optionally add a `.webm` for smaller size.
- **Length:** any. The player reads the real duration from the file's metadata
  and sizes its stall guard from that, so there is no length limit to keep
  under. Remember the viewer waits `LOGO_MS` (1.8s) _plus_ the clip before they
  reach the page, on every home-page load — there is no once-per-session gate.
- **Audio:** none needed, and none used — autoplay is only permitted muted.
- **Weight:** the one number worth caring about. The clip is `preload="auto"`
  and starts downloading with the page (the `<video>` is in the server HTML, so
  the fetch begins before hydration rather than when its beat arrives), but it
  still sits behind an opaque overlay holding the home page. Keep it near the
  current ~3 MB.
- **First frame:** there is no `poster`, so frame one arrives on a 0.6s fade.
  Make it something deliberate rather than a black or half-exposed frame.

Falls back with zero errors to a scripted CSS cinematic (built from the centre's
mark and taglines) if the file is missing, unplayable, or autoplay is refused.
Reduced motion skips the intro entirely; Escape and the "Skip intro" button exit
at any point.

The old `hero.mp4` background-video pipeline this file used to document is
retired — the hero is now the WebGL card globe.
