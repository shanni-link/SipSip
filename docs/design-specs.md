# 🎨 设计规范速查卡

> 基于 [design-system.md](../design-system.md) v2 | 组件开发时参照此文件

---

## 一、CSS 变量总表

```css
/* 主色 — 奶茶棕 */
--tea-50:   #fbf5ed;   --tea-100:  #f5e6d3;
--tea-200:  #ebd3b0;   --tea-300:  #d4b68a;
--tea-400:  #b8946e;   --tea-500:  #8b6b4a;
--tea-600:  #6b4f34;   --tea-700:  #4d3724;
--tea-800:  #2f1f12;   --tea-900:  #1a0f06;

/* 印章红 */
--accent:        #c94a3a;
--accent-light:  #e57363;
--accent-dark:   #9e3527;

/* 语义色 */
--success: #5a8f6c;    --warning: #d4943a;
--error:   #c94a3a;    --info:    #7a9eb3;

/* 中性色 */
--bg:       var(--tea-50);    --surface:  #fffdf7;
--border:   #e0cfb5;          --divider:  #ede0cf;
--text-primary:   var(--tea-800);
--text-secondary: var(--tea-600);
--text-hint:      var(--tea-400);
--text-inverse:   #fffdf7;

/* 字体 */
--font-display: 'Noto Serif SC', serif;
--font-body:    'Zen Kaku Gothic New', sans-serif;
--font-receipt: 'Courier New', monospace;
--font-stamp:   'Ma Shan Zheng', cursive;
--font-marker:  'ZCOOL KuaiLe', cursive;

/* 字号 */
--text-xs: 10px;  --text-sm: 12px;  --text-base: 15px;
--text-md: 17px;  --text-lg: 20px;  --text-xl:  24px;
--text-2xl: 32px; --text-3xl: 40px;

/* 间距 4px 基准 */
--space-1: 4px;   --space-2: 8px;   --space-3: 12px;
--space-4: 16px;  --space-5: 20px;  --space-6: 24px;
--space-8: 32px;  --space-10: 40px; --space-12: 48px;

/* 圆角 */
--radius-sm: 4px;  --radius-md: 8px;
--radius-lg: 12px; --radius-xl: 16px;
--radius-full: 9999px;

/* 阴影 */
--shadow-sm:   0 1px 3px  rgba(47,31,18,0.06);
--shadow-md:   0 4px 16px rgba(47,31,18,0.10);
--shadow-lg:   0 8px 30px rgba(47,31,18,0.14);
--shadow-glow: 0 0 20px  rgba(212,148,58,0.25);

/* 缓动 */
--ease-default: cubic-bezier(0.4, 0, 0.2, 1);
--ease-bounce:  cubic-bezier(0.34, 1.56, 0.64, 1);
--ease-spring:  cubic-bezier(0.68, -0.55, 0.27, 1.55);

/* 时长 */
--duration-instant: 100ms; --duration-fast:   150ms;
--duration-normal:  300ms; --duration-slow:   500ms;
--duration-stamp:   400ms; --duration-tear:   600ms;
```

---

## 二、字体使用规则

| 场景 | 字体 | 字重 | 字号 |
|------|------|------|------|
| 月份大标题 | `--font-display` | 700 | `--text-xl` 24px |
| 奶茶名称 | `--font-display` | 600 | `--text-lg` 20px |
| 正文/表单 | `--font-body` | 400/500 | `--text-base` 15px |
| 小票信息 | `--font-receipt` | 400 | `--text-sm` 12px |
| 标签/徽标 | `--font-body` | 500 | `--text-xs` 10px |
| 心情文字 | `--font-marker` | 400 | `--text-base` 15px |
| 印章评分 | `--font-stamp` | 700 | 24px |
| 价格 | `--font-receipt` | 700 | `--text-2xl` 32px |

---

## 三、品牌小票配色

| 品牌 | 主色 | 辅色 | 纸张色 |
|------|------|------|--------|
| 喜茶 | `#1a1a1a` | `#c9a87c` | `#faf7f0` |
| 奈雪 | `#2d5a27` | `#8bab7a` | `#f5f8f0` |
| 蜜雪冰城 | `#d40016` | `#ff6b6b` | `#fffdf7` |
| 茶百道 | `#1a5276` | `#5dade2` | `#f0f4f8` |
| 霸王茶姬 | `#4a235a` | `#d4a574` | `#faf5f0` |
| 默认/其他 | `#5d4037` | `#a08060` | `#faf3e0` |

---

## 四、组件尺寸快速参照

| 组件 | 宽 | 高 | 特殊 |
|------|-----|-----|------|
| 顶部栏 | 100% | 48px | - |
| FAB 按钮 | 56px | 56px | radius 50%, 突出导航 18px |
| 底部导航 | 100% | 60px | 含 safe area |
| 小票卡片 | 320-360px | 自动 | 撕边 8px 锯齿 |
| 日历格 | 1/7 宽度 | 自适应 | 内容区约 52px |
| 输入框 | 100% | 48px | 最小点击区 |
| 按钮（Primary） | 自适应 | 48px | radius-full |
| 药丸选择器 | 自适应 | 36px | radius-full |
| 印章评分（大） | 40×40px | - | 小票用 28×28px |
| 日历缩略图 | 28×28px | - | 偏移 6px |

---

## 五、关键交互细节

### 印章评分
```
初始态: 5个浅灰色虚线圆 (dashed circle, tea-300)
点击:   stamp-down 动画 400ms ease-spring
结果:   红色实心章印, rotate: -3°, text-shadow 墨水晕染
```

### 小票微旋转
```
列表中小票每张固定 ±2° 旋转（组件挂载时确定，不变）
模拟"随手放在桌上"的自然感
```

### 虚线缝线边框
```css
/* 月度统计、历史最爱卡片 */
border: 1.5px dashed var(--tea-300);
```

### 纸张纹理背景（全局）
```css
background-image: url("data:image/svg+xml,...");
/* SVG feTurbulence noise, opacity: 0.035 */
```
