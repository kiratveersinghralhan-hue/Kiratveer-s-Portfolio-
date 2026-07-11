# QA Notes — Auto Gold Mobile Repair Pass

Tested locally on July 11, 2026.

## Fixed in this pass

- Reworked the intro direction to black/gold with gold orbit, sweep, logo glow and progress line.
- Reworked the intro letter reveal so the Kiratveer letters animate one-by-one before the curtain exit.
- Fixed mobile project cards so cover images render at full opacity and fixed phone width.
- Changed mobile selected-work layout to stacked cards, so TripMitra, Harvester Parts, gaane.gpt and Gloss Boss covers are directly visible while scrolling instead of hidden behind a swipe carousel.
- Fixed mobile reference/project cover visibility so cards no longer depend on a subtle fade before looking complete.
- Fixed mobile video card alignment by forcing every video card to the same phone-width flex basis.
- Restored old-site-style muted autoplay for all showreel videos on mobile.
- Moved the mobile video pause/play button to the top-right corner so it does not block the video.
- Disabled automatic carousel movement on mobile so cards do not slide away while users are reading or playing media.
- Replaced the source videos with compressed, valid MP4s for faster mobile loading and GitHub-safe upload.
- Optimized the generated logo/project artwork into lightweight WebP display assets while keeping PNG fallbacks.
- Updated public and admin cache-busting to `20260711-autogold`.
- Bumped local CMS storage to `kiratveerStudioContentV5` so old cached admin content does not override the repaired media defaults.
- Added image preloading and fallback recovery so broken or old image paths fall back to bundled artwork.
- Removed lazy-loading from carousel artwork so project/reference slides do not appear blank while swiping.
- Made showreel videos native-playable with controls, `autoplay`, `muted`, `playsinline` and compressed MP4 files.
- Added loading/ready/error states for image and video cards.
- Made the top logo visible with a small optimized display asset.
- Upgraded the intro with a visible logo mark, glow sweep, progress line and stronger premium motion.
- Rebuilt the thank-you page with animated logo, orbit, beam, status chips and smoother CTAs.
- Added horizontal overflow containment for mobile pages and decorative thanks-page layers.

## Verified

- Desktop live audit: 16/16 images loaded, no missing images and no console errors.
- Mobile intro at 390 px: black/gold intro reaches ready state, logo loads and letters reveal one-by-one.
- Mobile project cards: 5/5 cover images complete, stacked vertically, full-width and visible at opacity `1`.
- Mobile video cards: 3/3 cards aligned at the same width and autoplaying with `Pause` controls visible.
- Mobile intro at 390 px: intro reaches ready state, logo loads, page is locked during intro, then unlocks after exit.
- Mobile main page: no actual horizontal scrolling, logo visible, no missing images, project counter shows `05`.
- Mobile video section: carousel remains swipeable and videos autoplay like the older site.
- Thank-you page: logo loads, animated status chips/buttons render and `scrollX` remains `0` after overflow fix.
- Theme toggle switches to dark mode and keeps the logo/video/media state intact.
- Admin loads the optimized logo, five projects, six references and the reference cover-image field.
- JavaScript syntax checks pass for `app.js`, `admin.js` and `site-data.js`.

## Manual checks after deployment

- Upload the entire folder, including the new `.webp` files, the PNG fallback files and all `.mp4` videos.
- Submit one real enquiry to confirm the existing Formspree endpoint delivers to the intended inbox.
- Connect Firebase or Supabase before expecting admin edits or analytics to sync across devices and visitors.
- Recheck external project and Instagram URLs from the final production domain.
