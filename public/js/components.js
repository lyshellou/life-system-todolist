function renderTodoItem(t) {
  return `<div class="todo-item" data-id="${t.id}">
    <div class="todo-checkbox${t.completed?" checked":""}" onclick="toggleTodo('${t.id}')">${t.completed?UI_ICONS.checkboxCheck:""}</div>
    <div class="todo-body">
      <div class="todo-title${t.completed?" done":""}">${ESC(t.title)}</div>
      <div class="todo-meta">
        ${t.priority?`<span class="todo-priority ${t.priority}">${PRI_LABELS[t.priority]}</span>`:""}
        ${t.goalTitle?`<span class="todo-goal-tag">${ESC(t.goalTitle)}</span>`:""}
        ${t.dueDate?`<span style="font-size:11px;color:var(--text-secondary);font-variant-numeric:tabular-nums">${FMT(t.dueDate)}</span>`:""}
        ${t.note?`<span style="font-size:11px;color:var(--text-secondary)">${ESC(t.note)}</span>`:""}
      </div>
    </div>
    <div class="todo-actions">
      <button class="todo-btn" onclick="editTodo('${t.id}')" title="编辑">${UI_ICONS.pencil}</button>
      <button class="todo-btn" onclick="deleteTodo('${t.id}')" title="删除" style="color:#9F2F2D">${UI_ICONS.trash}</button>
    </div>
  </div>`;
}

function renderKarmaBar(stats) {
  const k = stats.karma;
  return `<div class="karma-card card">
    <div class="karma-header">
      <div><span class="karma-level">${k.level}</span><span class="karma-level-label"> 级</span></div>
      <span class="karma-xp-text">${k.totalXp} XP</span>
    </div>
    <div class="xp-bar-wrap"><div class="xp-bar-fill" style="width:${k.levelProgress}%"></div></div>
    <div style="display:flex;justify-content:space-between;font-size:12px;color:var(--text-secondary);margin-top:6px">
      <span>Lv.${k.level}</span><span>${k.xpInLevel} / ${k.xpForNext} XP</span>
    </div>
  </div>`;
}

function renderStreakCard(streak) {
  return `<div class="streak-card card">
    <div class="streak-top">${svgIcon(P.fire,20,1.8)}<span class="streak-number">${streak.current}</span></div>
    <div class="streak-label">连续天数</div>
    <div class="streak-longest">最长 ${streak.longest} 天</div>
  </div>`;
}

function renderStatCard(num, label) {
  return `<div class="stat-card"><div class="stat-number">${num}</div><div class="stat-label">${label}</div></div>`;
}

function renderDimCard(d) {
  const c = getDim(d.id);
  return `<div class="dim-card" style="background:${c.bg}" onclick="navigate('#/dimension/${d.id}')">
    <div class="dim-card-top">
      <div class="dim-card-icon">${getIcon(d.icon)}</div>
      <div class="dim-card-name" style="color:${c.c}">${ESC(d.name)}</div>
    </div>
    <div class="dim-card-progress">
      <div class="progress-bar"><div class="progress-fill" style="width:${d.progress}%;background:${c.c}"></div></div>
      <div class="dim-card-stats"><span>${d.completedGoals}/${d.totalGoals} 目标</span><span>${d.progress}%</span></div>
    </div>
  </div>`;
}

function renderGoalCard(g, dimColor) {
  const msDone=(g.milestones||[]).filter(m=>m.achieved).length;
  const msTotal=(g.milestones||[]).length;
  const prog=msTotal>0?Math.round(msDone/msTotal*100):0;
  return `<div class="goal-card" onclick="navigate('#/goal/${g.id}')">
    <div class="goal-card-header">
      <div class="goal-card-title${g.completed?" done":""}">${ESC(g.title)}${g.completed?` <span class="goal-done-badge">${UI_ICONS.done}已完成</span>`:""}</div>
      <div class="btn-group">
        <button class="btn btn-ghost btn-sm btn-icon" onclick="event.stopPropagation();toggleGoalComplete('${g.id}')" title="${g.completed?"取消完成":"标记完成"}">${g.completed?UI_ICONS.undo:UI_ICONS.check}</button>
        <button class="btn btn-ghost btn-sm btn-icon" onclick="event.stopPropagation();editGoal('${g.id}')" title="编辑">${UI_ICONS.pencil}</button>
        <button class="btn btn-ghost btn-sm btn-icon" onclick="event.stopPropagation();deleteGoal('${g.id}')" title="删除" style="color:#9F2F2D">${UI_ICONS.trash}</button>
      </div>
    </div>
    ${g.description?`<div class="goal-card-desc">${ESC(g.description)}</div>`:""}
    <div class="goal-card-meta">
      <span>${msDone}/${msTotal} 里程碑</span>
      ${g.todoCount?'<span>'+g.todoCount+' 待办</span>':""}
      ${g.targetDate?'<span>'+FMT(g.targetDate)+'</span>':""}
    </div>
    ${msTotal>0?`<div class="goal-progress"><div class="progress-bar"><div class="progress-fill" style="width:${prog}%;background:${typeof dimColor==="string"?dimColor:"#10B981"}"></div></div></div>`:""}
  </div>`;
}

function renderMilestoneItem(m) {
  return `<div class="milestone-item">
    <div class="milestone-dot">
      <div class="milestone-dot-circle${m.achieved?" achieved":""}" onclick="toggleMilestone('${m.id}')">${m.achieved?UI_ICONS.checkboxCheck:""}</div>
      <div class="milestone-line"></div>
    </div>
    <div class="milestone-body">
      <div class="milestone-title${m.achieved?" done":""}">${ESC(m.title)}</div>
      <div class="btn-group mt-8">
        <button class="btn btn-ghost btn-sm" onclick="editMilestone('${m.id}')">${UI_ICONS.pencil} 编辑</button>
        <button class="btn btn-ghost btn-sm" onclick="deleteMilestone('${m.id}')" style="color:#9F2F2D">${UI_ICONS.trash} 删除</button>
      </div>
    </div>
  </div>`;
}

function renderAchCard(a) {
  if (a.unlocked) {
    return `<div class="ach-card unlocked">
      <div class="ach-card-inner">
        <div class="ach-badge unlocked">${ACH_ICONS[a.icon]||svgIcon(P.flag,22)}</div>
        <div class="ach-name">${ESC(a.name)}</div>
        <div class="ach-desc">${ESC(a.description)}</div>
        ${a.unlockedAt?`<div class="ach-date">${FMT(a.unlockedAt)}</div>`:""}
      </div>
    </div>`;
  }
  return `<div class="ach-card locked">
    <div class="ach-card-inner">
      <div class="ach-badge locked">${svgIcon(P.lock,20)}</div>
      <div class="ach-name">???</div>
      <div class="ach-desc">${ESC(a.description)}</div>
    </div>
  </div>`;
}

function renderActivityCells(days) {
  const cells = []; const now = new Date();
  for (let i=83;i>=0;i--) {
    const d=new Date(now); d.setDate(d.getDate()-i);
    const ds=d.toISOString().slice(0,10);
    const act=(days||[]).find(a=>a.date===ds);
    const lvl=act?Math.min(4,Math.ceil((act.count||0)/3)):0;
    cells.push(`<div class="activity-cell${lvl>0?" level-"+lvl:""}" title="${ds}: ${act?act.count:0} 条"></div>`);
  }
  return cells.join("");
}

function renderModalForm(title, innerHtml) {
  return `<div class="modal-title">${title}</div>${innerHtml}`;
}

// Skeleton shimmer for page loading
function renderSkeleton() {
  return `<div class="karma-section">${'<div class="sk-card skeleton"></div>'.repeat(4)}</div>
    <div class="sk-grid">${'<div class="sk-block skeleton"></div>'.repeat(5)}</div>
    <div class="sk-row skeleton"></div>
    <div class="sk-row skeleton"></div>`;
}

// Empty state with optional icon + action
function renderEmpty(iconKey, text, sub, actionHtml) {
  const iconSvg = svgIcon(P[iconKey]||P.inbox, 40, 1.5);
  return `<div class="empty-state">
    <div class="empty-state-icon">${iconSvg}</div>
    <div class="empty-state-text">${ESC(text)}</div>
    ${sub?`<div class="empty-state-sub">${ESC(sub)}</div>`:""}
    ${actionHtml?`<div class="empty-state-action">${actionHtml}</div>`:""}
  </div>`;
}

// Confirm dialog modal
function confirmAction(title, msg, onConfirm) {
  const mo=document.getElementById("modalOverlay"), mc=document.getElementById("modalContent");
  mc.innerHTML=`<div class="modal-title">${ESC(title)}</div>
    <p style="font-size:14px;color:var(--text-secondary);line-height:1.5">${ESC(msg)}</p>
    <div class="confirm-actions">
      <button class="btn btn-danger-solid btn-full" id="confirmDeleteBtn">${UI_ICONS.trash} 确定删除</button>
      <button class="btn btn-secondary btn-full" onclick="app.closeModal()">取消</button>
    </div>`;
  mo.classList.remove("hidden");
  document.getElementById("confirmDeleteBtn").focus();
  document.getElementById("confirmDeleteBtn").onclick=()=>{ app.closeModal(); onConfirm(); };
}

// Activity heatmap with month/week labels
function renderHeatmap(days) {
  const now=new Date();
  const weekLabels=["一","二","三","四","五","六","日"];
  // Build 12-week grid cells
  let cellsHtml=""; let monthLabels={};
  for (let i=83;i>=0;i--) {
    const d=new Date(now); d.setDate(d.getDate()-i);
    const ds=d.toISOString().slice(0,10);
    const act=(days||[]).find(a=>a.date===ds);
    const lvl=act?Math.min(4,Math.ceil((act.count||0)/3)):0;
    const monthKey=d.getMonth();
    if (!monthLabels[monthKey]) monthLabels[monthKey]=i;
    cellsHtml+=`<div class="activity-cell${lvl>0?" level-"+lvl:""}" title="${ds}: ${act?act.count:0} 条"></div>`;
  }
  // Month labels
  const monthNames=["1月","2月","3月","4月","5月","6月","7月","8月","9月","10月","11月","12月"];
  let monthsHtml="";
  const sortedMonths=Object.entries(monthLabels).sort((a,b)=>a[1]-b[1]);
  for (let mi=0;mi<sortedMonths.length;mi++) {
    const [mIdx,offset]=sortedMonths[mi];
    const nextOffset=mi<sortedMonths.length-1?sortedMonths[mi+1][1]:84;
    const span=Math.max(1,Math.round((nextOffset-offset)/7));
    monthsHtml+=`<span class="activity-month-label" style="min-width:${span*17}px">${monthNames[parseInt(mIdx)]}</span>`;
  }
  // Week labels
  let daysHtml="";
  for (let wi=0;wi<7;wi++) {
    daysHtml+=`<div class="activity-day-label">${weekLabels[wi]}</div>`;
  }
  return `<div>
    <div class="activity-months">${monthsHtml}</div>
    <div class="activity-body">
      <div class="activity-days">${daysHtml}</div>
      <div class="activity-grid">${cellsHtml}</div>
    </div>
    <div class="activity-legend">
      <span>少</span>
      <div class="activity-legend-cell" style="background:#F0EFED"></div>
      <div class="activity-legend-cell level-1" style="background:#D1FAE5"></div>
      <div class="activity-legend-cell level-2" style="background:#6EE7B7"></div>
      <div class="activity-legend-cell level-3" style="background:#34D399"></div>
      <div class="activity-legend-cell level-4" style="background:#10B981"></div>
      <span>多</span>
    </div>
  </div>`;
}