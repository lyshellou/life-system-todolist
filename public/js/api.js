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

// SVG path dictionary (Lucide-style, stroke-width=2)
const P = {
  sun: `<circle cx="12" cy="12" r="5"/><g stroke-linecap="round"><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></g>`,
  layers: `<polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 12 12 17 22 12"/><polyline points="2 17 12 22 22 17"/>`,
  archive: `<rect x="2" y="3" width="20" height="4" rx="1"/><path d="M4 7v11a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7"/><path d="M8 12h8"/>`,
  flag: `<path d="M4 15V3h12l-2 5.5L16 15H4z"/><path d="M4 21V15"/>`,
  rocket: `<path d="M12 2s-4.5 4.5-4.5 9.5c0 3 2 5.5 4.5 5.5s4.5-2.5 4.5-5.5S12 2 12 2z"/><circle cx="12" cy="11" r="2"/><path d="M8 16l-2 4h12l-2-4"/>`,
  crown: `<path d="M2 19h20L19 7l-7 5-7-5L2 19z"/><path d="M6 19v-3"/><path d="M18 19v-3"/>`,
  fire: `<path d="M12 10c-2-1-3-3-1-5 2 2 3 4 1 5z"/><path d="M8 14c-2-1-2-3 0-4 2 1 2 3 0 4z"/><path d="M12 18c-3-1-4-4-2-6 2 2 4 4 2 6z"/>`,
  lightning: `<polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>`,
  target: `<circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/>`,
  star: `<polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>`,
  medal: `<circle cx="12" cy="8" r="6"/><path d="M8.21 13.89L7 23l5-3 5 3-1.21-9.11"/>`,
  circlesFour: `<circle cx="5" cy="5" r="2.5"/><circle cx="19" cy="5" r="2.5"/><circle cx="5" cy="19" r="2.5"/><circle cx="19" cy="19" r="2.5"/>`,
  zap: `<polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>`,
  pencil: `<path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"/>`,
  trash: `<polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>`,
  check: `<polyline points="20 6 9 17 4 12"/>`,
  undo: `<polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"/>`,
  plus: `<line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>`,
  back: `<polyline points="15 18 9 12 15 6"/>`,
  calendar: `<rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>`,
  lock: `<rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>`,
  inbox: `<polyline points="22 12 16 12 14 15 10 15 8 12 2 12"/><path d="M5.45 5.11L2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"/>`,
  alert: `<path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>`,
  checkboxCheck: `<polyline points="20 6 9 17 4 12"/>`,
};

function svgIcon(paths, size, sw) {
  const s = size || 20;
  const w = sw || 2;
  return `<svg width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round">${paths}</svg>`;
}

const ACH_ICONS = {
  flag: svgIcon(P.flag, 22),
  rocket: svgIcon(P.rocket, 22),
  crown: svgIcon(P.crown, 22),
  fire: svgIcon(P.fire, 22),
  lightning: svgIcon(P.lightning, 22),
  target: svgIcon(P.target, 22),
  star: svgIcon(P.star, 22),
  medal: svgIcon(P.medal, 22),
  circlesFour: svgIcon(P.circlesFour, 22),
  zap: svgIcon(P.zap, 22),
};

const UI_ICONS = {
  pencil: svgIcon(P.pencil, 14),
  trash: svgIcon(P.trash, 14),
  check: svgIcon(P.check, 14),
  undo: svgIcon(P.undo, 14),
  plus: svgIcon(P.plus, 16),
  back: svgIcon(P.back, 16),
  done: svgIcon(P.check, 14),
  checkboxCheck: svgIcon(P.checkboxCheck, 10, 2.5),
};

const PRI_LABELS = { high:"高", medium:"中", low:"低" };
const BUCK_LABELS = { today:"今天", anytime:"随时", someday:"某天" };
const BUCK_ICONS = {
  today: svgIcon(P.sun, 16, 1.8),
  anytime: svgIcon(P.layers, 16, 1.8),
  someday: svgIcon(P.archive, 16, 1.8),
};

function toast(msg, type) {
  const c = document.getElementById("toastContainer");
  const t = document.createElement("div");
  const icon = type === "error" ? svgIcon(P.alert, 16, 1.8) : svgIcon(P.check, 16, 1.8);
  t.className = "toast " + (type || "success");
  t.innerHTML = icon + msg;
  c.appendChild(t);
  setTimeout(() => {
    t.classList.add("toast-out");
    setTimeout(() => t.remove(), 200);
  }, 2400);
}

function getDim(id) { return DIM_C[id]||{bg:"#F0EFED",c:"#666"}; }
function getIcon(n) { return ICONS[n]||""; }