# CountryKids Daycare

A warm, modern marketing site for **CountryKids** — a baby & child daycare.
Built with Next.js (App Router) and a **blue & golden** theme with light/dark modes.

The folder structure mirrors the reference `mining-investment` project:

```
app/                 App Router routes (home + interior pages)
components/
  home/              Home page sections (Hero, StatsBar, ProgramsGrid, …)
  layout/            SiteHeader, SiteFooter, ThemeToggle, PageTransition
  providers/         ThemeProvider, TranslationProvider
  shared/            Page wrapper, T text helper, EnrollForm
hooks/               useAnimations, useFadeUps, useBorderGlow
lib/                 nav-data, routes, programs-data, testimonials-data
styles/              style.css (@import chain) + responsive.css
css/                 Component stylesheets (theme lives in base.css)
public/images/       Static assets
```

## Getting started

```bash
npm install
npm run dev      # http://localhost:3000
npm run build
npm run start
```

## Theme

All theming is driven by CSS custom properties in `css/base.css`
(`:root` = light, `[data-theme="dark"]` = dark). Blue is the primary brand
color; golden is the accent. The theme toggle writes `data-theme` on `<html>`
and persists to `localStorage` under the key `ckTheme`.
