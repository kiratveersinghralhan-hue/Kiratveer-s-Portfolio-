# Kiratveer Studio Admin Guide

Open `admin.html` from the same domain as the portfolio.

## What the dashboard can do

- Add, edit, remove and reorder portfolio projects.
- Upload a project cover image under 1.5 MB, or use an image URL.
- Add and edit Instagram pages, brands and other references.
- Change the public announcement offer.
- Review local page views, sessions, CTA activity and project-link clicks.
- Export or import a JSON content backup.

## Important: local CMS mode

This version stores edits and analytics in the current browser's `localStorage`. It is ideal for previewing and maintaining a local copy, but it is not a secure shared database:

- Changes appear on the public portfolio in the same browser and domain.
- Changes do not automatically sync to other devices or every website visitor.
- Browser data can be cleared, so export a JSON backup after important edits.
- The admin page is marked `noindex`, but it is not password-secured.

For a production admin that publishes to every visitor, connect the same content structure in `site-data.js` to Firebase or Supabase and add real authentication.

## Files to upload

Upload the complete folder, including:

- `index.html`, `styles.css`, `app.js`, `site-data.js`
- `admin.html`, `admin.css`, `admin.js`
- `thanks.html`, `logo-premium.png`, `logo-premium-display.webp`, `preview.jpg`
- all `project-*.webp` optimized portfolio covers and `project-*.png` fallback/source covers
- all `.mp4` files

Keep the same filenames and folder structure so videos and project visuals continue to load.
