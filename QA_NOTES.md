# QA Notes — Premium Wow Repair Pass

Tested locally on July 11, 2026.

## Fixed in this pass

- Optimized the generated logo/project artwork into lightweight WebP display assets while keeping PNG fallbacks.
- Updated public and admin cache-busting to `20260711-wow`.
- Bumped local CMS storage to `kiratveerStudioContentV3` so old cached admin content does not override the repaired media defaults.
- Added image preloading and fallback recovery so broken or old image paths fall back to bundled artwork.
- Removed lazy-loading from carousel artwork so project/reference slides do not appear blank while swiping.
- Made all showreel videos native-playable with controls, `autoplay`, `muted`, `playsinline`, `preload="auto"` and JS viewport play/pause support.
- Added loading/ready/error states for image and video cards.
- Made the top logo visible with a small optimized display asset.
- Upgraded the intro with a visible logo mark, glow sweep, progress line and stronger premium motion.
- Rebuilt the thank-you page with animated logo, orbit, beam, status chips and smoother CTAs.
- Added horizontal overflow containment for mobile pages and decorative thanks-page layers.

## Verified

- Desktop live audit: 16/16 images loaded, no missing images and no console errors.
- Desktop videos: 3/3 showreel videos loaded, autoplayed, stayed muted, exposed controls and had no media errors.
- Mobile intro at 390 px: intro reaches ready state, logo loads, page is locked during intro, then unlocks after exit.
- Mobile main page: no actual horizontal scrolling, logo visible, no missing images, project counter shows `05`.
- Mobile video section: carousel remains swipeable and the first visible video plays with native controls.
- Thank-you page: logo loads, animated status chips/buttons render and `scrollX` remains `0` after overflow fix.
- Theme toggle switches to dark mode and keeps the logo/video/media state intact.
- Admin loads the optimized logo, five projects, six references and the reference cover-image field.
- JavaScript syntax checks pass for `app.js`, `admin.js` and `site-data.js`.

## Manual checks after deployment

- Upload the entire folder, including the new `.webp` files, the PNG fallback files and all `.mp4` videos.
- Submit one real enquiry to confirm the existing Formspree endpoint delivers to the intended inbox.
- Connect Firebase or Supabase before expecting admin edits or analytics to sync across devices and visitors.
- Recheck external project and Instagram URLs from the final production domain.
