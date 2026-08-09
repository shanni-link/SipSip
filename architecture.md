# 🧋 奶茶记录仪 — 网站架构设计

> 配合 PRD v1.4 | 日期：2026-06-22 | 状态：已确认
>
> 📌 本文档与 [奶茶记录仪prd.md](奶茶记录仪prd.md) 配套，架构变更时需同步更新。

---

## 一、网站地图 (Sitemap)

```
奶茶记录仪
│
├── 🏠 日历首页          /                         [默认页]
│   ├── 📦 收集盒         → /list                   [右上角图标，列表唯一入口]
│   └── (弹层) 小票详情                            [模态覆盖，不改变路由]
│
├── 📋 列表视图           /list                     [从收集盒进入]
│   └── (弹层) 小票详情   同上                      [共用同一模态组件]
│
├── ➕ 新增记录           /new                      [全屏流程页]
│   ├── Step 1: 拍照      /new/photo
│   ├── Step 2: 日期      /new/date
│   ├── Step 3: 抠图      /new/cutout
│   ├── Step 4: 信息      /new/info
│   ├── Step 5: 心情      /new/mood
│   └── Step 6: 小票预览   /new/preview
│
└── ✏️ 编辑记录           /edit/:id                 [从详情进入]
```

**只有 4 个"真页面"**（对应路由），其余都是弹层/浮层：

| 路由 | 页面 | 类型 |
|------|------|------|
| `/` | 日历首页 | 主页面 |
| `/list` | 小票列表 | 主页面 |
| `/new/*` | 新增记录（多步） | 全屏流程 |
| `/edit/:id` | 编辑记录 | 全屏页面 |
| *(弹层)* | 小票详情 | 模态浮层 |

---

## 二、页面关系图

```
                    ┌──────────────┐
                    │   启动画面    │
                    └──────┬───────┘
                           │
                    ┌──────▼───────┐
                    │  日历首页 /   │  ← 默认首页
                    │  (月历网格)   │
                    │  [📦收集盒]  │  ← 右上角
                    └──┬───┬───┬───┘
                       │   │   │
         点击缩略图     │   │   │  点击📦收集盒
                       │   │   │
        ┌──────┐       │   │   └────────────┐
        ▼      │       │   │                ▼
  ┌──────────┐│       │   │        ┌──────────────┐
  │ 小票详情  ││       │   │        │  列表视图 /list │
  │ (模态弹层) ││       │   │        │  (小票交叠堆叠)  │
  └──┬───┬───┘│       │   │        └────────┬───────┘
     │   │    │       │   │                 │
     │   └────┼───────┼───┼── 点击小票 ────┘
     │        │       │   │   (同样弹出小票详情)
     │  点击编辑        │   │
     ▼        │       │   │
┌──────────┐ │       │   │
│ 编辑记录  │ │       │   │
│/edit/:id │ │       │   │
└──────────┘ │       │   │
             │       │   │
    点击删除  │       │   │
    (确认后  │       │   │
     返回)   │       │   │
             │       │   │
    底部FAB "+"       │   │
    (日历页)          │   │
             │       │   │
             ▼       ▼   ▼
      ┌─────────────────────┐
      │  新增记录 /new/*     │
      │  (7步流程)          │
      │  完成后 → 回日历首页 │
      └─────────────────────┘
```

**关键关系**：
- 日历是**唯一主页**，列表是日历的子页面（通过📦收集盒进入）
- 小票详情是**模态弹层**，从日历和列表都能触发
- 新增记录通过底部 FAB 进入，**独立全屏流程**，完成后自动回到日历
- 编辑记录从详情弹层进入，保存/取消后回到弹层

---

## 三、用户流程 (User Flows)

### 3.1 主流程：记录一杯新奶茶 🧋

```
[日历] 或 [列表]
   │
   └── 点 FAB "+"
        │
        ▼
   Step 1 【拍照/选照片】
        │ 拍照 or 相册选择
        ▼
   Step 2 【确认日期】
        │ 自动读EXIF → 展示日期 → 可手动改
        ▼
   Step 3 【AI 抠图】
        │ 展示进度条 → 预览结果 → 不满意点"增强"
        ▼
   Step 4 【填写信息】
        │ 奶茶名·品牌·门店·杯型·甜度·温度·小料·价格·评分
        ▼
   Step 5 【记录心情】
        │ 录音 / 打字 / 都做
        ▼
   Step 6 【小票预览】
        │ 展示生成的小票 → 满意?
        ▼
   Step 7 【✂️ 撕下小票 + 📌 贴入日历 + 📦 收入盒中】
        │ ① 撕下动效
        │ ② 抠图飞出 → 飞向日历对应日期 → "啪"贴上（弹性缩放动效）
        │ ③ 小票同时飘入右上角📦收集盒（贝塞尔曲线）
        │ ④ 收集盒图标抖动/弹跳 + 数字+1
        │ 存入数据库 → 返回首页
        ▼
   [日历首页] ← 新奶茶抠图已在对应日期格中
              月度统计自动更新
              收集盒数字已+1
```

### 3.2 回顾流程：听之前的心情

```
[日历首页]
   │
   └── 点击某天的奶茶缩略图
        │
        ▼
   [小票详情弹层]
   │ 自动播放语音 🔊
   │ 展示全部信息
   │
   ├── 点空白处 → 关闭弹层
   │
   ├── 点「编辑」→ 进入编辑页 → 修改 → 保存 → 回到弹层
   │
   └── 点「删除」→ 确认弹窗 → 是 → 删除 → 关闭弹层
```

### 3.3 浏览流程：翻小票

```
[列表视图]
   │
   │  看到按日期分组的小票
   │
   ├── 某天只有 1 杯 → 显示单张小票
   │   └── 点击 → 播放语音 🔊
   │
   ├── 某天有 3 杯 → 小票交叠堆叠
   │   ├── 左滑 → 翻到下一张
   │   ├── 右滑 → 翻回上一张
   │   └── 点击当前可见小票 → 播放语音 🔊
   │
   └── 顶部筛选 → 按品牌过滤 / 按评分排序
```

### 3.4 查看月度统计

```
[日历首页]
   │
   └── 向下滚动（日历下方）
        │
        ▼
   [📊 月度统计卡片]
   │ 本月 X 杯 · X 家店
   │ 5张奶茶抠图
   │ 💰 消费总额
   │
   └── 继续下滑
        │
        ▼
   [🏆 历史最爱卡片]
   │ 本月最爱：多肉葡萄 × 3杯 + 抠图
   │
   └── 点击「查看历史最爱」→ 展开
        │
        ▼
   [历史最爱列表]
   │ 2026年6月 → 多肉葡萄 × 3杯
   │ 2026年5月 → 伯牙绝弦 × 2杯
   │ 2026年4月 → 杨枝甘露 × 4杯
   │ ...
   └── 再次点击收起
```

### 3.5 从小票盒浏览

```
[日历首页]
   │
   └── 点击右上角📦收集盒
        │
        ▼
   [小票列表 /list]
   │ 所有小票，按日期分组
   │ 筛选：按品牌 / 按评分 / 按日期范围
   │
   └── ← 返回按钮回到日历
        (或手机手势右滑返回)
```

### 3.6 编辑/删除流程

```
[小票详情弹层]
   │
   ├── 点「编辑」
   │   └── 进入 /edit/:id
   │       修改任意字段（可重拍/重抠/重录心情）
   │       → 保存 → 回到弹层（数据已更新）
   │
   └── 点「删除」
       └── 确认弹窗："确定删除这杯奶茶记录？"
           ├── 取消 → 回到弹层
           └── 确认 → 删除本地数据 → 关闭弹层 → 刷新页面
```

---

## 四、导航逻辑

### 4.1 底部导航栏（仅日历主页）

```
┌────────────────────┬────────────────────┐
│     📅 日历        │     🧋  (+)        │
│                    │                    │
└────────────────────┴────────────────────┘
```

| 按钮 | 行为 |
|------|------|
| 📅 日历 | 当前页 `/`，始终高亮 |
| 🧋 (+) | FAB 按钮，跳转 `/new/photo` 新增记录 |

- 仅 2 个按钮，简洁
- 列表入口由右上角📦收集盒独家承担
- (+) 按钮视觉突出（浮起、主色填充、轻阴影）

### 4.2 顶部导航（按页面变化）

| 页面 | 顶部内容 |
|------|---------|
| `/` 日历 | `← 2026年6月 →` 月份切换器 + 右上角 [📦 收集盒(N)] |
| `/list` 列表 | `小票存根` 标题 + 右侧筛选/排序图标 |
| `/new/*` 各步 | `← 返回` + 步骤指示器 `●○○○○○` (Step 1/6) |
| `/edit/:id` | `← 返回` + `编辑记录` 标题 |

### 4.3 导航规则

- **日历 → 列表**：点击📦收集盒，push 进历史栈（保留返回手势），列表页滚动位置独立
- **→ 新增记录**：push 进历史栈，返回时 pop 回之前的页面
- **→ 小票详情**：模态弹层，不产生路由变化，关闭即消失
- **→ 编辑页**：从详情弹层 push 进去，保存后 pop 回弹层
- **→ 删除**：确认后删除数据，关闭弹层，底层页面刷新数据

### 4.4 手势导航（移动端）

| 手势 | 场景 | 行为 |
|------|------|------|
| 左右滑 | 日历 | 切换上/下月 |
| 左右滑 | 列表（同组小票） | 翻看叠放的小票 |
| 右滑 | 新增流程任意步 | 返回上一步 |
| 下滑 | 小票详情弹层 | 关闭弹层 |
| 下滑 | 小票预览(Step 6) | ✂️ 撕下小票 |

---

## 五、数据结构设计

### 5.1 IndexedDB 数据库

```
数据库名: milktea-diary
版本: 1

📦 表 (Object Stores):
├── records          — 奶茶记录（主表）
├── brands           — 品牌预设 + 用户自定义
└── settings         — 用户设置
```

### 5.2 records 表

```
{
  // 主键
  id: string (UUID v4),

  // 图片
  originalImage: Blob,          // 原图
  cutoutImage: Blob | null,     // 抠图结果（可为空=抠图失败用原图）

  // 基本信息
  teaName: string,              // 奶茶名 "多肉葡萄"
  brand: string,                // 品牌 "喜茶"
  store: string,                // 门店 "XX路店"
  date: string,                 // 日期 "2026-06-22"

  // 口味
  size: 'medium' | 'large' | 'xl',
  sweetness: 'full' | '70' | '50' | '30' | 'none',
  temperature: 'ice' | 'less-ice' | 'no-ice' | 'room' | 'warm' | 'hot',
  toppings: string[],           // ['珍珠', '脆波波']

  // 评价
  price: number,                // 18.00
  rating: 1 | 2 | 3 | 4 | 5,

  // 心情
  moodText: string | null,      // 文字心情
  moodAudio: Blob | null,       // 语音录音
  moodTranscript: string | null,// 语音转写

  // 元数据
  createdAt: number,            // 时间戳
  updatedAt: number             // 时间戳
}

// 索引 (Indexes):
// - date        : 按日期查询日历
// - brand       : 按品牌筛选
// - rating      : 按评分排序
// - createdAt   : 按创建时间排序
```

### 5.3 brands 表（品牌预设管理）

```
{
  id: string,
  name: string,                 // "喜茶"
  colorScheme: {                // 小票配色
    primary: '#1a1a1a',
    secondary: '#d4a574',
    background: '#faf3e0'
  },
  isPreset: boolean,            // 是否系统预设
  createdAt: number
}
```

### 5.4 settings 表（用户偏好）

```
{
  key: string,                  // 主键
  value: any
}

// 预设条目：
// - { key: 'removeBgApiKey', value: '...' }
// - { key: 'defaultSize', value: 'large' }
// - { key: 'theme', value: 'auto' }
```

### 5.5 数据流

```
用户操作 → React State (Zustand) → Dexie.js → IndexedDB
                                      ↕
                                 浏览器本地存储
                                 (离线可用，无后端)
```

---

## 六、组件树（初步）

```
App
├── BottomNavBar                    // 底部导航（仅日历页显示）
│   ├── TabCalendar
│   └── FABAddButton                // 仅2个按钮
│
├── CalendarPage  /                 // 日历首页
│   ├── MonthHeader                 // 月份切换 + [📦 收集盒(N)]
│   ├── CalendarGrid                // 月历网格
│   │   └── DayCell × 28-31        // 每个日期格
│   │       └── TeaStack            // 奶茶交叠缩略图
│   │           └── TeaThumb × N   // 单个缩略图
│   ├── MonthlySummary              // 📊 月度统计卡片
│   │   ├── StatRow (杯数/店数)
│   │   ├── CutoutStrip (5张抠图)
│   │   └── TotalSpent (消费额)
│   ├── HistoricalFavorite           // 🏆 历史最爱卡片
│   │   ├── CurrentMonthFavorite    // 本月最爱（默认可见）
│   │   └── AllTimeFavoriteList     // 历史各月最爱（可展开/折叠）
│   ├── ReceiptModal                // 小票详情弹层（共享）
│   └── PasteAnimation              // 📌 贴日历动效（新增后触发）
│
├── ListPage  /list                 // 列表视图
│   ├── ListHeader                  // 标题 + 筛选/排序
│   ├── DateGroup × N              // 按日期分组
│   │   └── ReceiptStack            // 同天小票叠放
│   │       └── ReceiptCard × N    // 单张小票（可滑动）
│   └── ReceiptModal                // 小票详情弹层（共享）
│
├── NewRecordFlow  /new/*           // 新增记录流程
│   ├── StepIndicator               // 步骤进度条
│   ├── Step1_Photo                 // 拍照/选照片
│   ├── Step2_Date                  // 确认日期
│   ├── Step3_Cutout                // AI抠图
│   ├── Step4_Info                  // 填信息
│   ├── Step5_Mood                  // 录音/输入心情
│   ├── Step6_Preview               // 小票预览
│   └── Step7_TearAndFly            // ✂️撕下 + 📌贴日历 + 📦飞收集盒
│
├── EditPage  /edit/:id             // 编辑页面
│   └── EditForm
│
└── Shared Components
    ├── ReceiptCard                  // 小票卡片（核心复用组件）
    │   ├── TearEdge (撕边SVG)
    │   ├── CutoutImage
    │   ├── TeaInfo
    │   ├── RatingStars
    │   ├── MoodText
    │   ├── AudioPlayer
    │   └── BrandColorWrapper
    ├── ReceiptModal                 // 小票详情弹层
    ├── ReceiptBox                   // 📦 收集盒（带数字徽标+飞入动画）
    ├── AudioRecorder                // 语音录制组件
    ├── BrandPicker                  // 品牌选择器
    ├── ToppingPicker               // 小料多选器
    └── RatingInput                  // 星级评分输入
```

---

## 七、路由设计

```
/                   → CalendarPage       (默认)
/list               → ListPage
/new/photo          → NewRecordFlow Step 1
/new/date           → NewRecordFlow Step 2
/new/cutout         → NewRecordFlow Step 3
/new/info           → NewRecordFlow Step 4
/new/mood           → NewRecordFlow Step 5
/new/preview        → NewRecordFlow Step 6
/edit/:id           → EditPage
```

- 使用 React Router (HashRouter，兼容 PWA/文件协议)
- `/new/*` 各步骤间用 `replace` 推进，保证"返回"是回到上一页而非上一步
- 小票详情弹层不占用路由，通过 state 控制显隐

---

## 八、状态管理

```
Zustand Store 设计:

├── recordsStore       // 奶茶记录 CRUD
│   ├── records: TeaRecord[]
│   ├── fetchByMonth(year, month)
│   ├── fetchByDate(date)
│   ├── add(record)
│   ├── update(id, data)
│   └── delete(id)
│
├── newRecordStore     // 新增流程临时状态（跨步骤）
│   ├── step: 1-7
│   ├── photo: Blob | null
│   ├── date: string
│   ├── cutoutImage: Blob | null
│   ├── teaName: string
│   ├── brand: string
│   ├── store: string
│   ├── size: string
│   ├── sweetness: string
│   ├── temperature: string
│   ├── toppings: string[]
│   ├── price: number
│   ├── rating: number
│   ├── moodText: string
│   ├── moodAudio: Blob | null
│   ├── reset()                  // 清空所有临时数据
│   └── toRecord(): TeaRecord    // 转换为持久化格式
│
├── uiStore            // UI 状态
│   ├── selectedReceipt: TeaRecord | null
│   ├── isReceiptModalOpen: boolean
│   ├── isFavoriteExpanded: boolean
│   └── listFilter: { brand?, sortBy? }
│
├── statsStore          // 统计数据（从 records 派生）
│   ├── monthlyStats(year, month) → { cups, stores, totalSpent, top5Images }
│   ├── monthlyFavorite(year, month) → { teaName, count, image } | null
│   └── historicalFavorites() → Array<{ year, month, teaName, count, image }>
│
└── settingsStore      // 用户设置
    ├── removeBgApiKey: string | null
    └── ...
```

---

## 九、关键交互规范

### 9.1 小票点击热区

```
┌─────────────────────────┐
│ ～～～～～～～～～～～～～～│
│                         │
│       [奶茶抠图]        │
│                         │   ← 整个小票 = 一个热区
│     多肉葡萄            │      点击任意位置 = 播放语音
│     喜茶 · XX路店       │
│     ...                │      (因为小票已经展示全貌,
│     ⭐⭐⭐⭐☆          │       用户不需要区分"点哪里")
│     ¥18.00             │
│                         │
│  "今天超开心..."  🔊   │
│                         │
│     2026.06.22         │      只有底部的「编辑」「删除」
│ ～～～～～～～～～～～～～～│      是独立的小热区
│   ✏️编辑    🗑️删除     │
└─────────────────────────┘
```

### 9.2 列表堆叠动画

```
多张小票 → 错层展示：

     ┌─────────────┐
     │   小票 #1   │  ← 正面，完全可见
     └────┬────────┘
    ┌─────┴───────┐
    │  小票 #2    │  ← 向右下偏移 8px，露出左/上边缘
    └────┬────────┘
   ┌─────┴──────────┐
   │   小票 #3      │  ← 再偏移 8px
   └────────────────┘

滑动 → 小票 #1 左飞出 → #2 滑到正面 → #3 露出更多
       ← 反向右滑 → #1 回到正面
```

### 9.3 📌 贴日历 + 📦 飞收集盒动效

```
撕下小票后（Step 7 → 返回首页前）：

① 撕下（~300ms）
   小票沿顶部锯齿撕边"裂开"，纸张撕裂音效

② 贴日历（~500ms）
   奶茶抠图从小票中"弹"出
   → 沿抛物线飞向日历对应日期格
   → 到达格子后缩放弹性动画（scale 1.0 → 1.2 → 0.9 → 1.0）
   → "啪"的一声贴上去

③ 飞收集盒（~600ms，与②同时进行）
   撕下的小票缩小
   → 沿贝塞尔曲线飘向右上角📦收集盒图标
   → 到达后收集盒弹跳 + 数字徽标+1
   → 小票消失
```

### 9.4 语音播放反馈

- 点击小票 → 如果有语音 → 小票轻轻震动 + 播放图标变波浪动画
- 如果没有语音录过 → 轻触无语音响应（仅视觉反馈：小票闪一下）
- 播放完毕自动停止

---

## 十、技术决策记录

| # | 决策项 | 结论 |
|---|--------|------|
| ① | 路由方案 | HashRouter（兼容 PWA + 离线打开） |
| ② | 草稿策略 | 新增流程自动存 localStorage，完成/取消后清除 |
| ③ | 日历性能 | 一次加载全月数据（数据量小，无性能瓶颈） |
| ④ | 品牌配色 | v1 固定预设 6 种，v2 再考虑自定义 |
| ⑤ | 月度抠图 | 展示最近 5 杯的奶茶抠图 |
| ⑥ | 收集盒 vs 列表Tab | 移除底部列表Tab，📦收集盒为列表唯一入口 |
