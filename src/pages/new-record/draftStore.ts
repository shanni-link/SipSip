/* ═══════════════════════════════════════════════════
   新增记录草稿 store（内存版）
   Phase 8 将替换为 Zustand + localStorage 持久化
   ═══════════════════════════════════════════════════ */

export interface INewRecordDraft {
  /* Step 1 — 拍照 */
  photoDataUrl: string | null;
  /* Step 2 — 日期 + 时间 */
  date: string; // YYYY-MM-DD
  time: string; // HH:MM
  /* Step 3 — 抠图 */
  cutoutDataUrl: string | null;
  /* Step 4 — 信息 */
  name: string;
  brand: string;
  brandKey: string;
  store: string;
  cupSize: string;
  sweetness: string;
  temperature: string;
  toppings: string[];
  price: string;
  rating: number;
  /* Step 5 — 心情 */
  moodText: string;
  hasVoice: boolean;
  audioDataUrl: string | null;  // 录音 base64 data URL
  /* 收藏 */
  isFavorite: boolean;
}

function getToday(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function createEmptyDraft(): INewRecordDraft {
  return {
    photoDataUrl: null,
    date: getToday(),
    time: '',
    cutoutDataUrl: null,
    name: '',
    brand: '',
    brandKey: '',
    store: '',
    cupSize: '',
    sweetness: '',
    temperature: '',
    toppings: [],
    price: '',
    rating: 0,
    moodText: '',
    hasVoice: false,
    audioDataUrl: null,
    isFavorite: false,
  };
}

type Listener = () => void;
const listeners = new Set<Listener>();

let draft: INewRecordDraft = createEmptyDraft();

function emit() {
  listeners.forEach(fn => fn());
}

/** 获取当前草稿（只读快照） */
export function getDraft(): Readonly<INewRecordDraft> {
  return draft;
}

/** 更新草稿（浅合并） */
export function updateDraft(patch: Partial<INewRecordDraft>): void {
  draft = { ...draft, ...patch };
  emit();
}

/** 重置草稿 */
export function resetDraft(): void {
  draft = createEmptyDraft();
  emit();
}

/** 订阅变化（React hook 用） */
export function subscribeDraft(fn: Listener): () => void {
  listeners.add(fn);
  return () => { listeners.delete(fn); };
}
