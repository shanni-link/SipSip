# 🧋 奶茶记录仪 — 设计系统 v2

> 基于 PRD v1.4 + Architecture v1.0 + Pages v1.0 | 日期：2026-06-22
>
> 🎨 本版本经 frontend-design skill 升级：更大胆的字体对比、纸张质感、印章美学、不对称排版

---

## 一、Design Thinking（设计思维）

### 1.1 美学方向

```
核心隐喻：手账里的奶茶票据夹 📝

不是冷冰冰的"数据记录工具"
而是一本 📔 温暖的个人手账 —
  每一页都是你喝过的奶茶，
  每一张小票都是你撕下来的记忆。

情绪板：
  🧋 手冲奶茶的蒸汽  — 温暖，上升，自然不规则
  📝 旧书店的收据    — 纸张纹理，墨水微洇，橡皮章
  📸 拍立得相纸     — 白边，即影即有，即时贴上
  🎀 手账胶带       — 装饰但不喧宾夺主
  🪄 木质印章       — 盖上去的评分，稍有歪斜
```

### 1.2 四个核心设计问题

| 问题 | 回答 |
|------|------|
| **Purpose** 唤起什么情绪？ | 温暖、怀旧、日常治愈感 — 打开 app 像翻开一本手账 |
| **Tone** 美学立场？ | **温暖手账风** — 纸张质感、印章美学、手写温度，拒绝冷冰冰的"效率工具"感 |
| **Constraints** 技术约束？ | 移动端优先、PWA 离线、React+Tailwind、需支持深色模式后期扩展 |
| **Differentiation** 看一眼就记住的细节？ | ⭐ **橡皮章评分** — 不是普通星星，而是盖上去的红色印章（微旋转+墨水晕染），这是整个app的灵魂细节 |

### 1.3 反模式自检（来自 frontend-design skill）

| ❌ 避免 | ✅ 我们选择 |
|------|-----------|
| Inter/Roboto/Arial 字体 | **Noto Serif SC** 主导（有性格的衬线体），手写体点缀 |
| 蓝紫渐变+白底 | **奶茶棕占 >60% 面积**，白底只是小票卡片色 |
| 居中一切 | **左对齐为主，关键元素有意偏离中心** |
| 白卡片+细边框+box-shadow | **纸张纹理背景 + 锯齿撕边 + 印章叠加** |
| 三列卡片布局 | **手账式自由排版，叠放+错位** |
| emoji 当图标（过渡依赖） | emoji 仅装饰，**核心交互用 SVG 手绘风格图标** |

---

## 二、色彩系统

> **策略**：奶茶棕占主导（>60%面积），草莓红尖锐点缀（<10%面积），白色仅用于小票卡片。

### 2.1 主色 — 奶茶棕（占主导地位）

```
页面背景、卡片底、分割线、文字… 都从这同一色系派生
一个颜色家族讲完整件事，这是「看一眼就暖」的关键
─────────────────────
--tea-50:   #fbf5ed    页面背景（微暖纸色）
--tea-100:  #f5e6d3    卡片底/按压态
--tea-200:  #ebd3b0    浅边框/标签底
--tea-300:  #d4b68a    分割线/禁用态
--tea-400:  #b8946e    提示文字/辅助图标
--tea-500:  #8b6b4a    正文/图标 ← 核心基准色
--tea-600:  #6b4f34    小标题/强调
--tea-700:  #4d3724    大标题
--tea-800:  #2f1f12    主文字（更深更有对比）
--tea-900:  #1a0f06    最深（品牌小票深色背景用）
```

### 2.2 强调色 — 印章朱红（尖锐点缀，<10%面积）

```
印章红 — 像盖上去的印泥，不是普通的红色按钮
饱和度略低、明度略低，有「印泥干了之后」的质感
─────────────────────
--accent:        #c94a3a    印章红 ← 比普通红更沉稳
--accent-light:  #e57363    印章浅（hover态）
--accent-dark:   #9e3527    印章深（按压态）
--accent-glow:   rgba(201,74,58,0.25)  印章光晕
```

### 2.3 语义色

```
--success:  #5a8f6c    已识别/成功（偏暖的绿）
--warning:  #d4943a    提醒（蜂蜜色，不刺眼）
--error:    #c94a3a    删除（复用印章红）
--info:     #7a9eb3    信息（灰蓝，不抢戏）
```

### 2.4 中性色 — 从纸张出发

```
--bg:              var(--tea-50)     页面背景 = 纸色
--surface:         #fffdf7           卡片/弹层 = 微暖白纸（不是纯白）
--border:          #e0cfb5           边框
--divider:         #ede0cf           分割线
--text-primary:    var(--tea-800)    主文字
--text-secondary:  var(--tea-600)    次要文字
--text-hint:       var(--tea-400)    提示文字
--text-inverse:    #fffdf7           反色文字（深底上）
```

### 2.5 品牌小票配色（6+1）

> 小票是 app 中「白色卡片」的主要出现场景 — 品牌色是小票的**标题栏色**和**撕边色**

| 品牌 | 标题栏/撕边 | 辅色 | 纸张底色 | CSS变量名 |
|------|-----------|------|---------|-----------|
| 喜茶 | `#1a1a1a` | `#c9a87c` | `#faf7f0` | `--brand-heytea` |
| 奈雪 | `#2d5a27` | `#8bab7a` | `#f5f8f0` | `--brand-nayuki` |
| 蜜雪冰城 | `#d40016` | `#ff6b6b` | `#fffdf7` | `--brand-mxbc` |
| 茶百道 | `#1a5276` | `#5dade2` | `#f0f4f8` | `--brand-chabaidao` |
| 霸王茶姬 | `#4a235a` | `#d4a574` | `#faf5f0` | `--brand-bwcj` |
| 默认/其他 | `#5d4037` | `#a08060` | `#faf3e0` | `--brand-default` |

### 2.6 色彩面积配比规则

```
60% — 奶茶棕系（背景、边框、分割线、文字）
20% — 纸张白（surface卡片、小票底）
10% — 品牌色（小票标题栏）
5%  — 印章红（FAB、评分、删除、关键CTA）
5%  — 语义色（成功/警告/信息徽标）
```

> 🔑 关键：印章红**绝对不能**大面积使用。它只出现在「需要用户注意的那一个点上」—
> FAB按钮、评分印章、删除确认。这种克制让红色真正成为"强调"而非"噪音"。

---

---

## 二点五、纸张质感系统 🆕

> frontend-design skill 强调：**背景不是颜色，是材质**。这是本设计系统与普通"暖色UI"的分水岭。

### 纸张底色（非纯白）

所有"白色"卡片都不是 `#ffffff`，而是微微偏暖的纸色 `#fffdf7`。这 0.2% 的差异肉眼察觉不到色相，但和纯白 button 放在一起时，暖意就出来了。

### CSS 噪点纹理（页面背景）

```css
/* 页面背景：暖纸色 + 极细微噪点 */
body {
  background-color: var(--tea-50);
  background-image:
    /* SVG噪点叠加 — 模拟纸张纤维 */
    url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.03'/%3E%3C/svg%3E");
}
/* 噪点极其微妙（opacity: 0.03），在 Retina 屏幕上刚好可见，模拟纸张触感 */
```

### 卡片纸张效果

```css
.receipt-card {
  background: var(--surface);           /* #fffdf7 暖白纸 */
  background-image:
    /* 极细纤维纹理 */
    url("data:image/svg+xml,...");       /* SVG噪点，opacity: 0.02 */
  box-shadow:
    var(--shadow-md),                    /* 常规阴影 */
    0 0 0 1px rgba(64,48,32,0.04);      /* 1px暖色描边替代冷灰border */
}
```

### 印章元素（评分用）

```css
/* 印章效果 — 是本设计系统的签名细节 */
.stamp {
  color: var(--accent);
  font-family: var(--font-stamp);
  font-weight: 700;
  letter-spacing: 0.05em;
  transform: rotate(-3deg);              /* 微微歪斜 — 模拟手工盖印 */
  text-shadow:
    0 0 2px rgba(201,74,58,0.3),        /* 墨水微洇效果 */
    0 0 6px rgba(201,74,58,0.15);
  position: relative;
}
.stamp::after {
  content: '';
  position: absolute;
  inset: -4px;
  background: radial-gradient(
    ellipse at center,
    rgba(201,74,58,0.08) 0%,
    transparent 70%
  );
  pointer-events: none;
}
```

### 撕边锯齿（SVG）

```
小票顶部/底部撕边使用 SVG path 锯齿：
                    
  _   _   _   _   _   _   _   _   _
  / \_/ \_/ \_/ \_/ \_/ \_/ \_/ \_/ \
  \_/ \_/ \_/ \_/ \_/ \_/ \_/ \_/ \_/
  
  锯齿高度: 8px
  周期宽度: 16px
  颜色: 跟随品牌色
  实现: CSS mask-image 或 before/after 伪元素 + SVG data-URI
```

---

## 三、字体系统（升级版）

> frontend-design skill 核心原则：**字体是设计个性的第一载体**。
> 避免 Noto Sans SC 作为主字体 — 它相当于中文世界的 Inter，没有性格。

### 3.1 字体族 — 高对比搭配

```css
--font-display:  'Noto Serif SC', 'Source Han Serif SC', 'STSong', serif;
                 /* 页面标题、月份、奶茶名 → 宋体有「茶文化」的优雅 */

--font-body:     'Zen Kaku Gothic New', 'PingFang SC', 'Microsoft YaHei', sans-serif;
                 /* 正文、表单、标签 → 现代但不过分几何化的日文哥特体 */
                 /* 备选：PingFang SC（macOS/iOS 自带，品质高） */

--font-receipt:  'Courier New', 'FZXiaoBiaoSong-B05S', 'Cascadia Code', monospace;
                 /* 小票内容 → 等宽打字机字体 = 收据感 */

--font-stamp:    'Ma Shan Zheng', 'ZCOOL QingKe HuangYou', cursive;
                 /* 🆕 印章字体 → 用于评分★数字、特殊标注 */
                 /* 毛笔手写体，模拟手工盖印的不规则感 */

--font-marker:   'ZCOOL KuaiLe', cursive;
                 /* 🆕 手写标记 → 日期圈注、"好喝!"等手写批注 */
```

### 3.2 字体用途对照表

| 层级 | 用途 | 字体 | 字重 | 字号 |
|------|------|------|------|------|
| 🏔️ 页面大标题 | "2026年6月" | `--font-display` | 700 | 28px |
| 📝 卡片标题 | 奶茶名 | `--font-display` | 600 | 20px |
| 📄 正文 | 门店/规格/价格 | `--font-body` | 400/500 | 14-16px |
| 🧾 小票内容 | 品牌/甜度/小料 | `--font-receipt` | 400 | 12-14px |
| 🏷️ 标签/徽标 | "少冰""+珍珠" | `--font-body` | 500 | 11px |
| 🖐️ 手写批注 | 心情文字、"好喝!" | `--font-marker` | 400 | 14-16px |
| 🪄 印章 | 评分数字 | `--font-stamp` | 700 | 24-28px |
| 🔢 价格(醒目) | ¥18.00 | `--font-receipt` | 700 | 32px |

### 3.3 字号阶梯

```css
--text-xs:      10px    /* 微小标签 */
--text-sm:      12px    /* 辅助文字 */
--text-base:    15px    /* 正文 ← 15px比14px更易读（移动端） */
--text-md:      17px    /* 列表标题 */
--text-lg:      20px    /* 小票奶茶名 */
--text-xl:      24px    /* 页面标题 */
--text-2xl:     32px    /* 价格数字 */
--text-3xl:     40px    /* 空状态大标题 */
```

### 3.4 字重

```css
--font-normal:   400
--font-medium:   500
--font-semibold: 600
--font-bold:     700
```

### 3.5 Google Fonts 引入

```html
<link href="https://fonts.googleapis.com/css2?
  family=Noto+Serif+SC:wght@400;600;700&
  family=Zen+Kaku+Gothic+New:wght@400;500;700&
  family=Ma+Shan+Zheng&
  family=ZCOOL+KuaiLe&
  display=swap" rel="stylesheet">
```

---

## 三點五、空间构图原则 🆕

> frontend-design skill 强调：**不对称、叠压、留白、打破网格**。
> 这些是让界面从"能用"升级到"有灵气"的关键。

### 构图规则

| 原则 | 应用 | 效果 |
|------|------|------|
| **左对齐为主** | 卡片标题、正文、表单一律左对齐 | 奶茶名左对齐，价格右对齐形成张力 |
| **有意偏离** | 关键元素故意不在正中间 | 小票微旋转 1-2°，像随手放在桌上 |
| **重叠创造深度** | 日历格缩略图交叠、列表小票叠放 | 每张偏移 6px → 一眼看出"有多杯" |
| **打破网格** | 月度统计 5 张抠图不完全对齐 | 微旋转 ±5° 模拟随手贴 |
| **留白 = 自信** | 空状态大量留白 | "还没有小票哦" + 大面积暖纸纹理 |
| **意外的大** | 价格数字 32px | 比其他信息大 2-3 倍，焦点明确 |

### 列表中小票的「随手放」效果

```
❌ 不要：全部左对齐、间距一致（太"设计"了）

✅ 要：每张小票 rotate(-2° ~ +2°)、偏移 3-6px
    模拟一叠收据被随意收集在盒子里的自然感
```

### 月度统计中抠图的「照片墙」效果

```
❌ 不要：5 张抠图等间距完美排列

✅ 要：像拍立得照片随手贴在页面上
    transform: rotate(-8°) rotate(-3°) rotate(4°) rotate(-5°) rotate(2°)
    各有微妙旋转，模拟"贴照片"的自然手感
```

---

## 三點六、签名细节 ——「看一眼就记住」 🆕

> frontend-design skill 要求：**One memorable detail that makes this NOT look like generic AI design**

### #1 🪄 橡皮章评分（灵魂交互）

评分不是点 ⭐ 星星，而是**盖一个红色橡皮章**：

```
初始态：5 个浅灰色章印轮廓（虚线圆 + 空心 ☆）
点击：  scale(1.3) → scale(1.0) + 弹跳 + 墨水晕开
结果：  红色圆章，内含 ★ 数量，整体 rotate: -3°
```

```css
/* 印章效果 */
.stamp-rating {
  color: var(--accent);                /* #c94a3a 印章朱红 */
  font-family: var(--font-stamp);      /* Ma Shan Zheng 毛笔体 */
  font-size: 24px;
  font-weight: 700;
  letter-spacing: 0.1em;
  transform: rotate(-3deg);            /* 固定歪斜 — 手工感 */
  text-shadow:
    0 0 2px rgba(201,74,58,0.3),      /* 墨水微洇 */
    0 0 8px rgba(201,74,58,0.12);     /* 晕染光晕 */
  border: 2px solid var(--accent);     /* 章印外圈 */
  border-radius: 50%;
  width: 44px; height: 44px;
  display: flex; align-items: center; justify-content: center;
}

/* 盖下动画 */
@keyframes stamp-down {
  0%   { transform: scale(1.8) rotate(-8deg); opacity: 0.2; }
  60%  { transform: scale(0.92) rotate(-2deg); opacity: 1; }
  80%  { transform: scale(1.06) rotate(-3.5deg); }
  100% { transform: scale(1.0) rotate(-3deg); }
}
.stamp-rating.animating {
  animation: stamp-down 400ms var(--ease-spring) forwards;
}
```

### #2 ✍️ 手绘圈注「今天」

日历上"今天"的日期数字被一个不规则红色圈圈起：

```html
<svg viewBox="0 0 40 40" class="hand-circle">
  <ellipse cx="20" cy="20" rx="15" ry="13"
    fill="none" stroke="var(--accent)" stroke-width="1.8"
    stroke-dasharray="58 2 55 3 60 1"
    transform="rotate(-7 20 20)" opacity="0.65" />
</svg>
<!-- 不是正圆 + 断笔虚线 + 微旋转 = 手绘感 -->
```

### #3 📜 小票微旋转

列表中每张小票带有固定 ±2° 旋转（存为组件状态，不随渲染变化），模拟随手塞进收集盒的自然感。

### #4 🧵 虚线缝线装饰

「历史最爱」卡片边缘用虚线模拟手账缝线：

```css
.stitched-edge {
  border: 1.5px dashed var(--tea-300);
  /* 像缝在手账页上的布标签 */
}
```

---

## 四、间距系统

基于 4px 基准：

```
--space-1:   4px
--space-2:   8px
--space-3:   12px
--space-4:   16px
--space-5:   20px
--space-6:   24px
--space-8:   32px
--space-10:  40px
--space-12:  48px
--space-16:  64px

页面边距:    --space-4 (16px)
卡片内边距:  --space-4 (16px)
组件间距:    --space-3 (12px)
区块间距:    --space-6 (24px)
```

---

## 五、圆角

```
--radius-sm:     4px     小标签/徽标
--radius-md:     8px     按钮/输入框
--radius-lg:     12px    卡片
--radius-xl:     16px    弹层/大卡片
--radius-full:   9999px  药丸形/徽章
```

---

## 六、阴影

```
--shadow-sm:    0 1px 3px rgba(64,48,32,0.08)     微妙浮起
--shadow-md:    0 4px 12px rgba(64,48,32,0.12)    卡片/弹层
--shadow-lg:    0 8px 24px rgba(64,48,32,0.16)    模态遮罩
--shadow-glow:  0 0 16px rgba(232,165,64,0.3)     FAB按钮发光
```

---

## 七、动效系统

> frontend-design skill 原则：**CSS-only 优先、只动画 transform/opacity、staggered reveals**

### 7.1 缓动曲线

```css
--ease-default:  cubic-bezier(0.4, 0, 0.2, 1);        /* 标准过渡 */
--ease-in:       cubic-bezier(0.4, 0, 1, 1);           /* 进入 */
--ease-out:      cubic-bezier(0, 0, 0.2, 1);           /* 退出 */
--ease-bounce:   cubic-bezier(0.34, 1.56, 0.64, 1);    /* 微弹 */
--ease-spring:   cubic-bezier(0.68, -0.55, 0.27, 1.55);/* 强弹（印章盖下） */
--ease-stamp:    cubic-bezier(0.25, 0.46, 0.45, 1.4);  /* 印章专用 */
```

### 7.2 时长

```css
--duration-instant:  100ms    /* 按压反馈 */
--duration-fast:     150ms    /* 微交互 */
--duration-normal:   300ms    /* 过渡/展开 */
--duration-slow:     500ms    /* 页面转场 */
--duration-tear:     600ms    /* 撕小票 */
--duration-stamp:    400ms    /* 印章盖下 */
--duration-fly:      600ms    /* 飞收集盒 */
```

### 7.3 CSS-only 动画（优先）

| 场景 | 实现 | 代码思路 |
|------|------|---------|
| 列表项依次入场 | `animation-delay` stagger | 每个 item `animation-delay: calc(var(--i) * 60ms)` |
| 卡片 hover 浮起 | `transition: transform 150ms var(--ease-bounce)` | `:hover { transform: translateY(-2px); }` |
| 按钮按压 | `transition: transform 100ms` | `:active { transform: scale(0.97); }` |
| 加载骨架屏 | `@keyframes shimmer` | 渐变 `background-position` 动画 |
| 语音播放波浪 | `@keyframes wave` | 3 条 bar 交替 scaleY |
| 印章盖下 | `@keyframes stamp-down` | scale + rotate 弹跳 |

### 7.4 JS 动画（Framer Motion — 复杂场景）

| 场景 | 动效 | 时长 | 缓动 |
|------|------|------|------|
| 弹层打开 | translateY(100%→0) + opacity 0→1 | 300ms | ease-out |
| 弹层关闭 | translateY(0→100%) + opacity 1→0 | 200ms | ease-in |
| 页面转场 | translateX(100%→0) | 300ms | ease-default |
| 撕小票 | 沿贝塞尔曲线飞出 + rotate + scale | 600ms | ease-in |
| 贴日历 | 抠图飞到日期格 + 弹性着陆 | 500ms | ease-spring |
| 飞收集盒 | 小票缩小飞到📦 + 盒子弹跳 | 600ms | ease-bounce |
| 同天小票翻页 | 左右 swipe translateX | 300ms | ease-out |

### 7.5 Reduced Motion

```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

### 7.6 Staggered Reveal 工具类

```css
/* 列表项依次出现 */
.stagger-item {
  opacity: 0;
  animation: fade-in-up 300ms var(--ease-out) forwards;
  animation-delay: calc(var(--stagger-index) * 60ms);
}
@keyframes fade-in-up {
  from { opacity: 0; transform: translateY(12px); }
  to   { opacity: 1; transform: translateY(0); }
}

/* 使用: 每个 item 设置 --stagger-index: 0, 1, 2, ... */
```

---

## 八、图标系统

> frontend-design skill 指出：**emoji 作为图标是典型的 AI 设计味道**。
> 我们采用分层策略：emoji 仅用于装饰性emoji，核心交互用 SVG。

### 策略

| 层级 | 方案 | 场景 |
|------|------|------|
| 🎭 **装饰** | emoji | 空状态插画、心情表达、趣味点缀 |
| 🧭 **导航/交互** | 手绘风 SVG 图标 | 底部导航、FAB、收集盒、返回、关闭 |
| 📐 **品牌图形** | 内联 SVG | 撕边锯齿、印章评分、手绘圈 |

### 手绘风 SVG 图标（核心交互用）

```html
<!-- 风格：2px 线条、微圆角、暖棕色、像手账上的小插画 -->

日历图标 (tab):    📅 → SVG 日历+折角
FAB加号:           🧋 → SVG 奶茶杯+加号
收集盒:            📦 → SVG 带盖小盒子
返回箭头:          ←  → SVG 左箭头
关闭:              ✕  → SVG X
搜索:              🔍 → SVG 放大镜
筛选/排序:         🔽 → SVG 筛选漏斗
```

### emoji 装饰（保留趣味感）

| 场景 | emoji |
|------|-------|
| 空状态 | 🧋📦 |
| 拍照按钮装饰 | 📷 |
| 相册按钮装饰 | 🖼️ |
| 月度统计 | 📊🏆 |
| 心情问候 | 💭 |

---

## 九、基础组件规范（升级版）

### 9.1 按钮

```
主要按钮 (Primary)
┌──────────────────────┐
│      🧋 开始记录      │  bg: var(--accent), color: white
└──────────────────────┘  radius: var(--radius-full), height: 48px
                          hover: brightness(1.05), active: scale(0.97)

次要按钮 (Secondary)
┌──────────────────────┐
│      上一步           │  bg: transparent, border: 1.5px solid var(--border)
└──────────────────────┘  color: var(--text-primary)
                          hover: bg var(--tea-100)

文字按钮 (Text/Link)
  编辑   删除             color: var(--text-secondary) / var(--error)
                          underline on hover, no bg, no border

FAB 按钮 (浮动操作)
      ┌────┐
      │ 🧋 │              bg: var(--accent), shadow: var(--shadow-glow)
      └────┘              size: 56×56px, radius: 50%
                          hover: scale(1.05), active: scale(0.95)
```

### 9.2 输入框

```
┌──────────────────────────────┐
│  输入饮品名...                │  height: 48px (更大点击区)
└──────────────────────────────┘  bg: var(--surface), border: 1.5px solid var(--border)
                                  radius: var(--radius-md)
                                  focus: border → var(--tea-500), shadow → 0 0 0 3px rgba(139,107,74,0.12)
                                  placeholder: var(--text-hint)
```

### 9.3 选择器（单选组）

```
杯型：  ○ 中杯   ● 大杯   ○ 超大杯

甜度/温度：
  ┌────┬────┬────┬────┬────┐
  │全糖│七分│半糖│三分│无糖│    药丸形按钮组，水平滚动
  └────┴────┴────┴────┴────┘
  未选: bg transparent, border 1.5px var(--border)
  选中: bg var(--tea-500), color white, no border
  过渡: 150ms ease-out
```

### 9.4 小料多选（Tag 网格）

```
┌────────┬────────┬────────┐
│  ✓珍珠 │  椰果  │ 脆波波  │    tag: radius-full, px-3, py-1.5
├────────┼────────┼────────┤    未选: bg var(--tea-100), text var(--tea-700)
│  奶盖  │  芋泥  │  布丁  │    选中: bg var(--tea-500), text white
└────────┴────────┴────────┘    过渡: 150ms ease-out
                                布局: flex-wrap, gap-2
```

### 9.5 星级评分 → 🪄 升级为印章评分

```
旧设计：⭐ ⭐ ⭐ ⭐ ☆  （普通星星 — 太常见）

新设计 🪄 橡皮章：
  ┌─────────────────────────────┐
  │   ○    ○    ○    ○    ○    │  ← 未评分：虚线圆圈（章印轮廓）
  │                              │
  │   🏮   🏮   🏮   🏮    ○    │  ← 已评4分：红色实心章印
  │  (每个章印内有★，微旋转)    │
  └─────────────────────────────┘

交互流程：
  1. 初始：5 个浅灰色虚线圆（像还没盖下去的章位）
  2. 点击第 N 个：该章位触发 stamp-down 动画
  3. 结果：1~N 个变为红色实心章印（rotate:-3°, 墨水晕染效果）
  4. 重新点击：可修改（点击已评分 → 减分，点击未评分 → 加分）

尺寸：每个章印 40×40px，间距 8px
章印CSS：见「三點六 → #1 橡皮章评分」
```

### 9.6 小票卡片 ReceiptCard

```
核心组件，品牌色差异化：

结构（从上到下）:
  ┌─────────────────────────────┐
  │  ～～～ 锯齿撕边 ～～～～～  │  ← 8px高 SVG 锯齿（品牌主色）
  ├─────────────────────────────┤
  │                             │
  │      🧋 [奶茶抠图居中]      │  ← 抠图最大宽度 180px
  │                             │
  │   多肉葡萄                  │  ← --font-display, --text-lg, 600
  │   喜茶 · XX路店             │  ← --font-receipt, --text-sm
  │                             │
  │   大杯 · 少冰 · 半糖        │  ← --font-receipt, --text-sm
  │   +珍珠 +脆波波             │  ← --text-xs, tag 样式
  │                             │
  │     🏮🏮🏮🏮○              │  ← 印章评分（缩小版 28×28）
  │                             │
  │     ¥ 18.00                │  ← --font-receipt, --text-2xl, 700
  │                             │
  │  ─ ─ ─ ─ ─ ─ ─ ─ ─ ─     │  ← 虚线分隔
  │  "今天超开心..."     🔊   │  ← 心情文字 + 语音图标
  │                             │
  │     2026.06.22             │  ← --text-sm, --text-hint
  │                             │
  │  ～～～ 锯齿撕边 ～～～～～  │  ← 底部撕边
  └─────────────────────────────┘

背景：var(--surface) 暖白纸 + 极细微噪点
阴影：var(--shadow-md) + 1px 暖色描边
列表旋转：±2° 随机但固定（随手放效果）
点击反馈：scale(0.98), 150ms ease-bounce
```

### 9.7 日历格 DayCell + TeaThumb

```
DayCell:
  - 7列均分，高度自适应
  - 今天: bg var(--tea-100), 手绘红圈圈注日期
  - 非本月: 日期数字 var(--text-hint)
  - 有奶茶: 底部交叠缩略图
  - hover/active: bg var(--tea-100) 过渡 150ms

TeaThumb 交叠:
  - 每张 28×28px, radius: 4px
  - 白边 1.5px solid white（模拟拍立得白边）
  - 每张偏移 6px 右下（比之前的 4px 更明显）
  - 最多 3 层，超出显示 "+N" 圆形标签
  - +N 标签: bg var(--tea-500), color white, 14px 圆形
```

### 9.8 月度统计 MonthlySummary + 历史最爱 HistoricalFavorite

```
MonthlySummary:
  - 卡片: bg var(--surface), radius-lg
  - 边框: 1.5px dashed var(--tea-300)  🆕 虚线缝线效果
  - 布局: 纵向 stack, gap-4
  - "本月12杯 · 5家店" → font-display, 居中但内容左对齐
  - 5张抠图: 各有微旋转 (-8°/-3°/4°/-5°/2°)  🆕 照片墙效果
  - 金额 ¥186.00 → font-receipt, text-2xl, 右对齐

HistoricalFavorite:
  - 本月最爱: 抠图 + 奶茶名 + "×3杯"
  - 展开/折叠: max-height transition, 300ms ease-default
  - 历史列表: 每年一行 stagger 60ms 依次入场
  - 边缘: 虚线缝线 (同MonthlySummary)
```

### 9.9 步骤指示器 StepIndicator

```
  ●──●──●──○──○──○    已完成: var(--tea-500) 实心
  1  2  3  4  5  6     当前: var(--accent) 实心 + 2px外光环
                        未完成: var(--tea-300) 空心
                        连线: 2px solid var(--tea-200) / var(--tea-500)
                        过渡: 300ms ease-default
```

### 9.10 收集盒 ReceiptBox

```
常态: 手绘风 SVG 盒子图标, 28×28px
有票: 右上角红色徽标数字 (bg var(--accent), 14px圆形)
飞入: 小票沿贝塞尔曲线缩小 → 盒子弹跳 → 徽标+1
点击: → /list 页面
位置: 日历页顶部栏右侧
```

### 9.11 底部导航 BottomNavBar

```
┌──────────────────────────────┐
│         │          │         │
│    📅   │    🧋    │         │  height: 60px (含 safe area)
│   日历  │    (+)   │         │  bg: var(--surface)
│         │          │         │  shadow: 0 -2px 12px rgba(64,48,32,0.06)
└──────────────────────────────┘

FAB: 在导航栏上方突出 18px, size: 56×56px, radius: 50%
     带 shadow-glow 发光（茶金色，不是红色）
```

---

## 十、CSS变量总览

```css
:root {
  /* === 主色 — 奶茶棕家族 === */
  --tea-50:   #fbf5ed;
  --tea-100:  #f5e6d3;
  --tea-200:  #ebd3b0;
  --tea-300:  #d4b68a;
  --tea-400:  #b8946e;
  --tea-500:  #8b6b4a;
  --tea-600:  #6b4f34;
  --tea-700:  #4d3724;
  --tea-800:  #2f1f12;
  --tea-900:  #1a0f06;

  /* === 强调色 — 印章朱红 === */
  --accent:        #c94a3a;
  --accent-light:  #e57363;
  --accent-dark:   #9e3527;
  --accent-glow:   rgba(201,74,58,0.25);

  /* === 语义色 === */
  --success: #5a8f6c;
  --warning: #d4943a;
  --error:   #c94a3a;
  --info:    #7a9eb3;

  /* === 中性色（从纸出发） === */
  --bg:              var(--tea-50);
  --surface:         #fffdf7;
  --border:          #e0cfb5;
  --divider:         #ede0cf;
  --text-primary:    var(--tea-800);
  --text-secondary:  var(--tea-600);
  --text-hint:       var(--tea-400);
  --text-inverse:    #fffdf7;

  /* === 字体（高对比搭配） === */
  --font-display:  'Noto Serif SC', 'Source Han Serif SC', 'STSong', serif;
  --font-body:     'Zen Kaku Gothic New', 'PingFang SC', 'Microsoft YaHei', sans-serif;
  --font-receipt:  'Courier New', 'FZXiaoBiaoSong-B05S', 'Cascadia Code', monospace;
  --font-stamp:    'Ma Shan Zheng', 'ZCOOL QingKe HuangYou', cursive;
  --font-marker:   'ZCOOL KuaiLe', cursive;

  /* === 字号 === */
  --text-xs:    10px;
  --text-sm:    12px;
  --text-base:  15px;
  --text-md:    17px;
  --text-lg:    20px;
  --text-xl:    24px;
  --text-2xl:   32px;
  --text-3xl:   40px;

  /* === 字重 === */
  --font-normal:   400;
  --font-medium:   500;
  --font-semibold: 600;
  --font-bold:     700;

  /* === 间距 (4px基准) === */
  --space-1:   4px;
  --space-2:   8px;
  --space-3:   12px;
  --space-4:   16px;
  --space-5:   20px;
  --space-6:   24px;
  --space-8:   32px;
  --space-10:  40px;
  --space-12:  48px;
  --space-16:  64px;

  /* === 圆角 === */
  --radius-sm:    4px;
  --radius-md:    8px;
  --radius-lg:   12px;
  --radius-xl:   16px;
  --radius-full: 9999px;

  /* === 阴影 === */
  --shadow-sm:    0 1px 3px rgba(47,31,18,0.06);
  --shadow-md:    0 4px 16px rgba(47,31,18,0.10);
  --shadow-lg:    0 8px 30px rgba(47,31,18,0.14);
  --shadow-glow:  0 0 20px rgba(212,148,58,0.25);

  /* === 缓动曲线 === */
  --ease-default:  cubic-bezier(0.4, 0, 0.2, 1);
  --ease-in:       cubic-bezier(0.4, 0, 1, 1);
  --ease-out:      cubic-bezier(0, 0, 0.2, 1);
  --ease-bounce:   cubic-bezier(0.34, 1.56, 0.64, 1);
  --ease-spring:   cubic-bezier(0.68, -0.55, 0.27, 1.55);
  --ease-stamp:    cubic-bezier(0.25, 0.46, 0.45, 1.4);

  /* === 时长 === */
  --duration-instant:  100ms;
  --duration-fast:     150ms;
  --duration-normal:   300ms;
  --duration-slow:     500ms;
  --duration-tear:     600ms;
  --duration-stamp:    400ms;
  --duration-fly:      600ms;
}
```

---

## 十一、技术实现

| 层面 | 选型 | 说明 |
|------|------|------|
| CSS框架 | **Tailwind CSS** | 自定义 theme 扩展以上所有 token |
| 动效库 | **Framer Motion** | 弹层转场、撕小票、飞行动画 |
| CSS动画 | 原生 CSS `@keyframes` | stagger 入场、印章盖下、骨架屏 |
| 字体 | **Google Fonts** | Noto Serif SC + Zen Kaku Gothic New + Ma Shan Zheng + ZCOOL KuaiLe |
| 图标 | **手绘风内联 SVG** | 导航/交互用 SVG，emoji 仅装饰 |
| 纹理 | **SVG 噪点滤镜** | 纸张纤维感（纯 CSS，零额外资源） |
| 印章 | **CSS transform + text-shadow** | 评分章印效果（旋转+墨水晕染） |

---

## 十二、frontend-design 升级清单

| # | 升级点 | 旧 | 新 |
|---|-------|----|----|
| 1 | 字体策略 | Noto Sans SC 主导 | **Noto Serif SC 主导** + 手写印章体点缀 |
| 2 | 背景 | 纯色 `#fdf8f0` | **暖纸色 + SVG噪点纹理**（纸张触感） |
| 3 | 卡片底色 | `#ffffff` 纯白 | **`#fffdf7` 暖白纸** + 1px暖色描边 |
| 4 | 评分交互 | ⭐ 星星点击 | **🪄 橡皮章盖印**（rotate:-3°, 墨水晕染） |
| 5 | 构图 | 居中为主 | **左对齐主导 + 有意偏离** |
| 6 | 小票排列 | 完美对齐 | **微旋转 ±2°** 随手放效果 |
| 7 | 照片展示 | 等间距排列 | **各有微旋转** 照片墙效果 |
| 8 | 今天标记 | 背景色高亮 | **手绘红圈** 不规则椭圆圈注 |
| 9 | 统计卡片 | shadow-sm | **虚线缝线 border** 手账感 |
| 10 | 图标策略 | emoji 为主 | **手绘SVG 为主**，emoji仅装饰 |
| 11 | 动画 | 通用缓动 | **stagger入场 + 印章专用缓动 + reduced-motion** |
| 12 | 字重层次 | 3-4 级 | **清晰4级 + 印章体独立字重** |
