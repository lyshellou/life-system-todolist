const api = {
  base: "/api",
  async get(path) { const r = await fetch(this.base + path); return r.json(); },
  async post(path, body) { const r = await fetch(this.base + path, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }); return r.json(); },
  async put(path, body) { const r = await fetch(this.base + path, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }); return r.json(); },
  async del(path) { const r = await fetch(this.base + path, { method: "DELETE" }); return r.json(); },
  async patch(path, body) { const r = await fetch(this.base + path, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }); return r.json(); },
};
const ESC = (s) => { const d = document.createElement("div"); d.textContent = s||""; return d.innerHTML; };
const FMT = (s) => s ? new Date(s).toLocaleDateString("zh-CN",{month:"short",day:"numeric"}) : "";
const DIM_C = { "dim-health":{bg:"#EDF3EC",c:"#346538"}, "dim-work":{bg:"#E1F3FE",c:"#1F6C9F"}, "dim-study":{bg:"#EBE5FA",c:"#5B3E9F"}, "dim-social":{bg:"#FDF3DB",c:"#956400"}, "dim-fun":{bg:"#FDEBEC",c:"#9F2F2D"} };
const ICONS = {
  heart: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0016.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 002 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg>`,
  briefcase: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 21V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v16"/></svg>`,
  book: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 19.5A2.5 2.5 0 016.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z"/></svg>`,
  usersThree: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="9" cy="7" r="4"/><path d="M5 21v-2a4 4 0 014-4h0a4 4 0 014 4v2"/><path d="M17 11.5a4 4 0 013 6.5"/><circle cx="19" cy="5" r="2"/></svg>`,
  gameController: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="6" y1="12" x2="10" y2="12"/><line x1="8" y1="10" x2="8" y2="14"/><line x1="15" y1="13" x2="15.01" y2="13"/><line x1="18" y1="11" x2="18.01" y2="11"/><rect x="2" y="6" width="20" height="12" rx="2"/></svg>`,
};
const ACH_ICONS = { flag:"1st", rocket:"10x", crown:"100x", fire:"7d", lightning:"30d", target:"Goal", star:"Star", medal:"Mstone", circlesFour:"All", zap:"Day" };
const PRI_LABELS = { high:"高", medium:"中", low:"低" };
const BUCK_LABELS = { today:"今天", anytime:"随时", someday:"某天" };
const BUCK_ICONS = { today:"[今日]", anytime:"[随时]", someday:"[将来]" };
function toast(msg, type) { const c=document.getElementById("toastContainer"); const t=document.createElement("div"); t.className="toast "+(type||"success"); t.textContent=msg; c.appendChild(t); setTimeout(()=>t.remove(),2500); }
function getDim(id) { return DIM_C[id]||{bg:"#F0EFED",c:"#666"}; }
function getIcon(n) { return ICONS[n]||""; }
