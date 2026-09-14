
(function() {
'use strict';
document.documentElement.classList.add('js');
const q=(selector,scope=document)=>scope.querySelector(selector);
const qa=(selector,scope=document)=>Array.from(scope.querySelectorAll(selector));
const config=window.BeyondWeightConfig;
const root=document.body.dataset.root;
const nav=q('#primary-navigation'), toggle=q('.menu-toggle');
if(toggle&&nav){
  const closeMenu=()=>{nav.classList.remove('is-open');toggle.setAttribute('aria-expanded','false');};
  toggle.addEventListener('click',()=>{const open=toggle.getAttribute('aria-expanded')!=='true';toggle.setAttribute('aria-expanded',String(open));nav.classList.toggle('is-open',open);});
  document.addEventListener('keydown',e=>{if(e.key==='Escape'&&nav.classList.contains('is-open')){closeMenu();toggle.focus();}});
  document.addEventListener('click',e=>{if(!e.target.closest('.site-header'))closeMenu();});
  qa('a',nav).forEach(a=>a.addEventListener('click',closeMenu));
}
qa('[data-official]').forEach(a=>{const url=config.official[a.dataset.official];if(url)a.href=url;});

/* Events stay in the page as a non-PII interface for future integration.
   There is no dataLayer push, network call, cookie or storage write. */
const emit=(name,detail={})=>document.dispatchEvent(new CustomEvent('beyondweight:'+name,{detail:{page:document.body.dataset.page,...detail}}));

const dialog=q('.enquiry-dialog');
const form=q('#enquiry-form');
const success=q('#enquiry-success');
let opener=null, nextResource='', downloading=false, hasProfileDemo=false, downloadURL='';
function clearForm(){
  form.reset();
  form.hidden=false;
  success.hidden=true;
}
function setProfile(later){
  const initial=q('.initial-fields',form), extra=q('.later-fields',form);
  initial.hidden=later;extra.hidden=!later;
  qa('input,select',initial).forEach(el=>el.disabled=later);
  qa('input,select',extra).forEach(el=>el.disabled=!later);
}
const enquiryCopy={
  demo:['Explore a clinical demonstration','Start with the question your clinical team wants to answer.'],
  pathway:['Discuss your pathway','Consider the right touchpoint and what a pilot would need to establish.'],
  pilot:['Discuss a clinical pilot','Frame a proportionate evaluation for your service.'],
  deployment:['Plan deployment','Explore your assessment proposition and practical implementation.'],
  resource:['Keep a useful clinical resource','Read online now, or use this simulated form to preview a resource conversion.']
};
function showEnquiry(kind,resource='',download=false,trigger=null){
  opener=trigger||document.activeElement;nextResource=resource;downloading=download;
  clearForm();setProfile(hasProfileDemo);
  const copy=enquiryCopy[kind]||enquiryCopy.demo;
  q('#enquiry-title').textContent=hasProfileDemo?'Add context for the next conversation':copy[0];
  q('#enquiry-description').textContent=hasProfileDemo?'Preview how a later conversion can ask different questions. Fictional details only.':copy[1];
  form.dataset.kind=kind;
  if(!dialog.open)dialog.showModal();
  const first=qa('input,select',form).find(el=>!el.disabled);
  if(first)first.focus();
}
qa('[data-enquiry]').forEach(b=>b.addEventListener('click',()=>showEnquiry(b.dataset.enquiry,b.dataset.resource||'',false,b)));
qa('[data-download-guide]').forEach(b=>b.addEventListener('click',()=>showEnquiry('resource','',true,b)));
q('.dialog-close').addEventListener('click',()=>dialog.close());
dialog.addEventListener('click',e=>{if(e.target===dialog){const r=dialog.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)dialog.close();}});
dialog.addEventListener('close',()=>{document.body.classList.remove('modal-open');form.reset();if(opener)opener.focus();});
dialog.addEventListener('cancel',()=>{document.body.classList.remove('modal-open');});
new MutationObserver(()=>document.body.classList.toggle('modal-open',dialog.open)).observe(dialog,{attributes:true,attributeFilter:['open']});
q('[type=submit]',form).disabled=false;
form.addEventListener('submit',e=>{
  e.preventDefault();
  if(!form.reportValidity())return;
  /* Deliberately do not read, serialise or persist any field values. */
  const kind=form.dataset.kind;
  form.reset();form.hidden=true;success.hidden=false;hasProfileDemo=true;
  const next=q('#resource-next');
  next.hidden=!(downloading||nextResource);
  next.removeAttribute('download');
  if(downloading){
    if(downloadURL)URL.revokeObjectURL(downloadURL);
    const result=downloadGuide();
    downloadURL=result.url;next.href=result.url;next.download=result.filename;next.textContent='Download your printable guide ↗';
  }else if(nextResource){next.href=nextResource;next.textContent='Open your resource ↗';}
  success.focus();
  emit('simulated-conversion',{kind});
});
q('[data-profile-next]').addEventListener('click',()=>showEnquiry('demo','',false,opener));
function downloadGuide(){
  const article=q('.article-body').cloneNode(true);
  const refs=q('.sources').cloneNode(true);
  [article,refs].forEach(part=>qa('a',part).forEach(a=>a.setAttribute('href',a.href)));
  const title=q('h1').textContent;
  const subtitle=q('.hero .lead').textContent;
  const safe=s=>s.replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
  const html='<!doctype html><html lang="en-GB"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>'+safe(title)+'</title><style>@page{size:A4;margin:20mm}*{box-sizing:border-box}body{max-width:800px;margin:50px auto;padding:0 25px;font:17px/1.75 Arial,sans-serif;color:#252725}header{border-top:6px solid #c8102e;padding-top:24px;margin-bottom:50px}header p:first-child{font-size:11px;letter-spacing:.15em;color:#c8102e;font-weight:bold}h1{font-size:48px;line-height:1.08;letter-spacing:-.05em;font-weight:500}h2{font-size:27px;line-height:1.25;font-weight:500;letter-spacing:-.03em}section{margin-bottom:36px;border-top:1px solid #ddd;padding-top:25px;break-inside:avoid}a{color:#9d0a23;overflow-wrap:anywhere}.section-num{font-size:12px;color:#c8102e}.citation,.small{font-size:12px}.sources{font-size:13px}footer{border-top:1px solid #ccc;padding-top:20px;font-size:11px}.text-link{font-size:14px}@media print{body{margin:0;padding:0;font-size:11pt}h1{font-size:32pt}h2{font-size:20pt}}</style></head><body><header><p>BEYOND WEIGHT · CLINICAL RESOURCE</p><h1>'+safe(title)+'</h1><p>'+safe(subtitle)+'</p><p>14 September 2026 · seca UK campaign concept</p></header>'+article.outerHTML+refs.outerHTML+'<footer>Concept campaign prototype created for interview discussion. Not an official seca website. Clinical and product information should be verified against current seca documentation before publication. Educational material for healthcare professionals, not individual clinical advice.</footer></body></html>';
  return {url:URL.createObjectURL(new Blob([html],{type:'text/html;charset=utf-8'})),filename:title.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/-$/,'')+'.html'};
}
qa('[data-print]').forEach(b=>b.addEventListener('click',()=>window.print()));

const library=q('#resource-search');
if(library){
 let filter='All';
 const entries=qa('.resource-card');
 function updateLibrary(){
  const term=library.value.toLowerCase().trim();
  let count=0;
  entries.forEach(card=>{const visible=(filter==='All'||card.dataset.tags.split('|').includes(filter))&&card.textContent.toLowerCase().includes(term);card.hidden=!visible;if(visible)count++;});
  q('#resource-count').textContent=count+' resource'+(count===1?'':'s');
  q('#no-resources').hidden=count!==0;
 }
 qa('[data-filter]').forEach(b=>b.addEventListener('click',()=>{filter=b.dataset.filter;qa('[data-filter]').forEach(btn=>btn.setAttribute('aria-pressed',String(btn===b)));updateLibrary();}));
 library.addEventListener('input',updateLibrary);
}

const pathways=[
 {name:'Weight management',intro:'Consider measurement within an existing treatment review, before the clinician discusses progress.',review:'Interpret with treatment, nutrition and clinical context.',question:'Agree whether the added information is useful within the existing review.'},
 {name:'Nutrition',intro:'Consider a suitable measurement before a planned dietetic or nutritional review.',review:'Combine with intake, symptoms, screening and the clinical assessment.',question:'Check fluid-related context and avoid treating a reading as a nutritional diagnosis.'},
 {name:'Private health assessment',intro:'Consider measurement as an additional, explained part of an existing health assessment.',review:'Review selected parameters alongside the appropriate clinical tests.',question:'Explain eligibility, optional charges and what any repeat measurement would add.'},
 {name:'Healthy ageing',intro:'Consider body composition alongside a broader assessment of strength and function.',review:'Interpret muscle quantity alongside strength, function and clinical history.',question:'Confirm safe standing, accessibility and suitability; body composition alone does not diagnose sarcopenia.'},
 {name:'Rehabilitation',intro:'Consider measurement at a clinically relevant rehabilitation review when a standing device is suitable.',review:'Review with symptoms, function and the rehabilitation plan.',question:'Do not equate changes in muscle estimates with functional recovery.'}
];
qa('[data-pathway]').forEach(b=>b.addEventListener('click',()=>{
 const i=Number(b.dataset.pathway),p=pathways[i];
 qa('[data-pathway]').forEach(btn=>btn.setAttribute('aria-pressed',String(btn===b)));
 const stages=[
 ['Patient appointment','Confirm eligibility and the purpose of measurement.'],
 ['mBCA Alpha measurement','Allow time for preparation, assistance and measurement.'],
 ['Results available','Check the result and access the relevant parameters.'],
 ['Clinician review',p.review],
 ['Patient conversation','Explain the findings and agree the next step.'],
 ['Follow-up measurement','Repeat where relevant, under comparable conditions.']
 ];
 q('#pathway-output').innerHTML='<h3>'+p.name+'</h3><p>'+p.intro+'</p><ol class="steps">'+stages.map((s,n)=>'<li><span class="step-number">0'+(n+1)+'</span><div><h3>'+s[0]+'</h3><p>'+s[1]+'</p></div></li>').join('')+'</ol><p class="notice-inline">'+p.question+'</p>';
 emit('pathway-selected',{pathway:p.name});
}));

const nf=new Intl.NumberFormat('en-GB',{maximumFractionDigits:1});
const money=new Intl.NumberFormat('en-GB',{style:'currency',currency:'GBP',maximumFractionDigits:0});
const bindings={
 capacity:{patients:'cap-patients',measurements:'cap-measurements',sites:'cap-sites',days:'cap-days',devices:'cap-devices'},
 opportunity:{assessments:'opp-assessments',locations:'opp-locations',offered:'opp-offered',uptake:'opp-uptake',value:'opp-value',followups:'opp-followups',followupValue:'opp-followup-value',investment:'opp-investment'}
};
function renderCalculator(el){
 const kind=el.dataset.calculator;
 const input={};let valid=true;
 Object.entries(bindings[kind]).forEach(([name,id])=>{
   const node=q('#'+id);
   const optional=kind==='opportunity'&&(name==='investment'||name==='followupValue');
   const value=node.value.trim();
   input[name]=value===''?(optional?0:NaN):Number(value);
   if(!node.validity.valid||(!optional&&value===''))valid=false;
 });
 const result=valid?window.BeyondWeightMath[kind](input):null;
 const error=q('.calculation-error',el);
 error.hidden=Boolean(result);
 if(!result){
  error.textContent='Enter valid values within the limits shown. Patient, location, device and working-day counts must be whole numbers; percentages must be 0–100.';
  qa('output',el).forEach(out=>out.textContent='-');
  return;
 }
 const set=(id,value)=>q('#'+id).textContent=value;
 if(kind==='capacity'){
  set('cap-annual',nf.format(result.annual));set('cap-site',nf.format(result.perSite));set('cap-day',nf.format(result.perDay));set('cap-device',nf.format(result.perDevice));set('cap-device-day',nf.format(result.perDeviceDay));
 }else{
  set('opp-total',money.format(result.combined));set('opp-enhanced',nf.format(result.enhanced));set('opp-assessment-revenue',money.format(result.assessmentRevenue));set('opp-followup-revenue',money.format(result.followupRevenue));
  set('opp-payback',input.investment===0?'Not entered':result.payback===null?'Not calculable':result.payback<.1?'<0.1':nf.format(result.payback));
 }
}
qa('[data-calculator]').forEach(el=>{
 const kind=el.dataset.calculator;
 qa('input',el).forEach(input=>input.addEventListener('input',()=>renderCalculator(el)));
 q('[data-reset]',el).addEventListener('click',()=>{Object.entries(bindings[kind]).forEach(([name,id])=>q('#'+id).value=config.defaults[kind][name]);renderCalculator(el);});
 renderCalculator(el);
});
})();
