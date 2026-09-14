'use strict';
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const base = 'https://robertsicher.github.io/seca-medical-campaigns/';
const roots = ['index.html','weight-management','pathway-efficiency','patient-engagement','private-health','clinical-applications','nhs-pilot','resources','campaign-strategy','assets'];
function files(p) { return fs.statSync(p).isDirectory() ? fs.readdirSync(p).flatMap(n=>files(path.posix.join(p,n))) : /\.(html|css|js|svg|jpg|png|webp)$/.test(p) ? [p] : []; }
function hash(b) { return crypto.createHash('sha256').update(b).digest('hex'); }
async function check(p) {
  const url = new URL(p === 'index.html' ? './' : p.replace(/index\.html$/, ''), base);
  for (let attempt=1;attempt<=4;attempt++) {
    try {
      const response=await fetch(url,{signal:AbortSignal.timeout(30000),cache:'no-store'});
      assert.equal(response.status,200,'HTTP '+response.status);
      const body=Buffer.from(await response.arrayBuffer());
      assert.equal(hash(body),hash(fs.readFileSync(p)),'Published content differs from repository');
      console.log('PASS '+url.pathname+' ('+body.length+' bytes)');
      return;
    } catch(error) {
      if(attempt===4) throw new Error(p+': '+error.message);
      await new Promise(resolve=>setTimeout(resolve,10000));
    }
  }
}
(async()=>{
  const targets=roots.flatMap(files);
  for(let i=0;i<targets.length;i+=5) await Promise.all(targets.slice(i,i+5).map(check));
  console.log('LIVE CHECK PASSED: '+targets.length+' pages/assets match the repository at the GitHub Pages project path.');
})().catch(error=>{console.error(error);process.exitCode=1;});
