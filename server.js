const http = require("http");
const fs = require("fs");
const path = require("path");

const PORT = 3001;
const DATA_FILE = path.join(__dirname, "data", "db.json");
const PUBLIC_DIR = path.join(__dirname, "public");

// --- Data helpers ---
function readDb() {
  try {
    const raw = fs.readFileSync(DATA_FILE, "utf-8");
    const clean = raw.replace(/^﻿/, "");
    if (clean.trim() === "") {
      return {
        dimensions: [],
        goals: [],
        milestones: [],
        todos: [],
        dailyActivity: [],
        karma: { totalXp: 0, level: 1 },
        streak: { current: 0, longest: 0, lastDate: null },
        counter: { todosCompleted: 0, goalsCompleted: 0, milestonesCompleted: 0 },
        achievements: [],
      };
    }
    return JSON.parse(clean);
  } catch (err) {
    console.error("Database parse error:", err);
    throw err;
  }
}
function writeDb(data) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), "utf-8");
}
function uid() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}
function todayStr() {
  return new Date().toISOString().slice(0, 10);
}

// --- MIME types ---
const MIME = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".json": "application/json",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
};

// --- Serve static ---
function serveStatic(url, res) {
  let filePath = path.join(PUBLIC_DIR, url === "/" ? "index.html" : url);
  const ext = path.extname(filePath);
  if (!MIME[ext]) {
    filePath = path.join(PUBLIC_DIR, "index.html");
  }
  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(404, { "Content-Type": "text/plain" });
      res.end("Not found");
    } else {
      res.writeHead(200, { "Content-Type": MIME[ext] || "application/octet-stream" });
      res.end(data);
    }
  });
}

// --- Parse JSON body ---
function parseBody(req) {
  return new Promise((resolve) => {
    let body = "";
    req.on("data", (c) => (body += c));
    req.on("end", () => {
      try {
        resolve(JSON.parse(body));
      } catch {
        resolve({});
      }
    });
  });
}

// --- API Handlers ---
async function handleApi(method, url, body, res) {
  const send = (data, code = 200) => {
    if (res.headersSent) {
      console.warn("Response already sent, skipping duplicate send.");
      return;
    }
    res.writeHead(code, { "Content-Type": "application/json" });
    res.end(JSON.stringify(data));
  };

  const db = readDb();
  const cleanPath = url.split('?')[0];
  const parts = cleanPath.split('/').filter(Boolean); // ['api', 'dimensions', ...]

  // GET /api/stats/activity?year=2026  (must be BEFORE /api/stats to avoid shadowing)
  if (method === "GET" && parts[1] === "stats" && parts[2] === "activity") {
    const urlObj = new URL(url, "http://localhost");
    const year = parseInt(urlObj.searchParams.get("year")) || 2026;
    return send({ year, days: db.dailyActivity });
  }

  // GET /api/stats
  if (method === "GET" && parts[1] === "stats" && !parts[2]) {
    const { karma, streak, counter, achievements, dimensions, goals, todos } = db;
    const levelXp = karma.level * 100;
    const xpInLevel = karma.totalXp - ((karma.level - 1) * karma.level * 100) / 2;
    const xpForNext = levelXp;
    const totalTodos = todos.filter((t) => !t.completed).length;
    const todayTodos = todos.filter((t) => !t.completed && t.bucket === "today").length;
    const dimProgress = dimensions.map((d) => {
      const dimGoals = goals.filter((g) => g.dimensionId === d.id);
      const done = dimGoals.filter((g) => g.completed).length;
      return { ...d, totalGoals: dimGoals.length, completedGoals: done, progress: dimGoals.length > 0 ? Math.round((done / dimGoals.length) * 100) : 0 };
    });
    return send({
      karma: { ...karma, xpInLevel, xpForNext, levelProgress: xpForNext > 0 ? Math.min(100, Math.round((xpInLevel / xpForNext) * 100)) : 0 },
      streak,
      counter,
      dimProgress,
      todayTodos,
      totalTodos,
      achievements,
      unlockedCount: achievements.filter((a) => a.unlocked).length,
    });
  }



  // --- Dimensions CRUD ---
  if (parts[1] === "dimensions") {
    const dimId = parts[2];
    if (method === "GET" && !dimId) return send(db.dimensions);
    if (method === "POST") {
      const dim = { id: uid(), name: body.name, icon: body.icon || "circle", color: body.color || "#666", bgColor: body.bgColor || "#f0f0f0", sortOrder: db.dimensions.length + 1, createdAt: new Date().toISOString() };
      db.dimensions.push(dim);
      writeDb(db);
      return send(dim, 201);
    }
    if (dimId) {
      const idx = db.dimensions.findIndex((d) => d.id === dimId);
      if (idx === -1) return send({ error: "not found" }, 404);
      if (method === "PUT") {
        db.dimensions[idx] = { ...db.dimensions[idx], ...body };
        writeDb(db);
        return send(db.dimensions[idx]);
      }
      if (method === "DELETE") {
        db.dimensions.splice(idx, 1);
        db.goals = db.goals.filter((g) => g.dimensionId !== dimId);
        const goalIds = db.goals.map((g) => g.id);
        db.milestones = db.milestones.filter((m) => goalIds.includes(m.goalId));
        writeDb(db);
        return send({ ok: true });
      }
      if (method === "GET") return send(db.dimensions[idx]);
    }
  }

  // --- Goals CRUD ---
  if (parts[1] === "goals") {
    const goalId = parts[2];
    if (method === "GET" && !goalId) {
      const urlObj = new URL(url, "http://localhost");
      const dimFilter = urlObj.searchParams.get("dimensionId");
      let result = db.goals;
      if (dimFilter) result = result.filter((g) => g.dimensionId === dimFilter);
      result = result.map((g) => ({
        ...g,
        milestones: db.milestones.filter((m) => m.goalId === g.id),
        todoCount: db.todos.filter((t) => t.goalId === g.id && !t.completed).length,
      }));
      return send(result);
    }
    if (method === "POST" && !goalId) {
      const goal = { id: uid(), dimensionId: body.dimensionId, title: body.title, description: body.description || "", targetDate: body.targetDate || null, sortOrder: db.goals.filter((g) => g.dimensionId === body.dimensionId).length + 1, completed: false, completedAt: null, createdAt: new Date().toISOString() };
      db.goals.push(goal);
      writeDb(db);
      // Check all-dimensions achievement
      updateAchievements(db);
      return send(goal, 201);
    }
    if (goalId) {
      const idx = db.goals.findIndex((g) => g.id === goalId);
      if (idx === -1) return send({ error: "not found" }, 404);
      if (method === "GET") {
        const goal = { ...db.goals[idx], milestones: db.milestones.filter((m) => m.goalId === goalId) };
        return send(goal);
      }
      if (method === "PUT") {
        db.goals[idx] = { ...db.goals[idx], ...body };
        writeDb(db);
        return send(db.goals[idx]);
      }
      if (method === "DELETE") {
        db.goals.splice(idx, 1);
        db.milestones = db.milestones.filter((m) => m.goalId !== goalId);
        db.todos.forEach((t) => { if (t.goalId === goalId) t.goalId = null; });
        writeDb(db);
        return send({ ok: true });
      }
    }
  }

  // --- Milestones ---
  if (parts[1] === "milestones") {
    const msId = parts[2];
    if (method === "POST" && body.goalId) {
      const ms = { id: uid(), goalId: body.goalId, title: body.title, sortOrder: db.milestones.filter((m) => m.goalId === body.goalId).length + 1, achieved: false, achievedAt: null, createdAt: new Date().toISOString() };
      db.milestones.push(ms);
      writeDb(db);
      return send(ms, 201);
    }
    if (msId) {
      const idx = db.milestones.findIndex((m) => m.id === msId);
      if (idx === -1) return send({ error: "not found" }, 404);
      if (method === "PUT") {
        db.milestones[idx] = { ...db.milestones[idx], ...body };
        writeDb(db);
        return send(db.milestones[idx]);
      }
      if (method === "DELETE") {
        db.milestones.splice(idx, 1);
        writeDb(db);
        return send({ ok: true });
      }
      if (method === "PATCH" && url.endsWith("/toggle")) {
        const ms = db.milestones[idx];
        ms.achieved = !ms.achieved;
        ms.achievedAt = ms.achieved ? new Date().toISOString() : null;
        if (ms.achieved) {
          addXp(db, 25);
          db.counter.milestonesCompleted++;
        }
        writeDb(db);
        updateAchievements(db);
        return send(ms);
      }
    }
  }

  // --- Todos CRUD ---
  if (parts[1] === "todos") {
    const todoId = parts[2];
    if (method === "GET" && !todoId) {
      const urlObj = new URL(url, "http://localhost");
      const bucket = urlObj.searchParams.get("bucket");
      const goalFilter = urlObj.searchParams.get("goalId");
      const completedFilter = urlObj.searchParams.get("completed");
      let result = db.todos;
      if (bucket) result = result.filter((t) => t.bucket === bucket);
      if (goalFilter) result = result.filter((t) => t.goalId === goalFilter);
      if (completedFilter !== null && completedFilter !== undefined) {
        const comp = completedFilter === "1" || completedFilter === "true";
        result = result.filter((t) => t.completed === comp);
      }
      // Enrich with goal title
      result = result.map((t) => ({ ...t, goalTitle: db.goals.find((g) => g.id === t.goalId)?.title || null }));
      result.sort((a, b) => a.sortOrder - b.sortOrder);
      return send(result);
    }
    if (method === "POST" && !todoId) {
      const todo = { id: uid(), title: body.title, note: body.note || "", bucket: body.bucket || "anytime", goalId: body.goalId || null, priority: body.priority || "medium", completed: false, completedAt: null, dueDate: body.dueDate || null, sortOrder: db.todos.length + 1, createdAt: new Date().toISOString() };
      db.todos.push(todo);
      writeDb(db);
      return send(todo, 201);
    }
    if (todoId) {
      const idx = db.todos.findIndex((t) => t.id === todoId);
      if (idx === -1) return send({ error: "not found" }, 404);
      if (method === "PUT") {
        db.todos[idx] = { ...db.todos[idx], ...body };
        writeDb(db);
        return send(db.todos[idx]);
      }
      if (method === "DELETE") {
        db.todos.splice(idx, 1);
        writeDb(db);
        return send({ ok: true });
      }
      if (method === "PATCH" && url.endsWith("/complete")) {
        const todo = db.todos[idx];
        todo.completed = !todo.completed;
        todo.completedAt = todo.completed ? new Date().toISOString() : null;
        if (todo.completed) {
          addXp(db, 10);
          db.counter.todosCompleted++;
          updateStreak(db);
        }
        writeDb(db);
        updateAchievements(db);
        return send(todo);
      }
    }
  }

  // --- Achievements ---
  if (parts[1] === "achievements" && method === "GET") {
    return send(db.achievements);
  }

  send({ error: "not found" }, 404);
}

// --- XP System ---
function addXp(db, amount) {
  db.karma.totalXp += amount;
  let xp = db.karma.totalXp;
  let level = 1;
  let needed = 100;
  while (xp >= needed) {
    xp -= needed;
    level++;
    needed = level * 100;
  }
  db.karma.level = level;
}

// --- Streak System ---
function updateStreak(db) {
  const today = todayStr();
  const last = db.streak.lastDate;
  if (last === today) return; // already tracked today
  if (last) {
    const lastDate = new Date(last);
    const diff = Math.round((new Date(today) - lastDate) / 86400000);
    if (diff === 1) {
      db.streak.current++;
    } else {
      db.streak.current = 1;
    }
  } else {
    db.streak.current = 1;
  }
  if (db.streak.current > db.streak.longest) db.streak.longest = db.streak.current;
  db.streak.lastDate = today;
  // Add daily activity
  if (!db.dailyActivity.find((d) => d.date === today)) {
    db.dailyActivity.push({ date: today, count: 0 });
  }
  const todayAct = db.dailyActivity.find((d) => d.date === today);
  todayAct.count = (todayAct.count || 0) + 1;
}

// --- Achievement Check ---
function updateAchievements(db) {
  let changed = false;
  db.achievements.forEach((a) => {
    if (a.unlocked) return;
    let met = false;
    switch (a.conditionType) {
      case "todosCompleted":
        met = db.counter.todosCompleted >= a.conditionTarget;
        break;
      case "streak":
        met = db.streak.longest >= a.conditionTarget;
        break;
      case "goalsCompleted":
        met = db.counter.goalsCompleted >= a.conditionTarget;
        break;
      case "milestonesCompleted":
        met = db.counter.milestonesCompleted >= a.conditionTarget;
        break;
      case "allDimensions":
        const dimsWithGoal = new Set(db.goals.map((g) => g.dimensionId));
        met = dimsWithGoal.size >= a.conditionTarget;
        break;
      case "perfectDay":
        met = db.dailyActivity.some((d) => d.count >= a.conditionTarget);
        break;
    }
    if (met) {
      a.unlocked = true;
      a.unlockedAt = new Date().toISOString();
      changed = true;
    }
  });
  if (changed) writeDb(db);
}

// --- Server ---
const server = http.createServer(async (req, res) => {
  try {
    const { method, url } = req;
    cors(res);
    if (method === "OPTIONS") return res.end();

    if (url.startsWith("/api/")) {
      const body = ["POST", "PUT", "PATCH"].includes(method) ? await parseBody(req) : {};
      await handleApi(method, url, body, res);
    } else {
      serveStatic(url, res);
    }
  } catch (err) {
    console.error("Server error:", err);
    if (!res.headersSent) {
      res.writeHead(500, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: "Internal server error" }));
    }
  }
});

function cors(res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, PATCH, DELETE, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
}

server.listen(PORT, () => {
  console.log("Server running at http://localhost:" + PORT);
});
