function renderTodoItem(t) {
  return `<div class="todo-item" data-id="${t.id}">
    <div class="todo-checkbox${t.completed?" checked":""}" onclick="toggleTodo('${t.id}')"></div>
    <div class="todo-body">
      <div class="todo-title${t.completed?" done":""}">${ESC(t.title)}</div>
      <div class="todo-meta">
        ${t.priority?`<span class="todo-priority ${t.priority}">${PRI_LABELS[t.priority]}</span>`:""}
        ${t.goalTitle?`<span class="todo-goal-tag">${ESC(t.goalTitle)}</span>`:""}
        ${t.dueDate?`<span style="font-size:11px;color:var(--text-secondary)">${FMT(t.dueDate)}</span>`:""}
        ${t.note?`<span style="font-size:11px;color:var(--text-secondary)">${ESC(t.note)}</span>`:""}
      </div>
    </div>
    <div class="todo-actions">
      <button class="todo-btn" onclick="editTodo('${t.id}')" title="编辑">?</button>
      <button class="todo-btn" onclick="deleteTodo('${t.id}')" title="删除" style="color:#9F2F2D"></button>
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
      <span>Lv.${k.level}</span><span>${k.xpInLevel}/${k.xpForNext} XP</span>
    </div>
  </div>`;
}

function renderStreakCard(streak) {
  return `<div class="streak-card card">
    <div class="streak-number">${streak.current}</div>
    <div class="streak-label">连续天数</div>
    <div style="font-size:11px;color:var(--text-secondary);margin-top:4px">最长 ${streak.longest} 天</div>
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
      <div class="goal-card-title${g.completed?" done":""}">${ESC(g.title)}</div>
      <div class="btn-group">
        <button class="btn btn-ghost btn-sm btn-icon" onclick="event.stopPropagation();toggleGoalComplete('${g.id}')" title="${g.completed?"取消完成":"标记完成"}">${g.completed?"?":"?"}</button>
        <button class="btn btn-ghost btn-sm btn-icon" onclick="event.stopPropagation();editGoal('${g.id}')">?</button>
        <button class="btn btn-ghost btn-sm btn-icon" onclick="event.stopPropagation();deleteGoal('${g.id}')" style="color:#9F2F2D"></button>
      </div>
    </div>
    ${g.description?`<div class="goal-card-desc">${ESC(g.description)}</div>`:""}
    <div class="goal-card-meta">
      <span>${msDone}/${msTotal} 里程碑</span>
      ${g.todoCount?`<span>`${g.todoCount}</span>`:""}
      ${g.targetDate?`<span>`${FMT(g.targetDate)}</span>`:""}
    </div>
    ${msTotal>0?`<div class="goal-progress"><div class="progress-bar"><div class="progress-fill" style="width:${prog}%;background:${typeof dimColor==="string"?dimColor:"#10B981"}"></div></div></div>`:""}
  </div>`;
}

function renderMilestoneItem(m) {
  return `<div class="milestone-item">
    <div class="milestone-dot">
      <div class="milestone-dot-circle${m.achieved?" achieved":""}" onclick="toggleMilestone('${m.id}')"></div>
      <div class="milestone-line"></div>
    </div>
    <div class="milestone-body">
      <div class="milestone-title${m.achieved?" done":""}">${ESC(m.title)}</div>
      <div class="btn-group mt-8">
        <button class="btn btn-ghost btn-sm" onclick="editMilestone('${m.id}')">?</button>
        <button class="btn btn-ghost btn-sm" onclick="deleteMilestone('${m.id}')" style="color:#9F2F2D"></button>
      </div>
    </div>
  </div>`;
}

function renderAchCard(a) {
  if (a.unlocked) {
    return `<div class="ach-card unlocked">
const ACH_ICONS = { flag:"1st", rocket:"10x", crown:"100x", fire:"7d", lightning:"30d", target:"Goal", star:"Star", medal:"Mstone", circlesFour:"All", zap:"Day" };
      <div class="ach-name">${ESC(a.name)}</div>
      <div class="ach-desc">${ESC(a.description)}</div>
      ${a.unlockedAt?`<div style="font-size:10px;color:var(--text-secondary);margin-top:6px">${FMT(a.unlockedAt)}</div>`:""}
    </div>`;
  }
  return `<div class="ach-card locked">
    <div class="ach-icon">*</div>
    <div class="ach-name">???</div>
    <div class="ach-desc">${ESC(a.description)}</div>
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
