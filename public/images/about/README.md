# Our Story — image assets

Photography for `/about`. Every slot is referenced from `lib/story-media.ts`;
nothing on this page loads from a remote CDN.

## How this folder works

Each slot ships as **two** files:

| file | role |
| --- | --- |
| `<name>.svg` | Brand placeholder art, committed to the repo. Renders while the photograph is outstanding. |
| `<name>.jpg` | **The real photograph. Drop it in with exactly this filename — no code change is needed.** |

`components/story/ImageReveal` requests the `.jpg` and swaps to the `.svg` on a
load error, so a missing photograph degrades to a designed navy panel rather
than a broken-image icon. The hero does the same trick with stacked CSS
background layers.

Delete nothing: keep the `.svg` files in place as the permanent safety net.

## Slots

| Filename | Section | Dimensions | Ratio | Alt text |
| --- | --- | --- | --- | --- |
| `about-hero.jpg` | Page hero background | 2400 × 1350 | 16:9 | Children and educators together in the natural outdoor play space at Country Kids Learning Centre |
| `chapter-one-country.jpg` | Chapter One — The country that held us | 1600 × 2000 | 4:5 | Open Australian grassland under a wide sky near Ravenhall, Victoria |
| `chapter-two-journey.jpg` | Chapter Two — The long way around | 1600 × 1200 | 4:3 | A child's hands working carefully with natural loose parts at a wooden table |
| `chapter-three-educator-child.jpg` | Chapter Three — The day the dream had a name | 2400 × 1200 | 2:1 | An educator kneeling at a young child's eye level, listening as they share a discovery |
| `chapter-four-learning-space.jpg` | Chapter Four — What we planted | 2000 × 1125 | 16:9 | A calm, light-filled learning room with timber shelving and open-ended play materials |
| `chapter-five-care.jpg` | Chapter Five — A promise we make in writing | 1600 × 2000 | 4:5 | An educator watching over children at play in a secure, gated outdoor yard |
| `chapter-six-family-country.jpg` | Chapter Six — Walking together | 2000 × 1500 | 4:3 (cropped to 16:7) | Families and children exploring together among native plants in the centre garden |
| `closing-belonging.jpg` | Closing message | 2560 × 1280 | 2:1 (cropped to 21:9) | Children walking hand in hand along a garden path lined with native grasses |
| `cta-tour.jpg` | Book-a-tour call to action | 1600 × 1200 | 4:3 | A parent and child being welcomed at the entrance of Country Kids Learning Centre |

The dimensions above are the **intrinsic** size written onto each `<img>`, which
is what reserves the box and keeps layout shift at zero. A larger file at the
same ratio is fine; a **different ratio is not** — update `lib/story-media.ts`
if a crop has to change.

## Art direction

Documentary, not corporate stock. Natural light, real moments, Australian
landscape and native planting, warm neutral grade consistent with the navy /
cream / sage palette. No visible third-party branding, no obviously posed
"stock family" setups.

Before use, confirm photo consent for every identifiable child and family.

## Preparing files

Export progressive JPEG, quality ~72, sRGB, metadata stripped. Aim for under
~350 KB each (under ~500 KB for the hero). For example:

```bash
# from this folder, with ImageMagick
magick source.jpg -resize 2400x1350^ -gravity center -extent 2400x1350 \
  -strip -interlace Plane -quality 72 about-hero.jpg
```

`next.config.js` sets `images.unoptimized`, so files are served exactly as they
are committed — the export settings above *are* the optimisation step.
