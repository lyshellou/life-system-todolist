# Life System TodoList — Agent Guide

## Project Overview

A personal life-management dashboard combining long-term goal tracking with daily todo management. Built as a single-page application served by a zero-dependency Node.js HTTP server.

**Core Philosophy:**
- 5 life dimensions (Health, Work, Study, Social, Fun) each with their own goals
- Three-bucket todo system: Today / Anytime / Someday
- XP + Level system for positive reinforcement
- Streak tracking for daily consistency
- Achievement badges that auto-unlock on condition met
- Local JSON file storage (no database server required)

---

## Architecture

```
life-system-todolist/
├── server.js              # HTTP server + REST API (Node.js built-in modules only)
├── data/
│   └── db.json            # JSON file database (all persisted state)
└── public/
    ├── index.html          # SPA shell: sidebar + content area
    ├── css/style.css       # Complete UI stylesheet (~16KB)
    └── js/
        ├── api.js          # API client + global helpers (icons, formatters, colors)
        ├── components.js   # UI component renderers (cards, progress bars, milestones)
        ├── pages.js        # 5 page renderers (Dashboard, Dimension, Goal, Todos, Achievements)
        ├── actions.js      # CRUD handlers + modal form controllers (11 window functions)
        └── main.js         # Router + sidebar init + app bootstrap
```

### Zero Dependency

The entire project uses only Node.js built-in modules: `http`, `fs`, `path`. No npm packages required. The npm registry was unavailable during development so this was a hard requirement.

- Server: `http.createServer` + `fs.readFileSync/WriteFileSync` for JSON persistence
- Frontend: Vanilla JS, no bundler, no framework, no npm packages
- CSS: Hand-written, no preprocessor
- Icons: Inline SVG paths (no icon library)

---

## Server (`server.js`)

Single-file HTTP server on port **3001**.

### Request Flow

```
client -> GET /api/dimensions -> handleApi() -> send(db.dimensions)
client -> GET /                    -> serveStatic("index.html")
client -> POST /api/todos          -> parseBody() -> handleApi() -> send(todo, 201)
```

### Static File Serving

- Serves files from `public/` directory
- MIME types: `.html`, `.css`, `.js`, `.json`, `.png`, `.svg`, `.ico`
- Falls back to `index.html` for unknown extensions (SPA catch-all)

### API Endpoints

| Method | Path | Description |
|---|---|---|
| **Dimensions** | | |
| GET | `/api/dimensions` | List all dimensions |
| POST | `/api/dimensions` | Create dimension |
| PUT | `/api/dimensions/:id` | Update dimension |
| DELETE | `/api/dimensions/:id` | Delete dimension (cascade: removes goals + unbind todos) |
| **Goals** | | |
| GET | `/api/goals[?dimensionId=X]` | List goals (optional filter) |
| GET | `/api/goals/:id` | Get single goal with milestones |
| POST | `/api/goals` | Create goal |
| PUT | `/api/goals/:id` | Update goal |
| DELETE | `/api/goals/:id` | Delete goal (cascade: removes milestones + unbind todos) |
| **Milestones** | | |
| POST | `/api/milestones` | Create milestone (requires `goalId`) |
| PUT | `/api/milestones/:id` | Update milestone |
| DELETE | `/api/milestones/:id` | Delete milestone |
| PATCH | `/api/milestones/:id/toggle` | Toggle achieved state (+25 XP if newly achieved) |
| **Todos** | | |
| GET | `/api/todos[?bucket=X&goalId=Y&completed=0\|1]` | List todos with filters |
| POST | `/api/todos` | Create todo |
| PUT | `/api/todos/:id` | Update todo |
| DELETE | `/api/todos/:id` | Delete todo |
| PATCH | `/api/todos/:id/complete` | Toggle completion (+10 XP, updates streak, checks achievements) |
| **Stats** | | |
| GET | `/api/stats` | Aggregated stats: karma, streak, counters, dimension progress, achievements |
| GET | `/api/stats/activity[?year=2026]` | Daily activity heatmap data |
| **Achievements** | | |
| GET | `/api/achievements` | All achievements with unlock status |

### Server Internals

- `cors(res)`: Sets CORS headers for all requests
- `parseBody(req)`: Returns Promise resolving to parsed JSON body
- `send(data, code)`: Writes JSON response with status code
- `readDb()` / `writeDb(data)`: Synchronous JSON file I/O
- `uid()`: Generates unique ID via `Date.now().toString(36) + Math.random().toString(36).slice(2, 8)`
- `todayStr()`: Returns today's date as `YYYY-MM-DD` string

---

## Database Schema (`data/db.json`)

```json
{
  "dimensions": [
    {
      "id": "dim-health",
      "name": "健康",
      "icon": "heart",           // Key into ICONS map in api.js
      "color": "#346538",        // Text/accent color
      "bgColor": "#EDF3EC",      // Card background
      "sortOrder": 1,
      "createdAt": "ISO-date"
    }
  ],
  "goals": [
    {
      "id": "goal-xxx",
      "dimensionId": "dim-health",
      "title": "Run 5km",
      "description": "",
      "targetDate": "ISO-date or null",
      "sortOrder": 1,
      "completed": false,
      "completedAt": "ISO-date or null",
      "createdAt": "ISO-date"
    }
  ],
  "milestones": [
    {
      "id": "ms-xxx",
      "goalId": "goal-xxx",
      "title": "First 1km",
      "sortOrder": 1,
      "achieved": false,
      "achievedAt": "ISO-date or null",
      "createdAt": "ISO-date"
    }
  ],
  "todos": [
    {
      "id": "todo-xxx",
      "title": "Morning run",
      "note": "",
      "bucket": "today|anytime|someday",
      "goalId": "goal-xxx or null",
      "priority": "high|medium|low",
      "completed": false,
      "completedAt": "ISO-date or null",
      "dueDate": "ISO-date or null",
      "sortOrder": 1,
      "createdAt": "ISO-date"
    }
  ],
  "dailyActivity": [
    { "date": "2026-07-16", "count": 5 }
  ],
  "karma": { "totalXp": 0, "level": 1 },
  "streak": { "current": 0, "longest": 0, "lastDate": "ISO-date or null" },
  "counter": { "todosCompleted": 0, "goalsCompleted": 0, "milestonesCompleted": 0 },
  "achievements": [
    {
      "id": "ach-first-todo",
      "name": "第一步",
      "description": "完成第 1 个待办",
      "icon": "flag",
      "conditionType": "todosCompleted|streak|goalsCompleted|milestonesCompleted|allDimensions|perfectDay",
      "conditionTarget": 1,
      "unlocked": false,
      "unlockedAt": "ISO-date or null"
    }
  ]
}
```

---

## Business Logic

### XP & Level System

| Action | XP Gained |
|---|---|
| Complete a todo | +10 |
| Achieve a milestone | +25 |
| Complete a goal | +50 |

**Level formula:** Level N requires `N * 100` cumulative XP.
- Lv1: 0 XP (starting)
- Lv2: 100 XP total needed
- Lv3: 300 XP total (100 + 200)
- Lv4: 600 XP total (100 + 200 + 300)

Calculated in `addXp()`:
```js
db.karma.totalXp += amount;
let xp = db.karma.totalXp, level = 1, needed = 100;
while (xp >= needed) { xp -= needed; level++; needed = level * 100; }
db.karma.level = level;
```

### Streak Tracking

- Tracking logic in `updateStreak()`:
  - Same day: no change (prevents double-count)
  - Next day: `current++`
  - Gap > 1 day: `current = 1` (reset)
  - Updates `longest` if `current > longest`
  - Also records `dailyActivity` entry for heatmap

### Achievement Conditions

| Condition Type | Check | Achievement Examples |
|---|---|---|
| `todosCompleted` | `counter.todosCompleted >= target` | 1st todo (1), 10 todos (10), 100 todos (100) |
| `streak` | `streak.longest >= target` | 7-day streak (7), 30-day streak (30) |
| `goalsCompleted` | `counter.goalsCompleted >= target` | 1st goal (1), 5 goals (5) |
| `milestonesCompleted` | `counter.milestonesCompleted >= target` | 1st milestone (1) |
| `allDimensions` | Unique dimension IDs with goals >= target | All 5 dimensions (5) |
| `perfectDay` | Any `dailyActivity` entry has `count >= target` | 5 todos in 1 day (5) |

Achievements are checked in `updateAchievements()` after any XP-generating event. Once unlocked, an achievement stays unlocked permanently.

### Goal Completion

- Server-side: API `PUT /goals/:id` with `{ completed: true }` sets `completedAt`
- Client-side: `toggleGoalComplete()` makes the API call, then adds XP separately
- Note: XP for goal completion (+50) is added client-side due to a simplification, not via the server

---

## Frontend Architecture

### SPA Routing (Hash-based)

Handled in `main.js` via `hashchange` event:

```js
function parseHash() {
  const hash = location.hash.slice(1) || "/dashboard";
  const parts = hash.split("/").filter(Boolean);
  return { route: "/" + parts[0], params: parts.slice(1), hash };
}
```

Routes:
| Hash | Page | File | Function |
|---|---|---|---|
| `#/dashboard` | Dashboard | `pages.js` | `renderDashboard()` |
| `#/dimension/:id` | Dimension Detail | `pages.js` | `renderDimDetail()` |
| `#/goal/:id` | Goal Detail | `pages.js` | `renderGoalDetail()` |
| `#/todos` | Todo List | `pages.js` | `renderTodoList()` |
| `#/achievements` | Achievements | `pages.js` | `renderAchPage()` |

### Client File Loading Order

```html
<script src="/js/api.js"></script>      <!-- Global: api object, ESC, DIM_C, ICONS, toast, etc. -->
<script src="/js/components.js"></script> <!-- Render helpers: renderTodoItem, renderKarmaBar, etc. -->
<script src="/js/pages.js"></script>     <!-- Page renderers: renderDashboard, renderDimDetail, etc. -->
<script src="/js/actions.js"></script>   <!-- CRUD handlers: toggleTodo, showTodoForm, etc. -->
<script src="/js/main.js"></script>      <!-- Router + init -->
```

### Global Context (`api.js`)

| Variable | Purpose |
|---|---|
| `api` | REST client: `api.get()`, `api.post()`, `api.put()`, `api.del()`, `api.patch()` |
| `ESC(s)` | HTML-escapes a string |
| `FMT(s)` | Formats ISO date to Chinese locale (e.g. "7月16日") |
| `DIM_C` | Color map for 5 dimensions (hex bg + text colors) |
| `ICONS` | Inline SVG strings for 5 dimension icons |
| `ACH_ICONS` | Text labels for achievement icons (corrupted emoji replacement) |
| `PRI_LABELS` | Priority labels: high→高, medium→中, low→低 |
| `BUCK_LABELS` | Bucket labels: today→今天, anytime→随时, someday→某天 |
| `BUCK_ICONS` | Bucket icon labels |
| `toast(msg, type)` | Shows a toast notification (auto-dismisses after 2.5s) |
| `getDim(id)` | Returns `{ bg, c }` color for a dimension ID |
| `getIcon(name)` | Returns inline SVG for a dimension icon name |

### Action Handlers (`actions.js`)

All handlers are exposed globally via `window.*` for use in inline `onclick` attributes:

| Handler | Description |
|---|---|
| `toggleTodo(id)` | Toggle todo completion, update UI |
| `deleteTodo(id)` | Confirm + delete todo |
| `editTodo(id)` | Open modal with prefilled form |
| `showTodoForm(goalId)` | Open empty todo creation modal |
| `toggleGoalComplete(id)` | Toggle goal completion |
| `deleteGoal(id)` | Confirm + delete goal |
| `showGoalForm(dimId)` | Open goal creation modal |
| `editGoal(id)` | Open goal edit modal |
| `toggleMilestone(id)` | Toggle milestone achieved |
| `showMilestoneForm(goalId)` | Open milestone creation modal |
| `editMilestone(id)` | Open milestone edit modal |
| `deleteMilestone(id)` | Confirm + delete milestone |

### Modal System

The Modal is a singleton with an overlay (`#modalOverlay`) and content container (`#modalContent`):
- `modal.open(html)`: Sets innerHTML of modal and shows overlay
- `modal.close()`: Hides overlay and clears content
- Forms inside modals use `id="actionForm"` for the submit handler

---

## Design System

Based on the `taste-ui-design` Codex skill (Minimalist flavor + tool UI dials).

### Three Dials

| Dial | Value | Meaning |
|---|---|---|
| DESIGN_VARIANCE | 4 | Low variance, predictable daily-use tool |
| MOTION_INTENSITY | 3 | Subtle micro-interactions only |
| VISUAL_DENSITY | 6 | Moderate-high density for dashboard content |

### Color Palette

```css
--canvas: #F7F6F3;           /* Warm off-white background */
--card: #FFFFFF;              /* Card surface */
--border: #EAEAEA;            /* Light border */
--text: #1A1A1A;              /* Primary text */
--text-secondary: #787774;    /* Secondary text */
--accent: #10B981;            /* Emerald green accent */
--accent-hover: #059669;
--accent-light: #D1FAE5;
```

**Dimension Colors:**

| Dimension | Background | Text |
|---|---|---|
| Health | `#EDF3EC` | `#346538` |
| Work | `#E1F3FE` | `#1F6C9F` |
| Study | `#EBE5FA` | `#5B3E9F` |
| Social | `#FDF3DB` | `#956400` |
| Fun | `#FDEBEC` | `#9F2F2D` |

### Typography

```css
font-family: "Plus Jakarta Sans", system-ui, -apple-system, sans-serif;
font-family: "JetBrains Mono", monospace;  /* For stats/numbers */
```

Google Fonts loaded from CDN in `index.html`.

### Corner Radii

```css
--radius-card: 12px;     /* Card containers */
--radius-btn: 8px;       /* Buttons & inputs */
--radius-pill: 9999px;   /* Badges, tags */
```

### Banned Patterns (from taste-skill)

- **No AI-purple gradients**
- **No centered hero** (dashboard is content-first)
- **No pure-black shadows** on light backgrounds
- **No generic glassmorphism**
- **No "Inter" font** (using Plus Jakarta Sans per the skill's guidance)
- **No em-dashes** in visible text
- **No `ease-in-out`** transitions (prefer custom beziers, though CSS transitions are minimal in this project)

---

## Component Tree

```
AppLayout (sidebar + main-content)
├── Sidebar
│   ├── Logo ("人生系统" with checkmark SVG)
│   ├── Nav: Dashboard
│   ├── Section: 人生维度
│   │   └── 5 dimension links (dynamically loaded from API)
│   └── Section: 功能
│       ├── Nav: Todo
│       └── Nav: Achievements
└── Main Content (page container, swapped by router)
    ├── Dashboard
    │   ├── KarmaBar (XP progress + level)
    │   ├── StreakCard (consecutive days)
    │   ├── StatCards (achievements, today's todos)
    │   ├── DimensionGrid (5 cards with progress)
    │   ├── ActivityHeatmap (12 weeks)
    │   └── TodayTodos (preview list)
    ├── DimensionDetail
    │   ├── BackButton + Header + DimBadge
    │   ├── ActionBar + NewGoalButton
    │   └── GoalList (cards with progress)
    ├── GoalDetail
    │   ├── BackButton + Header + DimBadge
    │   ├── ProgressCard (percentage + counts)
    │   ├── MilestoneTimeline
    │   └── BoundTodos (list)
    ├── TodoList
    │   ├── StatsRow (pending/done/total)
    │   └── ThreeBuckets (Today/Anytime/Someday)
    └── Achievements
        └── AchievementGrid (unlocked + locked cards)
```

---

## Known Issues & Pitfalls

### 1. Character Encoding (Fixed)

**Root cause:** PowerShell `Set-Content` defaults to GB2312 on Chinese Windows. All files in this project were initially written with GB2312 encoding, causing Chinese text and emoji corruption.

**Fix applied:** All files have been converted from GB2312 to UTF-8 using `[System.IO.File]::ReadAllText(path, Encoding.GetEncoding(936))` + `WriteAllText(path, content, Encoding.UTF8)`.

**Future changes:** Always use these PowerShell write patterns:
```powershell
# ✅ Correct
[System.IO.File]::WriteAllText("file.js", $content, [System.Text.Encoding]::UTF8)
# ❌ Wrong (uses GB2312)
Set-Content -Path "file.js" -Value $content
```

### 2. Emoji Corruption (Fixed)

Emoji characters (`✅`, `🗑️`, `✏️`, etc.) were destroyed during the initial GB2312 writes. They've been replaced with text equivalents (e.g., `✓` for checkmark, removed from button text). If you want emoji back, you'll need to re-add them via a UTF-8-safe write method.

### 3. Background Server Instability

The Node.js server cannot reliably run as a background process in this sandbox environment. Start it in a foreground terminal:
```bash
node server.js
```

### 4. No npm Dependencies

The npm registry was unavailable during development. If you add npm packages in the future, verify they install correctly and update the import pattern accordingly.

---

## How to Extend

### Adding a New Entity

1. Add seed data to `data/db.json`
2. Add route handlers to `server.js` following the existing CRUD pattern
3. Add API client methods to `public/js/api.js` (if the existing `api` object doesn't cover the paths)
4. Create render functions in `public/js/pages.js` or `public/js/components.js`
5. Add action handlers in `public/js/actions.js`
6. Add route to router in `public/js/main.js`

### Adding a New Page

1. Add `renderNewPage()` function in `pages.js`
2. Add route case in `main.js` `parseHash()` switch
3. Add nav link in `public/index.html` sidebar
4. If needed, add new API endpoints in `server.js`

### Adding a New Achievement

Add a new entry to the `achievements` array in `data/db.json` seed data. The condition types are already extensible. Add a new `case` in `updateAchievements()` in `server.js` for new condition types.

### Styling

All CSS is in `public/css/style.css`. CSS custom properties (variables) are defined in `:root`. Component-specific styles are grouped by component name in comments.

---

## Seed Data

When `data/db.json` is first created (or reset), it contains:

- **5 dimensions**: 健康/工作/学习/人际/娱乐 (Health/Work/Study/Social/Fun)
- **0 goals**: Empty, user creates their own
- **0 milestones**: Empty
- **0 todos**: Empty
- **10 achievements**: Pre-defined with condition rules
- **Reset state**: karma=0, level=1, streak=0, all counters=0
