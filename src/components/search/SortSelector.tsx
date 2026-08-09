import { memo, useState, useCallback, useRef, useEffect } from 'react';

export type SortOption = 'newest' | 'oldest' | 'price-desc' | 'price-asc' | 'rating-desc';

const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: 'newest', label: '最新优先' },
  { value: 'oldest', label: '最早优先' },
  { value: 'price-desc', label: '价格从高到低' },
  { value: 'price-asc', label: '价格从低到高' },
  { value: 'rating-desc', label: '评分最高' },
];

interface ISortSelectorProps {
  value: SortOption;
  onChange: (value: SortOption) => void;
}

export const SortSelector = memo(function SortSelector({
  value,
  onChange,
}: ISortSelectorProps) {
  const current = SORT_OPTIONS.find((o) => o.value === value) ?? SORT_OPTIONS[0];
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  const handleSelect = useCallback(
    (opt: SortOption) => {
      onChange(opt);
      setOpen(false);
    },
    [onChange],
  );

  // 点击外部关闭
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  return (
    <div className="sort-selector" ref={wrapperRef}>
      {/* 当前排序按钮 */}
      <button
        className="sort-selector__trigger"
        onClick={() => setOpen((prev) => !prev)}
        aria-label={`排序：${current.label}`}
      >
        <svg
          width="15"
          height="15"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <line x1="4" y1="6" x2="16" y2="6" />
          <line x1="4" y1="12" x2="12" y2="12" />
          <line x1="4" y1="18" x2="8" y2="18" />
        </svg>
        <span>{current.label}</span>
        <svg
          width="12"
          height="12"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{ transform: open ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 150ms ease' }}
          aria-hidden="true"
        >
          <path d="M6 9l6 6 6-6" />
        </svg>
      </button>

      {/* 下拉菜单 — 定位在按钮下方 */}
      {open && (
        <div className="sort-selector__menu">
          {SORT_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              className={`sort-selector__option${opt.value === value ? ' sort-selector__option--active' : ''}`}
              onClick={() => handleSelect(opt.value)}
            >
              <span>{opt.label}</span>
              {opt.value === value && (
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <path d="M20 6L9 17l-5-5" />
                </svg>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
});
