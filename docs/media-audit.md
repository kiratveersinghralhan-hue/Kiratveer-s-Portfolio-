# Media completion audit

Completed 2026-09-16. This continues the interrupted media task and preserves every supplied original asset. No source project, remote service, form, account or deployment was modified.

## Genuine video posters

All three MP4 files decoded successfully in local Chromium. Metadata and sampled original frames are retained in `work/evidence/`; the original videos were not transcoded or replaced.

| Supplied file | Verified content | Dimensions / duration | Selected frame | New optimized poster |
|---|---|---|---|---|
| `main-demo.mp4` | TripMitra product film, including a real phone displaying the TripMitra URL | 720 × 1280 / 35.017 seconds | 15.7575 seconds | `public/assets/images/poster-tripmitra.webp` — 20,616 bytes |
| `gb1.mp4` | Gloss Boss automotive detailing reel | 720 × 1280 / 36 seconds | 4 seconds | `public/assets/images/poster-glossboss.webp` — 45,408 bytes |
| `manali.mp4` | Mountain travel edit; snowy mountain footage and existing editorial text | 960 × 540 / 17.367 seconds | 14.9353 seconds | `public/assets/images/poster-manali.webp` — 118,340 bytes |

Poster selection was visually reviewed using contact sheets of six original frames per video. Posters are actual decoded video frames. The old `preview.jpg` is not used as a travel poster. TripMitra and Gloss Boss retain their portrait aspect; Manali retains its landscape aspect. Any text on the film frames already exists in the supplied edits.

## Genuine public interface screenshots

Each of the user-supplied project URLs returned HTTP 200 with matching branding and actual interface content on 2026-09-16. Screenshots were captured at 1440 × 1000, visually inspected, and optimized to WebP without rearranging or inventing their UI.

| URL | Captured content | New files | Combined size |
|---|---|---|---|
| `https://tripmitra.store/` | Group-travel homepage and trip-idea discovery section | `screen-tripmitra.webp`, `screen-tripmitra-detail.webp` | 216,242 bytes |
| `https://harvesterparts.in/` | Farm marketplace homepage and parts-listing section | `screen-harvesterparts.webp`, `screen-harvesterparts-detail.webp` | 199,290 bytes |
| `https://glossbossautomotive.online/` | Automotive detailing homepage and service section | `screen-glossboss.webp`, `screen-glossboss-detail.webp` | 162,578 bytes |

All new files live in `outputs/kirat-portfolio/public/assets/images/`.

The first TripMitra attempt captured its loader; the next captured its launch popup. These were not used. The final capture waited for the real page and dismissed the popup through its visible “Explore the website” control. The Harvester Parts language prompt was dismissed by selecting English. These actions were local navigation preferences. No booking, purchase, enquiry, generated trip, login or other remote write was performed.

`src/data/projects.js` now uses these real screens as covers for TripMitra, Harvester Parts and Gloss Boss, and a second screen in each case-study gallery. The descriptions and factual project claims were preserved. Image captions identify the media as public interface captures from September 2026.

## Preservation and boundaries

- Existing AI concept covers remain in the assets directory and preserved source/legacy archive; they were not deleted.
- VEYRATH and gaane.gpt still use the supplied concept artwork with explicit concept labels. No genuine project screenshot was supplied for these projects and no new artwork was fabricated.
- QORTRA remains unchanged by this task. No private QORTRA instance was started, and no credentials or sensitive information were read or copied.
- Public screenshot metrics, sample-trip values and public business contact details are pixels from the real websites. They are not copied into portfolio outcome claims.
- Read-only URL checks and screenshots verify the public pages loaded at capture time. They do not verify underlying payments, databases, delivery, analytics or authenticated product workflows.
- The 3 original videos total 7,237,643 bytes. They should remain `preload="none"` or equivalent until visitors choose playback; the posters let the film chapter render without downloading all videos.

## Reproducibility

- `work/capture-evidence.mjs`: local range-capable video server on port 8766, video metadata and sampled frames, preliminary project capture.
- `work/capture-project-screens.mjs`: final public website captures after visible initial overlays.
- `work/optimize-evidence.mjs`: WebP video posters.
- `work/optimize-project-screens.mjs`: WebP interface screenshots.
- `work/evidence/evidence.json` and `site-detail-evidence.json`: capture date, response status, page titles and public navigation evidence.
- Contact sheets are retained under `work/evidence/` as internal QA evidence.

The helper scripts use the already available Playwright and bundled sharp runtime. No new project dependency was installed for this media task.
