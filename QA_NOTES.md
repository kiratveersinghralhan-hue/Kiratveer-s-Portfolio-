# QA Notes — Premium Correction Pass

Tested locally on July 4, 2026.

## Fixed from the previous build

- Replaced the desktop-only link navbar with a VEYRATH-style glass header and right-side navigation drawer on every screen size.
- Added an explicit close control inside the drawer so it is never trapped behind the overlay.
- Rebuilt the intro using the VEYRATH orbit, letter reveal and curtain-exit pattern. The intro removes itself after exit and has a fallback release timer.
- Added persistent Light and Dark themes. Light uses white, beige and brown; Dark uses black, teal and red.
- Replaced transformed carousel rails with native scroll-snap carousels to avoid black rendering blocks and improve touch swiping.
- Added stronger staged hero animation, directional section reveals, card hover motion, video motion and automatic carousel progression.
- Replaced abstract initials in the hero and About section with a generated logo and an understandable project showcase.
- Added generated covers for VEYRATH, TripMitra, Harvester Parts, gaane.gpt and Gloss Boss.
- Added gaane.gpt to the main project carousel and converted all reference cards to image-backed cards.
- Updated the public email to `kiratveersinghralhan@gmail.com`.
- Updated the local CMS data version and reference editor to support cover images.

## Verified

- Desktop Light and Dark themes render with the intended palettes and theme preference survives reload.
- Mobile layouts checked at 390 px and 360 px without page-level horizontal overflow.
- Mobile/desktop drawer opens, locks the page, fits within the viewport and closes from its own close button.
- Intro reaches its ready state, exits, unlocks page scroll and leaves no overlay blocking interaction.
- Five image-backed project slides render; project counter shows `05` and next/previous controls advance the native carousel.
- Six image-backed reference cards render and lazy-loaded images resolve when the section is reached.
- Hero project showcase and generated logo load on desktop and mobile.
- Admin loads five projects, six references and the reference cover-image field.
- JavaScript syntax checks pass for `app.js`, `admin.js` and `site-data.js`.
- Browser console checked with no JavaScript errors.

## Manual checks after deployment

- Submit one real enquiry to confirm the existing Formspree endpoint delivers to the intended inbox.
- Connect Firebase or Supabase before expecting admin edits or analytics to sync across devices and visitors.
- Recheck external project and Instagram URLs from the final production domain.
