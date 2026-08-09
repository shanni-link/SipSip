# 🧋 奶茶记录仪 — CLAUDE.md

> Claude Code 工作指引 | 每次对话自动加载

---

## 项目概述

一款移动端优先的 PWA 奶茶记录工具。核心体验：拍照 → AI 抠图 → 填信息 → 生成小票 → 撕下 → 日历回顾 → 点击听心情。

---

## 关键文件路径

### 规划文档（只读参考）

| 文件 | 路径 | 说明 |
|------|------|------|
| 📋 PRD | [奶茶记录仪prd.md](奶茶记录仪prd.md) | 产品需求文档 v1.4 — 功能清单、页面结构 |
| 🏗️ 架构 | [architecture.md](architecture.md) | 技术架构 v1.0 — 组件树、数据流、路由 |
| 📄 页面 | [pages.md](pages.md) | 页面规划 v1.0 — 5 个页面的组件分解 |
| 🎨 设计系统 | [design-system.md](design-system.md) | 设计系统 v2 — CSS 变量、色彩、字体、动效 |
| 🖼️ 设计 Demo | [design-system-demo.html](design-system-demo.html) | 可视化设计预览 |

### 开发规范（docs/）

| 文件 | 路径 | 说明 |
|------|------|------|
| 📐 开发规范 | [docs/development-standards.md](docs/development-standards.md) | 编码规范、命名约定、Git 规范 |
| ⚙️ 技术规范 | [docs/tech-specs.md](docs/tech-specs.md) | 技术栈、版本锁定、配置说明 |
| 🎨 设计规范 | [docs/design-specs.md](docs/design-specs.md) | 设计 token 速查、组件 API |
| 📝 执行步骤 | [docs/execution-steps.md](docs/execution-steps.md) | 开发阶段、执行顺序、检查点 |

### 开发日志（开发日志/）

| 文件 | 说明 |
|------|------|
| `开发日志/YYYY-MM-DD.md` | 每日自动记录，包含完成事项 + 待办事项 |

---

## 每日工作流程

### 启动时
1. 读取 `开发日志/` 最新日志，了解当前进度
2. 检查待办事项，确定今天要做的任务
3. 确认目标组件和依赖关系

### 收工时
1. 更新当日开发日志：记录完成事项 + 更新待办
2. 确保项目可编译运行
3. 标注阻碍项（如有）

### 组件开发顺序（严格按此顺序搭积木）

```
1. Header    — 顶部栏（MonthHeader / ListHeader / StepHeader）
2. Sidebar   — 侧边栏 / 底部导航
3. Card      — 小票卡片 / 日历格 / 统计卡
4. Search    — 搜索筛选面板
5. Footer    — 页脚 / 底部操作栏
```

每个组件完成后必须：
- ✅ 在浏览器中肉眼验证
- ✅ 响应式检查（手机/平板/桌面 3 个断点）
- ✅ 空状态、正常态、交互态均通过
- ✅ 更新开发日志

---

## 技术栈速查

```
框架:     React 18 + TypeScript
构建:     Vite 5
样式:     Tailwind CSS 3 + 自定义 CSS 变量
动效:     Framer Motion（复杂转场）+ CSS @keyframes（微交互）
路由:     React Router v6 (HashRouter)
状态:     Zustand
存储:     Dexie.js (IndexedDB)
PWA:      Workbox + vite-plugin-pwa
```

---

## 编码约定

- **组件文件**: PascalCase → `Header.tsx`、`ReceiptCard.tsx`
- **样式文件**: 同组件名 → `Header.css`
- **状态管理**: 页面状态用 Zustand store，组件内部状态用 useState
- **CSS 变量**: 所有颜色/字体/间距使用 `var(--xxx)`，禁止硬编码 hex
- **动画**: 简单动效用 CSS @keyframes，复杂转场用 Framer Motion
- **空状态**: 每个组件必须有空状态设计（无数据时展示）

---

## 设计 Token 速查

```
主背景:   var(--tea-50)    #fbf5ed (暖纸色)
卡片底:   var(--surface)   #fffdf7 (暖白纸)
正文色:   var(--tea-800)   #2f1f12 (深棕)
印章红:   var(--accent)    #c94a3a (仅用于强调 → FAB/评分/删除)
标题体:   var(--font-display)  Noto Serif SC
正文字:   var(--font-body)     Zen Kaku Gothic New
印章体:   var(--font-stamp)    Ma Shan Zheng
间距基:   4px → --space-1 ~ --space-16
```

---

## 禁止事项

- ❌ 不使用 Ant Design / MUI 等重型 UI 库（项目目标是轻量自定义设计）
- ❌ 不硬编码颜色值（必须用 CSS 变量）
- ❌ 不使用 Inter / Roboto / Arial 字体
- ❌ 不一口气做多个组件（每次只做一个组件）
- ❌ 不跳过空状态和错误状态
- ❌ 不在未确认设计时擅自修改 design-system 中的 token
