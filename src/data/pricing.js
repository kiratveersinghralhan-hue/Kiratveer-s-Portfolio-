export const packages = [
  {
    id: 'launch',
    name: 'Launch Experience',
    price: 12999,
    category: 'A focused first impression',
    description: 'For founders, campaigns, personal brands and a single offer worth presenting well.',
    scope: ['Premium landing page', 'Responsive design', 'WhatsApp & contact', 'SEO foundation', 'Analytics', 'Controlled motion'],
    featured: false,
    plus: false,
  },
  {
    id: 'business',
    name: 'Business Growth',
    price: 24999,
    category: 'For the next stage of business',
    description: 'A considered website for small businesses, consultants and service brands.',
    scope: ['Multi-page website', 'Custom visual direction', 'Responsive development', 'Lead capture & WhatsApp', 'Analytics & SEO foundation', 'Premium motion'],
    featured: true,
    plus: false,
  },
  {
    id: 'premium',
    name: 'Premium Experience',
    price: 44999,
    category: 'A more distinctive presence',
    description: 'For brands that want the experience itself to leave an impression.',
    scope: ['Custom UX & art direction', 'Advanced motion', 'Interactive storytelling', '3D where appropriate', 'Conversion strategy & analytics', 'Technical SEO'],
    featured: false,
    plus: false,
  },
  {
    id: 'commerce',
    name: 'Commerce',
    price: 59999,
    category: 'Turn interest into a purchase',
    description: 'For e-commerce, catalogues and custom selling experiences. Scope depends on catalogue, payments, shipping, integrations and content.',
    scope: ['Commerce experience', 'Catalogue structure', 'Responsive storefront', 'Payments & shipping scoping', 'Integration planning', 'Content & complexity review'],
    featured: false,
    plus: true,
  },
  {
    id: 'product',
    name: 'AI / Digital Product',
    price: 79999,
    category: 'From product idea to working system',
    description: 'For AI tools, web applications, automation, MVPs and dashboards. Quoted according to functionality and architecture.',
    scope: ['Product discovery', 'Application architecture', 'Custom user experience', 'AI & workflow scoping', 'Integration planning', 'Build & handover scope'],
    featured: false,
    plus: true,
  },
];

export const addons = [
  { id: 'video', name: 'Short-form video edit', price: 1499, category: 'Motion', description: 'A focused edit for a social or launch moment.', scope: [], featured: false, plus: true },
  { id: 'brand', name: 'Brand starter system', price: 9999, category: 'Identity', description: 'A visual starting point for a coherent brand.', scope: [], featured: false, plus: true },
  { id: 'care', name: 'SEO / Website Care', price: 7999, period: 'month', category: 'Ongoing', description: 'Ongoing website attention and SEO foundations.', scope: [], featured: false, plus: true },
  { id: 'content', name: 'Content / Social Support', price: 11999, period: 'month', category: 'Ongoing', description: 'A regular content and social support scope.', scope: [], featured: false, plus: true },
  { id: 'launch-content', name: 'Launch Content Pack', price: 14999, category: 'Launch', description: 'A coordinated set of content for a launch.', scope: [], featured: false, plus: true },
];

export const pricingDisclaimer = 'Starting prices. Final proposals depend on project scope, functionality, integrations, content and timeline.';
export const internationalDisclaimer = 'International estimates include a cross-border service and currency buffer. Final proposals are quoted in the agreed billing currency.';

// Quote currency units per EUR, published 14 September 2026. INR is the price base.
const eurReference = {
  INR: 110.3755,
  USD: 1.1551,
  EUR: 1,
  GBP: 0.85598,
  CAD: 1.6041,
  AUD: 1.6202,
  SGD: 1.4676,
  NZD: 2.0012,
  CHF: 0.9431,
  JPY: 178.52,
};

export const currencySettings = {
  base: 'INR',
  defaultCurrency: 'INR',
  defaultInternationalBuffer: 1.15,
  gulfBuffer: 1.12,
  rateDate: '2026-09-14',
  rateDateLabel: '14 Sep 2026',
  rateMode: 'static',
  storageKey: 'kirat-pricing-currency',
  sources: [
    { name: 'ECB reference rates, 14 September 2026', url: 'https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=OJ%3AC_202604607' },
    { name: 'CBUAE USD/AED reference', url: 'https://centralbank.ae/umbraco/Surface/Exchange/GetExchangeRateAllCurrency' },
    { name: 'SAMA USD/SAR peg', url: 'https://sama.gov.sa/en-US/MediaCenter/News/Pages/news-557.aspx' },
  ],
};

const fromEur = (code) => eurReference[code] / eurReference.INR;

export const currencies = [
  { code: 'INR', name: 'Indian rupee', symbol: '₹', rate: 1, buffer: 1 },
  { code: 'USD', name: 'US dollar', symbol: '$', rate: fromEur('USD'), buffer: currencySettings.defaultInternationalBuffer },
  { code: 'EUR', name: 'Euro', symbol: '€', rate: fromEur('EUR'), buffer: currencySettings.defaultInternationalBuffer },
  { code: 'GBP', name: 'British pound', symbol: '£', rate: fromEur('GBP'), buffer: currencySettings.defaultInternationalBuffer },
  { code: 'AED', name: 'UAE dirham', symbol: 'د.إ', rate: fromEur('USD') * 3.6725, buffer: currencySettings.gulfBuffer },
  { code: 'CAD', name: 'Canadian dollar', symbol: 'C$', rate: fromEur('CAD'), buffer: currencySettings.defaultInternationalBuffer },
  { code: 'AUD', name: 'Australian dollar', symbol: 'A$', rate: fromEur('AUD'), buffer: currencySettings.defaultInternationalBuffer },
  { code: 'SGD', name: 'Singapore dollar', symbol: 'S$', rate: fromEur('SGD'), buffer: currencySettings.defaultInternationalBuffer },
  { code: 'NZD', name: 'New Zealand dollar', symbol: 'NZ$', rate: fromEur('NZD'), buffer: currencySettings.defaultInternationalBuffer },
  { code: 'CHF', name: 'Swiss franc', symbol: 'CHF', rate: fromEur('CHF'), buffer: currencySettings.defaultInternationalBuffer },
  { code: 'JPY', name: 'Japanese yen', symbol: '¥', rate: fromEur('JPY'), buffer: currencySettings.defaultInternationalBuffer },
  { code: 'SAR', name: 'Saudi riyal', symbol: 'SAR', rate: fromEur('USD') * 3.75, buffer: currencySettings.gulfBuffer },
];

export const budgetOptions = [
  { value: '', label: 'Select an approximate budget', min: null, max: null },
  { value: 'below-15k', label: 'Below ₹15k', min: null, max: 15000 },
  { value: '15k-30k', label: '₹15k–₹30k', min: 15000, max: 30000 },
  { value: '30k-60k', label: '₹30k–₹60k', min: 30000, max: 60000 },
  { value: '60k-1l', label: '₹60k–₹1L', min: 60000, max: 100000 },
  { value: '1l-plus', label: '₹1L+', min: 100000, max: null },
  { value: 'discuss', label: "Let's discuss", min: null, max: null },
];

export function getCurrency(code = 'INR') {
  const normalized = typeof code === 'string' ? code.trim().toUpperCase() : 'INR';
  return currencies.find((currency) => currency.code === normalized) ?? currencies[0];
}

export function estimatePrice(amount, code = 'INR') {
  const number = typeof amount === 'number' ? amount : Number(amount);
  if (!Number.isFinite(number) || number <= 0) return 0;
  const currency = getCurrency(code);
  const converted = number * currency.rate * currency.buffer;
  if (!Number.isFinite(converted)) return 0;
  if (currency.code === 'INR') return Math.round(converted);
  const increment = currency.code === 'JPY' ? 100 : 5;
  const tolerance = Number.EPSILON * Math.max(1, converted);
  return Math.ceil((converted - tolerance) / increment) * increment;
}

export function formatPrice(amount, code = 'INR') {
  const currency = getCurrency(code);
  const formatter = new Intl.NumberFormat(currency.code === 'INR' ? 'en-IN' : 'en-US', {
    style: 'currency',
    currency: currency.code,
    currencyDisplay: 'symbol',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
  return formatter.formatToParts(estimatePrice(amount, currency.code))
    .map((part) => part.type === 'currency' ? currency.symbol : part.value)
    .join('');
}

export function getBudgetOptions(code = 'INR') {
  const currency = getCurrency(code);
  return budgetOptions.map((option) => {
    if (currency.code === 'INR' || (option.min === null && option.max === null)) return { ...option };
    const lower = option.min === null ? null : formatPrice(option.min, currency.code);
    const upper = option.max === null ? null : formatPrice(option.max, currency.code);
    const label = lower === null ? `Below approx. ${upper}` : upper === null ? `Approx. ${lower}+` : `Approx. ${lower}–${upper}`;
    return { ...option, label };
  });
}

export function getCurrencyNote(code = 'INR') {
  const currency = getCurrency(code);
  const reference = `Static reference rates: ${currencySettings.rateDateLabel} (ECB; AED/SAR derived from USD pegs).`;
  if (currency.code === 'INR') return `Base prices are in INR. ${internationalDisclaimer} ${reference}`;
  const percentage = Math.round((currency.buffer - 1) * 100);
  return `${internationalDisclaimer} The ${currency.code} estimate includes a ${percentage}% buffer and rounds up to ${currency.code === 'JPY' ? '100' : '5'} currency units. ${reference}`;
}
