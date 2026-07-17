async function parseHash() {
  const hash=location.hash.slice(1)||"/dashboard";
  const parts=hash.split("/").filter(Boolean);
  const route="/"+parts[0], params=parts.slice(1);
  const c=document.getElementById("pageContainer");
  c.innerHTML='<div class="loading"><div class="loading-spinner"></div></div>';
  document.querySelectorAll(".nav-item[data-route]").forEach(el=>el.classList.toggle("active",el.getAttribute("href")==="#"+route));
  try {
    if (route==="/dashboard") await renderDashboard(c);
    else if (route==="/dimension") await renderDimDetail(c,params[0]);
    else if (route==="/goal") await renderGoalDetail(c,params[0]);
    else if (route==="/todos") await renderTodoList(c);
    else if (route==="/achievements") await renderAchPage(c);
    else c.innerHTML='<div class="empty-state"><div class="empty-state-icon">📋</div><div class="empty-state-text">页面不存在</div></div>';
  } catch(e) { console.error(e); c.innerHTML='<div class="empty-state"><div class="empty-state-text">加载失败，请刷新</div></div>'; }
}
function navigate(hash) { location.hash=hash; }
window.addEventListener("hashchange",parseHash);
window.navigate=navigate;

// Sidebar dimensions
(async()=>{
  const dims=await api.get("/dimensions");
  const nav=document.getElementById("dimNavItems");
  for (const d of dims) {
    const c=getDim(d.id);
    const a=document.createElement("a");
    a.className="nav-item"; a.setAttribute("href","#/dimension/"+d.id); a.setAttribute("data-route","");
    a.innerHTML=`<span class="dim-nav-dot" style="background:${c.c}"></span><span>${ESC(d.name)}</span>`;
    a.addEventListener("click",()=>location.hash="#/dimension/"+d.id);
    nav.appendChild(a);
  }
})();

parseHash();
window.app={closeModal:(e)=>{const o=document.getElementById("modalOverlay");if(e&&e.target!==o)return;o.classList.add("hidden");document.getElementById("modalContent").innerHTML="";}};
