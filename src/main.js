import { projects } from './data/projects.js';
import { loadLocalContent } from './modules/local-content.js';
import { track, initAnalytics } from './modules/analytics.js';
import { initPricing } from './modules/pricing.js';
import { initNavigation, initFilms, initForm } from './modules/interactions.js';
import { initTheme } from './modules/theme.js';
import { initMotion } from './modules/motion.js';
import { escapeHtml, safeUrl } from './modules/safety.js';

document.documentElement.classList.add('js');
const disposeTheme=initTheme();
const content=loadLocalContent(projects);
if(content.isCustomized){
  const {projectWorld,projectArchive}=await import('./components.js');
  const worlds=document.querySelector('#project-worlds');
  const archive=document.querySelector('#project-archive');
  if(worlds)worlds.innerHTML=content.projects.filter(p=>p.featured).map(projectWorld).join('');
  if(archive)archive.innerHTML=projectArchive(content.projects);
  const book=document.querySelector('#book-scene');
  if(book){
    book.hidden=false;
  }
  const offer=document.querySelector('[data-offer]');if(offer)offer.textContent=content.offer;
  const references=document.querySelector('#reference-list');
  if(references)references.innerHTML=content.references.map(r=>safeUrl(r.url)?`<a href="${escapeHtml(r.url)}" target="_blank" rel="noopener noreferrer">${escapeHtml(r.name)} — ${escapeHtml(r.type)} ↗</a>`:`<span>${escapeHtml(r.name)} — ${escapeHtml(r.type)}</span>`).join('');
}
initAnalytics();
if(document.body.dataset.case)track(`case:${document.body.dataset.case}`);
document.addEventListener('click',event=>{
  const link=event.target.closest('[data-track]');if(link)track(link.dataset.track);
});
document.querySelectorAll('.price-item').forEach(el=>el.addEventListener('toggle',()=>{if(el.open)track('pricing:opened');}));
initNavigation();initFilms({track});initForm({track});initPricing({track});
if(document.querySelector('.project-flow,.flow-confirmation')){const {initProjectFlow}=await import('./modules/project-flow.js');initProjectFlow({track});}
const entry=document.querySelector('.entry-sequence');
try{
  const replay=new URLSearchParams(location.search).get('intro')==='replay';
  const reduced=matchMedia('(prefers-reduced-motion:reduce)').matches;
  if(entry&&(replay||!sessionStorage.getItem('kirat-entry-seen'))&&!location.hash){
    entry.classList.add('play-entry');
    if(reduced)entry.classList.add('reduced-entry');
    sessionStorage.setItem('kirat-entry-seen','1');
    let fallbackTimer;
    const removeEntry=()=>{clearTimeout(fallbackTimer);entry.remove()};
    entry.addEventListener('animationend',event=>{if(event.target===entry)removeEntry()});
    entry.querySelector('button')?.addEventListener('click',removeEntry,{once:true});
    fallbackTimer=setTimeout(removeEntry,reduced?650:3000);
  }else entry?.remove();
}catch{entry?.remove();}
const disposeMotion=initMotion();
let disposeBook=()=>{};
const root=document.querySelector('#book-scene');
if(root&&!root.hidden){const {initBook}=await import('./modules/book.js');disposeBook=await initBook({root,projects:content.projects.filter(p=>p.featured)});}
document.querySelectorAll('[data-year]').forEach(el=>el.textContent=String(new Date().getFullYear()));
addEventListener('pagehide',event=>{if(!event.persisted){disposeMotion();disposeBook();disposeTheme();}});
