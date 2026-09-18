import { chromium } from 'playwright';
import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';
const baseURL=process.env.TEST_BASE_URL||'http://127.0.0.1:5173';
const output='test-results/master-polish'; await mkdir(output,{recursive:true});
const browser=await chromium.launch({channel:'chrome',headless:true});
const results=[], errors=[];
async function context(options={}){
 const ctx=await browser.newContext({baseURL,viewport:{width:1440,height:900},colorScheme:'dark',...options});
 await ctx.route('https://formspree.io/**',r=>r.abort());
 ctx.on('page',p=>p.on('pageerror',e=>errors.push(e.message)));
 return ctx;
}
async function open(page,path='/'){
 await page.goto(path,{waitUntil:'networkidle'});
 const skip=page.locator('.entry-sequence button'); if(await skip.isVisible())await skip.click();
}
async function check(name,fn){try{await fn();results.push({name,passed:true});console.log('PASS '+name)}catch(e){results.push({name,passed:false,error:e.message});console.error('FAIL '+name+': '+e.message)}}
try{
 await check('System theme follows first visit; explicit keyboard choice persists on every route',async()=>{
  const ctx=await context({colorScheme:'light'});try{
   const p=await ctx.newPage();await open(p);
   const html=await (await p.request.get('/')).text();
   assert(html.indexOf('function initializeTheme')<html.indexOf('rel="stylesheet"'), 'Theme must initialize before blocking stylesheets');
   assert.equal(await p.locator('html').getAttribute('data-theme'),'day');
   const button=p.locator('[data-theme-toggle]');await button.focus();await p.keyboard.press('Enter');
   assert.equal(await button.getAttribute('aria-label'),'Switch to day mode');
   assert.equal(await p.evaluate(()=>localStorage.getItem('kirat-theme')),'night');
   for(const path of ['/start-project/','/thank-you/','/thanks.html','/work/qortra.html','/work/tripmitra.html']){
    await open(p,path);assert.equal(await p.locator('html').getAttribute('data-theme'),'night');
    assert.equal(await p.locator('meta[name="theme-color"]').getAttribute('content'),'#08090B');
   }
   await p.emulateMedia({colorScheme:'light'});assert.equal(await p.locator('html').getAttribute('data-theme'),'night');
  }finally{await ctx.close()}
 });
 await check('System changes remain live until a preference is chosen, and propagate across tabs',async()=>{
  const ctx=await context();try{
   const p=await ctx.newPage();await open(p);await p.emulateMedia({colorScheme:'light'});
   await p.waitForFunction(()=>document.documentElement.dataset.theme==='day');
   const second=await ctx.newPage();await open(second,'/start-project/');
   await second.emulateMedia({colorScheme:'light'});
   await second.waitForFunction(()=>document.documentElement.dataset.theme==='day');
   await p.locator('[data-theme-toggle]').click();
   await second.waitForFunction(()=>document.documentElement.dataset.theme==='night');
  }finally{await ctx.close()}
 });
 await check('Blocked storage preserves usable theme controls and correct initial system palette',async()=>{
  const ctx=await context({colorScheme:'light'});try{
   await ctx.addInitScript(()=>{Storage.prototype.getItem=()=>{throw new Error('QA blocked storage')};Storage.prototype.setItem=()=>{throw new Error('QA blocked storage')}});
   const p=await ctx.newPage();await open(p);assert.equal(await p.locator('html').getAttribute('data-theme'),'day');
   await p.locator('[data-theme-toggle]').click();assert.equal(await p.locator('html').getAttribute('data-theme'),'night');
   await open(p,'/start-project/');assert(await p.locator('#project-enquiry').isVisible());
  }finally{await ctx.close()}
 });
 await check('Theme tokens retain readable text and accent contrast in both palettes',async()=>{
  const ctx=await context();try{
   const p=await ctx.newPage();await open(p);
   for(const theme of ['night','day']){
    if(await p.locator('html').getAttribute('data-theme')!==theme)await p.locator('[data-theme-toggle]').click();
    const ratios=await p.evaluate(()=>{
     const c=getComputedStyle(document.documentElement);
     const lum=key=>{const value=c.getPropertyValue(key).trim().slice(1);const channels=[0,2,4].map(i=>parseInt(value.slice(i,i+2),16)/255).map(v=>v<=.04045?v/12.92:((v+.055)/1.055)**2.4);return channels[0]*.2126+channels[1]*.7152+channels[2]*.0722};
     const pairs=[];for(const text of ['--text-primary','--text-secondary','--text-muted','--accent-primary'])for(const bg of ['--bg-primary','--bg-secondary','--surface']){const a=lum(text),b=lum(bg);pairs.push({text,bg,ratio:(Math.max(a,b)+.05)/(Math.min(a,b)+.05)})}return pairs;
    });
    assert(ratios.every(r=>r.ratio>=4.5),JSON.stringify({theme,failed:ratios.filter(r=>r.ratio<4.5)}));
   }
  }finally{await ctx.close()}
 });
 await check('Theme changes reuse the desktop canvas; idle and offscreen WebGL stop rendering',async()=>{
  const ctx=await context();try{
   await ctx.addInitScript(()=>{window.qaDraws=0;for(const name of ['drawElements','drawArrays']){const original=WebGL2RenderingContext.prototype[name];WebGL2RenderingContext.prototype[name]=function(...args){window.qaDraws++;return original.apply(this,args)}}});
   const p=await ctx.newPage();await open(p);await p.waitForSelector('.book-ready canvas');
   await p.evaluate(()=>{window.qaCanvas=document.querySelector('.book-stage canvas')});
   await p.waitForTimeout(600);const idle=await p.evaluate(()=>window.qaDraws);await p.waitForTimeout(450);assert.equal(await p.evaluate(()=>window.qaDraws),idle);
   await p.locator('[data-theme-toggle]').click();await p.waitForTimeout(700);
   assert(await p.evaluate(()=>window.qaCanvas===document.querySelector('.book-stage canvas')));
   assert(await p.evaluate(n=>window.qaDraws>n,idle));
   await p.locator('#pricing').scrollIntoViewIfNeeded();await p.waitForTimeout(400);
   const away=await p.evaluate(()=>window.qaDraws);await p.locator('[data-theme-toggle]').click();await p.waitForTimeout(700);
   assert.equal(await p.evaluate(()=>window.qaDraws),away);
   await p.evaluate(()=>scrollTo({top:0,behavior:'instant'}));await p.waitForTimeout(400);
   await p.emulateMedia({reducedMotion:'reduce'});await p.waitForFunction(()=>document.querySelector('#book-scene').dataset.bookMode==='magazine');
   assert.equal(await p.locator('.book-stage canvas').count(),0);
   assert(await p.locator('.book-fallback').isVisible());
  }finally{await ctx.close()}
 });
 await check('Book choreography and theme-aware materials: actual scroll frames',async()=>{
  const ctx=await context();try{
   const p=await ctx.newPage();await open(p);await p.waitForSelector('.book-ready canvas');
   for(const theme of ['night','day']){
    if(await p.locator('html').getAttribute('data-theme')!==theme)await p.locator('[data-theme-toggle]').click();
    for(const progress of [0,.12,.28,.45,.60,.68,.73,.78,.84,.9,.96]){
     await p.evaluate(v=>{const e=document.querySelector('#book-scene');scrollTo({top:e.offsetTop+v*(e.offsetHeight-innerHeight),behavior:'instant'})},progress);
     await p.waitForTimeout(150);await p.screenshot({path:`${output}/${theme}-book-${progress}.png`});
     assert.equal(await p.locator('#book-scene').getAttribute('data-book-diagnostic'),'active');
    }
   }
  }finally{await ctx.close()}
 });
 await check('Intro identity, words, monogram and curtain remain layered above navigation',async()=>{
  const ctx=await context();try{
   const p=await ctx.newPage();await p.goto('/?intro=replay',{waitUntil:'domcontentloaded'});
   await p.waitForSelector('.entry-sequence.play-entry');
   await p.evaluate(()=>document.querySelector('.entry-sequence').getAnimations({subtree:true}).forEach(a=>a.pause()));
   for(const time of [450,1000,1800,2300]){
    await p.evaluate(t=>document.querySelector('.entry-sequence').getAnimations({subtree:true}).forEach(a=>a.currentTime=t),time);
    await p.screenshot({path:`${output}/intro-${time}.png`});
   }
   assert.equal(await p.locator('.entry-sequence').evaluate(e=>getComputedStyle(e).zIndex),'1600');
  }finally{await ctx.close()}
 });
 await check('No uncaught theme/browser errors',async()=>assert.deepEqual(errors,[]));
}finally{await browser.close();await writeFile(`${output}/theme-results.json`,JSON.stringify({results,errors},null,2))}
if(results.some(r=>!r.passed))process.exitCode=1;
