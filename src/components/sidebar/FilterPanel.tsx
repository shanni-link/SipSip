import { memo, useState, useCallback, useEffect, useMemo, useRef } from 'react';

const PRESET_BRANDS = [
  { key: 'heytea', label: '喜茶', color: '#1a1a1a' },
  { key: 'nayuki', label: '奈雪', color: '#2d5a27' },
  { key: 'mxbc', label: '蜜雪冰城', color: '#d40016' },
  { key: 'chabaidao', label: '茶百道', color: '#1a5276' },
  { key: 'bwcj', label: '霸王茶姬', color: '#4a235a' },
  { key: 'other', label: '其他', color: '#5d4037' },
];

export interface IFilterState {
  brands: string[];
  rating: number | null;
  dateMonth: string | null;
  dateDay: number | null;
}

interface IFilterPanelProps {
  isOpen: boolean;
  onClose: () => void;
  initial?: IFilterState;
  currentMonth: string;
  onApply: (filters: IFilterState) => void;
}

/* ═══════════════════════ 日期滚轮选择器 ═══════════════════════ */

/** 可滚动的选择列 */
function PickerColumn({
  items,
  selected,
  onChange,
}: {
  items: { value: number | null; label: string }[];
  selected: number | null;
  onChange: (v: number | null) => void;
}) {
  const colRef = useRef<HTMLDivElement>(null);

  // 挂载时滚到选中项居中
  useEffect(() => {
    if (!colRef.current) return;
    const selectedEl = colRef.current.querySelector('.date-picker__item--selected');
    if (selectedEl) {
      selectedEl.scrollIntoView({ block: 'center' });
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleClick = useCallback(
    (item: { value: number | null; label: string }, e: React.MouseEvent) => {
      onChange(item.value);
      // 滚动到点击项居中
      const el = e.currentTarget as HTMLElement;
      el.scrollIntoView({ block: 'center', behavior: 'smooth' });
    },
    [onChange],
  );

  return (
    <div className="date-picker__col" ref={colRef}>
      <div className="date-picker__col-spacer" />
      {items.map(item => (
        <div
          key={item.label}
          className={`date-picker__item${item.value === selected ? ' date-picker__item--selected' : ''}`}
          onClick={(e) => handleClick(item, e)}
        >
          {item.label}
        </div>
      ))}
      <div className="date-picker__col-spacer" />
    </div>
  );
}

interface IDatePickerPopoverProps {
  year: number;
  month: number;
  day: number | null;
  onConfirm: (year: number, month: number, day: number | null) => void;
  onClose: () => void;
}

function DatePickerPopover({ year, month, day, onConfirm, onClose }: IDatePickerPopoverProps) {
  const [pickYear, setPickYear] = useState(year);
  const [pickMonth, setPickMonth] = useState(month);
  const [pickDay, setPickDay] = useState<number | null>(day);

  const yearItems = useMemo(() => {
    const items: { value: number; label: string }[] = [];
    for (let y = year - 10; y <= year + 5; y++) {
      items.push({ value: y, label: `${y}年` });
    }
    return items;
  }, [year]);

  const monthItems = useMemo(() => {
    return Array.from({ length: 12 }, (_, i) => ({
      value: i + 1,
      label: `${i + 1}月`,
    }));
  }, []);

  const dayItems = useMemo(() => {
    const daysInMonth = new Date(pickYear, pickMonth, 0).getDate();
    const items: { value: number | null; label: string }[] = [
      { value: null, label: '−' },
    ];
    for (let d = 1; d <= daysInMonth; d++) {
      items.push({ value: d, label: `${d}日` });
    }
    return items;
  }, [pickYear, pickMonth]);

  return (
    <div className="date-picker-overlay" onClick={onClose}>
      <div className="date-picker" onClick={e => e.stopPropagation()}>
        {/* 列标题 */}
        <div className="date-picker__headers">
          <span className="date-picker__col-title">年</span>
          <span className="date-picker__col-title">月</span>
          <span className="date-picker__col-title">日</span>
        </div>

        {/* 三列滚动区 */}
        <div className="date-picker__cols">
          <PickerColumn items={yearItems} selected={pickYear} onChange={(v) => { if (v !== null) setPickYear(v); }} />
          <PickerColumn items={monthItems} selected={pickMonth} onChange={(v) => { if (v !== null) setPickMonth(v); }} />
          <PickerColumn items={dayItems} selected={pickDay} onChange={setPickDay} />
        </div>

        {/* 确认 */}
        <button
          className="date-picker__confirm"
          onClick={() => onConfirm(pickYear, pickMonth, pickDay)}
        >
          确认
        </button>
      </div>
    </div>
  );
}

/* ═══════════════════════ FilterPanel ═══════════════════════ */

export const FilterPanel = memo(function FilterPanel({
  isOpen,
  onClose,
  initial,
  currentMonth,
  onApply,
}: IFilterPanelProps) {
  const [selectedBrands, setSelectedBrands] = useState<string[]>(initial?.brands ?? []);
  const [selectedRating, setSelectedRating] = useState<number | null>(initial?.rating ?? null);
  const [selectedDate, setSelectedDate] = useState<string | null>(initial?.dateMonth ?? null);
  const [selectedDay, setSelectedDay] = useState<number | null>(initial?.dateDay ?? null);
  const [pickerOpen, setPickerOpen] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setSelectedBrands(initial?.brands ?? []);
      setSelectedRating(initial?.rating ?? null);
      setSelectedDate(initial?.dateMonth ?? null);
      setSelectedDay(initial?.dateDay ?? null);
    }
  }, [isOpen, initial]);

  const activeDate = selectedDate ?? currentMonth;
  const [dateYear, dateMonthNum] = activeDate.split('-').map(Number);

  // 今日日期 — 打开滚轮时默认定位到今日
  const todayForPicker = useMemo(() => {
    const d = new Date();
    return { year: d.getFullYear(), month: d.getMonth() + 1 };
  }, []);

  const toggleBrand = useCallback((key: string) => {
    setSelectedBrands(prev =>
      prev.includes(key) ? prev.filter(b => b !== key) : [...prev, key]
    );
  }, []);

  const handlePickerConfirm = useCallback((y: number, m: number, d: number | null) => {
    setSelectedDate(`${y}-${String(m).padStart(2, '0')}`);
    setSelectedDay(d);
    setPickerOpen(false);
  }, []);

  const handleApply = useCallback(() => {
    onApply({ brands: selectedBrands, rating: selectedRating, dateMonth: selectedDate, dateDay: selectedDay });
    onClose();
  }, [selectedBrands, selectedRating, selectedDate, selectedDay, onApply, onClose]);

  const handleReset = useCallback(() => {
    setSelectedBrands([]);
    setSelectedRating(null);
    setSelectedDate(null);
    setSelectedDay(null);
  }, []);

  const hasFilters = selectedBrands.length > 0 || selectedRating !== null || selectedDate !== null || selectedDay !== null;
  const dayLabel = selectedDay === null ? '−' : `${selectedDay}日`;

  return (
    <>
      <div className={`filter-panel-wrapper${isOpen ? ' filter-panel-wrapper--open' : ''}`}>
        <div className="filter-panel" role="dialog" aria-label="筛选条件">
          {/* ═══ 日期 ═══ */}
          <div className="filter-panel__group">
            <h3 className="filter-panel__group-title">日期</h3>
            <div className="filter-panel__date-display">
              <button className="filter-panel__date-part" onClick={() => setPickerOpen(true)}>
                {dateYear}年{dateMonthNum}月{dayLabel}
              </button>
            </div>
          </div>

          {/* ═══ 品牌 ═══ */}
          <div className="filter-panel__group">
            <h3 className="filter-panel__group-title">品牌</h3>
            <div className="filter-panel__chips">
              {PRESET_BRANDS.map(brand => (
                <button
                  key={brand.key}
                  className={`filter-panel__chip${selectedBrands.includes(brand.key) ? ' filter-panel__chip--active' : ''}`}
                  style={selectedBrands.includes(brand.key) ? { background: brand.color, borderColor: brand.color } : undefined}
                  onClick={() => toggleBrand(brand.key)}
                >
                  {brand.label}
                </button>
              ))}
            </div>
          </div>

          {/* ═══ 评分 ═══ */}
          <div className="filter-panel__group">
            <h3 className="filter-panel__group-title">评分</h3>
            <div className="filter-panel__chips">
              {[1, 2, 3, 4, 5].map(n => (
                <button
                  key={n}
                  className={`filter-panel__chip${selectedRating === n ? ' filter-panel__chip--active' : ''}`}
                  style={selectedRating === n ? { background: 'var(--color-accent)', borderColor: 'var(--color-accent)' } : undefined}
                  onClick={() => setSelectedRating(selectedRating === n ? null : n)}
                >
                  {n}分
                </button>
              ))}
            </div>
          </div>

          {/* ═══ 底部 ═══ */}
          <div className="filter-panel__actions">
            {hasFilters && (
              <button className="filter-panel__btn--reset" onClick={handleReset}>
                清除
              </button>
            )}
            <div style={{ flex: 1 }} />
            <button className="filter-panel__btn filter-panel__btn--secondary" onClick={onClose}>
              取消
            </button>
            <button className="filter-panel__btn filter-panel__btn--primary" onClick={handleApply}>
              应用
            </button>
          </div>
        </div>
      </div>

      {/* 日期滚轮弹出选择器 — 默认定位到今日 */}
      {pickerOpen && (
        <DatePickerPopover
          year={todayForPicker.year}
          month={todayForPicker.month}
          day={null}
          onConfirm={handlePickerConfirm}
          onClose={() => setPickerOpen(false)}
        />
      )}
    </>
  );
});
