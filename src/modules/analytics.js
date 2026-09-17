export const ANALYTICS_KEY = 'kiratveerStudioAnalyticsV1';
const SESSION_KEY = `${ANALYTICS_KEY}:session`;
let initialized = false;

function privacyOptOut() {
  const navigator = globalThis.navigator;
  return navigator?.globalPrivacyControl === true
    || [navigator?.doNotTrack, navigator?.msDoNotTrack, globalThis.window?.doNotTrack].some(value => value === '1' || value === 'yes');
}

function validName(name) {
  return typeof name === 'string' && /^[a-z][a-z\d:_-]{0,79}$/i.test(name)
    && !['__proto__', 'constructor', 'prototype'].includes(name);
}

function count(value) {
  return Number.isSafeInteger(value) && value >= 0 ? value : 0;
}

function readAnalytics(storage) {
  let saved;
  try { saved = JSON.parse(storage.getItem(ANALYTICS_KEY) || 'null'); } catch { saved = null; }
  const events = Object.create(null);
  if (saved?.events && typeof saved.events === 'object' && !Array.isArray(saved.events)) {
    for (const [name, value] of Object.entries(saved.events)) {
      if (validName(name) && count(value)) events[name] = count(value);
    }
  }
  return { events, pageViews: count(saved?.pageViews), sessions: count(saved?.sessions), lastVisit: '' };
}

function record(change) {
  if (privacyOptOut()) return false;
  try {
    const storage = globalThis.localStorage;
    if (!storage) return false;
    const analytics = readAnalytics(storage);
    change(analytics);
    analytics.lastVisit = new Date().toISOString();
    storage.setItem(ANALYTICS_KEY, JSON.stringify(analytics));
    return true;
  } catch {
    return false;
  }
}

export function track(name) {
  if (!validName(name)) return false;
  return record(analytics => { analytics.events[name] = Math.min(count(analytics.events[name]) + 1, Number.MAX_SAFE_INTEGER); });
}

export function initAnalytics() {
  if (initialized || privacyOptOut()) return false;
  initialized = true;
  let isNewSession = true;
  try { isNewSession = globalThis.sessionStorage?.getItem(SESSION_KEY) !== '1'; } catch { /* A page-local session remains available. */ }
  const saved = record(analytics => {
    analytics.pageViews = Math.min(analytics.pageViews + 1, Number.MAX_SAFE_INTEGER);
    if (isNewSession) analytics.sessions = Math.min(analytics.sessions + 1, Number.MAX_SAFE_INTEGER);
  });
  if (saved) {
    try { globalThis.sessionStorage?.setItem(SESSION_KEY, '1'); } catch { /* Storage is optional. */ }
  }
  return saved;
}
