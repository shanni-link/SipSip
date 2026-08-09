/* ═══════════════════════════════════════════════════
   奶茶记录 store（IndexedDB 持久化 → Dexie.js）
   ═══════════════════════════════════════════════════ */

import Dexie from 'dexie';

export interface ITeaRecord {
  id: string;
  photoDataUrl: string;
  cutoutDataUrl: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:MM
  name: string;
  brand: string;
  brandKey: string;
  store: string;
  cupSize: string;
  sweetness: string;
  temperature: string;
  toppings: string[];
  price: number;
  rating: number;
  moodText: string;
  hasVoice: boolean;
  audioDataUrl: string | null;  // 录音 base64 data URL
  isFavorite: boolean;          // 收藏 → 本月最爱
  createdAt: number;
}

/* ═══════════════════════ Dexie 数据库 ═══════════════════════ */

class TeaDB extends Dexie {
  records!: Dexie.Table<ITeaRecord, string>;

  constructor() {
    super('TeaRecords');
    this.version(1).stores({
      records: 'id, date, isFavorite, brandKey, rating, createdAt',
    });
  }
}

const db = new TeaDB();

/* ═══════════════════════ 内存缓存（读写分离） ═══════════════════════ */

let cache: ITeaRecord[] = [];
let ready = false;

// 等待数据库就绪的 Promise，首次写入前需要确保已完成
const initPromise: Promise<void> = (async () => {
  try {
    let records = await db.records.toArray();

    // 从旧 localStorage 迁移数据（仅首次）
    if (records.length === 0) {
      const legacy = loadLegacy();
      if (legacy.length > 0) {
        await db.records.bulkPut(legacy);
        records = legacy;
      }
    }

    cache = records;
    ready = true;
  } catch (e) {
    console.warn('IndexedDB init failed, cache is empty:', e);
    ready = true; // 降级：写入仍尝试 IndexedDB
  }
})();

/** 确保数据库已初始化（写入前调用） */
async function ensureReady(): Promise<void> {
  if (!ready) await initPromise;
}

/* ═══════════════════════ 旧 localStorage 迁移 ═══════════════════════ */

const LEGACY_KEY = 'tea_records_v1';

function loadLegacy(): ITeaRecord[] {
  try {
    const raw = localStorage.getItem(LEGACY_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as ITeaRecord[];
    // 迁移成功后清除旧数据
    localStorage.removeItem(LEGACY_KEY);
    return parsed;
  } catch {
    return [];
  }
}

/* ═══════════════════════ 订阅 ═══════════════════════ */

type Listener = () => void;
const listeners = new Set<Listener>();

function notify() {
  listeners.forEach(fn => fn());
}

export function subscribeRecords(fn: Listener): () => void {
  listeners.add(fn);
  return () => { listeners.delete(fn); };
}

/* ═══════════════════════ 读操作（同步，读缓存） ═══════════════════════ */

export function getAllRecords(): ITeaRecord[] {
  return cache;
}

export function getRecordsByMonth(year: number, month: number): ITeaRecord[] {
  const prefix = `${year}-${String(month).padStart(2, '0')}`;
  return cache.filter(r => r.date.startsWith(prefix));
}

export function getRecordById(id: string): ITeaRecord | undefined {
  return cache.find(r => r.id === id);
}

export function getTeasForDay(year: number, month: number, day: number): ITeaRecord[] {
  const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  return cache.filter(r => r.date === dateStr);
}

/** 获取某月统计：杯数、店铺数、总金额、前5抠图 */
export function getMonthStats(year: number, month: number): {
  cupCount: number;
  shopCount: number;
  totalAmount: number;
  topCutouts: string[];
} {
  const records = getRecordsByMonth(year, month);
  const shops = new Set(records.map(r => r.store || r.brand).filter(Boolean));
  const total = records.reduce((sum, r) => sum + (r.price || 0), 0);
  const cutouts = records
    .filter(r => r.cutoutDataUrl)
    .sort((a, b) => b.date.localeCompare(a.date) || b.createdAt - a.createdAt)
    .slice(0, 5)
    .map(r => r.cutoutDataUrl);
  return {
    cupCount: records.length,
    shopCount: shops.size,
    totalAmount: total,
    topCutouts: cutouts,
  };
}

/** 获取本月收藏（所有收藏的奶茶，按出现次数降序） */
export function getMonthFavorites(year: number, month: number): { name: string; count: number; cutout: string }[] {
  const records = getRecordsByMonth(year, month).filter(r => r.isFavorite);
  if (records.length === 0) return [];
  const counter = new Map<string, { count: number; cutout: string }>();
  for (const r of records) {
    const key = r.name;
    const entry = counter.get(key);
    if (entry) {
      entry.count++;
    } else {
      counter.set(key, { count: 1, cutout: r.cutoutDataUrl });
    }
  }
  const result: { name: string; count: number; cutout: string }[] = [];
  for (const [name, { count, cutout }] of counter) {
    result.push({ name, count, cutout });
  }
  result.sort((a, b) => b.count - a.count);
  return result;
}

/** @deprecated 使用 getMonthFavorites 代替 */
export function getMonthFavorite(year: number, month: number): { name: string; count: number; cutout: string } | null {
  const favorites = getMonthFavorites(year, month);
  return favorites.length > 0 ? favorites[0] : null;
}

/** 获取所有收藏记录（本月+历史，按日期降序），每条单独展示 */
export function getAllFavorites(): ITeaRecord[] {
  return cache
    .filter(r => r.isFavorite && r.cutoutDataUrl)
    .sort((a, b) => b.date.localeCompare(a.date) || b.createdAt - a.createdAt);
}

/** 获取历史最爱（仅收藏的奶茶，按年月分组，取每月最爱） */
export function getHistoryFavorites(): { year: number; month: number; name: string; count: number; cutout: string }[] {
  const all = cache.filter(r => r.isFavorite);
  const grouped = new Map<string, Map<string, number>>();
  const cutoutMap = new Map<string, string>();

  for (const r of all) {
    const [y, m] = r.date.split('-').map(Number);
    const key = `${y}-${m}`;
    if (!grouped.has(key)) grouped.set(key, new Map());
    const monthMap = grouped.get(key)!;
    monthMap.set(r.name, (monthMap.get(r.name) || 0) + 1);
    if (!cutoutMap.has(key + r.name) && r.cutoutDataUrl) {
      cutoutMap.set(key + r.name, r.cutoutDataUrl);
    }
  }

  const result: { year: number; month: number; name: string; count: number; cutout: string }[] = [];
  for (const [key, monthMap] of grouped) {
    const [y, m] = key.split('-').map(Number);
    let bestName = '';
    let bestCount = 0;
    for (const [name, count] of monthMap) {
      if (count > bestCount) {
        bestCount = count;
        bestName = name;
      }
    }
    if (bestName) {
      result.push({
        year: y, month: m,
        name: bestName,
        count: bestCount,
        cutout: cutoutMap.get(key + bestName) || '',
      });
    }
  }
  result.sort((a, b) => b.year - a.year || b.month - a.month);
  return result;
}

/* ═══════════════════════ 写操作（异步，IndexedDB → 缓存 → 通知） ═══════════════════════ */

export async function saveRecord(record: ITeaRecord): Promise<boolean> {
  try {
    await ensureReady();
    await db.records.put(record);
    // 更新缓存
    const idx = cache.findIndex(r => r.id === record.id);
    if (idx >= 0) {
      cache[idx] = record;
    } else {
      cache.unshift(record);
    }
    notify();
    return true;
  } catch (e) {
    console.warn('saveRecord failed:', e);
    return false;
  }
}

export async function updateRecord(id: string, patch: Partial<ITeaRecord>): Promise<void> {
  try {
    await ensureReady();
    // IndexedDB 不支持 partial update，先读后写
    const existing = await db.records.get(id);
    if (existing) {
      const updated = { ...existing, ...patch };
      await db.records.put(updated);
      // 更新缓存
      const idx = cache.findIndex(r => r.id === id);
      if (idx >= 0) cache[idx] = updated;
      notify();
    }
  } catch (e) {
    console.warn('updateRecord failed:', e);
  }
}

export async function deleteRecord(id: string): Promise<void> {
  try {
    await ensureReady();
    await db.records.delete(id);
    cache = cache.filter(r => r.id !== id);
    notify();
  } catch (e) {
    console.warn('deleteRecord failed:', e);
  }
}
