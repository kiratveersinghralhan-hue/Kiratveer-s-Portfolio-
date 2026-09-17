import {
  currencies,
  currencySettings,
  formatPrice,
  getBudgetOptions,
  getCurrency,
  getCurrencyNote,
} from '../data/pricing.js';

export function initPricing({ track = () => {} } = {}) {
  const select = document.querySelector('#currency-select');
  if (!select) return () => {};
  select.disabled = false;
  const priceNodes = [...document.querySelectorAll('[data-price]')];
  const prefixes = [...document.querySelectorAll('.price-prefix')];
  const periods = [...document.querySelectorAll('[data-price-period]')];
  const budget = document.querySelector('#budget');
  const note = document.querySelector('#currency-note');

  if (!select.options.length) {
    for (const currency of currencies) {
      const option = document.createElement('option');
      option.value = currency.code;
      option.textContent = `${currency.code} — ${currency.symbol}`;
      select.append(option);
    }
  }

  let current = currencySettings.defaultCurrency;
  try {
    current = getCurrency(localStorage.getItem(currencySettings.storageKey)).code;
  } catch {
    // Storage can be unavailable in private browsing; pricing still works.
  }

  function update(code) {
    current = getCurrency(code).code;
    select.value = current;
    for (const node of priceNodes) {
      const raw = node.getAttribute('data-price');
      const amount = Number(raw);
      if (raw === null || raw.trim() === '' || !Number.isFinite(amount) || amount < 0) continue;
      node.textContent = formatPrice(amount, current);
    }
    for (const node of prefixes) node.textContent = current === 'INR' ? 'From' : 'Approx. from';
    for (const node of periods) {
      const period = node.getAttribute('data-price-period');
      node.textContent = period === 'month' || period === 'monthly' ? '/month' : '';
    }
    if (note) note.textContent = getCurrencyNote(current);
    if (budget) {
      const selected = budget.value;
      const options = getBudgetOptions(current);
      const fragment = document.createDocumentFragment();
      for (const item of options) {
        const option = document.createElement('option');
        option.value = item.value;
        option.textContent = item.label;
        fragment.append(option);
      }
      budget.replaceChildren(fragment);
      if (options.some((option) => option.value === selected)) budget.value = selected;
    }
    const billingCurrency = document.querySelector('[name="billing_currency"]');
    if (billingCurrency) billingCurrency.value = current;
  }

  function onChange() {
    update(select.value);
    try {
      localStorage.setItem(currencySettings.storageKey, current);
    } catch {
      // The selected currency remains effective for this page.
    }
    track('currency_change', { currency: current });
  }

  update(current);
  select.addEventListener('change', onChange);
  return () => select.removeEventListener('change', onChange);
}
