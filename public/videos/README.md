# Hero background video

Drop your hero clip here as **`hero.mp4`** (this exact path: `/public/videos/hero.mp4`).

Guidelines for a premium, performant hero:

- **Format:** MP4 (H.264) — widest browser support. Optionally add a `.webm` for smaller size.
- **Length:** 8–15s seamless loop.
- **Resolution:** 1920×1080, exported at a modest bitrate (aim < 4–6 MB).
- **Audio:** none needed — the player is muted.
- **Content:** calm, softly-lit footage of children learning/playing that reads well under the dark overlay.

Until this file exists, the hero automatically shows the poster image (Ken-Burns + parallax)
with zero errors — the `<video>` element's `onError` handler handles the fallback.
The poster image stays the LCP element for good Lighthouse scores.
