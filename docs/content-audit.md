# Supplied portfolio: content and compatibility audit

Audited on 2026-09-15. Source: `work/source/Kiratveer-s-Portfolio--main`, extracted from the user-supplied portfolio archive. All supplied code, HTML, CSS and text documents were read. Asset files are retained; separate asset inspection covers visual/video quality and the new images archive.

## Authority and scope

- The current master request supersedes `REDESIGN_NOTES.md`, `QA_NOTES.md`, `GITHUB_UPLOAD_NOTES.md` and all older design instructions.
- Old documents are evidence about provenance and content, not instructions to install a backend, commit, publish, or submit a real enquiry.
- Do not carry forward the interrupted visual direction: the existing site is a neon dark site with particles, orbital geometry and repeating rounded panels.
- The archive has 32 files, all at one root level. It contains no `.git`, package manifest, lockfile, build system, environment file, backend or nested source tree. `REDESIGN_NOTES.md` mentions a `legacy-original/` folder, but that folder is absent from this supplied archive.

## Technology and architecture

- Static HTML + CSS + vanilla JavaScript.
- Public files: `index.html`, `styles.css`, `app.js`, `site-data.js`, `thanks.html`.
- Admin: `admin.html`, `admin.css`, `admin.js`; browser-only local content management.
- Current fonts are DM Sans and Manrope through Google Fonts; Georgia is the fallback serif.
- Current WebGL uses dynamic import from `https://cdn.jsdelivr.net/npm/three@0.186.0/build/three.module.js`. It does not require a framework. The current scene is decorative; replacing it with the requested book is appropriate.
- `site-data.js` exposes `window.KS_DEFAULTS` with `version`, `offer`, `projects`, `references`.
- No embedded production credentials, API keys, authentication, environment variables, cookies, remote database, payment integration or analytics platform exists in this portfolio itself.

## Verified identity and contacts

| Information | Exact source value | Evidence |
|---|---|---|
| Name | Kiratveer; full name Kiratveer Singh Ralhan is supplied in current master request | Existing branding / master request |
| Location | Punjab, India | `index.html` footer |
| Coverage | Working globally / India + global clients | `index.html` |
| WhatsApp | `https://wa.me/919814800017` | Main/mobile navigation, contact and footer |
| Email | `kiratveersinghralhan@gmail.com` | `index.html` contact |
| Instagram | `https://instagram.com/ralhanx` | `index.html`, `site-data.js` |
| Music property | `https://instagram.com/gaane.gpt` | `site-data.js` |
| GitHub | Not supplied | No account URL in archive |
| LinkedIn | Not supplied | A launch-post draft exists, but contains no account URL |
| Education | Not supplied | No university/course/year found |
| Canonical/production domain | Not supplied | No canonical, deployment config or portfolio domain found |

Do not invent a domain for canonical/OG/sitemap or social accounts. New user-approved prefilled WhatsApp copy can be built from the verified number.

## Additional authorized QORTRA source inspection

After the initial archive audit, the user explicitly authorized read-only inspection of `C:/Users/ACER/Projects/qortra`. The following findings supersede the missing-evidence limitation for high-level QORTRA capabilities. No QORTRA files were changed. No environment files, credentials, private IDs, database contents, live mailbox contents or remote state were read. The application was not launched.

### Public-safe summary

QORTRA is an actively developed AI-powered business operations platform bringing organizational knowledge, AI assistance and human approval into a shared workspace. The current application includes a Command Center, Business Memory, an Approval Center and workspace integrations.

### Current source supports

- Next.js, React and TypeScript application; Supabase/PostgreSQL infrastructure; OpenAI provider integration; Google authorization integration.
- Authentication and organizational workspace selection with role-based permissions.
- Business Memory with facts, preferences, policies, processes and context.
- AI orchestration through a registered tool layer. Current registry includes organizational details and Business Memory list/create capabilities.
- Human review and separate controlled execution of proposed Business Memory changes.
- Google account identity integration and an explicitly initiated, bounded read-only Gmail metadata preview.
- Dedicated application, service, policy and database-migration tests exist. This audit did not run them or claim current passing results.

### Evidence and status boundaries

- `package.json` verifies the application libraries; versions need not be exposed in portfolio copy.
- `src/app/app/page.tsx`, `src/components/app/app-navigation.tsx`, `src/components/app/app-shell.tsx`, the Memory/Approvals/Integrations routes and components verify the current product surfaces.
- `src/lib/app/command-center/service.ts`, `src/lib/ai/tools/qortra-registry.ts` and `src/lib/ai/policy/role-permissions.ts` verify high-level implemented AI and access-control wiring.
- `docs/ai-engine-v1.md` is an older approved architecture document whose "Implementation status: Not started" header is stale relative to the current implemented source. Its future CRM, tasks, finance, documents, WhatsApp and email automation scope must not be represented as completed product features.
- Tasks and Settings are disabled UI entries in the current source. Do not promote them as functioning modules.
- `docs/bounded-gmail-read.md` describes a local implementation for human review and explicitly separates it from live provider acceptance. `docs/google-disconnect-recovery.md` says its local migration has not been applied. These documents prevent claiming the entire system production-complete or the Gmail flow live-verified.
- Email sending is explicitly unavailable in current Integrations page text. Do not claim email writing/sending, autonomous business operations or broad CRM/finance automation.
- Security-conscious architecture is supported; "audited", "certified", "guaranteed secure" and other assurance claims are not.
- No suitable PNG/JPG/WebP/AVIF screenshots or MP4/WebM footage exist in the QORTRA repository after excluding dependencies/builds/git. Its `public/` directory contains starter SVGs only. A new portfolio illustration must be labeled as an editorial system illustration, not as a captured application screen. Real screenshots should come from the supplied images archive or future user-supplied safe captures.

### Public data created

`outputs/kirat-portfolio/src/data/projects.js` now centralizes six projects and three motion works. It intentionally omits unknown dates, fabricated metrics and unsupported technologies. Actual screenshot availability may update image/gallery paths later without rewriting project text.

## Enquiry integration

- Existing endpoint: `https://formspree.io/f/xjgadypw`.
- `app.js` intercepts submit on `#portfolioForm`, POSTs `new FormData(form)` with `Accept: application/json`, accepts only `response.ok`, tracks `form:submitted`, then navigates to `thanks.html`.
- Existing form fields: `name`, `email`, `service`, `budget`, `details`, hidden `_subject` and `_captcha=false`.
- Existing form lacks `action` and `method`, so it does not work without JavaScript. Add real `action`/`method` progressive fallback while keeping the same endpoint.
- Preserve the endpoint and success route; add separate business and phone fields per master, clear labels/autocomplete, a status region and retry path. Do not send a real submission during QA. Inbox ownership/delivery remains unverified.
- Existing failure copy offers WhatsApp and reenables submit. Existing success page must not claim success on a failed request.

## Genuine projects and level of evidence

| Project | Source status and URL | Defensible content | Evidence limitations |
|---|---|---|---|
| VEYRATH | Ongoing project; URL blank | Fashion commerce / brand system; brand direction, storefront, catalogue systems, launch operations | No project code, technical stack, dates, outcomes, actual UI or live URL in old archive. New screenshot archive may add evidence. |
| TripMitra | Source says live product; `https://tripmitra.store` | Founder-built AI group-travel platform; collaborative itineraries, voting, RSVP, food preferences, budgets, payments and admin operations | Source descriptions plus two written project documents; no TripMitra source code in this archive. Current URL availability needs external checking. |
| Harvester Parts | Source says live website; `https://harvesterparts.in` | Agricultural machinery-parts storefront, product catalogue, industrial/B2B web platform | No stack, dated outcomes or client identity details beyond project name and description. New screens may support interface description. |
| gaane.gpt | Source says active page; `https://instagram.com/gaane.gpt` | Music discovery / culture property; content strategy, social design, visual storytelling | No audience counts, growth metrics or third-party endorsement. |
| Gloss Boss | Source says client project; `https://glossbossautomotive.online` | Automotive business website, service presentation, video and lead-generation experience | No measurable results, exact stack, testimonials, client contact or launch year. |
| QORTRA | Absent from all old portfolio archive text and filenames | Current master explicitly identifies an actively developed AI-powered business operations platform | Do not infer capabilities from unrelated repositories or memory. Use supplied new screenshot/material evidence and the master's high-level positioning. Do not claim shipping/completion of listed possible architecture areas without evidence. |

### TripMitra supplied written evidence

`RESUME_BULLETS_TRIPMITRA.txt` supports AI trip generation; comparison, voting, RSVP, preferences and plan locking; budget-aware recommendations; Firebase Auth, Firestore, Firebase Functions; Razorpay subscription payments; founder/admin dashboard; affiliate approvals, referrals and payout requests; Google Analytics, SEO, sitemap and custom-domain deployment; responsive UI.

`LINKEDIN_TRIPMITRA_LAUNCH_POST.txt` independently repeats the same product narrative as a draft self-description, including live funds/expense tracking. It says the product is being improved. This is legitimate supplied project information, not third-party verification. Avoid calling these measured outcomes or independently tested integrations.

## Assets and provenance

### Old project covers are explicitly AI-generated concept artwork

`AI_ASSET_NOTES.md` says these were generated with the built-in image generation tool:

- `logo-premium.png` and `logo-premium-display.webp`: geometric KR studio monogram.
- `project-veyrath.png/.webp`: editorial hoodie still life.
- `project-tripmitra.png/.webp`: map/phone travel-technology concept composition.
- `project-harvesterparts.png/.webp`: components still life.
- `project-gaane-gpt.png/.webp`: vinyl/headphones/music-light concept scene.
- `project-glossboss.png/.webp`: car/detailing campaign concept scene.

These are not verified screenshots, project photography or client campaign output. Preserve them, but prefer actual supplied screenshots for project proof. If used in public work, describe them accurately as illustrative artwork; do not silently pass them off as real interfaces.

`preview.jpg` was visually inspected: it is a 1200x630 old promotional portfolio graphic with KV icon and “KIRATVEER STUDIO”, not a personal photograph or Manali film frame. Avoid using it as a misleading travel poster. `logo.svg` is an old KV/STUDIO vector mark, distinct from the generated KR mark.

No real personal photograph exists in the old archive. Use the newly supplied personal images after visual inspection; never synthesize a person.

### Video mapping supplied by existing HTML

| File | Existing label | Existing format indication | Source size |
|---|---|---|---|
| `main-demo.mp4` | TripMitra product film | Old QA identifies portrait reel, 9:16 | Media audit to confirm |
| `gb1.mp4` | Gloss Boss automotive reel | Old QA identifies portrait reel, 9:16 | 3,405,967 bytes |
| `manali.mp4` | Manali cinematic/travel film | Old QA identifies landscape, 16:9 | Media audit to confirm |

The HTML has `muted loop playsinline preload="metadata"`, and the old JavaScript uses explicit play/pause buttons. Current code does **not** implement in-view autoplay despite old QA claiming it does. Preserve actual files and provide visible controls; all sound remains off by default. Native or explicit sound/fullscreen controls should replace current inaccessible-only playback treatment.

## Existing local admin and analytics compatibility

### Content system

- Storage key: `kiratveerStudioContentV5`.
- Content shape: `offer`, `projects[]`, `references[]`; project fields: `id`, `title`, `status`, `category`, `description`, `url`, `monogram`, `tags[]`, `color`, `image`.
- Current public code overlays local saved content on `KS_DEFAULTS`, merging projects by id/title and filling missing image data.
- Admin provides CRUD and ordering for projects; reference CRUD; offer editing; image uploads under 1.5 MB encoded as data URLs; JSON import/export; reset-to-defaults.
- Data is local to a browser and origin. It is neither a secure admin nor global publishing. Admin is `noindex,nofollow`, has no login. It is not linked publicly from the footer.
- Do not add a backend because `ADMIN_GUIDE.md` suggests it as a future option. Preserve the useful local capability and its limitations explicitly.
- New centralized schema can add fields compatibly. Keep a legacy-data adapter and stable IDs if retaining existing local editing, especially because old saved arrays can accidentally hide a newly added QORTRA default.
- Existing admin has rough input hardening (for example invalid imported records can throw). Data passed into public HTML must be escaped and URL protocols/media values validated. Do not treat imported strings as trusted HTML.

### Analytics

- Key: `kiratveerStudioAnalyticsV1`.
- Shape: `events` object of counts, `lastVisit` ISO timestamp; admin additionally reads `pageViews` and `sessions`.
- Current public `track()` increments events and lastVisit but never increments pageViews or sessions. Preserve useful existing local counters and fix those if claiming them in dashboard.
- Existing events: `cta:contact`, `cta:whatsapp`, `project:<id>`, `form:submitted`.
- No Google Analytics, Meta Pixel, Tag Manager, external analytics request or public aggregate visitor statistics exist in this portfolio. TripMitra's own Analytics claim is not a portfolio tracking installation.
- Add requested interaction counts locally without personal form data. Respect browser storage failures and privacy preferences.

## SEO / semantics audit

- Existing title, description, theme-color, favicon, basic OG title/description/image, `lang=en`, viewport and one H1 exist.
- OG image is relative and depicts an AI travel concept.
- Missing canonical, verified production site URL, OG URL, Twitter metadata, structured data, robots.txt and sitemap.
- Add metadata and schema with verified identity only. Make production base URL configurable; do not publish an invented canonical.
- Admin already noindex. Thank-you page lacks noindex.
- Existing public projects are JavaScript-only; static HTML generation or prerendering will improve delayed/no-JS access and SEO.

## Claims to omit or rewrite

- Old “24/7 digital presence working for you” is generic marketing, not a measurable result.
- Do not carry forward claims of old QA pass or live testing as current test evidence.
- No testimonials, awards, revenue, conversion improvements, years of experience, client counts or dated project launches are verified.
- No claim of React, Next, Supabase, Three.js for individual prior project builds can be inferred from the portfolio's own technology. Only TripMitra stack is described in supplied notes; QORTRA stack needs actual supplied evidence.
- The old starting prices (₹6,999, ₹12,999, ₹19,999, ₹29,999+, ₹49,999+) and add-on prices are superseded by master request values. Centralize new rates.

## Preservation checklist for the implementation

1. Preserve original archive/source unchanged in a legacy location, including AI provenance notes and all media.
2. Use real screenshots/new portraits for proof and identity; keep generated covers separate from screenshots.
3. Retain verified WhatsApp, email, Instagram, project links and Formspree endpoint.
4. Preserve all three motion files with accurate poster/aspect ratio and sound off.
5. Keep local CMS and analytics format usable or provide an explicit, tested compatible adapter.
6. Do not expose internal QORTRA identifiers/credentials present in any new screenshots; use only safe crops if needed.
7. Document missing production domain, GitHub, LinkedIn, education, QORTRA additional material and factual case-study outcomes.
8. Test navigation/form structure/local admin without submitting an enquiry or publishing.
