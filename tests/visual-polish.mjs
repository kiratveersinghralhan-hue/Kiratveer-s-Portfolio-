import { chromium } from 'playwright';
import { mkdir, writeFile } from 'node:fs/promises';
const browser=await chromium.launch({channel:'chrome',headless:true});
const output='test-results/master-polish';await mkdir(output,{recursive:true});
const results=[];
const baseURL=process.env.TEST_BASE_URL||'http://127.0.0.1:5173';
const sizes=process.env.POLISH_ALL?[[320,568],[360,800],[375,812],[390,844],[430,932],[768,1024],[820,1180],[1024,768],[1366,768],[1440,900],[1536,864],[1920,1080],[2560,1440]]:[[1440,900],[390,844],[768,1024]];
for(const theme of ['night','day']){
 for(const [width,height] of sizes){
  const context=await browser.newContext({viewport:{width,height},colorScheme:theme==='day'?'light':'dark',hasTouch:width<1100});
  await context.addInitScript(()=>sessionStorage.setItem('kirat-entry-seen','1'));
  const page=await context.newPage();
  page.on('pageerror',e=>results.push({error:e.message}));
  await page.goto(baseURL+'/',{waitUntil:'networkidle'});
  await page.waitForTimeout(800);
  for(const [label,selector] of [['hero',null],['qortra','#project-qortra'],['tripmitra','#project-tripmitra'],['film','#motion'],['practice','#capabilities'],['process','#process'],['pricing','#pricing'],['about','#about'],['contact','#contact'],['footer','.site-footer']]){
   if(![1440,390,768].includes(width)&&!['hero','qortra','pricing'].includes(label))continue;
   if(selector)await page.evaluate(s=>{const e=document.querySelector(s);window.scrollTo({top:e.getBoundingClientRect().top+scrollY,behavior:'instant'})},selector);
   else await page.evaluate(()=>scrollTo({top:0,behavior:'instant'}));
   await page.waitForTimeout(250);
   await page.screenshot({path:`${output}/${theme}-${width}-${label}.png`});
   results.push({theme,width,label,info:await page.evaluate(()=>({overflow:document.documentElement.scrollWidth-innerWidth,book:document.querySelector('#book-scene')?.dataset.bookMode,theme:document.documentElement.dataset.theme}))});
  }
  for(const path of ([1440,390,768].includes(width)?['start-project/','thank-you/','work/qortra.html']:[])){
   await page.goto(`${baseURL}/${path}`,{waitUntil:'networkidle'});
   await page.screenshot({path:`${output}/${theme}-${width}-${path.replaceAll('/','-')}.png`});
  }
  await context.close();
 }
}
await writeFile(`${output}/report.json`,JSON.stringify(results,null,2));await browser.close();console.log(JSON.stringify(results.filter(x=>x.error||x.info?.overflow>1)));
