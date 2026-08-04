# Photography shot list — whole site

What to shoot (or source) to replace every stand-in photograph on
countrykids.au, and the exact size each slot needs.

`lib/page-media.ts` opens by saying it plainly:

> These are DUMMY photographs … They are NOT Country Kids photography and must
> be replaced before launch.

That is still true. **26 distinct stock photographs**, referenced 117 times,
currently carry every photographic slot on the site — plus 7 unattributed local
WebP files on `/contact`. Only the five curriculum landscapes are the centre's
own.

---

## 1. The number that matters

You do not need 121 photographs. Because most images are reused across pages,
**about 30 well-chosen frames cover the entire site.** That is one solid photo
day at Ravenhall.

| Set | Frames | Covers |
| --- | --- | --- |
| A — Core rooms & activities | 12 | Home marquee, programs, rooms, gallery, most features |
| B — Editorial / Our Story | 9 | The `/about` chapter sequence |
| C — Landscape & Country | 5 | Curriculum series *(already shot — keep)* |
| D — People & welcome | 6 | Heroes, contact, enrolment, families |

---

## 2. What makes a photo read as Australian

This is the actual problem with the current set — not who is in the frame, but
where it was taken. None of the seven local photos carries a single Australian
cue: one is a North American brick loft with radiators and city windows, one a
dark-tiled European interior, one an outdoor mat scene that reads as Southeast
Asia.

**Include, wherever it is natural to:**

- Broad-brim / legionnaire sun hats outdoors — "no hat, no play" is instantly
  legible to every Australian parent and is the single strongest cue
- Native planting: gum, wattle, grevillea, lomandra, bottlebrush
- Nature-play yards — sandpit, mud kitchen, water trough, logs, stepping stumps,
  veggie patch
- Shade sails and verandas
- Hard Australian daylight and its shadows; avoid the flat grey-sky look
- AUSLAN, Acknowledgement of Country displays, Aboriginal and Torres Strait
  Islander artwork where genuinely part of the room — never as set dressing

**Avoid:**

- Radiators, snow, autumn deciduous colour, North American school buses
- Visible third-party branding
- Obviously posed "stock family" arrangements — documentary over corporate

### On who is in the frame

Shoot the community that actually walks through the door in Melbourne's west.
Ravenhall and the surrounding suburbs are among the most diverse in the
country, and a centre's photography should look like its own waitlist —
Anglo-Australian, Indian, Chinese, Vietnamese, Filipino, Sudanese, Sri Lankan,
Pacific Islander, Aboriginal and Torres Strait Islander families all belong in
it. Indian-Australians are one of the largest migrant communities in Victoria,
so their children reading as part of this centre is accuracy, not a
compromise. Aim for mixed groups in the wide shots rather than one child per
background in a checklist.

Ages: **6 months to 6 years**, weighted toward 2–5 where faces are visible.

---

## 3. Priority order

1. **`/contact` (7 slots)** — live in production *now* with unverified
   licensing. See §7. Highest priority.
2. **Home page** — first impression, ~40 slots off 20 photos.
3. **`/about` chapters (9 slots)** — the `.svg` fallbacks already ship, so
   these degrade gracefully, but the page currently shows stock.
4. **Interior page heroes + features (16 slots)** — 2 per page × 8 pages.
5. **`/philosophy` value shots (7 slots)** — portrait crops.

---

## 4. Two kinds of slot — read this before shooting

| Helper | Behaviour | What it means for you |
| --- | --- | --- |
| `crop(id, w, h)` | Requests an **exact** w×h crop | **Ratio is fixed.** A different ratio changes the layout. |
| `img(id, w)` | Requests width only, keeps native ratio | **Ratio is flexible.** CSS `object-fit` handles the rest. |

Dimensions below are the intrinsic size written onto the `<img>`, which is what
reserves the box and holds layout shift at zero. **A larger file at the same
ratio is always fine. A different ratio is not.**

---

## 5. Slots

### 5.1 `/contact` — replace first

All seven are `900 × 720` (**5:4**), served from `/images/contact/`. Keep the
filenames and no code changes are needed.

| File | Section | Subject |
| --- | --- | --- |
| `story-circle.webp` | Hero collage | Group reading — educator with a book, children gathered close |
| `block-table.webp` | Hero collage | Two toddlers building together at a table |
| `playground-slide.webp` | Hero collage | Child on the playground, mid-joy, sun hat on |
| `hands-up.webp` | Hero collage | Group mid-cheer, hands up, genuine faces |
| `alphabet-puzzle.webp` | Gallery | Floor play — puzzle or tiles, overhead angle |
| `wooden-blocks.webp` | Gallery | Wooden block construction, natural materials |
| `colouring-outdoors.webp` | Gallery | Arts & crafts outdoors under shade sail |

Also on this page: `hero` 2000×1125 (16:9) and `feature` 1300×1000 (13:10).

### 5.2 `/about` — Our Story chapters

Filenames, art direction and export settings are already specified in
`public/images/about/README.md`. Drop a `.jpg` in with the listed name and it
takes over from the stock automatically; keep the `.svg` fallbacks.

**Two ratios in that README disagree with the code.** The code wins — it sets
the reserved box:

| Slot | README says | Code actually requests |
| --- | --- | --- |
| `chapter-three-educator-child` | 2400 × 1200 (2:1) | **1800 × 1125 (16:10)** |
| `chapter-four-learning-space` | 2000 × 1125 (16:9) | **1800 × 1125 (16:10)** |

The other seven agree. That README also claims the page loads nothing from a
remote CDN — not currently true; it loads Unsplash and falls back to the
`.svg` only on error.

### 5.3 Interior pages — hero + feature

Every page takes the same two shapes. Hero is a wide background with text over
it, so **leave clean space in the upper third** and avoid busy centres.

| Page | Hero (16:9, 2000×1125) | Feature (13:10, 1300×1000) |
| --- | --- | --- |
| `/philosophy` | Child absorbed in block play | Portrait 4:5 (1200×1500) — group sharing a moment |
| `/rooms` | Bright prepared room, empty of people | Quiet corner, natural materials at child height |
| `/curriculum` | Story being read aloud to a group | Open country under low cloud *(landscape)* |
| `/compliance` | Educator supervising attentively | Safe outdoor play area seen from shade |
| `/fees` | Children side by side at a craft table | Family at a kitchen table with paperwork |
| `/families` | Educator and children sharing a moment | Parent and child arriving hand in hand |
| `/contact` | Welcoming centre entrance | Native foliage and bark, close up |
| `/enroll` | Child settling happily into a new space | Arts and crafts table, busy hands |

### 5.4 `/families` highlights — 4 × `1200 × 900` (4:3)

Daily moments · healthy meals · educator–parent partnership · children together.

### 5.5 `/philosophy` — rows and values

Three editorial rows at `1400 × 1050` (4:3): painting freely · open country ·
a child reaching into flowers.

Seven value shots at `1200 × 1400` (**6:7 portrait**) — these cross-fade in the
accordion, so they must feel like one family of images:

1. Child laughing, paint-covered hands
2. Children arm in arm
3. Children sitting together sharing a moment
4. Pile of coloured building bricks *(no faces)*
5. Tall trees lit from behind *(no faces)*
6. Child writing on a large blackboard
7. Open country receding into mist *(no faces)*

### 5.6 Home page — ratio-flexible

All use `img()`, so **native ratio is fine**; shoot landscape and let CSS crop.

**Learning Spaces marquee — 12 tiles, each captioned.** The caption is fixed, so
the photo must match it:

`Nature Play` · `Kindergarten` · `Creative Arts` · `Outdoor Learning` ·
`Music` · `Reading Corner` · `STEM` · `Family Events` · `Healthy Meals` ·
`Sensory Play` · `Community` · `Learning Through Play`

**Programs grid — 6:** Infant Care · Toddlers · Preschool · Pre-Kindergarten ·
After-School Club · Summer Camp

**Gallery marquee — 8:** Art & Crafts · Building · Story Time · Active Play ·
Music · Nature · Outdoors · Early Math

**Also:** GridMotion background (15, reuses the above) · Welcome and About
sections (900px wide) · hero cards (5, reuse the curriculum landscapes) ·
testimonial avatars (96×96 — optional, initials render when absent).

### 5.7 `/rooms` — the seven room photos

Room **illustrations** in `/images/about/rooms/` are brand art. **Keep them.**
Only the `img` photo behind each card needs replacing — ideally the real room:

Joey (0–1) · Koala (1–2) · Kookaburra (2–3) · Cockatoo (3–4) ·
Kingfisher (3–5) · Kangaroo (4–5) · Bunjil (5–6)

---

## 6. Activity coverage checklist

Every activity, mapped to where it lands. Tick these off on the day.

| Activity | Slots it feeds |
| --- | --- |
| Outdoor nature play | Home marquee ×2, gallery ×2, philosophy feature |
| Classroom learning | Rooms hero, curriculum hero, `/about` ch. 4 |
| Arts & crafts | Contact gallery, fees hero, enroll feature, home ×2 |
| Reading | Contact hero, home ×2, curriculum hero |
| Music | Home marquee, gallery |
| Group activities | Contact hero ×2, families highlights |
| Sensory play | Home marquee, Joey/Koala rooms |
| Playground | Contact hero, home marquee, compliance feature |
| Mealtime | Home marquee, families highlights |

---

## 7. Licensing — resolve before anything else

`lib/page-media.ts:365` already flags it:

> Licensing is UNVERIFIED. They arrived with no attribution and no README …
> Confirm the licence before this page goes near production.

Those seven photographs are **live on the production contact page right now**.
Commercial stock of identifiable children carries model-release requirements,
and a childcare centre is exactly the wrong place to be relaxed about it.

A photo day at your own centre solves licensing, model releases, authenticity
and "not obvious stock" in one move — which is why it beats sourcing stock
even before you consider how much better it looks.

For every photograph used, whatever the source:

- Written parent/guardian consent for each identifiable child, on file
- Consent covers **web and social** specifically, and is revocable
- No child's full name in a filename, `alt` text or caption
- Keep a register mapping each published file to its consent record

---

## 8. Preparing files

`next.config.js` sets `images.unoptimized`, so **files are served exactly as
committed** — export settings *are* the optimisation step.

WebP for `/images/contact/`, progressive JPEG elsewhere (matching what each
folder already uses). sRGB, metadata stripped, quality ~72–80.

Budgets: under ~350 KB per image; under ~500 KB for a hero.

```bash
# Exact-ratio crop, then WebP — e.g. a 5:4 contact tile
magick source.jpg -resize 900x720^ -gravity center -extent 900x720 \
  -strip -quality 82 story-circle.webp

# 16:9 page hero as progressive JPEG
magick source.jpg -resize 2000x1125^ -gravity center -extent 2000x1125 \
  -strip -interlace Plane -quality 72 hero.jpg
```

> **Known issue, unrelated to this brief:** `about/curriculum/river.jpg` is
> **9.5 MB** at 8064×5379, and `about/other images/stay in loop.png` is 2.8 MB.
> `crop()` passes local paths through **without resizing**, so visitors download
> them at full size. Both need downsizing regardless of what happens here.

---

## 9. Wiring replacements in

| To replace | Edit |
| --- | --- |
| Any `/about` chapter | Drop the `.jpg` into `public/images/about/` — no code change |
| Any `/contact` photo | Overwrite the `.webp` in `public/images/contact/` — no code change |
| Any stock slot | In `lib/page-media.ts`, change the first `shot()` argument from an id to a local path: `shot('/images/rooms/joey.jpg', 1300, 1000, '…')` |
| Home / programs / rooms | Replace the id in `lib/programs-data.ts`, `lib/rooms-data.ts`, `components/home/LearningSpaces.tsx` |

`crop()` and `img()` both pass any string starting with `/` straight through,
so a local path needs nothing else changed.

**Update the `alt` text at the same time.** It is written per photograph and
will otherwise describe the picture it replaced — `lib/page-media.ts` has been
wrong this way before, and its own comments record it.
