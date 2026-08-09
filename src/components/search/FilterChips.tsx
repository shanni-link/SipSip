import { memo } from 'react';

const BRAND_LABELS: Record<string, string> = {
  heytea: '喜茶',
  nayuki: '奈雪',
  mxbc: '蜜雪冰城',
  chabaidao: '茶百道',
  bwcj: '霸王茶姬',
  other: '其他',
};

export interface IActiveFilter {
  /** 展示标签 */
  label: string;
  /** 唯一 key，用于删除 */
  key: string;
  /** 删除回调 */
  onRemove: () => void;
}

interface IFilterChipsProps {
  filters: IActiveFilter[];
  /** 清除全部 */
  onClearAll?: () => void;
}

/** 从 IFilterState 构建 active chips 列表 */
export function buildFilterChips(
  brands: string[],
  rating: number | null,
  dateMonth: string | null,
  dateDay: number | null,
  onRemoveBrand: (key: string) => void,
  onRemoveRating: () => void,
  onRemoveDate: () => void,
): IActiveFilter[] {
  const chips: IActiveFilter[] = [];

  for (const b of brands) {
    chips.push({
      label: BRAND_LABELS[b] ?? b,
      key: `brand-${b}`,
      onRemove: () => onRemoveBrand(b),
    });
  }

  if (rating !== null) {
    chips.push({
      label: `${rating}分`,
      key: 'rating',
      onRemove: onRemoveRating,
    });
  }

  if (dateMonth !== null || dateDay !== null) {
    let label = '';
    if (dateMonth) {
      const [y, m] = dateMonth.split('-').map(Number);
      label = `${y}年${m}月`;
    }
    if (dateDay !== null) {
      label += `${dateDay}日`;
    }
    chips.push({
      label: label || '日期',
      key: 'date',
      onRemove: onRemoveDate,
    });
  }

  return chips;
}

export const FilterChips = memo(function FilterChips({
  filters,
  onClearAll,
}: IFilterChipsProps) {
  if (filters.length === 0) return null;

  return (
    <div className="filter-chips">
      <div className="filter-chips__scroll">
        {filters.map((f) => (
          <button
            key={f.key}
            className="filter-chips__chip"
            onClick={f.onRemove}
            aria-label={`移除筛选：${f.label}`}
          >
            <span className="filter-chips__chip-label">{f.label}</span>
            <svg
              className="filter-chips__chip-x"
              width="12"
              height="12"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        ))}
      </div>

      {onClearAll && (
        <button className="filter-chips__clear-all" onClick={onClearAll}>
          清除
        </button>
      )}
    </div>
  );
});
