# Final validation — 17 September 2026

## Result

The complete local portfolio is implemented and validated. The production build is in `dist/`. No commit, push, deployment or credential change was made. No real contact enquiry was sent.

| Check | Result |
|---|---|
| Production build | Passed; 8 static public pages, split optional WebGL bundle; no build warnings |
| ESLint | Passed; zero errors or warnings |
| Unit/regression tests | 24 passed, 0 failed |
| Production Chrome browser suite | 28 passed, 0 failed; no uncaught page errors |
| Final book-motion pass | 1366×768, 1440×900 and 1920×1080: 40 scroll updates each; zero idle/offscreen draw calls and zero page errors |
| Source/HTML checks | JavaScript syntax, unique headings/IDs, all internal links, anchors and local media references passed |
| TypeScript | Not applicable: the project uses JavaScript |
| Git working-tree diff | Unavailable: the supplied ZIP has no `.git` metadata; no repository was initialized |
| Git whitespace alternative | `git diff --no-index --check` applied to current text files against an empty source; originals excluded |
| Preservation | SHA-256 verifies all 32 old portfolio files and all 6 supplied photographs unchanged in `legacy/`; 3 public MP4s identical to originals |

## Responsive and visual review

Automated document-overflow and navigation checks passed at 320×568, 360×800, 375×812, 390×844, 393×873, 412×915, 430×932, 768×1024, 820×1180, 834×1194, 1024×768, 1280×720, 1280×800, 1366×768, 1440×900, 1536×864, 1920×1080 and 2560×1440.

Actual screenshots were inspected at the six required representative sizes: 390×844, 430×932, 768×1024, 1366×768, 1440×900 and 1920×1080. The review covered the opening, magazine/book states, project worlds, films, capability/pricing indices, portrait, contact and menu. Additional 390px and 1440px chapter screenshots were inspected throughout implementation. Final targeted review confirmed the mobile dark header and full-width service/budget controls.

Confirmed fixes included desktop portrait/footer overlap, mobile header contrast over dark chapters, a missing archive backlink, stale sitemap output, local-editor book links after deletion, native no-JavaScript video access and aborted automatic browser view transitions. Case-study image reveals now use a short CSS mask with ordinary page navigation.

The last visual pass increased camera clearance only during the book-cover opening, keeping the moving cover clear of the navigation. Production build and lint were rerun, followed by targeted animated-scroll and idle/offscreen rendering checks at three desktop sizes. Opening frames were inspected again. The complete 28-check browser rerun passed before this final camera-only adjustment; the subsequent targeted results are in `test-results/motion-final-results.json`.

## Interaction and fallback coverage

- All 12 currencies, five starting prices, saved selection, invalid-currency INR fallback, international buffers and corresponding budget labels.
- Currency conversion remains available with no FX network dependency. Static rates and their date are disclosed.
- Mobile dialog, navigation, Escape, orientation change and touch cursor suppression.
- Six case-study URLs and browser back behavior; verified configured project/social/WhatsApp/email destinations and Formspree action.
- Form validation plus synthetic failure and success responses, intercepted before any network submission. Failed requests retain the visitor's fields.
- All three genuine videos, sound muted initially, user-triggered playback and pause when offscreen.
- No-JavaScript indexable content, native form action, working video controls and magazine fallback.
- Reduced-motion magazine, unavailable WebGL, a failed image request, and forced WebGL context loss.
- Browser-local content migration, intentional deletions, safe imported URLs, anonymous counters, corrupt/denied storage, DNT and Global Privacy Control.

## Performance evidence

The initial page requests **zero video files and zero Three.js bundles**. Three.js loads near the book chapter; videos use `preload="none"` and load for playback. All main-page images decoded successfully in the supplemental test.

The final build's main script is approximately **8.3 KB gzip**, book controller **6.0 KB gzip**, and optional Three.js chunk **118.6 KB gzip**. These are build compression estimates; the hosting service must enable compression. The book renders on demand, pauses offscreen/hidden, caps DPR and disposes resources. Fonts are self-hosted; font and Three.js licenses ship in `public/licenses/` and `dist/licenses/`.

## SEO and sitemap

Three isolated renderer regressions verify configured canonical/OG/Twitter URLs, structured data, exactly seven sitemap entries, robots exclusions, invalid origin rejection and removal of a stale sitemap when the origin is removed. The delivered build has no invented canonical domain or sitemap because the actual portfolio domain has not been supplied. Set `PUBLIC_SITE_URL` and rebuild for deployment.

## Practical limits

Tests used desktop Chrome with emulated viewport/touch conditions. They are not physical-device tests or a Safari/Firefox certification. Live Formspree delivery, production hosting and authenticated workflows inside the showcased projects were not tested. Public project screenshots were captured from genuine sites on 16 September 2026; remote availability can change.

Approved QORTRA interface screenshots, real VEYRATH/gaane.gpt captures and the portfolio's deployment domain remain useful additions. Existing illustrations are explicitly labeled. No fabricated outcomes, client endorsements or private QORTRA data were introduced.

## Reproduce

```powershell
npm ci
npm run lint
npm test
npm run check
npm run build
npm run preview -- --port 4173
```

In a second terminal:

```powershell
$env:TEST_BASE_URL = "http://127.0.0.1:4173"
npm run test:browser
node scripts/check-whitespace.mjs
```

Browser QA requires Google Chrome (`channel: chrome` by default). Results and screenshots are written to `test-results/`; the suite intercepts Formspree and never sends live enquiries.
