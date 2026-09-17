import { chromium } from 'playwright';
import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { currencies, formatPrice } from '../src/data/pricing.js';

const baseURL = process.env.TEST_BASE_URL || 'http://127.0.0.1:5173';
const output = resolve(import.meta.dirname, '../test-results/project-flow');
await mkdir(output, { recursive: true });
const browser = await chromium.launch({ channel: 'chrome', headless: true });
const results = [];
const errors = [];
let calls = 0;
let mode = 'fail';
const context = await browser.newContext({ baseURL, viewport: { width: 1440, height: 900 } });
await context.route('https://formspree.io/**', async route => {
  calls += 1;
  if (mode === 'success') await new Promise(resolve => setTimeout(resolve, 200));
  await route.fulfill({ status: mode === 'success' ? 200 : 500, contentType: 'application/json', body: mode === 'success' ? '{"ok":true}' : '{"errors":[{"message":"QA intercepted failure"}]}' });
});
const page = await context.newPage();
page.on('pageerror', error => errors.push(error.message));
async function check(name, run) { await run(); results.push({ name, passed: true }); console.log(`PASS ${name}`); }
const next = () => page.locator('[data-flow-next]').click();
const visibleStep = async index => assert.equal(await page.locator(`[data-flow-step="${index}"]`).isVisible(), true);
const shot = async name => page.screenshot({ path: `${output}/${name}.png` });
async function overflow() { assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), 'Horizontal overflow'); }

try {
  await page.goto('/start-project/', { waitUntil: 'networkidle' });
  await page.waitForSelector('#project-enquiry.is-enhanced');
  await check('desktop initial visual and required name', async () => {
    await shot('initial-1440'); await overflow(); await next();
    assert.match(await page.locator('[data-flow-step="0"] [data-step-error]').innerText(), /name|fill/i);
    await visibleStep(0);
    await page.locator('[name="name"]').fill('Alex Example');
    await page.locator('[name="business"]').fill('Example studio');
    await page.locator('[name="location"]').fill('London / Europe/London'); await next();
  });
  await check('service validation, multiple choices and previous preservation', async () => {
    await next(); await visibleStep(1);
    assert.match(await page.locator('[data-flow-step="1"] [data-step-error]').innerText(), /at least one/);
    await page.locator('.flow-choice').filter({ has: page.locator('[name="services"][value="AI product / MVP"]') }).click();
    await page.locator('.flow-choice').filter({ has: page.locator('[name="services"][value="Automation"]') }).click();
    await page.locator('[data-flow-prev]').click(); await visibleStep(0);
    assert.equal(await page.locator('[name="name"]').inputValue(), 'Alex Example');
    await next(); assert.equal(await page.locator('[name="services"]:checked').count(), 2); await next();
  });
  await check('business context and optional URL validation', async () => {
    await page.locator('[name="website"]').fill('invalid'); await next(); await visibleStep(2);
    await page.locator('[name="website"]').fill('https://example.com');
    await page.locator('[name="business_context"]').fill('A small service business preparing a useful internal product.'); await next();
  });
  await check('all twelve currencies keep budget math and selection', async () => {
    await page.locator('.flow-choice').filter({ has: page.locator('[name="budget"][value="1l-2.5l"]') }).click();
    for (const currency of currencies) {
      await page.locator('#currency-select').selectOption(currency.code);
      const label = await page.locator('[name="budget"][value="1l-2.5l"] + span').innerText();
      assert.equal(label, currency.code === 'INR' ? '₹1L–₹2.5L' : `Approx. ${formatPrice(100000, currency.code)}–${formatPrice(250000, currency.code)}`);
      assert.equal(await page.locator('[name="budget"]:checked').inputValue(), '1l-2.5l');
    }
    await page.locator('#currency-select').selectOption('USD');
    await page.setViewportSize({ width: 390, height: 844 });
    await page.locator('#flow-title-3').scrollIntoViewIfNeeded(); await shot('investment-390'); await overflow(); await next();
  });
  await check('timeline, outcome and preferred contact validate', async () => {
    await next(); await visibleStep(4);
    await page.locator('.flow-choice').filter({ has: page.locator('[name="timeline"][value="Flexible"]') }).click(); await next();
    await page.locator('[name="message"]').fill('short'); await next(); await visibleStep(5);
    await page.locator('[name="message"]').fill('We want an AI-assisted workflow that helps our team make better use of its business knowledge.');
    await page.locator('[name="references"]').fill('https://example.com/reference'); await next();
    await page.locator('[name="email"]').fill('alex@example.com');
    await page.locator('.flow-choice').filter({ has: page.locator('[name="preferred_contact"][value="whatsapp"]') }).click();
    await next(); await visibleStep(6);
    assert.match(await page.locator('[data-flow-step="6"] [data-step-error]').innerText(), /WhatsApp number/);
    await page.locator('[name="phone"]').fill('+44 7700 900123');
    await page.locator('.flow-call summary').click();
    await page.locator('[name="preferred_call_time"]').fill('2026-10-01T14:00'); await next(); await visibleStep(6);
    await page.locator('[name="call_timezone"]').fill('Europe/London');
    await page.locator('#flow-title-6').scrollIntoViewIfNeeded(); await shot('contact-390'); await overflow(); await next();
  });
  await check('review edit and no clipping at 320, 390, 768 and 1440', async () => {
    await visibleStep(7);
    assert.match(await page.locator('[data-flow-review]').innerText(), /Alex Example|AI product/);
    await page.locator('[data-edit-step="0"]').click(); await visibleStep(0);
    await page.locator('[name="name"]').fill('Alexandra Example');
    await page.locator('[data-flow-jump="7"]').click();
    assert.match(await page.locator('[data-flow-review]').innerText(), /Alexandra Example/);
    for (const [width, height] of [[320,568],[390,844],[768,1024],[1440,900]]) {
      await page.setViewportSize({ width, height }); await page.locator('#flow-title-7').scrollIntoViewIfNeeded(); await overflow(); await shot(`review-${width}`);
    }
  });
  await check('mocked failure retains every answer and stays on enquiry', async () => {
    await page.locator('.flow-submit').click();
    await page.waitForFunction(() => document.querySelector('#flow-status').textContent.includes('Delivery could not'));
    assert.equal(calls, 1); assert.match(page.url(), /start-project/);
    assert.equal(await page.locator('[name="name"]').inputValue(), 'Alexandra Example');
    assert.equal(await page.locator('.flow-submit').isEnabled(), true);
    await shot('failure-1440');
  });
  await check('mocked success prevents duplicates and opens personalized confirmation', async () => {
    mode = 'success';
    await page.locator('.flow-submit').evaluate(button => { button.click(); button.click(); });
    await page.waitForURL('**/thank-you/**');
    assert.equal(calls, 2);
    await page.waitForSelector('.flow-confirmation.is-received');
    assert.match(await page.locator('[data-confirmation-title]').innerText(), /Project\s+received/);
    assert.match(await page.locator('[data-confirmation-message]').innerText(), /Alexandra.+WhatsApp/);
    await page.evaluate(() => scrollTo(0, 0)); await page.waitForTimeout(1150); await shot('received-1440');
    await page.setViewportSize({ width: 390, height: 844 }); await shot('received-390'); await overflow();
    const work = page.getByRole('link', { name: /Return to selected work/ }); assert.equal(await work.getAttribute('href'), '/#work');
  });
  await check('direct thank-you visit does not fabricate a submission', async () => {
    await page.evaluate(() => sessionStorage.removeItem('kirat-project-received'));
    await page.goto('/thank-you/?name=Unverified&contact=whatsapp', { waitUntil: 'networkidle' });
    assert.equal(await page.locator('.flow-confirmation.is-received').count(), 0);
    assert.match(await page.locator('[data-confirmation-title]').innerText(), /The next/);
  });
  await check('reduced motion and JavaScript-disabled fallback remain usable', async () => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/start-project/?service=Commerce', { waitUntil: 'networkidle' });
    assert.equal(await page.locator('[name="services"][value="E-commerce"]').isChecked(), true);
    await page.locator('[name="name"]').fill('Jordan'); await next();
    assert.equal(await page.locator('[data-flow-step="1"]').evaluate(element => element.getAnimations().length), 0);
    const nojs = await browser.newContext({ baseURL, javaScriptEnabled: false, viewport: { width: 390, height: 844 } });
    await nojs.route('https://formspree.io/**', route => route.abort());
    const fallback = await nojs.newPage(); await fallback.goto('/start-project/');
    assert.equal(await fallback.locator('[data-flow-step]:visible').count(), 8);
    assert.equal(await fallback.locator('.flow-submit').isVisible(), true);
    assert.equal(await fallback.locator('#currency-select').isDisabled(), true);
    await nojs.close();
  });
  assert.deepEqual(errors, []);
} catch (error) {
  results.push({ name: 'flow run', passed: false, error: error.message });
  await shot('failure-state');
  console.error(error); process.exitCode = 1;
} finally {
  await writeFile(`${output}/results.json`, JSON.stringify({ results, errors, interceptedRequests: calls }, null, 2));
  await context.close(); await browser.close();
}
