# Redesign notes — The Independent Edition

## Concept and preserved work

The portfolio unfolds as a directed digital film: a dark studio reveals a physical portfolio volume, the book opens into five project worlds, and the experience moves through film, capabilities, process, investment and a focused project brief. Warm paper is reserved for editorial contrast while graphite, cobalt light, depth and restrained glass establish the main cinematic system. Real photography connects the work to Kirat.

The supplied portfolio was static HTML/CSS/JavaScript. The rebuild keeps that lightweight model, adds a Vite build and modular JavaScript, and generates readable static pages. It does not introduce React, an application backend, a database or authentication. The existing Formspree endpoint, verified contact information, local content editor, all legitimate original media and the supplied new photographs are preserved.

- `legacy/original-portfolio/`: original portfolio and its documents/media.
- `legacy/supplied-photographs/`: all six newly supplied original photographs.
- `docs/`: content, media and reference audit records. Historical instructions in those records are evidence, not a replacement for the current master brief.

`legacy/` is outside Vite's public directory and is not part of `dist/`. Do not upload the complete source directory to a public web host.

## Design system

| Element | Current direction |
|---|---|
| Night | `--night: #070909` |
| Graphite | `--graphite: #101312` |
| Warm paper | `--bone: #ece9e0` |
| Electric cobalt | `--cobalt: #315efb`, `--acid: #8ca7ff` |
| Champagne | `--champagne: #d7c6a4` |
| Display serif | Instrument Serif, regular and italic |
| Interface sans | Manrope, weights 400/500/600 |
| Layout | Fluid `clamp()` typography, CSS Grid/Flexbox, restrained rules and broad margins |
| Glass | Navigation and selected interface layers; not a repeated card system |

Fonts are installed through Fontsource and served locally. Retain the font packages' licenses when redistributing the source. Change the cinematic tokens in `src/cinematic.css`; the preserved base and case-study styles remain in `src/styles.css`.

## Architecture and dependencies

| File / directory | Responsibility |
|---|---|
| `src/data/projects.js` | Six project records, five featured worlds and three original motion works |
| `src/data/site.js` | Identity, contact, social links, navigation, capabilities, process and audit offer |
| `src/data/pricing.js` | All base amounts, package scopes, add-ons, currency tables and conversion functions |
| `src/components.js` | Shared HTML composition for home, case studies and thank-you page |
| `src/components-flow.js` | Eight-step project brief and confirmation-page composition |
| `src/start-project.css` | Purpose-built enquiry and confirmation experience |
| `src/main.js` | Progressive enhancement and browser-local content integration |
| `src/modules/book.js` | Lazy Three.js book and its fallback lifecycle |
| `src/modules/motion.js` | Lenis/GSAP scroll choreography, scene progress, header contrast, cursor and CTA feedback |
| `src/modules/project-flow.js` | Step validation, review/edit, currency-aware ranges and protected Formspree submission |
| `src/modules/interactions.js` | Mobile dialog, capability index, films and Formspree submission |
| `src/modules/safety.js` | Text escaping and URL/media validation |
| `src/modules/local-content.js` | Compatibility with the original local content format |
| `src/modules/analytics.js` | Browser-only interaction counters and privacy preference handling |
| `scripts/render.mjs` | Build-time HTML, admin defaults, metadata, robots and sitemap generation |
| `public/` | Assets and the preserved local editor; copied to production output |

Runtime dependencies have specific roles: **Three.js** renders the book; **GSAP/ScrollTrigger** maps progress to project, film and process scenes; **Lenis** smooths fine-pointer desktop scrolling while preserving native form, touch and reduced-motion behavior; **Manrope and Instrument Serif Fontsource packages** provide self-hosted typography. Development dependencies are **Vite** for serving and bundling, and **Playwright** for browser QA. ESLint and its configuration packages are development-only code checks. There is no page-flip plugin, paid service dependency or new backend.

## 3D book and scroll direction

The book is a real Three.js object with cover board, spine, paper block, fine paper-edge lines, printed page textures, a hinged cover and a curved turning sheet. Canvas textures are composed from central project information and real project images. Captions retain each asset's screenshot/illustration distinction. No QORTRA application UI is fabricated.

Scroll progress controls the entrance, camera distance, opening hinge, sequential page turns and final page-to-world portal. Page curvature is calculated on a modest segmented plane rather than a physics simulation. The scene uses warm key lighting, cool edge lighting, rough paper/cloth materials, a raised metallic KR and restrained shadows. Its HTML surroundings provide project titles, narrative and real links independently of the canvas.

The Three.js import starts only when the book approaches the viewport. Rendering is requested on scroll, resize and image readiness; there is no permanent idle animation loop. Hidden/offscreen scenes stop rendering. DPR is capped at 1.5 for high capability and 1 for medium. Medium uses smaller textures and fewer page segments and disables dynamic shadows. Disposal releases textures, materials, geometries, shadows, renderer/context, observers and listeners. Context failure restores the magazine presentation.

Other motion is deliberately lighter: pinned project-world depth, QORTRA system planes, scroll-selected films, process progression, reading progress, scene-aware navigation, page curtains, link feedback and magnetic CTAs. Lenis runs only on fine-pointer, non-reduced-motion portfolio pages; touch, forms, keyboard navigation and browser history remain native. Case studies retain their own URLs and browser back behavior.

## Responsive and mobile strategy

- Desktop with a fine pointer and sufficient capability receives the 3D book.
- Reduced-motion, coarse/touch, small-screen, data-saving and low-capability conditions select a DOM magazine.
- Medium capable devices reduce rendering resolution and geometry.
- The mobile layout has its own CSS 3D volume, horizontal project portal, stacked project worlds, tap accordions and fullscreen navigation dialog.
- The mobile magazine uses actual images and links; it does not depend on WebGL or hover, and its movement remains linked to scroll.
- Images use intrinsic dimensions; hero/about photographs have responsive WebP variants. Films keep their portrait or landscape presentation.
- Mobile has no custom cursor or magnetic movement. Reduced motion disables nonessential transitions and scroll-driven transforms.

When changing layouts, inspect 320–430 px phones, 768–834 px tablets, landscape tablet/laptop, 1366/1440 px desktops and 1920/2560 px screens. Do not solve clipping by hiding important text or horizontal overflow globally.

## Updating project content

1. Add a record to `src/data/projects.js` using an existing record as the schema reference. Use a stable unique `id` and URL-safe `slug`.
2. Supply only verified title, category, summary, description, challenge, idea, experience, engineering points, role, services, stack and current status. Leave unsupported fields empty; do not fabricate results or dates.
3. Set `featured: true` for the main project journey; use `false` for archive-first work. Keep the main journey curated. The book accepts up to six projects.
4. Place optimized images in `public/assets/images/`. Set root-relative paths such as `/assets/images/project-example.webp`; add clear `imageNote` provenance and gallery alt text/captions.
5. Use `url: ''` when a public link is unavailable. Do not replace it with a placeholder link.
6. Add or reuse a `theme` in `src/styles.css` if the project needs its own atmosphere.
7. Run the checks and production build. The case-study HTML and local-editor defaults are regenerated automatically.

All six projects currently have generated case-study URLs. QORTRA leads the collection as an actively developed AI business operations platform. It uses a clearly labeled system illustration because no approved application screenshots were supplied or found. An approved screenshot can replace its `image` and populate `gallery` later without changing its truthful status.

## Replacing photographs and videos

Keep originals in `legacy/` and export appropriately sized WebP/AVIF assets for the public site. The existing real portrait variants use 480/960/1440 widths. Update the corresponding `srcset`, dimensions, alt text and crop in `src/components.js` and `src/styles.css` when replacing a portrait with a different aspect ratio.

Edit `motionWorks` in `src/data/projects.js` for films. Place MP4 files in `public/assets/video/` and genuine still-frame posters in `public/assets/images/`. The current originals are TripMitra's product film, Gloss Boss's automotive reel and the Manali travel film. Playback is user initiated, muted initially and uses native sound, seek and fullscreen controls. Videos use `preload="none"`; offscreen/hidden clips pause. Do not use unrelated promotional artwork as a film still.

## Prices and currency estimates

All prices are INR bases in `src/data/pricing.js`:

| Package | Starting price |
|---|---:|
| Launch Experience | ₹12,999 |
| Business Growth | ₹24,999 |
| Premium Experience | ₹44,999 |
| Commerce | ₹59,999+ |
| AI / Digital Product | ₹79,999+ |

Change `packages[].price`, scope and descriptions here only. `addons[]` holds optional service prices; `period: 'month'` marks recurring scope. The `plus` flag controls the additional plus sign. Budget brackets are centralized in `budgetOptions`.

Twelve currencies are supported: INR, USD, EUR, GBP, AED, CAD, AUD, SGD, NZD, CHF, JPY and SAR. Visitors explicitly choose their currency; there is no country detection. Their choice may be remembered locally.

Conversion is `INR amount × rate × buffer`, rounded upward to 5 currency units internationally or 100 for JPY. INR keeps its base amount. `Intl.NumberFormat` supplies grouping and currency formatting; the configured symbols distinguish dollar currencies. Converted prices say **Approx.** and show the buffer note. Form budget labels change with the same calculation and the form records the selected billing currency.

Rates are **static reference estimates dated 14 September 2026**, not live rates. The table contains ECB EUR reference cross rates; AED and SAR derive from the documented USD pegs. `currencySettings.sources` records the source URLs. No external request is required, so an FX outage cannot remove prices. Unknown/invalid currency selection falls back to INR.

To refresh rates, update `eurReference`, check the peg references, and update `rateDate`, `rateDateLabel` and `sources` together. To change buffers, edit `defaultInternationalBuffer` (currently 1.15) and `gulfBuffer` (currently 1.12); INR remains 1.00. Per-currency entries can override those defaults. Retest pricing and form budget labels after changes. Final proposals remain subject to the agreed scope and billing currency.

## Contact, privacy and local administration

Change email, WhatsApp digits/message, Formspree endpoint, socials and navigation in `src/data/site.js`. Only the verified Instagram account is listed; GitHub and LinkedIn can be added when actual URLs are provided. The WhatsApp URL is derived centrally. Do not add credentials to a browser file.

`/start-project/` preserves the original Formspree endpoint through an eight-step brief: identity, project type, current position, currency-aware investment, timing, goal/references, contact preference and review. It keeps a native POST fallback, validation, honeypot, accessible status, timeout/retry behavior and duplicate-submit protection. A confirmed response records a short-lived local success marker and opens `/thank-you/`; direct visits never claim a submission. `/thanks.html` remains a compatibility route. Real inbox ownership/delivery still requires an owner-approved live test; automated QA mocks every request.

`/admin.html` retains project/reference CRUD, ordering, offer editing and JSON import/export. It writes `kiratveerStudioContentV5` in localStorage. This edits only that browser on that origin; it does not publish to other visitors, update static case studies or create a backend. Source edits plus rebuilding are the publishing path. Local additions without a generated slug remain archive items. Version-5 data receives QORTRA compatibility handling; version-6 deletions are treated as intentional. Export a JSON backup before local resets or clearing browser storage. Do not store confidential information in the editor.

Anonymous interaction counters remain local under `kiratveerStudioAnalyticsV1`; they are not aggregate production analytics. Events include contact, project, case study, social, pricing/currency, video and confirmed form interactions. No form text or personal information is stored in those counters. Do Not Track and Global Privacy Control disable counter collection where exposed. No new external analytics provider or ad tracker is installed.

## SEO and accessibility

Static generated HTML exposes important content without waiting for JavaScript. Pages have an individual title/description, one main heading, semantic content, social metadata, favicon, theme color and Person/CreativeWork structured data using verified information. The admin and thank-you pages are excluded from indexing.

Set the actual `PUBLIC_SITE_URL` at build time to produce canonical/OG URLs and a sitemap; it must be the root origin. Never invent a domain. Without a configured origin those domain-specific fields are omitted. The social preview is the portfolio identity, not a claimed project screenshot.

The interface includes a skip link, focus indicators, meaningful alt text, labeled inputs, native details/summary controls and a modal mobile dialog. The cursor overlay does not replace native link/button behavior. Reduced motion keeps all content available. The WebGL canvas is decorative to assistive technology because the same work remains in semantic HTML.

## Build, QA and release

Use the commands in [README.md](README.md). `npm run dev` and `npm run build` regenerate HTML; generated files should never be the source of a content edit. Unit tests cover conversion and local-content compatibility. The source check and browser suite provide additional structural and interaction checks. No TypeScript compiler is needed for this vanilla JavaScript project.

**Final validation:** production build, ESLint, source checks and the Git no-index whitespace check passed; all 28 unit/SEO regressions, 28 production portfolio browser checks and 10 dedicated project-flow browser groups passed with no page errors. All 18 viewport sizes were checked, and actual visual review covered the six required representative sizes and key scroll states. Real Formspree submissions remained blocked during testing.

Only `dist/` belongs on static hosting. The current Vite base is `/`, intended for a domain root. There has been no commit, push, deployment or deployment-credential change.

## Remaining owner-supplied material

- The verified production portfolio domain for canonical URLs and sitemap.
- Approved non-sensitive QORTRA application screenshots or a short walkthrough.
- Genuine VEYRATH product/interface material and its public link when ready.
- Actual gaane.gpt content captures if preferred over its labeled concept cover.
- Optional GitHub/LinkedIn profile URLs, education details and verifiable case-study outcomes.
- Owner confirmation of Formspree inbox ownership and delivery.

Missing information is omitted or explicitly labeled; it is not replaced by fabricated claims.

Font licenses and the Three.js license are preserved in public/licenses/ and copied into the build. Use Node.js 22.13+ within v22 or Node.js 24+; the validation runtime was 24.19.0.
