# SEO and source-preservation validation

Validated locally on 17 September 2026. This report covers the checks below; the final QA report records browser, build and responsive results separately.

## SEO regression tests

Command: `node --test tests/seo.test.mjs` — **3 tests passed**.

The test runs the real renderer in temporary copies under `work/`, then removes those copies. It does not alter the working site's generated pages or set a production domain.

- A configured test origin generates matching canonical URLs, Open Graph URLs, absolute social-preview URLs and JSON-LD URLs across the homepage, six case studies and thank-you page.
- Each generated page has one H1. Public case studies use `CreativeWork` structured data; identity pages use the supplied person's data and verified social links.
- The sitemap has exactly seven routes: the homepage and six case studies. It excludes the local editor and thank-you page.
- Robots rules exclude `/admin.html` and `/thanks.html`; the thank-you page also has `noindex,follow`. The editor has `noindex,nofollow` in its source.
- Removing `PUBLIC_SITE_URL` and rerunning the renderer deletes any stale sitemap, removes its robots declaration and omits absolute canonical/URL data. An empty/whitespace setting behaves the same way.
- Malformed URLs, unsupported protocols and nested deployment paths fail generation before writing public pages.

No real portfolio domain was supplied. Set the actual HTTPS origin through `PUBLIC_SITE_URL` when making the production build. Until then, omitting canonical data is intentional; preview metadata is present but social image URLs are local paths. Do not publish the test origin used by the regression.

## Preservation checks

SHA-256 comparisons against the extracted supplied archives confirmed:

- **32/32 original portfolio files** match `legacy/original-portfolio/` exactly.
- **6/6 supplied personal photographs** match `legacy/supplied-photographs/` exactly.
- All three public MP4 files match their supplied originals exactly: `main-demo.mp4` (2,275,665 bytes), `gb1.mp4` (3,405,967 bytes), and `manali.mp4` (1,556,011 bytes).

The central project, motion and capability data reference 19 media entries representing 15 distinct files. Every referenced file exists in the public assets directory.

## Contact and project mapping

Compared the new configuration with the original `index.html`, `site-data.js` and `app.js`:

- WhatsApp retains `919814800017`; its encoded prefilled message decodes to the configured message.
- Email retains `kiratveersinghralhan@gmail.com`.
- Personal Instagram retains `https://instagram.com/ralhanx`.
- The music property retains `https://instagram.com/gaane.gpt`.
- TripMitra, Harvester Parts and Gloss Boss retain their supplied project URLs.
- Formspree retains `https://formspree.io/f/xjgadypw`.
- QORTRA and VEYRATH have no invented public URL. GitHub and LinkedIn profiles are omitted because no profile URLs were supplied.

These checks validate provenance, URL construction and local references. They do not claim mailbox ownership, successful delivery, production publication, authenticated product workflows or current external service availability. No enquiry, email, WhatsApp message or other remote write was sent.
