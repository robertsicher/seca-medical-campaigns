
/* Pure, testable scenario calculations. No patient data. No pricing defaults. */
(function(root) {
  'use strict';
  function check(value, min, max, integer) {
    return typeof value === 'number' && Number.isFinite(value) && value >= min && value <= max && (!integer || Number.isInteger(value));
  }
  function capacity(x) {
    if (!check(x.patients,0,10000000,true) || !check(x.measurements,1,100,true) || !check(x.sites,1,10000,true) || !check(x.days,1,366,true) || !check(x.devices,1,10000,true)) return null;
    const annual = x.patients * x.measurements;
    return {annual, perSite:annual/x.sites, perDay:annual/x.days, perDevice:annual/x.devices, perDeviceDay:annual/x.devices/x.days};
  }
  function opportunity(x) {
    if (!check(x.assessments,0,1000000,true) || !check(x.locations,1,10000,true) || !check(x.offered,0,100,false) || !check(x.uptake,0,100,false) || !check(x.value,0,100000,false) || !check(x.followups,0,100,false) || !check(x.followupValue,0,100000,false) || !check(x.investment,0,100000000,false)) return null;
    const enhanced = x.assessments * 12 * x.locations * x.offered/100 * x.uptake/100;
    const assessmentRevenue = enhanced*x.value;
    const followupRevenue = enhanced*x.followups*x.followupValue;
    const combined = assessmentRevenue+followupRevenue;
    const payback = x.investment>0 && combined>0 ? x.investment/combined*12 : null;
    return {enhanced,assessmentRevenue,followupRevenue,combined,payback};
  }
  const api = Object.freeze({capacity,opportunity});
  root.BeyondWeightMath = api;
  if (typeof module!=='undefined' && module.exports) module.exports=api;
})(typeof globalThis!=='undefined'?globalThis:this);
