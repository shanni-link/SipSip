# 📝 执行步骤

> 版本：v1.0 | 日期：2026-06-22
>
> 按此顺序搭积木式开发，每次只做一个组件。

---

## Phase 0：项目初始化 ✅

- [ ] 0.1 Vite + React + TypeScript 项目创建
- [ ] 0.2 安装依赖（Tailwind / Framer Motion / React Router / Zustand / Dexie.js）
- [ ] 0.3 Tailwind 配置（自定义 theme 扩展）
- [ ] 0.4 全局 CSS 变量注入（`src/styles/tokens.css`）
- [ ] 0.5 纸张纹理全局背景
- [ ] 0.6 Google Fonts 引入
- [ ] 0.7 基础路由框架（HashRouter + 5 个页面占位）

---

## Phase 1：Header 组件 🔲

```
1.1 MonthHeader  — 月份切换 (← 2026年6月 →) + 📦收集盒徽标
1.2 ListHeader   — ←返回 + "小票存根" + 搜索/筛选图标
1.3 StepHeader   — ←返回 + ●○○○○○ 步骤指示器

依赖: 无
页面: 日历首页 / 列表页 / 新增流程
```

**完成标准**:
- [ ] 三端响应式通过
- [ ] 月份左右切换正常工作
- [ ] 收集盒徽标数字显示
- [ ] 步骤指示器 6 步状态切换
- [ ] 返回按钮导航正常

---

## Phase 2：Sidebar 组件 🔲

```
2.1 BottomNavBar  — 📅日历 + 🧋FAB (+)
2.2 FilterPanel   — 品牌/评分/日期 筛选浮层（列表页用）

依赖: Header (FAB 在导航栏上方突出)
页面: 所有页面
```

**完成标准**:
- [ ] FAB 突出导航栏 18px
- [ ] FAB hover glow 发光效果
- [ ] 点击 FAB 跳转 /new/photo
- [ ] 筛选面板从底部滑入
- [ ] 筛选条件可清除

---

## Phase 3：Card 组件 🔲

```
3.1 ReceiptCard  — 完整小票（撕边 + 品牌色 + 印章评分 + 语音图标）
3.2 DayCell      — 日期格（今天红圈 + 交叠缩略图）
3.3 TeaThumb     — 单张抠图缩略图（白边拍立得效果）
3.4 TeaStack     — 多图交叠（最多3层 + +N 标记）
3.5 MonthlySummary  — 月度统计卡（虚线缝线 + 旋转照片墙）
3.6 HistoricalFavorite — 历史最爱（展开/折叠）
3.7 StepIndicator — 步骤指示器（可被 Header 引用）

依赖: 无
页面: 日历首页 / 列表页 / 新增流程 / 详情弹层
```

**完成标准**:
- [ ] 6 种品牌色小票渲染正确
- [ ] 撕边锯齿 SVG 显示
- [ ] 印章评分交互正常（点击盖印动画）
- [ ] 日历格空/有奶茶/今天高亮 3 态
- [ ] 缩略图交叠偏移正确
- [ ] 月度统计旋转照片墙
- [ ] 缝线虚线边框

---

## Phase 4：Search 组件 🔲

```
4.1 SearchInput   — 搜索输入框（列表页）
4.2 FilterChips   — 筛选条件标签（可×清除）
4.3 SortSelector  — 排序下拉

依赖: 无
页面: 列表页
```

**完成标准**:
- [ ] 搜索实时过滤（品牌名/奶茶名）
- [ ] 筛选标签可点击×清除
- [ ] 排序切换正常
- [ ] 无搜索结果空状态

---

## Phase 5：Footer 组件 🔲

```
5.1 BottomNavBar  — 已在 Phase 2 中完成
5.2 PageFooter    — 页面底部操作栏（上一步/下一步/确认）
5.3 SafeArea      — iPhone 底部安全区适配

依赖: Sidebar (共用 BottomNavBar)
页面: 新增流程 / 编辑页
```

**完成标准**:
- [ ] 操作按钮状态正确（上一步/下一步/确认）
- [ ] safe-area-inset-bottom 适配
- [ ] 按钮置灰态/激活态切换

---

## Phase 6：弹层 & 模态 🔲

```
6.1 ReceiptModal    — 小票详情弹层（从底部滑入 + 自动播语音）
6.2 ConfirmDialog   — 删除确认弹窗
6.3 Toast/Notify    — 轻提示（保存成功/失败）

依赖: Card (ReceiptCard 复用)
页面: 全应用
```

**完成标准**:
- [ ] 弹层滑入/滑出动画 (300ms)
- [ ] 点击遮罩关闭
- [ ] 自动播放语音
- [ ] 编辑/删除按钮功能

---

## Phase 7：页面组装 🔲

```
7.1 CalendarPage   — 日历首页 (Header + CalendarGrid + MonthlySummary + HistoricalFavorite)
7.2 ListPage       — 小票列表 (ListHeader + ReceiptStack + FilterPanel)
7.3 NewRecordPage  — 新增流程 (StepHeader + 6 个子步骤)
7.4 EditPage       — 编辑记录 (预填表单)
7.5 路由连接       — HashRouter + 页面转场动画
```

---

## Phase 8：数据层 🔲

```
8.1 Dexie.js 数据库初始化
8.2 CRUD 操作封装
8.3 Zustand stores (calendar / list / new-record-draft)
8.4 草稿机制（localStorage 持久化）
```

---

## Phase 9：AI 抠图 & 语音 🔲

```
9.1 @imgly/background-removal 集成
9.2 Remove.bg API 兜底
9.3 Web Speech API 语音录入
9.4 EXIF 日期读取
```

---

## Phase 10：PWA & 收尾 🔲

```
10.1 vite-plugin-pwa 配置
10.2 manifest.json + 图标
10.3 Service Worker 离线缓存
10.4 最终测试 & Bug 修复
```

---

## 开发节奏建议

```
每次只做 1 个组件 → 肉眼验证 → 更新日志 → 下一个

预估每个组件时间:
  Header:  30min
  Sidebar: 30min
  Card:    60min (最复杂)
  Search:  20min
  Footer:  15min
  Modal:   30min
  页面组装: 60min
  数据层:  45min
  AI/语音: 45min
  PWA:     30min

总计: ~6-7 小时
```
