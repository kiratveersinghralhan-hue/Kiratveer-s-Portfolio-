# Kiratveer Portfolio — Cinematic Redesign

## What changed
- Rebuilt the public portfolio into a cinematic, scroll-directed experience.
- Added a desktop WebGL/Three.js 3D environment with camera travel, particles, rings, objects and project textures.
- Added CSS 3D/perspective project transitions so the experience still feels dimensional if WebGL is unavailable.
- Added performance-safe mobile and reduced-motion fallbacks.
- Repositioned the site around **AI-powered websites, digital products, launch visuals and growth systems**.
- Rewrote the hero, proof, services, process, about and contact copy for client conversion.
- Kept the real project data in `site-data.js` and preserved the existing admin/localStorage content system.
- Kept the existing Formspree enquiry endpoint and WhatsApp/email/Instagram contact routes.
- Removed the public admin link from the customer-facing footer.
- Added a matching redesigned thank-you page.

## New pricing strategy
The public starting prices are intentionally positioned as accessible-premium/client-acquisition pricing:
- Landing Sprint — ₹6,999
- Business Core — ₹12,999
- Growth Engine — ₹19,999
- Commerce Launch — ₹29,999+
- AI / Product MVP — ₹49,999+

These are starting prices. Keep final quotes scope-based and charge separately for paid hosting, apps/APIs, subscriptions, large content/catalogue entry and other third-party costs.

## 3D implementation
The desktop experience loads Three.js 0.186.0 from jsDelivr at runtime. The rest of the website does not depend on the 3D library: if it fails to load, the CSS cinematic fallback remains usable.

For a completely self-hosted build later, download `three.module.js` and change the dynamic import in `app.js` to the local file.

## Deployment
This remains a static website — no build command is required. Deploy the folder to the same static host/GitHub Pages setup as the previous site.

## Preserved original
The previous `index.html`, `styles.css`, `app.js` and `thanks.html` are backed up under `legacy-original/` so the prior front-end is not lost.

## Before going live
1. Preview on desktop and mobile.
2. Confirm Formspree still accepts submissions from the production domain.
3. Check every live project URL.
4. Replace or add stronger project visuals whenever new work is available.
5. Add real client testimonials/results only when you have permission and verifiable wording/metrics.
