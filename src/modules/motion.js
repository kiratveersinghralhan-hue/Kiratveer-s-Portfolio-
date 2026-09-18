import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';

gsap.registerPlugin(ScrollTrigger);

export function initMotion() {
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const fine = matchMedia('(hover:hover) and (pointer:fine)');
  const header = document.querySelector('.site-header');
  const cursor = document.querySelector('.cursor-label');
  const html = document.documentElement;
  const bookScene = document.querySelector('#book-scene');
  const worlds = [...document.querySelectorAll('.project-world')];
  const processLine = document.querySelector('.process-section');
  const filmRoom = document.querySelector('.film-room');
  const filmButtons = [...document.querySelectorAll('[data-film-select]')];
  const cleanups = [];
  let cinematic = [];
  let lenis, loop = 0, readFrame = 0, pageRange = 1;
  let disposed = false;

  const setRead = () => {
    readFrame = 0;
    html.style.setProperty('--read', String(scrollY / pageRange));
    header?.classList.toggle('scrolled', scrollY > 30);
  };
  const scheduleRead = () => { if (!readFrame) readFrame = requestAnimationFrame(setRead); };
  const measure = () => { pageRange = Math.max(1, html.scrollHeight - innerHeight); scheduleRead(); };
  addEventListener('scroll', scheduleRead, { passive: true });
  addEventListener('resize', measure, { passive: true });
  measure();

  const tick = time => {
    if (!lenis || document.hidden) { loop = 0; return; }
    lenis.raf(time);
    loop = requestAnimationFrame(tick);
  };
  const visibility = () => {
    cancelAnimationFrame(loop); loop = 0;
    if (!document.hidden && lenis) loop = requestAnimationFrame(tick);
  };
  document.addEventListener('visibilitychange', visibility);

  function configure() {
    cancelAnimationFrame(loop); loop = 0;
    lenis?.destroy(); lenis = null;
    cinematic.forEach(dispose => dispose()); cinematic = [];
    if (fine.matches && !reduced.matches && !document.querySelector('.project-flow,.flow-confirmation')) {
      lenis = new Lenis({ duration: .78, smoothWheel: true, wheelMultiplier: 1, touchMultiplier: 1, anchors: { offset: -76 }, autoResize: true });
      lenis.on('scroll', ScrollTrigger.update);
      visibility();
    }
    if (bookScene) {
      const progress = ScrollTrigger.create({ trigger: bookScene, start: 'top top', end: 'bottom bottom', onUpdate: self => bookScene.style.setProperty('--book-progress', self.progress.toFixed(4)) });
      cinematic.push(() => progress.kill());
    }
    worlds.forEach(scene => {
      scene.style.removeProperty('--world-progress');
      scene.style.removeProperty('--scene-enter');
    });
    if (!reduced.matches) {
      worlds.forEach((scene, index) => {
        let sceneHeight = scene.offsetHeight;
        // One trigger covers the entrance mask and the entire spatial project journey.
        const trigger = ScrollTrigger.create({
          trigger: scene, start: 'top bottom', end: 'bottom bottom',
          onRefresh: () => { sceneHeight = scene.offsetHeight; },
          onUpdate: self => {
            const travelled = self.progress * sceneHeight;
            const enter = Math.min(1, travelled / innerHeight);
            const progress = Math.max(0, (travelled - innerHeight) / Math.max(1, sceneHeight - innerHeight));
            scene.style.setProperty('--scene-enter', enter.toFixed(4));
            scene.style.setProperty('--world-progress', progress.toFixed(4));
          },
        });
        cinematic.push(() => trigger.kill());
        scene.dataset.worldIndex = String(index);
      });
      if (processLine) {
        const trigger = ScrollTrigger.create({ trigger: processLine, start: 'top 70%', end: 'bottom 70%', onUpdate: self => processLine.style.setProperty('--process-progress', self.progress.toFixed(4)) });
        cinematic.push(() => trigger.kill());
      }
      const portal = document.querySelector('.portal-copy h2');
      if (portal) {
        const tween = gsap.fromTo(portal, { xPercent: -4 }, { xPercent: 0, ease: 'none', scrollTrigger: { trigger: portal, start: 'top bottom', end: 'bottom 40%', scrub: true } });
        cinematic.push(() => { tween.scrollTrigger?.kill(); tween.revert(); });
      }
      const about = document.querySelector('.about-image img');
      if (about) {
        const tween = gsap.fromTo(about, { scale: 1.09 }, { scale: 1, ease: 'none', scrollTrigger: { trigger: about, start: 'top bottom', end: 'bottom top', scrub: true } });
        cinematic.push(() => { tween.scrollTrigger?.kill(); tween.revert(); });
      }
      if (filmRoom) {
        let active = 0;
        const trigger = ScrollTrigger.create({ trigger: filmRoom, start: 'top top', end: 'bottom bottom', onUpdate: self => {
          const next = Math.min(filmButtons.length - 1, Math.floor(self.progress * filmButtons.length));
          if (next !== active) { active = next; filmButtons[next]?.click(); }
          filmRoom.style.setProperty('--film-exit', Math.max(0, (self.progress - .8) / .2).toFixed(4));
        } });
        cinematic.push(() => trigger.kill());
      }
    }
    measure();
  }
  configure();
  reduced.addEventListener('change', configure);
  fine.addEventListener('change', configure);

  function pointer(event) {
    if (!cursor || !fine.matches || reduced.matches || event.pointerType === 'touch') return;
    cursor.style.setProperty('--cx', `${event.clientX}px`);
    cursor.style.setProperty('--cy', `${event.clientY}px`);
    const target = event.target.closest('[data-cursor]');
    cursor.classList.toggle('active', Boolean(target));
    cursor.textContent = target?.dataset.cursor || '';
  }
  const leave = () => cursor?.classList.remove('active');
  document.addEventListener('pointermove', pointer, { passive: true });
  document.addEventListener('pointerleave', leave);
  document.querySelectorAll('[data-cursor="START"],.signal-button').forEach(el => {
    let bounds;
    const enter = () => { bounds = el.getBoundingClientRect(); };
    const move = event => {
      if (fine.matches && !reduced.matches && bounds && event.pointerType !== 'touch') {
        el.style.transform = `translate(${(event.clientX - bounds.left - bounds.width / 2) * .05}px,${(event.clientY - bounds.top - bounds.height / 2) * .07}px)`;
      }
    };
    const reset = () => { el.style.transform = ''; bounds = null; };
    el.addEventListener('pointerenter', enter); el.addEventListener('pointermove', move); el.addEventListener('pointerleave', reset);
    cleanups.push(() => { el.removeEventListener('pointerenter', enter); el.removeEventListener('pointermove', move); el.removeEventListener('pointerleave', reset); });
  });
  const refresh = () => { if (!disposed) { measure(); ScrollTrigger.refresh(); } };
  addEventListener('load', refresh, { once: true });
  document.fonts?.ready.then(refresh);
  return () => {
    disposed = true;
    cancelAnimationFrame(loop); cancelAnimationFrame(readFrame);
    lenis?.destroy(); cinematic.forEach(fn => fn()); cleanups.forEach(fn => fn());
    removeEventListener('scroll', scheduleRead); removeEventListener('resize', measure); removeEventListener('load', refresh);
    document.removeEventListener('visibilitychange', visibility);
    document.removeEventListener('pointermove', pointer); document.removeEventListener('pointerleave', leave);
    reduced.removeEventListener('change', configure); fine.removeEventListener('change', configure);
  };
}
