# CHANGELOG

## UI 重设计（taste-ui-design · Minimalist）

| 时间 | 修改内容 |
|---|---|
| 2026-07-19 21:54 | style.css 重写：暖灰阴影、显式 transition 缓动、骨架屏/focus-visible/页面淡入、侧边栏 228px、容器 1400px、目标双列网格、900/540px 断点 |
| 2026-07-19 21:55 | api.js：新增 23 枚内联 SVG 图标（P 字典 + svgIcon 工厂），替换成就/桶/操作按钮文字占位符，toast 加图标与退出动画 |
| 2026-07-19 21:55 | components.js：按钮全图标化，新增 renderSkeleton/renderEmpty/confirmAction/renderHeatmap 渲染器，成就卡片左边框+圆形底纹 |
| 2026-07-20 19:54 | pages.js：骨架屏替代 spinner，空态统一走 renderEmpty，热力图换 renderHeatmap（月份/星期/图例），完成目标加 done-badge |
| 2026-07-20 19:57 | actions.js：confirm() 全部替换为 confirmAction() 弹窗，表单加 autofocus，toast 消息去符号 |
| 2026-07-20 19:58 | main.js：加载态换骨架屏，page-enter 过渡动画，ESC 键关闭模态，404 用 renderEmpty |
| 2026-07-20 20:00 | index.html：加 favicon data URI、meta description、skip-link（tabindex=-1） |

### 待验证

- [ ] node --check 各 JS 文件
- [ ] 启动 server 截图检查渲染