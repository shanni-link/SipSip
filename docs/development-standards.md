# 📐 开发规范

> 版本：v1.0 | 日期：2026-06-22

---

## 一、编码规范

### 1.1 命名约定

| 类型 | 规则 | 示例 |
|------|------|------|
| 组件文件 | PascalCase | `Header.tsx`、`ReceiptCard.tsx` |
| 样式文件 | 同组件名 | `Header.css`、`ReceiptCard.css` |
| 工具函数 | camelCase | `formatDate()`、`getBrandColor()` |
| 常量 | UPPER_SNAKE_CASE | `DEFAULT_CUP_SIZE`、`MAX_TEA_STACK` |
| TypeScript 接口 | PascalCase + `I` 前缀 | `ITeaRecord`、`IBrand` |
| TypeScript 类型 | PascalCase + `T` 前缀 | `TBrandKey`、`TRatingValue` |
| Zustand store | camelCase + `Store` 后缀 | `useCalendarStore`、`useTeaStore` |
| 路由路径 | kebab-case | `/new/photo`、`/edit/:id` |
| CSS 类名 | kebab-case | `.receipt-card`、`.stamp-btn` |

### 1.2 目录结构

```
src/
├── components/          # 可复用组件
│   ├── header/          # Header 组件族
│   │   ├── Header.tsx
│   │   └── Header.css
│   ├── card/            # Card 组件族
│   │   ├── ReceiptCard.tsx
│   │   ├── DayCell.tsx
│   │   └── Card.css
│   └── ...
├── pages/               # 页面组件
│   ├── CalendarPage.tsx
│   ├── ListPage.tsx
│   └── NewRecordPage.tsx
├── stores/              # Zustand stores
│   ├── useCalendarStore.ts
│   └── useTeaStore.ts
├── db/                  # IndexedDB (Dexie.js)
│   └── teaDatabase.ts
├── hooks/               # 自定义 hooks
├── utils/               # 工具函数
├── styles/              # 全局样式 + CSS 变量
│   ├── tokens.css       # CSS 自定义属性
│   ├── global.css       # 全局重置 + 纸张纹理
│   └── animations.css   # @keyframes 动画
├── assets/              # 静态资源（SVG 图标等）
├── App.tsx
└── main.tsx
```

### 1.3 组件模板

```tsx
import { useState } from 'react';
import './ComponentName.css';

interface IComponentNameProps {
  // 必选 props
  id: string;
  // 可选 props
  className?: string;
  children?: React.ReactNode;
}

export const ComponentName: React.FC<IComponentNameProps> = ({
  id,
  className = '',
  children,
}) => {
  // state
  const [state, setState] = useState<Type>(initialValue);

  // handlers
  const handleClick = () => { /* ... */ };

  // 空状态
  if (!data) return <EmptyState />;

  return (
    <div className={`component-name ${className}`}>
      {children}
    </div>
  );
};
```

---

## 二、样式规范

### 2.1 CSS 变量优先

```css
/* ✅ 正确 */
.receipt-card {
  background: var(--surface);
  color: var(--text-primary);
  padding: var(--space-4);
}

/* ❌ 错误 */
.receipt-card {
  background: #fffdf7;
  color: #2f1f12;
  padding: 16px;
}
```

### 2.2 Tailwind + 自定义变量混合

```html
<!-- Tailwind 用于布局/间距 -->
<div className="flex flex-col gap-4 px-4">
  <!-- 自定义变量用于颜色/字体 -->
  <h2 style={{ fontFamily: 'var(--font-display)', color: 'var(--text-primary)' }}>
    多肉葡萄
  </h2>
</div>
```

### 2.3 响应式断点

| 断点 | 宽度 | 设计重点 |
|------|------|---------|
| 手机 | < 428px | 单列全宽，触控优先（48px 最小点击区） |
| 平板 | 428-768px | 日历格适中，小票居中 360px |
| 桌面 | > 768px | 日历居中 max 500px，弹层居中 400px |

### 2.4 组件必须处理的三种状态

```
✅ 正常态 — 有数据时的展示
🈳 空状态 — 无数据时的引导/占位
⚠️ 错误态 — 加载失败/数据异常
```

---

## 三、Git 规范

### 3.1 分支策略

```
main          — 稳定版本（随时可部署）
├── dev       — 开发分支
│   ├── feat/header   — 各组件功能分支
│   ├── feat/sidebar
│   ├── feat/card
│   └── ...
```

### 3.2 提交格式

```
<type>(<scope>): <description>

类型: feat / fix / style / refactor / docs / chore
范围: header / sidebar / card / search / footer / docs / devlog

示例:
  feat(header): 完成 MonthHeader 组件
  fix(card): 修复小票卡片品牌色不生效
  style(header): 调整顶部栏间距
  docs(devlog): 更新 6/22 开发日志
```

---

## 四、质量检查清单

每个组件开发完成后，必须通过以下检查：

- [ ] TypeScript 编译无报错
- [ ] `npm run build` 成功
- [ ] 移动端宽度 (375px) 肉眼验证通过
- [ ] 平板宽度 (768px) 肉眼验证通过
- [ ] 桌面宽度 (1024px+) 肉眼验证通过
- [ ] 正常状态展示正确
- [ ] 空状态展示正确
- [ ] 交互态（hover/active/focus）正常
- [ ] 所有颜色使用 CSS 变量
- [ ] 更新开发日志
