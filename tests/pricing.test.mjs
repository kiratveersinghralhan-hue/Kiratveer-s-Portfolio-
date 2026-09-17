import test from 'node:test';
import assert from 'node:assert/strict';
import {
  addons,
  budgetOptions,
  currencies,
  currencySettings,
  estimatePrice,
  formatPrice,
  getBudgetOptions,
  getCurrency,
  getCurrencyNote,
  packages,
} from '../src/data/pricing.js';

test('five agreed INR starting prices and monthly add-ons remain the source of truth', () => {
  assert.deepEqual(packages.map((item) => item.price), [12999, 24999, 44999, 59999, 79999]);
  assert.deepEqual(addons.map((item) => item.price), [1499, 9999, 7999, 11999, 14999]);
  assert.deepEqual(addons.filter((item) => item.period === 'month').map((item) => item.id), ['care', 'content']);
  assert.equal(packages.filter((item) => item.featured).length, 1);
  assert.deepEqual(packages.filter((item) => item.plus).map((item) => item.id), ['commerce', 'product']);
});

test('all twelve requested currencies have transparent buffers and positive static rates', () => {
  assert.deepEqual(currencies.map((item) => item.code).sort(), ['AED', 'AUD', 'CAD', 'CHF', 'EUR', 'GBP', 'INR', 'JPY', 'NZD', 'SAR', 'SGD', 'USD']);
  assert.equal(currencySettings.rateMode, 'static');
  assert.equal(currencySettings.rateDate, '2026-09-14');
  for (const currency of currencies) {
    assert.ok(currency.rate > 0 && Number.isFinite(currency.rate));
    assert.equal(currency.buffer, currency.code === 'INR' ? 1 : ['AED', 'SAR'].includes(currency.code) ? 1.12 : 1.15);
  }
});

test('conversion uses the documented ECB cross rates and Gulf dollar pegs', () => {
  assert.equal(getCurrency('USD').rate, 1.1551 / 110.3755);
  assert.equal(getCurrency('EUR').rate, 1 / 110.3755);
  assert.equal(getCurrency('AED').rate, (1.1551 / 110.3755) * 3.6725);
  assert.equal(getCurrency('SAR').rate, (1.1551 / 110.3755) * 3.75);
  assert.equal(estimatePrice(12999, 'USD'), 160);
  assert.equal(estimatePrice(12999, 'EUR'), 140);
  assert.equal(estimatePrice(12999, 'GBP'), 120);
  assert.equal(estimatePrice(12999, 'JPY'), 24200);
  assert.equal(estimatePrice(12999, 'INR'), 12999);
});

test('every package/currency estimate rounds upward by less than one chosen increment', () => {
  for (const currency of currencies.filter((item) => item.code !== 'INR')) {
    const step = currency.code === 'JPY' ? 100 : 5;
    for (const item of [...packages, ...addons]) {
      const raw = item.price * currency.rate * currency.buffer;
      const rounded = estimatePrice(item.price, currency.code);
      assert.ok(rounded >= raw, `${currency.code} estimate must cover its raw amount`);
      assert.ok(rounded - raw < step, `${currency.code} must not over-round`);
      assert.equal(rounded % step, 0);
      assert.ok(!formatPrice(item.price, currency.code).includes('NaN'));
    }
  }
});

test('formatted amounts use correct grouping, unique dollar symbols and whole units', () => {
  assert.equal(formatPrice(12999, 'INR'), '₹12,999');
  assert.equal(formatPrice(100000, 'INR'), '₹1,00,000');
  assert.equal(formatPrice(12999, 'USD'), '$160');
  assert.equal(formatPrice(12999, 'EUR'), '€140');
  assert.equal(formatPrice(12999, 'GBP'), '£120');
  for (const [code, symbol] of [['CAD', 'C$'], ['AUD', 'A$'], ['SGD', 'S$'], ['NZD', 'NZ$'], ['JPY', '¥'], ['AED', 'د.إ'], ['CHF', 'CHF'], ['SAR', 'SAR']]) {
    assert.ok(formatPrice(12999, code).includes(symbol));
  }
});

test('unknown currency, blocked selection input and invalid amounts fail safely to INR or zero', () => {
  for (const code of ['XYZ', '', null, undefined, {}, 123]) {
    assert.equal(getCurrency(code).code, 'INR');
    assert.equal(formatPrice(12999, code), '₹12,999');
  }
  assert.equal(getCurrency(' usd ').code, 'USD');
  for (const amount of [-1, NaN, Infinity, undefined, 'wrong', null]) {
    assert.equal(estimatePrice(amount, 'USD'), 0);
  }
  assert.equal(estimatePrice('12999', 'INR'), 12999);
});

test('budget bands keep stable values while labels follow displayed estimates', () => {
  assert.deepEqual(getBudgetOptions('INR').map((option) => option.label), [
    'Select an approximate budget', 'Below ₹15k', '₹15k–₹30k', '₹30k–₹60k', '₹60k–₹1L', '₹1L+', "Let's discuss",
  ]);
  for (const currency of currencies) {
    const converted = getBudgetOptions(currency.code);
    assert.deepEqual(converted.map((option) => option.value), budgetOptions.map((option) => option.value));
    if (currency.code !== 'INR') {
      assert.equal(converted[1].label, `Below approx. ${formatPrice(15000, currency.code)}`);
      assert.equal(converted[2].label, `Approx. ${formatPrice(15000, currency.code)}–${formatPrice(30000, currency.code)}`);
      assert.equal(converted[5].label, `Approx. ${formatPrice(100000, currency.code)}+`);
    }
  }
});

test('rate age, approximation and selected buffer are disclosed', () => {
  assert.match(getCurrencyNote('USD'), /15% buffer/);
  assert.match(getCurrencyNote('AED'), /12% buffer/);
  assert.match(getCurrencyNote('SAR'), /12% buffer/);
  assert.match(getCurrencyNote('JPY'), /100 currency units/);
  for (const currency of currencies) {
    assert.match(getCurrencyNote(currency.code), /14 Sep 2026/);
    assert.match(getCurrencyNote(currency.code), /Static reference rates/);
    assert.match(getCurrencyNote(currency.code), /Final proposals are quoted in the agreed billing currency/);
  }
});
