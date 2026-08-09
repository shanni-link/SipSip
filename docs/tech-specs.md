# ⚙️ 技术规范

> 版本：v1.0 | 日期：2026-06-22

---

## 一、技术栈

| 层级 | 选型 | 版本 | 用途 |
|------|------|------|------|
| 语言 | TypeScript | ^5.4 | 类型安全 |
| 框架 | React | ^18.3 | UI 渲染 |
| 构建 | Vite | ^5.4 | 开发/打包 |
| 样式 | Tailwind CSS | ^3.4 | 原子化样式 + 自定义 theme |
| 动效 | Framer Motion | ^11 | 复杂转场/手势动画 |
| 路由 | React Router v6 | ^6.26 | HashRouter |
| 状态 | Zustand | ^4.5 | 轻量状态管理 |
| 数据库 | Dexie.js | ^4.0 | IndexedDB 封装 |
| AI 抠图 | @imgly/background-removal | latest | 本地 AI 抠图（免费） |
| EXIF | exif-js | ^2.3 | 照片日期读取 |
| PWA | vite-plugin-pwa | ^0.20 | Service Worker + manifest |

### 不需要的库（避免引入）

- ❌ Ant Design / MUI — 重型组件库，冲突自定义设计
- ❌ Axios — 无后端 API 需求
- ❌ Redux — Zustand 足够
- ❌ Moment.js — 用原生 `Intl.DateTimeFormat`
- ❌ Lodash — 按需手写工具函数

---

## 二、环境要求

```
node: >= 18.0.0
npm:  >= 9.0.0
浏览器: Chrome 90+, Safari 15+, Edge 90+
```

---

## 三、项目初始化命令

```bash
# 1. 创建项目
npm create vite@latest 奶茶记录仪 -- --template react-ts

# 2. 安装依赖
cd 奶茶记录仪
npm install

# 3. 追加依赖
npm install react-router-dom zustand dexie framer-motion exif-js
npm install -D tailwindcss postcss autoprefixer @types/react

# 4. Tailwind 配置
npx tailwindcss init -p

# 5. 开发启动
npm run dev
```

---

## 四、Vite 配置关键项

```ts
// vite.config.ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    host: true,    // 手机局域网测试
    port: 5173,
  },
  build: {
    target: 'es2020',
  },
  css: {
    // 允许 CSS 变量在 JS 中使用
    modules: {
      localsConvention: 'camelCase',
    },
  },
})
```

---

## 五、Tailwind 自定义 Theme

```js
// tailwind.config.js
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        tea: {
          50:  '#fbf5ed',
          100: '#f5e6d3',
          200: '#ebd3b0',
          300: '#d4b68a',
          400: '#b8946e',
          500: '#8b6b4a',
          600: '#6b4f34',
          700: '#4d3724',
          800: '#2f1f12',
          900: '#1a0f06',
        },
        accent: {
          DEFAULT: '#c94a3a',
          light:   '#e57363',
          dark:    '#9e3527',
        },
        surface: '#fffdf7',
      },
      fontFamily: {
        display: ['"Noto Serif SC"', '"Source Han Serif SC"', 'STSong', 'serif'],
        body:    ['"Zen Kaku Gothic New"', '"PingFang SC"', '"Microsoft YaHei"', 'sans-serif'],
        receipt: ['"Courier New"', 'monospace'],
        stamp:   ['"Ma Shan Zheng"', 'cursive'],
        marker:  ['"ZCOOL KuaiLe"', 'cursive'],
      },
      borderRadius: {
        sm:   '4px',
        md:   '8px',
        lg:   '12px',
        xl:   '16px',
        full: '9999px',
      },
      spacing: {
        1:  '4px',
        2:  '8px',
        3:  '12px',
        4:  '16px',
        5:  '20px',
        6:  '24px',
        8:  '32px',
        10: '40px',
        12: '48px',
        16: '64px',
      },
    },
  },
  plugins: [],
}
```

---

## 六、IndexedDB 数据模型

```ts
// src/db/teaDatabase.ts
import Dexie, { Table } from 'dexie';

export interface ITeaRecord {
  id: string;
  date: string;           // YYYY-MM-DD
  originalImage: Blob;
  cutoutImage: Blob;
  name: string;
  brand: string;
  store: string;
  cupSize: '中杯' | '大杯' | '超大杯';
  sweetness: string;
  temperature: string;
  toppings: string[];
  price: number;
  rating: 1 | 2 | 3 | 4 | 5;
  moodText?: string;
  moodAudio?: Blob;
  moodTranscript?: string;
  createdAt: number;
  updatedAt: number;
}

export class TeaDatabase extends Dexie {
  records!: Table<ITeaRecord, string>;

  constructor() {
    super('MilkTeaRecorder');
    this.version(1).stores({
      records: 'id, date, brand, name, rating',
    });
  }
}

export const db = new TeaDatabase();
```

---

## 七、路由设计

```ts
// HashRouter — PWA 兼容
// 路径: https://...#/path

/                    → CalendarPage   日历首页
/list                → ListPage       小票列表
/new/photo           → NewPhotoPage   新增 Step 1
/new/date            → NewDatePage    Step 2
/new/cutout          → NewCutoutPage  Step 3
/new/info            → NewInfoPage    Step 4
/new/mood            → NewMoodPage    Step 5
/new/preview         → NewPreviewPage Step 6
/edit/:id            → EditPage       编辑记录
/receipt/:id          → ReceiptModal  小票详情弹层（模态）
```

---

## 八、API 服务

| 服务 | 库 | 调用场景 | 说明 |
|------|-----|---------|------|
| 本地抠图 | @imgly/background-removal | 新增 Step 3 默认 | 免费不限量 |
| 增强抠图 | Remove.bg API | 用户不满意时切换 | 50张/月免费 |

```ts
// src/utils/removeBackground.ts
import { removeBackground } from '@imgly/background-removal';

export async function localRemoveBg(imageBlob: Blob): Promise<Blob> {
  return await removeBackground(imageBlob);
}

export async function removeBgApi(imageBlob: Blob, apiKey: string): Promise<Blob> {
  const formData = new FormData();
  formData.append('image_file', imageBlob);

  const res = await fetch('https://api.remove.bg/v1.0/removebg', {
    method: 'POST',
    headers: { 'X-Api-Key': apiKey },
    body: formData,
  });

  if (!res.ok) throw new Error('Remove.bg API failed');
  return await res.blob();
}
```
