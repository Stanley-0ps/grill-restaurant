# Lumina Grill

A single-page marketing Demo site for **Lumina Grill**, a modern fine-dining restaurant in Victoria Island, Lagos. Built as a dependency-free static site — one HTML document, one stylesheet, one script — and deployable to any static host, with first-class support for Netlify Forms.

---

## Table of contents

- [Overview](#overview)
- [Tech stack](#tech-stack)
- [Project structure](#project-structure)
- [Getting started](#getting-started)
- [Features](#features)
- [Design system](#design-system)
- [Forms](#forms)
- [Deployment](#deployment)
- [Accessibility](#accessibility)
- [Performance](#performance)
- [Image credits](#image-credits)
- [License](#license)

---

## Overview

The site is a fully self-contained landing page that walks a visitor from the hero through the story, menu, gallery, and reservation flow. There is **no build step, no package manager, and no runtime dependency** — the files in this repository are exactly the files served in production.

| | |
| --- | --- |
| **Type** | Static marketing site |
| **Pages** | 1 (`index.html`) |
| **Build step** | None |
| **Runtime dependencies** | None |
| **Hosting** | Netlify (config included) |
| **License** | MIT |

---

## Tech stack

| Layer | Choice |
| --- | --- |
| Markup | Semantic HTML5 |
| Styling | Hand-written CSS — custom properties, Grid, `clamp()` fluid type |
| Behaviour | Vanilla JavaScript (ES5-compatible syntax, no framework) |
| Icons | [Ionicons 5.5.2](https://unpkg.com/ionicons@5.5.2/) via unpkg |
| Typography | Cormorant Garamond (display) + Manrope (UI) via Google Fonts |
| Imagery | 22 WebP photographs |
| Forms | Netlify Forms |

The only third-party requests are Google Fonts and Ionicons; everything else is served from this repository.

---

## Project structure

```
grill-restaurant/
├── index.html                  # The entire site — all sections and markup
├── favicon.png
├── netlify.toml                # Build, cache, and security header configuration
├── style-guide.md              # Design-token reference
├── LICENSE
└── assets/
    ├── css/
    │   └── style.css           # All styles, organised by section
    ├── js/
    │   └── script.js           # All behaviour, organised by feature
    └── images/
        └── brand/              # 22 WebP images + CREDITS.md
```

Sections in `index.html`, in page order:

| Anchor | Section |
| --- | --- |
| — | Top bar (address, hours, phone, email) |
| `#home` | Hero slider |
| — | Services |
| `#about` | Our story |
| — | Signature dish |
| `#menu` | Filterable menu |
| — | Testimonials |
| `#reservation` | Reservation form |
| — | Why Lumina Grill |
| `#gallery` | Events & gallery (lightbox) |
| — | Footer + newsletter signup |

---

## Getting started

The site is static, so any file server works. Clone and serve the repository root:

```bash
git clone https://github.com/Stanley-0ps/grill-restaurant.git
cd grill-restaurant
python3 -m http.server 8000
```

Then open <http://localhost:8000>.

Any equivalent works — `npx serve`, `php -S localhost:8000`, or a VS Code Live Server session. Opening `index.html` directly from the filesystem also renders correctly.

> **Note:** reservation and newsletter submissions are handled by Netlify Forms, so they only succeed on a Netlify deploy (or through `netlify dev`). On a plain local server the POST is not processed.

---

## Features

**Layout & content**

- Fluid typographic scale driven by CSS `clamp()` — no breakpoint-specific font sizes.
- Responsive from small mobile up through wide desktop, with a slide-in navigation drawer below the desktop breakpoint.
- Sticky header that hides on downward scroll and returns on upward scroll (staying pinned under reduced motion), plus a back-to-top control that appears past the fold.

**Hero slider**

- Cross-fading slides with previous/next controls.
- Autoplay on a 7-second interval that **pauses** on pointer hover, on keyboard focus within the hero, and while the browser tab is hidden.
- An explicit play/pause toggle for visitors who want manual control.

**Menu**

- Client-side category filtering (`All`, `Fire`, `Garden`, `Sea`) with active-state management.
- Announcements routed through an `aria-live` status region so filtering is perceivable to screen-reader users.

**Gallery**

- Lightbox overlay with captions, opened from any gallery image.

**Motion**

- Mouse-parallax on decorative elements.
- Scroll-reveal animations via `IntersectionObserver`.
- Scroll-spy keeps the active navigation link in sync with the section in view.
- Every motion feature is gated on `prefers-reduced-motion`, and the site reacts if the visitor changes that setting mid-session.

**Forms**

- Inline, field-level validation with `aria-invalid` and linked error messages.
- Async submission with a busy state on the submit button and success/error feedback in an `aria-live` region.
- Progressive enhancement: with JavaScript disabled, both forms still `POST` natively and fall through to Netlify's default success page.

---

## Design system

A dark, warm palette anchored by a gold accent, with two type roles: Cormorant Garamond for display headings and Manrope for interface and body copy.

All tokens are declared as custom properties in `assets/css/style.css` and documented in [`style-guide.md`](./style-guide.md) — colours, gradients, the fluid type scale, spacing, shadows, border radii, and transitions.

To retheme the site, edit the token block at the top of the stylesheet; component rules reference tokens rather than literal values.

---

## Forms

Both forms use [Netlify Forms](https://docs.netlify.com/forms/setup/) with a honeypot field for spam mitigation:

| Form | `name` | Fields |
| --- | --- | --- |
| Reservation | `reservation` | name, phone, party size, date, time, message |
| Newsletter | `newsletter` | email address |

Each form carries `data-netlify="true"`, a hidden `form-name` input, and a `netlify-honeypot="bot-field"` trap.

After the first deploy, submissions appear under **Site → Forms** in the Netlify dashboard. Configure email or Slack notifications there.

---

## Deployment

`netlify.toml` contains everything needed:

```toml
[build]
  publish = "."
```

Because the site has no build step, Netlify publishes the repository root directly.

**Cache policy** — asset filenames are not content-hashed, so caching is deliberately short and revalidation is always permitted (images 24 h, CSS/JS 1 h). Netlify serves ETags, making re-checks cheap `304`s. If you later introduce hashed filenames, those can safely move to `immutable, max-age=31536000`.

**Security headers** — applied to every route:

- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY`
- `Referrer-Policy: strict-origin-when-cross-origin`

To deploy: connect the repository to Netlify and accept the defaults, or run `netlify deploy --prod` with the Netlify CLI.

---

## Accessibility

- Semantic landmarks — `header`, `nav`, `main`, `section`, `footer`, `address` — with `aria-label`/`aria-labelledby` on sections.
- Decorative icons marked `aria-hidden="true"`.
- Keyboard-operable navigation, slider, lightbox, and filters, with visible focus states.
- `aria-live` status regions for menu filtering and both form flows.
- Field-level errors wired through `aria-describedby` and `aria-invalid`.
- Full support for `prefers-reduced-motion`, including live preference changes.

---

## Performance

- Single HTTP request per asset type — 1 HTML, 1 CSS, 1 JS.
- No frameworks, bundlers, or runtime dependencies to download or parse.
- All 22 photographs served as WebP.
- The three hero images are `preload`ed; Google Fonts origins are `preconnect`ed.
- Non-critical sections use `IntersectionObserver` so off-screen work is deferred.

---

## Image credits

All 22 photographs in `assets/images/brand/` are sourced from [Vecteezy](https://www.vecteezy.com) under the [Vecteezy Free License](https://www.vecteezy.com/licensing-agreement).

That licence permits commercial and non-commercial use **provided the author and Vecteezy are credited**. Per-image attribution — title, author, and source URL for every file, plus a list of the six images their uploaders labelled AI-generated — is maintained in [`assets/images/brand/CREDITS.md`](./assets/images/brand/CREDITS.md).

**Keep that file with any published copy of the site, or surface an equivalent visible credit**, such as:

> Photography by the Vecteezy contributors listed in `assets/images/brand/CREDITS.md`, via Vecteezy

---

## License

Released under the [MIT License](./LICENSE). Copyright © 2026 Stanley-0ps.

Note that the MIT licence covers the **source code only**. The photography is licensed separately under the Vecteezy Free License and requires attribution — see [Image credits](#image-credits).
