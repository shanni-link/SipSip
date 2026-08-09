/* ═══════════════════════════════════════════════════
   预设数据 — 品牌/甜度/温度/杯型/小料
   ═══════════════════════════════════════════════════ */

export interface IBrandPreset {
  key: string;
  name: string;
}

/** 预设品牌列表 */
export const BRAND_PRESETS: IBrandPreset[] = [
  { key: 'heytea', name: '喜茶' },
  { key: 'nayuki', name: '奈雪的茶' },
  { key: 'mxbc', name: '蜜雪冰城' },
  { key: 'chabaidao', name: '茶百道' },
  { key: 'bwcj', name: '霸王茶姬' },
  { key: 'guming', name: '古茗' },
  { key: 'yidiandian', name: '一点点' },
  { key: 'coco', name: 'CoCo都可' },
  { key: 'luckin', name: '瑞幸咖啡' },
  { key: 'starbucks', name: '星巴克' },
  { key: 'hushang', name: '沪上阿姨' },
  { key: 'shuyi', name: '书亦烧仙草' },
  { key: 'chayan', name: '茶颜悦色' },
  { key: 'linlee', name: 'LINLEE' },
  { key: 'moyogurt', name: '茉酸奶' },
];

/** 甜度选项 */
export const SWEETNESS_OPTIONS = ['全糖', '七分糖', '半糖', '三分糖', '无糖'] as const;

/** 温度选项 */
export const TEMPERATURE_OPTIONS = ['正常冰', '少冰', '去冰', '常温', '温热', '热'] as const;

/** 杯型选项 */
export const CUP_SIZE_OPTIONS = ['中杯', '大杯', '超大杯'] as const;

/** 小料选项 */
export const TOPPING_OPTIONS = [
  '珍珠', '椰果', '脆波波', '奶盖', '芋泥', '布丁',
  '仙草', '红豆', '燕麦', '芝士', '冰淇淋', '芦荟',
] as const;
