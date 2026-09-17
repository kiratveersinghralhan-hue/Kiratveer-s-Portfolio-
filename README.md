# Kirat — The Independent Edition

A complete static portfolio for Kiratveer Singh Ralhan: editorial photography, a scroll-controlled Three.js portfolio book, five featured project worlds, six case studies, real films, transparent pricing and a direct enquiry flow.

## Run locally

Requires **Node.js 22.13+ (v22), or Node.js 24+** and npm. From this folder:

```powershell
npm ci
npm run dev
```

Open the URL printed by Vite, normally `http://127.0.0.1:5173`. Do not open the HTML through `file://`; modules and generated routes need an HTTP server.

## Check and build

```powershell
npm test
npm run lint
npm run check
npm run build
npm run preview
```

The browser suite is run with `npm run test:browser`. It uses installed Google Chrome by default. To use Playwright Chromium, run `npx playwright install chromium` and set `$env:PLAYWRIGHT_CHANNEL = 'chromium'`. Set `$env:TEST_BASE_URL = 'http://127.0.0.1:4173'` when testing the production preview. The suite intercepts Formspree requests so it never submits a real enquiry. See [QA_REPORT.md](QA_REPORT.md) for the complete commands.

`npm run build` first regenerates the HTML from the central source data, then produces **`dist/`**. `npm run preview` serves that production build, normally at `http://127.0.0.1:4173`.

## Production domain and deployment

The production portfolio domain was not supplied. Configure the verified origin when building:

```powershell
$env:PUBLIC_SITE_URL = 'https://your-verified-domain.example'
npm run build
```

Replace the example with the actual portfolio origin. This public setting is not a credential. It enables canonical URLs, absolute social-image URLs, Open Graph URLs and a sitemap. Without it, canonical and sitemap information is deliberately omitted.

Deploy **only the contents of `dist/` at the domain root**, using any static host. No server application, database or authentication service is required. Preserve `/work/*.html`, `/thanks.html` and `/assets/` paths; do not configure every request to fall back to the home page. The current root-relative build is not configured for a repository subpath.

Keep `legacy/`, `node_modules/`, source files and local QA records out of the public upload. The preserved local editor is included at `/admin.html`; it is a browser-local utility, not a secure publishing dashboard. For a deployment without that utility, omit its three admin files from the upload.

No commit, push or deployment was performed as part of this local rebuild. Formspree inbox delivery has not been live-tested.

## Where to make changes

| Change | Source |
|---|---|
| Projects, case studies and films | `src/data/projects.js` |
| Identity, contact, navigation, services and process | `src/data/site.js` |
| Prices, currencies, exchange rates and buffers | `src/data/pricing.js` |
| Page composition | `src/components.js` |
| Visual system and responsive layout | `src/styles.css` |
| 3D book | `src/modules/book.js` |
| Scroll, cursor and microinteractions | `src/modules/motion.js` |
| Forms, videos and navigation | `src/modules/interactions.js` |
| Static HTML, metadata and sitemap generation | `scripts/render.mjs` |
| Media | `public/assets/` |

Do not directly edit generated `index.html`, `thanks.html`, `work/*.html` or `public/site-data.js`; the next dev/build command regenerates them.

Read [REDESIGN_NOTES.md](REDESIGN_NOTES.md) for maintenance, architecture and safeguards. Read [CONTENT_PROVENANCE.md](CONTENT_PROVENANCE.md) for the distinction between verified information, real media and labeled illustrations.

## Validation status

Complete locally. Production build and ESLint passed, 24 unit/SEO tests passed, and all 28 production browser checks passed. All 18 specified viewports passed overflow checks, with actual visual review at the six required representative sizes. See [QA_REPORT.md](QA_REPORT.md) for evidence, commands and practical limits.
