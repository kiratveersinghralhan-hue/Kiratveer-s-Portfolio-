import test from 'node:test';
import assert from 'node:assert/strict';
import { getFlowBudgetLabel, getConfirmation } from '../src/modules/project-flow.js';
import { currencies, formatPrice } from '../src/data/pricing.js';
import { startProject, thankYou } from '../src/components-flow.js';
import { site, whatsappUrl } from '../src/data/site.js';

test('enquiry investment ranges use the existing converter and buffers for every currency', () => {
  const range = { label: '₹1L–₹2.5L', min: 100000, max: 250000 };
  assert.equal(getFlowBudgetLabel(range, 'INR'), range.label);
  for (const currency of currencies.filter(currency => currency.code !== 'INR')) {
    assert.equal(getFlowBudgetLabel(range, currency.code), `Approx. ${formatPrice(100000, currency.code)}–${formatPrice(250000, currency.code)}`);
    assert.equal(getFlowBudgetLabel({ label: 'Below ₹15k', max: 15000 }, currency.code), `Below approx. ${formatPrice(15000, currency.code)}`);
    assert.equal(getFlowBudgetLabel({ label: '₹2.5L+', min: 250000 }, currency.code), `Approx. ${formatPrice(250000, currency.code)}+`);
    assert.equal(getFlowBudgetLabel({ label: 'Not sure yet' }, currency.code), 'Not sure yet');
  }
  assert.equal(getFlowBudgetLabel(range, 'invalid'), range.label);
});

test('confirmation only uses a recent valid success marker and retains a first name', () => {
  const now = 2000000;
  assert.deepEqual(getConfirmation(JSON.stringify({ at: now - 1000, name: 'Alex Example', contact: 'whatsapp' }), now), { name: 'Alex', contact: 'WhatsApp' });
  assert.deepEqual(getConfirmation(JSON.stringify({ at: now, name: 'Alex', contact: 'unknown' }), now), { name: 'Alex', contact: 'email' });
  for (const record of [null, '{}', '{bad}', JSON.stringify({ at: now + 1, name: 'Alex' }), JSON.stringify({ at: 1, name: 'Alex' }), JSON.stringify({ at: now, name: 13 })]) assert.equal(getConfirmation(record, now), null);
});

test('project enquiry preserves real provider, progressive fallback and safe contact details', () => {
  const html = startProject();
  assert.equal((html.match(/data-flow-step="\d"/g) || []).length, 8);
  assert.ok(html.includes(`action="${site.formEndpoint}" method="POST"`));
  assert.ok(html.includes(whatsappUrl));
  assert.match(html, /name="_gotcha" tabindex="-1"/);
  assert.match(html, /name="email" type="email"[^>]*required/);
  assert.match(html, /name="billing_currency" value="INR"/);
  assert.match(html, /A preference, not a reserved appointment/);
  assert.match(html, /<noscript>/);
  assert.equal((html.match(/<h1>/g) || []).length, 1);
});

test('direct confirmation route does not claim an unverified submission', () => {
  const html = thankYou();
  assert.match(html, /data-confirmation-title>The next<br>chapter/);
  assert.doesNotMatch(html, /Your project brief has been sent/);
  assert.ok(html.includes(whatsappUrl));
  assert.equal((html.match(/<h1 /g) || []).length, 1);
});
