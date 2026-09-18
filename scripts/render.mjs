import { mkdir, writeFile, rm } from 'node:fs/promises';
import { home, caseStudy } from '../src/components.js';
import { startProject, thankYou } from '../src/components-flow.js';
import { projects } from '../src/data/projects.js';
import { initializeTheme } from '../src/modules/theme.js';
import { site } from '../src/data/site.js';
import { escapeHtml as e } from '../src/modules/safety.js';
import { fileURLToPath } from 'node:url';

process.chdir(fileURLToPath(new URL('../', import.meta.url)));

const configuredUrl = process.env.PUBLIC_SITE_URL?.trim();
let origin = '';
if (configuredUrl) {
  const url = new URL(configuredUrl);
  if (!['https:', 'http:'].includes(url.protocol) || url.pathname !== '/') throw new Error('PUBLIC_SITE_URL must be the portfolio origin, e.g. https://your-domain.com');
  origin = url.origin;
}
function page(content, {title = site.title, description = site.description, path = '/', project, noindex = false, flow = false} = {}) {
  const canonical = origin ? `${origin}${path}` : '';
  const schema = {'@context':'https://schema.org', '@type':project?'CreativeWork':'Person', name: project?.title || site.name, description, ...(project ? {creator:{'@type':'Person',name:site.name}} : {alternateName:'Kirat',jobTitle:'Independent Digital Product Developer',sameAs:site.socials.map(s=>s.url)}), ...(canonical?{url:canonical}:{})};
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover"><meta name="theme-color" content="#080909"><meta name="description" content="${e(description)}"><title>${e(title)}</title>${canonical?`<link rel="canonical" href="${e(canonical)}"><meta property="og:url" content="${e(canonical)}">`:''}<meta property="og:type" content="website"><meta property="og:title" content="${e(title)}"><meta property="og:description" content="${e(description)}"><meta property="og:image" content="${origin}/assets/images/social-preview.png"><meta property="og:image:width" content="1200"><meta property="og:image:height" content="630"><meta property="og:image:alt" content="Kirat — The Independent Edition. Design, development, AI and motion."><meta name="twitter:card" content="summary_large_image"><meta name="twitter:title" content="${e(title)}"><meta name="twitter:description" content="${e(description)}"><meta name="twitter:image" content="${origin}/assets/images/social-preview.png">${noindex?'<meta name="robots" content="noindex,follow">':''}<link rel="icon" href="/favicon.svg" type="image/svg+xml"><script>(${initializeTheme.toString()})()</script><link rel="stylesheet" href="/src/styles.css"><link rel="stylesheet" href="/src/cinematic.css">${flow?'<link rel="stylesheet" href="/src/start-project.css">':''}<link rel="stylesheet" href="/src/themes.css"><script type="application/ld+json">${JSON.stringify(schema).replace(/</g,'\\u003c')}</script><script type="module" src="/src/main.js"></script></head><body${project?` data-case="${project.id}"`:''}>${content}</body></html>`;
}
await mkdir('work', {recursive:true});
await writeFile('index.html', page(home()));
await mkdir('start-project', {recursive:true});
await mkdir('thank-you', {recursive:true});
await writeFile('start-project/index.html', page(startProject(),{title:'Start a project — Kirat',description:'Tell Kirat about your website, AI product, commerce or creative project. A focused brief and a personal conversation.',path:'/start-project/',flow:true}));
await writeFile('thank-you/index.html', page(thankYou(),{title:'The next chapter — Kirat',path:'/thank-you/',noindex:true,flow:true}));
await writeFile('thanks.html', page(thankYou(),{title:'The next chapter — Kirat',path:'/thanks.html',noindex:true,flow:true}));
for (const project of projects) await writeFile(`work/${project.slug}.html`,page(caseStudy(project),{title:`${project.title} — Selected work by Kirat`,description:project.description,path:`/work/${project.slug}.html`,project}));
const adminData={version:6,offer:site.offer,projects:projects.map(p=>({...p,tags:p.services,monogram:p.title.slice(0,2),color:'#253e96'})),references:[{name:'@ralhanx',type:'Creative practice',note:'Independent digital product development and creative work.',url:site.socials[0].url,color:'#253e96'},{name:'@gaane.gpt',type:'Music / culture',note:'Music discovery and visual storytelling.',url:'https://instagram.com/gaane.gpt',color:'#402e47'}]};
await writeFile('public/site-data.js',`window.KS_DEFAULTS = ${JSON.stringify(adminData,null,2)};\n`);
await writeFile('public/robots.txt',`User-agent: *\nAllow: /\nDisallow: /admin.html\nDisallow: /thanks.html\nDisallow: /thank-you/\n${origin?`Sitemap: ${origin}/sitemap.xml\n`:''}`);
if(origin) await writeFile('public/sitemap.xml',`<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${['/','/start-project/',...projects.map(p=>`/work/${p.slug}.html`)].map(path=>`<url><loc>${e(origin+path)}</loc></url>`).join('')}</urlset>`);
else await rm('public/sitemap.xml', {force:true});
console.log(`Generated home, ${projects.length} case studies, project enquiry and confirmation routes. ${origin?'Canonical domain configured.':'Canonical domain omitted: set PUBLIC_SITE_URL for release.'}`);
