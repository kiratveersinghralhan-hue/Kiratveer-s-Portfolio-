import test from 'node:test';
import assert from 'node:assert/strict';
import { cp, mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { join, resolve } from 'node:path';
import { spawnSync } from 'node:child_process';
import { projects } from '../src/data/projects.js';
import { site } from '../src/data/site.js';

const root = resolve(import.meta.dirname, '..');
const origin = 'https://portfolio.example';
const paths = ['/', '/start-project/', ...projects.map(project => `/work/${project.slug}.html`)];
const pageFile = path => path.endsWith('/') ? `${path.slice(1)}index.html` : path.slice(1);

async function isolatedRenderer(t) {
  const scratch = join(root, 'work');
  await mkdir(scratch, { recursive: true });
  const directory = await mkdtemp(join(scratch, 'seo-validation-'));
  t.after(() => rm(directory, { recursive: true, force: true }));
  await cp(join(root, 'src'), join(directory, 'src'), { recursive: true });
  await mkdir(join(directory, 'scripts'));
  await mkdir(join(directory, 'public'));
  await cp(join(root, 'scripts/render.mjs'), join(directory, 'scripts/render.mjs'));
  await writeFile(join(directory, 'package.json'), '{"type":"module"}\n');
  return {
    read: path => readFile(join(directory, path), 'utf8'),
    render(value) {
      const env = { ...process.env };
      delete env.PUBLIC_SITE_URL;
      if (value !== undefined) env.PUBLIC_SITE_URL = value;
      return spawnSync(process.execPath, ['scripts/render.mjs'], { cwd: directory, env, encoding: 'utf8' });
    },
  };
}

function assertRendered(result) {
  assert.equal(result.status, 0, result.stderr || result.stdout);
}

test('configured origin produces matching canonical, social metadata and eight sitemap routes including the enquiry', async t => {
  const renderer = await isolatedRenderer(t);
  assertRendered(renderer.render(`${origin}/`));
  assert.equal(paths.length, 8);
  const sitemap = await renderer.read('public/sitemap.xml');
  assert.match(sitemap, /xmlns="http:\/\/www.sitemaps.org\/schemas\/sitemap\/0.9"/);
  assert.deepEqual([...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map(match => match[1]), paths.map(path => origin + path));
  assert.doesNotMatch(sitemap, /admin|thanks|thank-you|localhost/);
  const robots = await renderer.read('public/robots.txt');
  assert.match(robots, /Disallow: \/admin\.html/);
  assert.match(robots, /Disallow: \/thanks\.html/);
  assert.match(robots, /Disallow: \/thank-you\//);
  assert.ok(robots.includes(`Sitemap: ${origin}/sitemap.xml`));
  for (const path of [...paths, '/thanks.html', '/thank-you/']) {
    const html = await renderer.read(pageFile(path));
    assert.ok(html.includes(`<link rel="canonical" href="${origin}${path}">`), path);
    assert.ok(html.includes(`<meta property="og:url" content="${origin}${path}">`), path);
    assert.ok(html.includes(`<meta property="og:image" content="${origin}/assets/images/social-preview.png">`), path);
    assert.ok(html.includes(`<meta name="twitter:image" content="${origin}/assets/images/social-preview.png">`), path);
    assert.equal((html.match(/<h1(?:\s|>)/g) || []).length, 1, path);
    const schema = JSON.parse(html.match(/<script type="application\/ld\+json">([^<]+)<\/script>/)[1]);
    assert.equal(schema.url, origin + path);
    assert.equal(schema['@type'], path.startsWith('/work/') ? 'CreativeWork' : 'Person');
    if (schema['@type'] === 'Person') assert.deepEqual(schema.sameAs, site.socials.map(social => social.url));
  }
  assert.match(await renderer.read('thanks.html'), /<meta name="robots" content="noindex,follow">/);
  assert.match(await renderer.read('thank-you/index.html'), /<meta name="robots" content="noindex,follow">/);
});

test('removing the release origin deletes a previously generated sitemap and all stale absolute metadata', async t => {
  const renderer = await isolatedRenderer(t);
  assertRendered(renderer.render(origin));
  assertRendered(renderer.render());
  await assert.rejects(renderer.read('public/sitemap.xml'), { code: 'ENOENT' });
  assert.doesNotMatch(await renderer.read('public/robots.txt'), /Sitemap:/);
  for (const path of [...paths, '/thanks.html', '/thank-you/']) {
    const html = await renderer.read(pageFile(path));
    assert.doesNotMatch(html, /rel="canonical"|property="og:url"|https:\/\/portfolio\.example/);
    const schema = JSON.parse(html.match(/<script type="application\/ld\+json">([^<]+)<\/script>/)[1]);
    assert.equal(schema.url, undefined);
    assert.match(html, /<meta property="og:image" content="\/assets\/images\/social-preview\.png">/);
  }
  assertRendered(renderer.render('   '));
  await assert.rejects(renderer.read('public/sitemap.xml'), { code: 'ENOENT' });
});

test('release origin rejects unsupported protocols, malformed URLs and nested deployment paths', async t => {
  const renderer = await isolatedRenderer(t);
  for (const value of ['ftp://portfolio.example', 'javascript:alert(1)', 'portfolio.example', `${origin}/portfolio/`]) {
    const result = renderer.render(value);
    assert.notEqual(result.status, 0, value);
    await assert.rejects(renderer.read('index.html'), { code: 'ENOENT' });
    await assert.rejects(renderer.read('public/sitemap.xml'), { code: 'ENOENT' });
  }
});
