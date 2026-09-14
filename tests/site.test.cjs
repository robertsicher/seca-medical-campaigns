
'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),http=require('node:http');
const {chromium}=require('playwright');
const {default:AxeBuilder}=require('@axe-core/playwright');
const math=require('../assets/js/calculators.js');
const root=path.resolve(__dirname,'..'),prefix='/seca-medical-campaigns/';
function walk(dir){return fs.readdirSync(dir,{withFileTypes:true}).flatMap(e=>{if(e.name.startsWith('.')||['node_modules','test-results'].includes(e.name))return [];const full=path.join(dir,e.name);return e.isDirectory()?walk(full):[full];});}
const htmlFiles=walk(root).filter(x=>x.endsWith('/index.html'));
assert.equal(htmlFiles.length,21);
let refs=0;
for(const file of htmlFiles){
 const html=fs.readFileSync(file,'utf8');
 assert.equal((html.match(/<h1\b/g)||[]).length,1,file+' h1 count');
 const ids=[...html.matchAll(/\bid="([^"]+)"/g)].map(m=>m[1]);
 assert.equal(ids.length,new Set(ids).size,file+' duplicate IDs');
 assert.ok(html.includes('<meta name="description"')&&html.includes('og:title'));
 assert.ok(html.includes("connect-src 'none'")&&html.includes("form-action 'none'"));
 for(const m of html.matchAll(/\b(?:href|src)="([^"]+)"/g)){
  const value=m[1].replaceAll('&amp;','&');if(/^(https?:|data:|blob:|mailto:)/.test(value))continue;
  assert.ok(!value.startsWith('/'),file+' root-absolute '+value);
  const url=new URL(value,'http://localhost'+prefix+path.relative(root,file));
  assert.ok(url.pathname.startsWith(prefix),file+' escapes project path');
  let target=path.join(root,decodeURIComponent(url.pathname.slice(prefix.length)));
  if(url.pathname.endsWith('/'))target=path.join(target,'index.html');
  assert.ok(fs.existsSync(target),file+' missing '+value);
  if(url.hash)assert.ok(fs.readFileSync(target,'utf8').includes('id="'+url.hash.slice(1)+'"'),file+' fragment '+value);
  refs++;
 }
}
console.log('PASS 21 pages, metadata, unique IDs and '+refs+' internal references');
const cap={patients:2400,measurements:3,sites:2,days:240,devices:2};
assert.deepEqual(math.capacity(cap),{annual:7200,perSite:3600,perDay:30,perDevice:3600,perDeviceDay:15});
assert.equal(math.capacity({...cap,patients:0}).annual,0);
for(const x of [{days:0},{sites:-1},{devices:0},{patients:NaN},{patients:2.5},{days:367},{measurements:Infinity}])assert.equal(math.capacity({...cap,...x}),null);
const opp={assessments:100,locations:1,offered:50,uptake:40,value:75,followups:1,followupValue:0,investment:0};
assert.deepEqual(math.opportunity(opp),{enhanced:240,assessmentRevenue:18000,followupRevenue:0,combined:18000,payback:null});
assert.equal(math.opportunity({...opp,investment:18000}).payback,12);
assert.equal(math.opportunity({...opp,locations:3,followups:2,followupValue:25}).combined,90000);
assert.equal(math.opportunity({...opp,uptake:0,investment:15000}).payback,null);
assert.equal(math.opportunity({...opp,offered:0}).combined,0);
for(const x of [{uptake:101},{offered:-1},{locations:0},{investment:-1},{value:NaN},{assessments:2.2}])assert.equal(math.opportunity({...opp,...x}),null);
console.log('PASS calculation defaults, multi-site formulas, zero and invalid edge cases');
for(const name of ['config.js','calculators.js','site.js'])new Function(fs.readFileSync(path.join(root,'assets/js',name),'utf8'));
assert.ok(!/\b(?:fetch|XMLHttpRequest|sendBeacon|localStorage|sessionStorage)\s*[.(]/.test(fs.readFileSync(path.join(root,'assets/js/site.js'),'utf8')));
const types={'.html':'text/html; charset=utf-8','.css':'text/css','.js':'text/javascript','.jpg':'image/jpeg','.svg':'image/svg+xml'};
const server=http.createServer((req,res)=>{
 const pathname=new URL(req.url,'http://localhost').pathname;
 if(!pathname.startsWith(prefix)){res.writeHead(404);res.end('Not found');return;}
 let file=path.resolve(root,decodeURIComponent(pathname.slice(prefix.length))||'.');
 if(!file.startsWith(root+path.sep)&&file!==root){res.writeHead(403);res.end();return;}
 if(pathname.endsWith('/'))file=path.join(file,'index.html');
 if(!fs.existsSync(file)||!fs.statSync(file).isFile()){res.writeHead(404);res.end('Not found');return;}
 res.setHeader('Content-Type',types[path.extname(file)]||'application/octet-stream');res.end(fs.readFileSync(file));
});
(async()=>{
 await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
 const base='http://127.0.0.1:'+server.address().port+prefix;
 const browser=await chromium.launch({headless:true});
 const context=await browser.newContext({viewport:{width:1440,height:1000},acceptDownloads:true,reducedMotion:'reduce'});
 const page=await context.newPage(),errors=[],requests=[];
 page.on('pageerror',e=>errors.push(e.message));
 page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
 page.on('request',r=>requests.push({url:r.url(),method:r.method()}));
 fs.mkdirSync(path.join(root,'test-results'),{recursive:true});
 try{
  for(const file of htmlFiles){
   const relative=path.relative(root,file).replace(/index.html$/,'');
   await page.setViewportSize({width:1440,height:1000});
   assert.equal((await page.goto(base+relative,{waitUntil:'networkidle'})).status(),200);
   await page.evaluate(async()=>{for(const img of document.images)img.loading='eager';await Promise.all(Array.from(document.images).map(img=>img.decode()));});
   for(const width of [1440,768,390,320]){
    await page.setViewportSize({width,height:950});
    const overflow=await page.evaluate(()=>({doc:document.documentElement.scrollWidth,width:innerWidth,offenders:Array.from(document.querySelectorAll('main *,header *')).filter(el=>{const r=el.getBoundingClientRect();return r.width&&r.right>innerWidth+2;}).slice(0,8).map(el=>el.tagName+'.'+el.className)}));
    assert.ok(overflow.doc<=width+1,relative+' overflow at '+width+': '+JSON.stringify(overflow));
   }
   await page.setViewportSize({width:1440,height:1000});
   const axe=await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21a','wcag21aa','wcag22aa']).analyze();
   if(axe.violations.length)console.log('AXE '+relative+' '+JSON.stringify(axe.violations.map(v=>({id:v.id,impact:v.impact,nodes:v.nodes.map(n=>({target:n.target,summary:n.failureSummary}))}))));
   assert.equal(axe.violations.length,0,'Accessibility: '+relative);
   console.log('PASS '+relative+' at four widths, images, WCAG automated checks');
  }
  await page.goto(base+'pathway-efficiency/',{waitUntil:'networkidle'});
  await page.locator('#cap-patients').fill('1000');assert.equal(await page.locator('#cap-annual').textContent(),'3,000');
  await page.locator('#cap-days').fill('0');assert.equal(await page.locator('.calculation-error').isVisible(),true);
  await page.locator('[data-reset="capacity"]').click();assert.equal(await page.locator('#cap-annual').textContent(),'7,200');
  for(let i=0;i<5;i++){await page.locator('[data-pathway="'+i+'"]').click();assert.equal(await page.locator('#pathway-output .steps li').count(),6);assert.equal(await page.locator('[data-pathway="'+i+'"]').getAttribute('aria-pressed'),'true');}
  console.log('PASS five pathways and capacity interactions');
  await page.goto(base+'private-health/',{waitUntil:'networkidle'});
  await page.locator('#opp-investment').fill('18000');assert.equal(await page.locator('#opp-payback').textContent(),'12');
  await page.locator('#opp-uptake').fill('0');assert.equal(await page.locator('#opp-total').textContent(),'£0');assert.equal(await page.locator('#opp-payback').textContent(),'Not calculable');
  await page.locator('#opp-uptake').fill('101');assert.equal(await page.locator('.calculation-error').isVisible(),true);
  await page.locator('[data-reset="opportunity"]').click();assert.equal(await page.locator('#opp-total').textContent(),'£18,000');
  console.log('PASS commercial calculator interactions');
  await page.goto(base+'resources/',{waitUntil:'networkidle'});
  await page.locator('[data-filter="NHS"]').click();assert.equal(await page.locator('.resource-card:visible').count(),3);
  await page.locator('#resource-search').fill('no-such-result');assert.equal(await page.locator('#no-resources').isVisible(),true);
  await page.locator('#resource-search').fill('');await page.locator('[data-filter="All"]').click();assert.equal(await page.locator('.resource-card:visible').count(),14);
  console.log('PASS combined library search and filters');
  await page.goto(base+'resources/beyond-weight-loss/',{waitUntil:'networkidle'});
  await page.locator('[data-download-guide]').click();assert.equal(await page.locator('dialog').isVisible(),true);
  const modalAxe=await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa']).analyze();
  assert.equal(modalAxe.violations.length,0,'Modal accessibility');
  const before=requests.length;
  for(const [id,value] of Object.entries({'first-name':'Example','last-name':'Person','work-email':'test@example.org','organisation':'Example Healthcare'}))await page.locator('#'+id).fill(value);
  await page.locator('#clinical-area').selectOption('Weight management');
  await page.locator('#enquiry-form button[type="submit"]').click();assert.equal(await page.locator('#enquiry-success').isVisible(),true);
  assert.equal(requests.length,before,'Form made a network request');
  assert.equal(await page.evaluate(()=>localStorage.length+sessionStorage.length),0);
  const downloadPromise=page.waitForEvent('download');await page.locator('#resource-next').click();const download=await downloadPromise;
  assert.equal(download.suggestedFilename(),'beyond-weight-loss.html');
  const downloaded=fs.readFileSync(await download.path(),'utf8');
  assert.ok(downloaded.includes('Why bodyweight tells only part of the story')&&downloaded.includes('<style>')&&!downloaded.includes('<script'));
  await page.locator('[data-profile-next]').click();assert.equal(await page.locator('.later-fields').isVisible(),true);assert.equal(await page.locator('.initial-fields').isVisible(),false);
  await page.keyboard.press('Escape');assert.equal(await page.locator('dialog').isVisible(),false);
  console.log('PASS no-transmission forms, progressive profiling and real printable download');
  await page.goto(base,{waitUntil:'networkidle'});await page.setViewportSize({width:390,height:844});
  assert.equal(await page.locator('#primary-navigation').isVisible(),false);
  await page.locator('.menu-toggle').click();assert.equal(await page.locator('#primary-navigation').isVisible(),true);
  await page.keyboard.press('Escape');assert.equal(await page.locator('#primary-navigation').isVisible(),false);
  console.log('PASS keyboard-friendly mobile navigation');
  await page.setViewportSize({width:1440,height:1000});
  await page.screenshot({path:path.join(root,'test-results/home-desktop.jpg'),type:'jpeg',quality:70,fullPage:true});
  await page.screenshot({path:path.join(root,'test-results/home-hero.jpg'),type:'jpeg',quality:65});
  await page.setViewportSize({width:390,height:844});
  await page.screenshot({path:path.join(root,'test-results/home-mobile.jpg'),type:'jpeg',quality:70,fullPage:true});
  for(const name of ['weight-management','pathway-efficiency','private-health','resources','campaign-strategy']){
   await page.setViewportSize({width:1440,height:1000});await page.goto(base+name+'/',{waitUntil:'networkidle'});
   await page.screenshot({path:path.join(root,'test-results/'+name+'.jpg'),type:'jpeg',quality:60,fullPage:true});
  }
  const nojs=await browser.newContext({javaScriptEnabled:false,viewport:{width:390,height:844}});
  const nojsPage=await nojs.newPage();await nojsPage.goto(base+'resources/beyond-weight-loss/');
  assert.equal(await nojsPage.locator('h1').textContent(),'Beyond Weight Loss');assert.equal(await nojsPage.locator('.article-body section').count(),10);assert.equal(await nojsPage.locator('button[type="submit"]').isDisabled(),true);await nojs.close();
  assert.deepEqual(errors,[],'Console or script errors');assert.ok(requests.every(r=>r.method==='GET'));
  fs.writeFileSync(path.join(root,'test-results/report.json'),JSON.stringify({status:'passed',pages:21,viewports:[1440,768,390,320],internalReferences:refs,consoleErrors:errors,guideDownload:true,formRequests:0},null,2));
  console.log('ALL CHECKS PASSED');
  console.log('HERO_IMAGE_BASE64 '+fs.readFileSync(path.join(root,'test-results/home-hero.jpg')).toString('base64'));
 }catch(error){await page.screenshot({path:path.join(root,'test-results/failure.jpg'),type:'jpeg',quality:65,fullPage:true}).catch(()=>{});throw error;}
 finally{await browser.close();server.close();}
})().catch(e=>{console.error(e);server.close();process.exitCode=1;});
