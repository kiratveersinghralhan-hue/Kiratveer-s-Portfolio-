import { chromium } from 'playwright';
import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { projects, motionWorks } from '../src/data/projects.js';
import { site, whatsappUrl } from '../src/data/site.js';
import { currencies, packages, formatPrice } from '../src/data/pricing.js';

const baseURL = process.env.TEST_BASE_URL || 'http://127.0.0.1:5173';
const output = resolve(import.meta.dirname, '..', 'test-results');
await mkdir(output, { recursive: true });
const viewports = [[320,568],[360,800],[375,812],[390,844],[393,873],[412,915],[430,932],[768,1024],[820,1180],[834,1194],[1024,768],[1280,720],[1280,800],[1366,768],[1440,900],[1536,864],[1920,1080],[2560,1440]];
const representative = new Set(['390x844','430x932','768x1024','1366x768','1440x900','1920x1080']);
const results = [];
const browserErrors = [];
let browser;
async function check(name, action) {
  const started = Date.now();
  try { const details = await action(); results.push({ name, passed: true, milliseconds: Date.now() - started, details }); console.log(`PASS ${name}`); }
  catch (error) { results.push({ name, passed: false, milliseconds: Date.now() - started, error: error.message }); console.error(`FAIL ${name}: ${error.message}`); }
}
async function context(options = {}) {
  const result = await browser.newContext({ baseURL, viewport: { width: 1440, height: 900 }, ...options });
  // Fail closed: every Formspree request is intercepted, including accidental submissions.
  await result.route('https://formspree.io/**', route => route.fulfill({ status: 503, contentType: 'application/json', body: '{"errors":[{"message":"Browser QA blocks live submissions"}]}' }));
  result.on('page', page => page.on('pageerror', error => browserErrors.push({ url: page.url(), message: error.message })));
  return result;
}
async function open(page, path = '/') {
  const response = await page.goto(path, { waitUntil: 'networkidle' });
  assert(response?.ok(), `${path} returned ${response?.status()}`);
  const skip = page.locator('.entry-sequence.play-entry button');
  if (await skip.count() && await skip.isVisible()) await skip.click();
  await page.waitForTimeout(350);
}
async function overflow(page) {
  const measurements = await page.evaluate(() => ({ viewport: innerWidth, width: document.documentElement.scrollWidth, body: document.body.scrollWidth }));
  assert(measurements.width <= measurements.viewport + 1, `Document overflows: ${JSON.stringify(measurements)}`);
}
async function settledScroll(page, selector) {
  await page.locator(selector).scrollIntoViewIfNeeded();
  await page.waitForTimeout(220);
  await overflow(page);
}
try {
  browser = await chromium.launch({ channel: process.env.PLAYWRIGHT_CHANNEL || 'chrome', headless: true });
  await check('Fresh-session intro remains visible, completes cleanly and plays once', async () => {
    const ctx = await context();
    try {
      const page = await ctx.newPage();
      await page.goto('/?intro=replay', { waitUntil: 'domcontentloaded' });
      await page.waitForSelector('.entry-sequence.play-entry', { state: 'visible' });
      const started = Date.now();
      await page.waitForTimeout(1200);
      assert(await page.locator('.entry-sequence').isVisible(), 'Intro disappears before its identity sequence resolves');
      await page.locator('.entry-sequence').waitFor({ state: 'detached', timeout: 2200 });
      const elapsed = Date.now() - started;
      assert(elapsed >= 2200 && elapsed <= 2900, `Intro duration ${elapsed}ms is outside the 2.3–2.8 second target tolerance`);
      await page.evaluate(() => sessionStorage.removeItem('kirat-entry-seen'));
      await page.reload({ waitUntil: 'domcontentloaded' });
      assert(await page.locator('.entry-sequence.play-entry').isVisible());
      await page.locator('.entry-sequence button').click();
      await page.goto('/', { waitUntil: 'networkidle' });
      assert.equal(await page.locator('.entry-sequence').count(), 0);
      return { elapsed, replayQuery: '?intro=replay', sessionKey: 'kirat-entry-seen' };
    } finally { await ctx.close(); }
  });
  for (const [width, height] of viewports) {
    const size = `${width}x${height}`;
    await check(`Responsive ${size}`, async () => {
      const ctx = await context({ viewport: { width, height }, isMobile: width < 768, hasTouch: width < 1024 });
      try {
        const page = await ctx.newPage();
        await open(page);
        assert.equal(await page.locator('h1').count(), 1);
        await overflow(page);
        assert(await page.locator('.hero-actions a').first().isVisible());
        const heading = await page.locator('h1').boundingBox();
        assert(heading.x >= -1 && heading.x + heading.width <= width + 1, 'Hero heading clips horizontally');
        if (representative.has(size)) await page.screenshot({ path: resolve(output, `hero-${size}.png`) });
        for (const selector of ['#book-scene', '#project-qortra', '#motion', '#pricing', '#contact']) {
          await settledScroll(page, selector);
          if (representative.has(size) && (selector === '#book-scene' || selector === '#pricing')) {
            await page.screenshot({ path: resolve(output, `${selector.slice(1)}-${size}.png`) });
          }
        }
        if (width < 768) assert.equal(await page.locator('#book-scene').getAttribute('data-book-mode'), 'magazine');
        if (width >= 1024) {
          await page.waitForFunction(() => document.querySelector('#book-scene')?.dataset.bookMode === '3d');
          assert(await page.locator('#book-scene canvas').isVisible());
          assert.equal(await page.locator('#book-scene').getAttribute('data-book-diagnostic'), 'active');
        }
        return { width, height, bookMode: await page.locator('#book-scene').getAttribute('data-book-mode') };
      } finally { await ctx.close(); }
    });
  }
  await check('Mobile menu, focus, Escape, navigation and orientation change', async () => {
    const ctx = await context({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
    try {
      const page = await ctx.newPage(); await open(page);
      await page.locator('.menu-toggle').click();
      assert.equal(await page.locator('.menu-toggle').getAttribute('aria-expanded'), 'true');
      assert(await page.locator('#mobile-menu').isVisible());
      await page.keyboard.press('Escape');
      assert.equal(await page.locator('.menu-toggle').getAttribute('aria-expanded'), 'false');
      assert.equal(await page.locator('#mobile-menu').isVisible(), false);
      await page.locator('.menu-toggle').click();
      await page.locator('#mobile-menu nav a[href="/#pricing"]').click();
      await page.waitForURL('**/#pricing');
      assert.equal(await page.locator('#mobile-menu').isVisible(), false);
      await page.locator('.menu-toggle').click();
      await page.setViewportSize({ width: 844, height: 390 });
      await page.waitForTimeout(200);
      assert.equal(await page.locator('#mobile-menu').isVisible(), false);
      await overflow(page);
      assert.equal(await page.locator('.cursor-label').evaluate(node => getComputedStyle(node).display), 'none');
    } finally { await ctx.close(); }
  });
  await check('All 12 currencies, package prices, enquiry budgets and stored selection', async () => {
    const ctx = await context();
    try {
      const page = await ctx.newPage(); await open(page);
      assert.equal(await page.locator('#currency-select option').count(), 12);
      for (const currency of currencies) {
        await page.locator('#currency-select').selectOption(currency.code);
        for (const item of packages) assert.equal(await page.locator(`[data-price="${item.price}"]`).first().textContent(), formatPrice(item.price, currency.code));
        if (currency.code !== 'INR') assert.match(await page.locator('#currency-note').textContent(), /buffer.*Static reference rates/s);
      }
      await page.reload({ waitUntil: 'networkidle' });
      assert.equal(await page.locator('#currency-select').inputValue(), currencies.at(-1).code);
      await page.evaluate(() => localStorage.setItem('kirat-pricing-currency', 'INVALID'));
      await page.reload({ waitUntil: 'networkidle' });
      assert.equal(await page.locator('#currency-select').inputValue(), 'INR');

      await open(page, '/start-project/');
      assert.equal(await page.locator('#currency-select option').count(), 12);
      await page.locator('[name="budget"][value="30k-60k"]').evaluate(input => {
        input.checked = true;
        input.dispatchEvent(new Event('change', { bubbles: true }));
      });
      for (const currency of currencies) {
        await page.locator('#currency-select').evaluate((select, code) => {
          select.value = code;
          select.dispatchEvent(new Event('change', { bubbles: true }));
        }, currency.code);
        assert.equal(await page.locator('[name="billing_currency"]').inputValue(), currency.code);
        assert.equal(await page.locator('[name="budget"]:checked').inputValue(), '30k-60k');
        const budgetLabel = await page.locator('[name="budget"][value="30k-60k"] + span').textContent();
        assert.equal(budgetLabel, currency.code === 'INR' ? '₹30k–₹60k' : `Approx. ${formatPrice(30000, currency.code)}–${formatPrice(60000, currency.code)}`);
      }
      return { currencies: currencies.map(currency => currency.code), rateMode: 'Static table; no FX request required' };
    } finally { await ctx.close(); }
  });
  await check('Project enquiry route validates the first step without a live submission', async () => {
    const ctx = await context();
    const requests = [];
    await ctx.route('https://formspree.io/**', async route => {
      requests.push(route.request().url());
      await route.fulfill({ status: 503, contentType: 'application/json', body: '{"errors":[{"message":"Browser QA blocks live submissions"}]}' });
    });
    try {
      const page = await ctx.newPage(); await open(page, '/start-project/');
      assert.equal(await page.locator('#project-enquiry').getAttribute('action'), site.formEndpoint);
      assert.equal(await page.locator('#project-enquiry').getAttribute('method'), 'POST');
      await page.locator('[data-flow-next]').click();
      assert.equal(requests.length, 0, 'Invalid form must not submit');
      await page.locator('[name="name"]').fill('Local QA Test');
      await page.locator('[name="business"]').fill('Local QA only');
      await page.locator('[data-flow-next]').click();
      assert.equal(await page.locator('[data-flow-count]').textContent(), '02 / 08');
      assert.equal(requests.length, 0);
      return { interceptedRequests: requests.length, fullSubmissionCoveredBy: 'project-flow-browser.mjs' };
    } finally { await ctx.close(); }
  });
  await check('Real video sources, muted user-triggered playback and pause on leaving scene', async () => {
    const ctx = await context();
    try {
      const page = await ctx.newPage(); await open(page);
      assert.equal(await page.locator('.film video').count(), motionWorks.length);
      const videos = await page.locator('.film video').evaluateAll(nodes => nodes.map(video => ({ muted: video.muted, autoplay: video.autoplay, preload: video.preload, src: video.querySelector('source').getAttribute('src') })));
      assert(videos.every(video => video.muted && !video.autoplay && video.preload === 'none'));
      assert.deepEqual(videos.map(video => video.src), motionWorks.map(video => video.src));
      const first = page.locator('.film').first();
      await first.locator('.film-play').click();
      await page.waitForFunction(() => { const video = document.querySelector('.film video'); return !video.paused && video.currentTime > 0; }, null, { timeout: 20000 });
      await first.locator('.film-play').click();
      assert(await first.locator('video').evaluate(video => video.paused));
      await first.locator('.film-play').click();
      await settledScroll(page, '#pricing');
      assert(await first.locator('video').evaluate(video => video.paused));
    } finally { await ctx.close(); }
  });
  await check('Six case-study URLs, browser back, genuine contact and social destinations', async () => {
    const ctx = await context();
    try {
      const page = await ctx.newPage(); await open(page);
      for (const project of projects) {
        await page.locator(`#project-archive a[href="/work/${project.slug}.html"]`).click();
        await page.waitForURL(`**/work/${project.slug}.html`);
        assert.equal(await page.locator('h1').textContent(), project.title);
        assert.equal(await page.locator('h1').count(), 1);
        await overflow(page);
        await page.goBack({ waitUntil: 'networkidle' });
      }
      const links = await page.locator('a').evaluateAll(nodes => nodes.map(node => node.getAttribute('href')));
      assert(links.includes(whatsappUrl));
      assert(links.includes(`mailto:${site.email}`));
      for (const social of site.socials) assert(links.includes(social.url));
      assert.match(whatsappUrl, /^https:\/\/wa\.me\/\d{10,15}\?text=/);
      assert(new URL(whatsappUrl).searchParams.get('text').includes('Hi Kirat'));
      return { caseStudies: projects.length, contactURLsChecked: true };
    } finally { await ctx.close(); }
  });
  await check('No-JavaScript content, native contact form and accessible project links', async () => {
    const ctx = await context({ javaScriptEnabled: false });
    try {
      const page = await ctx.newPage(); await open(page);
      assert.equal(await page.locator('h1').count(), 1);
      assert.equal(await page.locator('.project-world').count(), projects.filter(project => project.featured).length);
      assert(await page.locator('.book-fallback').isVisible());
      assert.equal(await page.locator('.entry-sequence').isVisible(), false);
      assert.equal(await page.locator('.film-play').first().isVisible(), false);
      await open(page, '/start-project/');
      assert.equal(await page.locator('#project-enquiry').getAttribute('action'), site.formEndpoint);
      assert.equal(await page.locator('#project-enquiry').getAttribute('method'), 'POST');
      assert.equal(await page.locator('#currency-select').isDisabled(), true);
      await overflow(page);
    } finally { await ctx.close(); }
  });
  await check('Reduced-motion complete content and magazine fallback', async () => {
    const ctx = await context({ reducedMotion: 'reduce' });
    try {
      const page = await ctx.newPage(); await open(page);
      await settledScroll(page, '#book-scene');
      assert.equal(await page.locator('#book-scene').getAttribute('data-book-mode'), 'magazine');
      assert(await page.locator('.book-fallback').isVisible());
      assert.equal(await page.locator('.book-stage canvas').count(), 0);
      assert.equal(await page.locator('.entry-sequence').isVisible(), false);
      await page.screenshot({ path: resolve(output, 'reduced-motion-book.png') });
    } finally { await ctx.close(); }
  });
  await check('Touch-capable Windows-sized desktop still receives the real 3D book', async () => {
    const ctx = await context({ viewport: { width: 1366, height: 768 }, screen: { width: 1366, height: 768 }, hasTouch: true });
    try {
      const page = await ctx.newPage(); await open(page);
      await page.waitForFunction(() => document.querySelector('#book-scene')?.dataset.bookMode === '3d');
      assert(await page.locator('#book-scene canvas').isVisible());
      assert.equal(await page.locator('#book-scene').getAttribute('data-book-diagnostic'), 'active');
    } finally { await ctx.close(); }
  });
  await check('WebGL unavailable and image failure preserve the magazine and project story', async () => {
    const ctx = await context();
    await ctx.route('**/assets/images/qortra-system.svg', route => route.abort());
    await ctx.addInitScript(() => {
      const original = HTMLCanvasElement.prototype.getContext;
      HTMLCanvasElement.prototype.getContext = function(type, ...args) { return /webgl/i.test(type) ? null : original.call(this, type, ...args); };
    });
    try {
      const page = await ctx.newPage(); await open(page);
      await settledScroll(page, '#book-scene');
      await page.waitForTimeout(300);
      assert.equal(await page.locator('#book-scene').getAttribute('data-book-mode'), 'magazine');
      assert(await page.locator('.book-fallback').isVisible());
      assert.equal(await page.locator('.book-stage canvas').count(), 0);
      assert.equal(await page.locator('#project-qortra h2').textContent(), 'QORTRA');
      await page.screenshot({ path: resolve(output, 'webgl-unavailable-book.png') });
    } finally { await ctx.close(); }
  });
  await check('Browser-local admin additions use real external links, never invented case-study routes', async () => {
    const ctx = await context();
    await ctx.addInitScript(() => { if (location.protocol === 'about:') return; localStorage.setItem('kiratveerStudioContentV5', JSON.stringify({ version: 6, projects: [{ id: 'local-qa-project', title: 'Local QA project', description: 'Private browser test record', category: 'QA', status: 'Draft', url: 'https://example.com/verified-project', tags: [] }], references: [], offer: 'QA local offer' })); });
    try {
      const page = await ctx.newPage(); await open(page);
      const archive = page.locator('#project-archive a');
      assert.equal(await archive.count(), 1);
      assert.equal(await archive.getAttribute('href'), 'https://example.com/verified-project');
      assert.equal(await page.locator('a[href="/work/local-qa-project.html"]').count(), 0);
      assert.equal(await page.locator('[data-offer]').textContent(), 'QA local offer');
      assert(await page.locator('#book-scene').isVisible());
      await overflow(page);
    } finally { await ctx.close(); }
  });
  await check('No uncaught browser page errors', async () => assert.deepEqual(browserErrors, []));
} finally {
  await browser?.close();
  await writeFile(resolve(output, 'browser-results.json'), JSON.stringify({ testedAt: new Date().toISOString(), baseURL, results, browserErrors }, null, 2));
}
const failed = results.filter(result => !result.passed);
console.log(`${results.length - failed.length}/${results.length} browser checks passed. Artifacts: ${output}`);
if (failed.length) process.exitCode = 1;
