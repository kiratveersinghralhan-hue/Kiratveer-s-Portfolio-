import { readdir, readFile, stat } from 'node:fs/promises';
import { resolve, relative, extname, join } from 'node:path';
import { spawnSync } from 'node:child_process';

const root = resolve(import.meta.dirname, '..');
const ignored = new Set(['node_modules', 'dist', 'legacy', 'test-results', '.git']);
const failures = [];
async function filesIn(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const groups = await Promise.all(entries.filter(entry => !ignored.has(entry.name)).map(entry => {
    const path = join(directory, entry.name);
    return entry.isDirectory() ? filesIn(path) : [path];
  }));
  return groups.flat();
}
const files = await filesIn(root);
const scripts = files.filter(file => ['.js', '.mjs'].includes(extname(file)));
for (const file of scripts) {
  const result = spawnSync(process.execPath, ['--check', file], { encoding: 'utf8' });
  if (result.status !== 0) failures.push(`${relative(root, file)}: ${result.stderr.trim()}`);
}
const decode = value => value.replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#39;/g, "'");
const pages = files.filter(file => extname(file) === '.html');
const contents = new Map(await Promise.all(pages.map(async file => [file, await readFile(file, 'utf8')])));
const routes = new Map();
for (const file of files) {
  const path = relative(root, file).replaceAll('\\', '/');
  if (path.startsWith('public/')) routes.set(`/${path.slice(7)}`, file);
  else {
    routes.set(`/${path}`, file);
    if (path.endsWith('/index.html')) {
      const directoryRoute = `/${path.slice(0, -'index.html'.length)}`;
      routes.set(directoryRoute, file);
      routes.set(directoryRoute.slice(0, -1), file);
    }
  }
}
routes.set('/', resolve(root, 'index.html'));
let referenceCount = 0;
for (const [file, html] of contents) {
  const sourceName = relative(root, file).replaceAll('\\', '/');
  const sourceRoute = sourceName.startsWith('public/') ? `/${sourceName.slice(7)}` : `/${sourceName}`;
  const references = [...html.matchAll(/\b(?:src|href|poster|action)\s*=\s*["']([^"']+)["']/gi)].map(match => decode(match[1]));
  for (const match of html.matchAll(/\bsrcset\s*=\s*["']([^"']+)["']/gi)) {
    for (const candidate of match[1].split(',')) references.push(decode(candidate.trim().split(/\s+/)[0]));
  }
  for (const reference of references) {
    if (!reference || /^(?:https?:|mailto:|tel:|data:|blob:|\/\/)/i.test(reference)) continue;
    referenceCount += 1;
    let url;
    try { url = new URL(reference, `https://portfolio.invalid${sourceRoute}`); }
    catch { failures.push(`${sourceName}: invalid URL ${reference}`); continue; }
    const target = routes.get(decodeURIComponent(url.pathname));
    if (!target) { failures.push(`${sourceName}: missing local target ${reference}`); continue; }
    if (url.hash && contents.has(target)) {
      const id = decodeURIComponent(url.hash.slice(1));
      const ids = [...contents.get(target).matchAll(/\bid\s*=\s*["']([^"']+)["']/gi)].map(match => decode(match[1]));
      if (id && !ids.includes(id)) failures.push(`${sourceName}: missing anchor ${reference}`);
    }
  }
  const ids = [...html.matchAll(/\bid\s*=\s*["']([^"']+)["']/gi)].map(match => match[1]);
  for (const id of new Set(ids.filter((id, index) => ids.indexOf(id) !== index))) failures.push(`${sourceName}: duplicate id ${id}`);
  if ((html.match(/<h1(?:\s|>)/gi) || []).length !== 1) failures.push(`${sourceName}: expected one logical H1`);
  if (!/<title>[^<]+<\/title>/i.test(html)) failures.push(`${sourceName}: missing title`);
}
try { await stat(resolve(root, 'public/assets/images/social-preview.png')); }
catch { failures.push('Missing public/assets/images/social-preview.png used by social metadata'); }
console.log(`Checked ${scripts.length} JavaScript files, ${pages.length} HTML pages and ${referenceCount} local references.`);
if (failures.length) {
  console.error([...new Set(failures)].map(failure => `FAIL ${failure}`).join('\n'));
  process.exitCode = 1;
} else console.log('PASS JavaScript syntax, generated page structure, assets, internal links and anchors.');
