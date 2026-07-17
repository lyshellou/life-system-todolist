// === Todo Actions ===
window.toggleTodo = async (id) => { await api.patch("/todos/"+id+"/complete"); toast("✓ 已更新"); parseHash(); };
window.deleteTodo = async (id) => { if (!confirm("确定删除？")) return; await api.del("/todos/"+id); toast("已删除"); parseHash(); };
window.editTodo = async (id) => { const todos=await api.get("/todos"); const t=todos.find(x=>x.id===id); if(t){const g=await api.get("/goals"); showTodoModal(t,g);} };
window.showTodoForm = async (goalId) => { const g=await api.get("/goals"); showTodoModal(null,g,goalId); };

async function showTodoModal(editTodo, allGoals, presetGoalId) {
  const isEdit=!!editTodo; const title=isEdit?"编辑待办":"新建待办";
  const bucketOpts=["today","anytime","someday"].map(b=>`<option value="${b}"${(editTodo&&editTodo.bucket===b)||(!isEdit&&b==="anytime")?" selected":""}>${BUCK_LABELS[b]}</option>`).join("");
  const priorityOpts=["high","medium","low"].map(p=>`<option value="${p}"${(editTodo&&editTodo.priority===p)||(!isEdit&&p==="medium")?" selected":""}>${PRI_LABELS[p]}</option>`).join("");
  const goalOpts=(allGoals||[]).map(g=>`<option value="${g.id}"${(editTodo&&editTodo.goalId===g.id)||(presetGoalId===g.id)?" selected":""}>${ESC(g.title)}</option>`).join("");
  const mo=document.getElementById("modalOverlay"), mc=document.getElementById("modalContent");
  mc.innerHTML=`<div class="modal-title">${title}</div>
<form id="actionForm"><div class="form-group"><label class="form-label">标题</label><input class="form-input" name="title" value="${ESC(editTodo?editTodo.title:"")}" required></div>
<div class="form-row"><div class="form-group"><label class="form-label">桶</label><select class="form-select" name="bucket">${bucketOpts}</select></div>
<div class="form-group"><label class="form-label">优先级</label><select class="form-select" name="priority">${priorityOpts}</select></div></div>
<div class="form-group"><label class="form-label">关联目标</label><select class="form-select" name="goalId"><option value="">无</option>${goalOpts}</select></div>
<div class="form-group"><label class="form-label">备注</label><input class="form-input" name="note" value="${ESC(editTodo?editTodo.note:"")}"></div>
<div class="form-group"><label class="form-label">截止</label><input class="form-input" name="dueDate" type="date" value="${editTodo&&editTodo.dueDate?editTodo.dueDate.slice(0,10):""}"></div>
<div class="btn-group" style="margin-top:16px"><button type="submit" class="btn btn-primary btn-full">${isEdit?"保存":"创建"}</button>
<button type="button" class="btn btn-secondary btn-full" onclick="app.closeModal()">取消</button></div></form>`;
  mo.classList.remove("hidden");
  document.getElementById("actionForm").onsubmit=async(e)=>{
    e.preventDefault(); const fd=new FormData(e.target);
    const data={title:fd.get("title"),bucket:fd.get("bucket"),priority:fd.get("priority"),goalId:fd.get("goalId")||null,note:fd.get("note"),dueDate:fd.get("dueDate")||null};
    if (!data.title) return;
    if (isEdit) { await api.put("/todos/"+editTodo.id,data); toast("已更新"); }
    else { await api.post("/todos",data); toast("已创建"); }
    app.closeModal(); parseHash();
  };
}

// === Goal Actions ===
window.toggleGoalComplete = async (id) => {
  const goal=await api.get("/goals/"+id);
  await api.put("/goals/"+id,{completed:!goal.completed,completedAt:!goal.completed?new Date().toISOString():null});
  toast(goal.completed?"已取消完成":"目标达成！"); parseHash();
};
window.deleteGoal = async (id) => { if(!confirm("确定删除？"))return; await api.del("/goals/"+id); toast("已删除"); parseHash(); };
window.showGoalForm = (dimId) => {
  const mo=document.getElementById("modalOverlay"), mc=document.getElementById("modalContent");
  mc.innerHTML=`<div class="modal-title">新建目标</div>
<form id="actionForm"><div class="form-group"><label class="form-label">标题</label><input class="form-input" name="title" required></div>
<div class="form-group"><label class="form-label">描述</label><textarea class="form-input form-textarea" name="description"></textarea></div>
<div class="form-group"><label class="form-label">目标日期</label><input class="form-input" name="targetDate" type="date"></div>
<div class="btn-group" style="margin-top:16px"><button type="submit" class="btn btn-primary btn-full">创建</button>
<button type="button" class="btn btn-secondary btn-full" onclick="app.closeModal()">取消</button></div></form>`;
  mo.classList.remove("hidden");
  document.getElementById("actionForm").onsubmit=async(e)=>{
    e.preventDefault(); const fd=new FormData(e.target);
    const data={title:fd.get("title"),description:fd.get("description"),dimensionId:dimId,targetDate:fd.get("targetDate")||null};
    if(!data.title)return; await api.post("/goals",data); toast("目标已创建"); app.closeModal(); parseHash();
  };
};
window.editGoal = async (id) => {
  const goal=await api.get("/goals/"+id);
  if(!goal)return;
  const mo=document.getElementById("modalOverlay"), mc=document.getElementById("modalContent");
  mc.innerHTML=`<div class="modal-title">编辑目标</div>
<form id="actionForm"><div class="form-group"><label class="form-label">标题</label><input class="form-input" name="title" value="${ESC(goal.title)}" required></div>
<div class="form-group"><label class="form-label">描述</label><textarea class="form-input form-textarea" name="description">${ESC(goal.description||"")}</textarea></div>
<div class="form-group"><label class="form-label">目标日期</label><input class="form-input" name="targetDate" type="date" value="${goal.targetDate?goal.targetDate.slice(0,10):""}"></div>
<div class="btn-group" style="margin-top:16px"><button type="submit" class="btn btn-primary btn-full">保存</button>
<button type="button" class="btn btn-secondary btn-full" onclick="app.closeModal()">取消</button></div></form>`;
  mo.classList.remove("hidden");
  document.getElementById("actionForm").onsubmit=async(e)=>{
    e.preventDefault(); const fd=new FormData(e.target);
    const data={title:fd.get("title"),description:fd.get("description"),targetDate:fd.get("targetDate")||null};
    if(!data.title)return; await api.put("/goals/"+id,data); toast("已更新"); app.closeModal(); parseHash();
  };
};

// === Milestone Actions ===
window.toggleMilestone = async (id) => { await api.patch("/milestones/"+id+"/toggle"); toast("✓ 里程碑已更新"); parseHash(); };
window.showMilestoneForm = (goalId) => {
  const mo=document.getElementById("modalOverlay"), mc=document.getElementById("modalContent");
  mc.innerHTML=`<div class="modal-title">添加里程碑</div>
<form id="actionForm"><div class="form-group"><label class="form-label">标题</label><input class="form-input" name="title" required></div>
<div class="btn-group" style="margin-top:16px"><button type="submit" class="btn btn-primary btn-full">添加</button>
<button type="button" class="btn btn-secondary btn-full" onclick="app.closeModal()">取消</button></div></form>`;
  mo.classList.remove("hidden");
  document.getElementById("actionForm").onsubmit=async(e)=>{
    e.preventDefault(); const fd=new FormData(e.target); const title=fd.get("title");
    if(!title)return; await api.post("/milestones",{goalId,title}); toast("✓ 已添加"); app.closeModal(); parseHash();
  };
};
window.editMilestone = async (id) => {
  const goals=await api.get("/goals"); let ms=null;
  for (const g of goals) { const gd=await api.get("/goals/"+g.id); const f=(gd.milestones||[]).find(m=>m.id===id); if(f){ms=f;break;} }
  if(!ms)return;
  const mo=document.getElementById("modalOverlay"), mc=document.getElementById("modalContent");
  mc.innerHTML=`<div class="modal-title">编辑里程碑</div>
<form id="actionForm"><div class="form-group"><label class="form-label">标题</label><input class="form-input" name="title" value="${ESC(ms.title)}" required></div>
<div class="btn-group" style="margin-top:16px"><button type="submit" class="btn btn-primary btn-full">保存</button>
<button type="button" class="btn btn-secondary btn-full" onclick="app.closeModal()">取消</button></div></form>`;
  mo.classList.remove("hidden");
  document.getElementById("actionForm").onsubmit=async(e)=>{
    e.preventDefault(); const fd=new FormData(e.target); const title=fd.get("title");
    if(!title)return; await api.put("/milestones/"+id,{title}); toast("已更新"); app.closeModal(); parseHash();
  };
};
window.deleteMilestone = async (id) => { if(!confirm("确定删除？"))return; await api.del("/milestones/"+id); toast("已删除"); parseHash(); };
