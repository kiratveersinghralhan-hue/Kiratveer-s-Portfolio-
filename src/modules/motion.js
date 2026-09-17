import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';

gsap.registerPlugin(ScrollTrigger);

export function initMotion(){
  const reduced=matchMedia('(prefers-reduced-motion: reduce)');
  const fine=matchMedia('(hover:hover) and (pointer:fine)');
  const header=document.querySelector('.site-header');
  const cursor=document.querySelector('.cursor-label');
  const cleanups=[];
  let lenis=null,raf=0;

  if(fine.matches&&!reduced.matches&&!document.querySelector('.project-flow,.flow-confirmation')){
    lenis=new Lenis({duration:1.04,smoothWheel:true,wheelMultiplier:.92,touchMultiplier:1.1,anchors:{offset:-70},autoResize:true});
    lenis.on('scroll',ScrollTrigger.update);
    const tick=time=>{lenis.raf(time);raf=requestAnimationFrame(tick)};
    raf=requestAnimationFrame(tick);
  }

  const setRead=()=>{
    document.documentElement.style.setProperty('--read',String(scrollY/Math.max(1,document.documentElement.scrollHeight-innerHeight)));
    header?.classList.toggle('scrolled',scrollY>30);
    const light=[...document.querySelectorAll('.portal-copy,.capabilities,.pricing-section,.case-story,.archive')].some(el=>{const r=el.getBoundingClientRect();return r.top<42&&r.bottom>42});
    header?.classList.toggle('on-light',light);
  };
  addEventListener('scroll',setRead,{passive:true});setRead();cleanups.push(()=>removeEventListener('scroll',setRead));

  const bookScene=document.querySelector('#book-scene');
  if(bookScene){
    const bookProgress=ScrollTrigger.create({trigger:bookScene,start:'top top',end:'bottom bottom',onUpdate:self=>bookScene.style.setProperty('--book-progress',self.progress.toFixed(4))});
    cleanups.push(()=>bookProgress.kill());
  }

  if(!reduced.matches){
    document.querySelectorAll('.project-world').forEach((scene,index)=>{
      const update=gsap.quickTo(scene,'--world-progress',{duration:.12,ease:'none'});
      const trigger=ScrollTrigger.create({trigger:scene,start:'top top',end:'bottom bottom',onUpdate:self=>update(self.progress)});
      cleanups.push(()=>trigger.kill());
      const copy=scene.querySelector('.world-copy');
      if(copy){const reveal=gsap.fromTo(copy,{clipPath:'inset(0 0 100% 0)'},{clipPath:'inset(0 0 0% 0)',duration:1,ease:'power4.out',paused:true});const revealTrigger=ScrollTrigger.create({trigger:scene,start:'top 70%',onEnter:()=>reveal.play(),onLeaveBack:()=>reveal.reverse()});cleanups.push(()=>{reveal.kill();revealTrigger.kill()})}
      scene.dataset.worldIndex=String(index);
    });
    const processLine=document.querySelector('.process-section');
    if(processLine){const trigger=ScrollTrigger.create({trigger:processLine,start:'top 70%',end:'bottom 70%',scrub:true,onUpdate:self=>processLine.style.setProperty('--process-progress',self.progress)});cleanups.push(()=>trigger.kill())}
    const portal=document.querySelector('.portal-copy h2');
    if(portal){const tween=gsap.fromTo(portal,{xPercent:-10,letterSpacing:'-.12em'},{xPercent:0,letterSpacing:'-.085em',ease:'none',scrollTrigger:{trigger:portal,start:'top bottom',end:'bottom 40%',scrub:true}});cleanups.push(()=>tween.kill())}
    const about=document.querySelector('.about-image img');
    if(about){const tween=gsap.fromTo(about,{scale:1.12},{scale:1,ease:'none',scrollTrigger:{trigger:about,start:'top bottom',end:'bottom top',scrub:true}});cleanups.push(()=>tween.kill())}
    const filmRoom=document.querySelector('.film-room');
    if(filmRoom){let activeFilm=0;const filmTrigger=ScrollTrigger.create({trigger:filmRoom,start:'top top',end:'bottom bottom',onUpdate:self=>{const next=Math.min(2,Math.floor(self.progress*3));if(next!==activeFilm){activeFilm=next;document.querySelector(`[data-film-select="${next}"]`)?.click()}}});cleanups.push(()=>filmTrigger.kill())}
  }

  function pointer(event){
    if(!cursor||!fine.matches||reduced.matches||event.pointerType==='touch')return;
    cursor.style.setProperty('--cx',`${event.clientX}px`);cursor.style.setProperty('--cy',`${event.clientY}px`);
    const target=event.target.closest('[data-cursor]');cursor.classList.toggle('active',Boolean(target));cursor.textContent=target?.dataset.cursor||'';
    document.documentElement.style.setProperty('--pointer-x',String(event.clientX/innerWidth-.5));document.documentElement.style.setProperty('--pointer-y',String(event.clientY/innerHeight-.5));
  }
  document.addEventListener('pointermove',pointer,{passive:true});cleanups.push(()=>document.removeEventListener('pointermove',pointer));
  document.addEventListener('pointerleave',()=>cursor?.classList.remove('active'));
  document.querySelectorAll('[data-cursor="START"],.signal-button').forEach(el=>{
    const move=event=>{if(fine.matches&&!reduced.matches){const r=el.getBoundingClientRect();el.style.transform=`translate(${(event.clientX-r.left-r.width/2)*.07}px,${(event.clientY-r.top-r.height/2)*.09}px)`}};
    const reset=()=>{el.style.transform=''};el.addEventListener('pointermove',move);el.addEventListener('pointerleave',reset);cleanups.push(()=>{el.removeEventListener('pointermove',move);el.removeEventListener('pointerleave',reset)})
  });
  const refresh=()=>ScrollTrigger.refresh();addEventListener('load',refresh,{once:true});
  return()=>{cancelAnimationFrame(raf);lenis?.destroy();cleanups.forEach(fn=>fn());ScrollTrigger.getAll().forEach(trigger=>trigger.kill())};
}
