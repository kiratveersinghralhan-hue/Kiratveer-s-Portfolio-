# Final validation — 18 September 2026

## Result

The existing portfolio architecture and content were preserved. The final pass adds integrated day/night themes, theme-aware book materials/lighting, a 2.6-second identity curtain, clearer typography, aligned gutters, refined controls and purpose-built tablet/mobile adjustments. The completed production output is in `dist/`. No commit, push, deployment, credential change or real enquiry submission was performed.

| Check | Result |
|---|---|
| `npm run build` | Passed; 10 generated public routes plus preserved admin utility |
| `npm run lint` | Passed, no errors or warnings |
| `npm test` | 28 unit/SEO regressions passed |
| `npm run check` | 31 JavaScript files, 11 HTML pages and 330 local references passed |
| `npm run test:browser` on production preview | 30 checks passed, no uncaught page errors |
| `node tests/project-flow-browser.mjs` on production preview | 10 groups passed, all provider requests intercepted |
| `node tests/theme-browser.mjs` on production preview | 8 groups passed, no uncaught page errors |
| `git diff --check` | Passed; the current folder has Git metadata |
| TypeScript | Not applicable; this is a JavaScript project |

## Visual and responsive review

The portfolio browser suite checks all 18 original viewport sizes: 320×568, 360×800, 375×812, 390×844, 393×873, 412×915, 430×932, 768×1024, 820×1180, 834×1194, 1024×768, 1280×720, 1280×800, 1366×768, 1440×900, 1536×864, 1920×1080 and 2560×1440.

The final palette pass additionally captures both day and night at 13 sizes, covering 320/360/375/390/430px phones, 768/820/1024px tablets and 1366/1440/1536/1920/2560px desktops. Actual screenshots and contact sheets were inspected, including the complete chapter journey at 390px and 1440px, all five project worlds, pricing, film, capabilities, process, portrait, footer, enquiry, confirmation and case-study pages. Camera frames were inspected during the approach, cover lift, full spread, page turns and QORTRA portal. The opening identity sequence was inspected at 450, 1000, 1800 and 2300ms.

Visual fixes from this pass:

- Removed inherited double gutters around project scenes.
- Corrected book framing while the cover lifts and centered the open spread in the viewport.
- Added a separate tablet-portrait text/book composition and adjusted its camera target.
- Prevented mobile project previews from crowding the opening frame.
- Simplified the smallest-phone QORTRA planes to a readable two-column diagram.
- Reduced oversized headings and raised important body/navigation/control text sizes.
- Reworked process alignment into one continuous path; retained accessible pricing accordions.
- Restored visible video pause controls and added keyboard navigation for film tabs.
- Kept inactive films out of focus order; retained native video controls without JavaScript.
- Added a stacked reduced-motion mobile magazine with no long empty pinned scene.

Artifacts live under `test-results/master-polish/`, `test-results/project-flow/` and the existing root browser screenshots. `tests/visual-polish.mjs` reproduces the palette capture pass; set `POLISH_ALL=1` for all 13 sizes.

## Theme, interaction and fallback coverage

- Early theme bootstrap precedes blocking stylesheets in generated/production HTML.
- Initial system preference, explicit keyboard choice, local persistence, internal routes, cross-tab updates and system changes without an override.
- Denied storage still leaves the theme control usable.
- Primary, secondary, muted and accent text tokens have at least 4.5:1 contrast against the three tested semantic backgrounds in both palettes. This is targeted palette validation, not a complete accessibility certification.
- Theme changes reuse the existing WebGL canvas; lights/materials transition in place.
- Desktop and touch-capable Windows-sized viewports have a visible canvas and `data-book-mode="3d"` when WebGL is available.
- Reduced motion and unavailable WebGL retain the DOM magazine and semantic project content.
- Intro measured at approximately 2.56 seconds in the production browser run; Skip, once-per-session behavior and explicit replay are covered.
- All 12 currencies, five starting prices, buffers, rounding, stored choice, invalid-currency fallback and corresponding form budget labels.
- Mobile menu, focus, Escape, navigation, orientation change and cursor suppression on touch.
- Six case-study routes, browser back, configured project/social links, WhatsApp/email URLs and original Formspree action.
- Eight-step enquiry validation, review/edit, retained answers after a mocked failure, duplicate-submit protection, mocked success and truthful direct confirmation visits.
- Three genuine video sources, muted initial state, user playback/pause and offscreen pause. No live contact requests are sent.
- Browser-local editor data, legacy compatibility, privacy preferences and no-JavaScript content/form fallbacks.

## Performance evidence

No new dependency was added during this polish pass. The optional Three.js chunk remains approximately 118.6 KB gzip; the book controller is 7.1 KB gzip and the main script, including GSAP/Lenis, is 57.1 KB gzip. Shared CSS is approximately 22.6 KB gzip. These are build estimates; the hosting service must enable compression.

The hero now contains the book, so capable desktop browsers request its lazy Three.js chunk when that first scene is near the viewport. Mobile/reduced-motion fallbacks avoid that import. Videos retain `preload="none"` and user-triggered playback.

Instrumented browser checks found zero additional WebGL draw calls while idle and while offscreen, including an offscreen theme switch. DPR caps remain 1.5 (high) and 1 (medium). Medium geometry/textures are smaller and real-time shadows are disabled. The final QORTRA spread reuses existing page textures. Resource cleanup is preserved.

Lenis is tuned to 0.78s; its animation loop stops while the document is hidden. Each project uses one shared ScrollTrigger for entry and spatial progression. Scene measurements and film controls are cached. Theme transitions only animate selected color/background/border properties; camera/object motion uses transforms rather than DOM layout animation.

## SEO and sitemap

Three renderer regressions verify configured canonical/social URLs, structured data, exactly eight sitemap routes, robots exclusions, origin validation and deletion of a stale sitemap when the origin is removed. The delivered build deliberately omits domain-specific canonical URLs and sitemap because no verified production domain was supplied. Configure `PUBLIC_SITE_URL` with the actual root origin and rebuild for deployment. The enquiry is indexable; admin and confirmation routes are excluded.

## Practical limits

Testing uses desktop Chrome with emulated viewport/touch/reduced-motion conditions. Physical-device battery/GPU performance and Safari/Firefox behavior were not certified. Live Formspree inbox delivery and production hosting were not tested. External project availability can change; configured destinations and local route behavior were verified.

Approved QORTRA application screenshots and the verified portfolio domain remain owner-supplied additions. QORTRA is currently presented through its verified architecture and an explicitly labeled system illustration. Existing assets were preserved; no private product data or invented results were added.

## Reproduce

```powershell
npm run lint
npm test
npm run build
npm run check
git diff --check
npm run preview -- --port 4173 --strictPort
```

In another terminal:

```powershell
$env:TEST_BASE_URL = 'http://127.0.0.1:4173'
npm run test:browser
node tests/project-flow-browser.mjs
node tests/theme-browser.mjs
$env:POLISH_ALL = '1'
node tests/visual-polish.mjs
```

Open `http://127.0.0.1:4173/`. Use `/?intro=replay` to replay the entry sequence. Browser checks use installed Google Chrome and intercept Formspree. Deploy only `dist/` at the domain root; do not upload the source/legacy/test folders.
