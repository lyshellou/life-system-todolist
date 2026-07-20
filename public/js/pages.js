async function renderDashboard(container) { try {
  const [stats, dims, todos] = await Promise.all([api.get("/stats"), api.get("/dimensions"), api.get("/todos?completed=false")]);
  const todayTodos = todos.filter(t=>t.bucket==="today");
  const act = await api.get("/stats/activity?year=2026");
  let h = `<div class="page-header"><h1>总览</h1><p>今天也要好好生活</p></div>`;
  h += `<div class="karma-section">${renderKarmaBar(stats)}${renderStreakCard(stats.streak)}
    <div class="streak-card card"><div class="karma-level">${stats.achievements.filter(a=>a.unlocked).length}</div><div class="streak-label">成就 / ${stats.achievements.length}</div></div>
    <div class="streak-card card"><div class="karma-level">${todayTodos.length}</div><div class="streak-label">今日待办</div></div>
  </div>`;
  h += `<div class="dim-grid">`;
  for (const d of stats.dimProgress) h += renderDimCard(d);
  h += `</div>`;
  h += `<div class="card mb-20"><div class="card-header"><div class="card-title">近期活动</div></div><div>${renderHeatmap(act.days||[])}</div></div>`;
  h += `<div class="card"><div class="card-header"><div class="card-title">今日待办</div></div>`;
  if (!todayTodos.length) h += renderEmpty("sun","今天没有待办，放松一下吧","点击下面按钮添加");
  else { h += `<div>`; for (const t of todayTodos) h += renderTodoItem(t); h += `</div>`; }
  h += `<div class="add-btn" onclick="navigate('#/todos')">查看所有待办</div></div>`;
  container.innerHTML = h;
  } catch(e) { console.error("Dashboard render error:", e); container.innerHTML = renderEmpty("alert","加载失败，请刷新页面"); }
}

async function renderDimDetail(container, dimId) { try {
  const [dim, goals] = await Promise.all([api.get("/dimensions/"+dimId).catch(()=>null), api.get("/goals?dimensionId="+dimId)]);
  if (!dim) { container.innerHTML = renderEmpty("alert","维度不存在"); return; }
  const c = getDim(dimId);
  let h = `<button class="back-btn" onclick="navigate('#/dashboard')">${UI_ICONS.back} 返回总览</button>`;
  h += `<div class="detail-header"><span class="dim-badge" style="background:${c.bg};color:${c.c}">${getIcon(dim.icon)} ${ESC(dim.name)}</span>`;
  h += `<h1>${ESC(dim.name)}</h1><p>${goals.length} 个目标 · ${goals.filter(g=>g.completed).length} 已完成</p></div>`;
  h += `<div class="action-bar"><div></div><button class="btn btn-primary" onclick="showGoalForm('${dimId}')">${UI_ICONS.plus} 新建目标</button></div>`;
  if (!goals.length) h += renderEmpty("target","还没有目标","开始创建第一个吧",`<button class="btn btn-primary" onclick="showGoalForm('${dimId}')">${UI_ICONS.plus} 新建目标</button>`);
  else {
    h += `<div class="goal-list">`;
    for (const g of goals) h += renderGoalCard(g, c.c);
    h += `</div>`;
  }
  container.innerHTML = h;
  } catch(e) { console.error("Dashboard render error:", e); container.innerHTML = renderEmpty("alert","加载失败，请刷新页面"); }
}

async function renderGoalDetail(container, goalId) { try {
  const [goal, todos] = await Promise.all([api.get("/goals/"+goalId).catch(()=>null), api.get("/todos?goalId="+goalId)]);
  if (!goal) { container.innerHTML = renderEmpty("alert","目标不存在"); return; }
  const dim = await api.get("/dimensions/"+goal.dimensionId).catch(()=>null);
  const c = getDim(goal.dimensionId);
  const msDone=(goal.milestones||[]).filter(m=>m.achieved).length, msTotal=(goal.milestones||[]).length;
  const prog=msTotal>0?Math.round(msDone/msTotal*100):0;
  let h = `<button class="back-btn" onclick="navigate('#/dimension/${goal.dimensionId}')">${UI_ICONS.back} 返回</button>`;
  h += `<div class="detail-header">`;
  if (dim) h += `<span class="dim-badge" style="background:${c.bg};color:${c.c}">${getIcon(dim.icon)} ${ESC(dim.name)}</span>`;
  h += `<h1>${ESC(goal.title)}${goal.completed?` <span class="goal-done-badge">${UI_ICONS.done}已完成</span>`:""}</h1>`;
  if (goal.description) h += `<p>${ESC(goal.description)}</p>`;
  if (goal.targetDate) h += `<p style="font-size:13px;color:var(--text-secondary)">目标日期: ${FMT(goal.targetDate)}</p>`;
  h += `</div>`;
  h += `<div class="card mb-16"><div class="card-header"><div class="card-title">进度</div><span style="font-size:13px;font-weight:600;color:${c.c};font-variant-numeric:tabular-nums">${prog}%</span></div>`;
  h += `<div class="progress-bar" style="height:8px;border-radius:4px"><div class="progress-fill" style="width:${prog}%;height:100%;border-radius:4px;background:${c.c}"></div></div>`;
  h += `<div style="display:flex;justify-content:space-between;font-size:12px;color:var(--text-secondary);margin-top:6px"><span>${msDone}/${msTotal} 里程碑</span><span>${todos.filter(t=>t.completed).length}/${todos.length} 待办</span></div></div>`;
  h += `<div class="card mb-16"><div class="card-header"><div class="card-title">里程碑</div><button class="btn btn-ghost btn-sm" onclick="showMilestoneForm('${goalId}')">${UI_ICONS.plus} 添加</button></div>`;
  if (!(goal.milestones||[]).length) h += renderEmpty("flag","还没有里程碑","添加一个来追踪进度");
  else { h += `<div class="milestone-list">`; for (const m of goal.milestones) h += renderMilestoneItem(m); h += `</div>`; }
  h += `</div>`;
  h += `<div class="card"><div class="card-header"><div class="card-title">关联待办</div><button class="btn btn-ghost btn-sm" onclick="showTodoForm('${goalId}')">${UI_ICONS.plus} 添加</button></div>`;
  if (!todos.length) h += renderEmpty("check","还没有关联待办","添加待办来完成这个目标");
  else { h += `<div>`; const sorted=[...todos].sort((a,b)=>a.completed-b.completed); for (const t of sorted) h+=renderTodoItem(t); h+=`</div>`; }
  h += `</div>`;
  container.innerHTML = h;
  } catch(e) { console.error("Dashboard render error:", e); container.innerHTML = renderEmpty("alert","加载失败，请刷新页面"); }
}

async function renderTodoList(container) { try {
  const todos = await api.get("/todos");
  const buckets = ["today","anytime","someday"];
  const pending = todos.filter(t=>!t.completed).length, done=todos.filter(t=>t.completed).length;
  let h = `<div class="page-header"><h1>待办</h1><p>三个桶帮你理清优先级</p></div>`;
  h += `<div class="action-bar"><div></div><button class="btn btn-primary" onclick="showTodoForm(null)">${UI_ICONS.plus} 新建待办</button></div>`;
  h += `<div class="stats-row">${renderStatCard(pending,"待完成")}${renderStatCard(done,"已完成")}${renderStatCard(todos.length,"总计")}</div>`;
  h += `<div class="todo-buckets">`;
  for (const b of buckets) {
    const items=todos.filter(t=>t.bucket===b&&!t.completed);
    h += `<div class="todo-bucket card"><div class="todo-bucket-header"><div class="todo-bucket-title">${BUCK_ICONS[b]} ${BUCK_LABELS[b]}</div><span class="todo-bucket-count">${items.length}</span></div>`;
    if (!items.length) h+=`<div style="padding:12px 0">${renderEmpty("inbox","空的")}</div>`;
    else { for (const t of items) h+=renderTodoItem(t); }
    h+=`</div>`;
  }
  h+=`</div>`;
  container.innerHTML = h;
  } catch(e) { console.error("Dashboard render error:", e); container.innerHTML = renderEmpty("alert","加载失败，请刷新页面"); }
}

async function renderAchPage(container) { try {
  const achs = await api.get("/achievements");
  const unlocked=achs.filter(a=>a.unlocked), locked=achs.filter(a=>!a.unlocked);
  let h = `<div class="page-header"><h1>成就</h1><p>已解锁 ${unlocked.length}/${achs.length}</p></div><div class="ach-grid">`;
  for (const a of unlocked) h+=renderAchCard(a);
  for (const a of locked) h+=renderAchCard(a);
  h+=`</div>`;
  container.innerHTML = h;
  } catch(e) { console.error("Dashboard render error:", e); container.innerHTML = renderEmpty("alert","加载失败，请刷新页面"); }
}