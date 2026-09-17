import test from 'node:test';
import assert from 'node:assert/strict';
import { CONTENT_KEY, loadLocalContent, normalizeLocalContent } from '../src/modules/local-content.js';
import { projects } from '../src/data/projects.js';

const defaults = { offer: 'Verified offer', references: [{ name: '@ralhanx', url: 'https://instagram.com/ralhanx' }] };
const clone = value => JSON.parse(JSON.stringify(value));

test('absent or malformed storage preserves the complete published collection and offer', () => {
  for (const saved of [null, undefined, [], 'wrong', 42, {}, { projects: 'wrong', references: null, offer: {} }]) {
    const result = normalizeLocalContent(projects, saved, defaults);
    assert.equal(result.projects, projects);
    assert.equal(result.offer, defaults.offer);
    assert.equal(result.isCustomized, false);
    assert.equal(result.references[0].name, '@ralhanx');
  }
});

test('exact IDs preserve case studies while old admin edits and array order win', () => {
  const original = clone(projects);
  const result = normalizeLocalContent(projects, { version: 6, projects: [
    { id: 'tripmitra', title: 'Travel, together', category: 'Travel', description: 'New description', status: 'In progress', url: 'https://example.com/trip', image: '/assets/images/portrait-studio-480.webp', tags: ['Design', ' Build ', null] },
    { id: 'qortra', title: 'QORTRA' },
  ] }, defaults);
  assert.deepEqual(result.projects.map(item => item.id), ['tripmitra', 'qortra']);
  const item = result.projects[0];
  assert.equal(item.title, 'Travel, together');
  assert.equal(item.shortCategory, 'Travel');
  assert.equal(item.summary, 'New description');
  assert.equal(item.status, 'In progress');
  assert.equal(item.url, 'https://example.com/trip');
  assert.equal(item.image, '/assets/images/portrait-studio-480.webp');
  assert.deepEqual(item.services, ['Design', 'Build']);
  assert.equal(item.slug, 'tripmitra');
  assert.equal(item.hasCaseStudy, true);
  assert.deepEqual(projects, original);
});

test('unknown IDs never inherit another project by index, title, or a supplied slug', () => {
  const result = normalizeLocalContent(projects, { version: 6, projects: [
    { id: 'new-project', title: 'QORTRA', slug: 'qortra', challenge: 'Injected detail', featured: true, url: 'https://example.com' },
    { id: 'TripMitra', title: 'TripMitra', url: '' },
  ] });
  for (const item of result.projects) {
    assert.equal(item.hasCaseStudy, false);
    assert.equal(item.slug, '');
    assert.equal(item.featured, false);
    assert.deepEqual(item.stack, []);
    assert.equal(item.challenge, undefined);
  }
  assert.equal(result.projects[0].url, 'https://example.com/');
  assert.equal(result.projects[1].url, '');
});

test('legacy migration adds QORTRA first without restoring intentionally deleted old projects', () => {
  for (const version of [undefined, 4, 5]) {
    const result = normalizeLocalContent(projects, { version, projects: [{ id: 'veyrath', title: 'VEYRATH' }] });
    assert.deepEqual(result.projects.map(item => item.id), ['qortra', 'veyrath']);
  }
  assert.deepEqual(normalizeLocalContent(projects, { version: 5, projects: [] }).projects.map(item => item.id), ['qortra']);
  assert.deepEqual(normalizeLocalContent(projects, { version: 5, projects: [{ id: 'qortra' }] }).projects.map(item => item.id), ['qortra']);
});

test('version 6 respects deletion of any project including QORTRA and an intentionally empty collection', () => {
  assert.deepEqual(normalizeLocalContent(projects, { version: 6, projects: [] }).projects, []);
  assert.deepEqual(normalizeLocalContent(projects, { version: 6, projects: [{ id: 'veyrath' }] }).projects.map(item => item.id), ['veyrath']);
  const result = normalizeLocalContent(projects, { version: 6, offer: '', references: [] }, defaults);
  assert.equal(result.offer, '');
  assert.deepEqual(result.references, []);
  assert.equal(result.projects, projects);
});

test('malformed imported records, duplicates and wrong typed fields do not corrupt defaults', () => {
  const result = normalizeLocalContent(projects, { version: 6, projects: [null, 3, 'bad', {}, { id: '<bad>' }, { id: 'qortra', title: {}, url: {}, tags: {} }, { id: 'qortra', title: 'duplicate' }] });
  assert.equal(result.projects.length, 1);
  assert.equal(result.projects[0].title, 'QORTRA');
  assert.deepEqual(result.projects[0].services, projects[0].services);
});

test('untrusted executable protocols, SVG data, and CSS values are discarded', () => {
  for (const url of ['javascript:alert(1)', 'data:text/html,<script>alert(1)</script>', 'vbscript:msgbox(1)', '//evil.example/path']) {
    const result = normalizeLocalContent(projects, { version: 6, projects: [{ id: 'qortra', url, image: url, color: 'red; background:url(javascript:alert(1))' }], references: [{ name: 'Test', url, image: url }] });
    assert.equal(result.projects[0].url, '');
    assert.equal(result.projects[0].image, '');
    assert.equal(result.projects[0].color, undefined);
    assert.equal(result.references[0].url, '');
    assert.equal(result.references[0].image, '');
    assert.equal(result.references[0].color, '#171717');
  }
  assert.equal(normalizeLocalContent(projects, { version: 6, projects: [{ id: 'qortra', image: 'data:image/svg+xml;base64,PHN2Zz4=' }] }).projects[0].image, '');
});

test('legitimate legacy media and local uploaded raster images remain usable', () => {
  for (const [image, expected] of [['project-tripmitra.png', '/assets/images/project-tripmitra.webp'], ['data:image/png;base64,iVBORw0KGgo=', 'data:image/png;base64,iVBORw0KGgo=']]) {
    const result = normalizeLocalContent(projects, { version: 6, projects: [{ id: 'tripmitra', image }] });
    assert.equal(result.projects[0].image, expected);
  }
});

function withGlobal(name, value, action) {
  const descriptor = Object.getOwnPropertyDescriptor(globalThis, name);
  Object.defineProperty(globalThis, name, { value, configurable: true, writable: true });
  try { return action(); } finally {
    if (descriptor) Object.defineProperty(globalThis, name, descriptor);
    else delete globalThis[name];
  }
}

test('browser loading survives invalid JSON and unavailable local storage', () => {
  for (const storage of [{ getItem: () => '{broken' }, { getItem: () => { throw new Error('Blocked'); } }, undefined]) {
    withGlobal('localStorage', storage, () => {
      const result = loadLocalContent(projects);
      assert.equal(result.projects, projects);
      assert.equal(result.isCustomized, false);
    });
  }
  withGlobal('localStorage', { getItem: key => key === CONTENT_KEY ? JSON.stringify({ version: 6, projects: [] }) : null }, () => {
    assert.deepEqual(loadLocalContent(projects).projects, []);
  });
});

function memoryStorage(initial = {}) {
  const values = new Map(Object.entries(initial));
  return { getItem: key => values.get(key) ?? null, setItem: (key, value) => values.set(key, value), values };
}

let instance = 0;
async function analyticsModule() { return import(`../src/modules/analytics.js?test=${instance++}`); }

test('analytics retains compatible counters, deduplicates initialization and ignores personal payloads', async () => {
  const analytics = await analyticsModule();
  const storage = memoryStorage({ [analytics.ANALYTICS_KEY]: JSON.stringify({ pageViews: 7, sessions: 2, events: { 'cta:whatsapp': 3 } }) });
  withGlobal('localStorage', storage, () => withGlobal('sessionStorage', memoryStorage(), () => {
    assert.equal(analytics.initAnalytics(), true);
    assert.equal(analytics.initAnalytics(), false);
    analytics.track('cta:whatsapp', { email: 'private@example.com' });
    const saved = JSON.parse(storage.getItem(analytics.ANALYTICS_KEY));
    assert.equal(saved.pageViews, 8);
    assert.equal(saved.sessions, 3);
    assert.equal(saved.events['cta:whatsapp'], 4);
    assert.ok(!JSON.stringify(saved).includes('private'));
    assert.match(saved.lastVisit, /^\d{4}-\d{2}-\d{2}T/);
    assert.equal(analytics.track('private@example.com'), false);
  }));
});

test('analytics preserves browser-session count across separate page loads', async () => {
  const first = await analyticsModule();
  const second = await analyticsModule();
  const storage = memoryStorage();
  withGlobal('localStorage', storage, () => withGlobal('sessionStorage', memoryStorage(), () => {
    first.initAnalytics();
    second.initAnalytics();
    const saved = JSON.parse(storage.getItem(first.ANALYTICS_KEY));
    assert.equal(saved.pageViews, 2);
    assert.equal(saved.sessions, 1);
  }));
});

test('analytics repairs corrupt counters and tolerates denied storage', async () => {
  for (const source of ['{broken', JSON.stringify({ pageViews: -2, sessions: '3', events: { valid: '5', negative: -4, good: 2, constructor: 10 } })]) {
    const analytics = await analyticsModule();
    const storage = memoryStorage({ [analytics.ANALYTICS_KEY]: source });
    withGlobal('localStorage', storage, () => {
      analytics.track('project:qortra');
      const saved = JSON.parse(storage.getItem(analytics.ANALYTICS_KEY));
      assert.equal(saved.pageViews, 0);
      assert.equal(saved.sessions, 0);
      assert.equal(saved.events['project:qortra'], 1);
      assert.equal(Object.hasOwn(saved.events, 'constructor'), false);
      assert.equal(Object.hasOwn(saved.events, 'negative'), false);
    });
  }
  const analytics = await analyticsModule();
  withGlobal('localStorage', { getItem: () => { throw new Error('Denied'); }, setItem: () => { throw new Error('Denied'); } }, () => {
    assert.equal(analytics.initAnalytics(), false);
    assert.equal(analytics.track('cta:contact'), false);
  });
});

test('DNT and Global Privacy Control prevent analytics writes', async () => {
  for (const preference of [{ doNotTrack: '1' }, { doNotTrack: 'yes' }, { globalPrivacyControl: true }, { msDoNotTrack: '1' }]) {
    const analytics = await analyticsModule();
    const storage = memoryStorage();
    withGlobal('navigator', preference, () => withGlobal('localStorage', storage, () => {
      assert.equal(analytics.initAnalytics(), false);
      assert.equal(analytics.track('cta:contact'), false);
      assert.equal(storage.values.size, 0);
    }));
  }
});
