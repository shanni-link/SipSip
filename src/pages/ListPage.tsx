import { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ListHeader } from '../components/header';
import { FilterPanel, type IFilterState } from '../components/sidebar';
import { ReceiptCard } from '../components/card';
import type { IReceiptCardProps } from '../components/card';
import { SearchInput, FilterChips, buildFilterChips, SortSelector } from '../components/search';
import type { SortOption } from '../components/search';
import { ReceiptModal } from '../components/modal';
import { getAllRecords, subscribeRecords, updateRecord, type ITeaRecord } from '../stores/recordStore';
import '../components/header/Header.css';
import '../components/sidebar/FilterPanel.css';
import '../components/card/ReceiptCard.css';
import '../components/search/SearchInput.css';
import '../components/search/FilterChips.css';
import '../components/search/SortSelector.css';
import '../components/modal/ReceiptModal.css';
import './ListPage.css';

function getCurrentMonth(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

/** ITeaRecord + 筛选元数据 */
interface IReceiptWithMeta extends IReceiptCardProps {
  _brandKey: string;
  _rating: number;
  _dateMonth: string;
  _dateDay: number;
  _price: number;
  _record: ITeaRecord;
}

function toReceiptWithMeta(r: ITeaRecord): IReceiptWithMeta {
  const [y, m, d] = r.date.split('-');
  return {
    id: r.id,
    date: `${y}.${String(m).padStart(2, '0')}.${String(d).padStart(2, '0')}`,
    cutoutImage: r.cutoutDataUrl || undefined,
    name: r.name,
    brand: r.brand,
    brandKey: r.brandKey,
    store: r.store || undefined,
    cupSize: r.cupSize || undefined,
    sweetness: r.sweetness || undefined,
    temperature: r.temperature || undefined,
    toppings: r.toppings.length > 0 ? r.toppings : undefined,
    price: r.price || undefined,
    rating: r.rating,
    moodText: r.moodText || undefined,
    hasVoice: r.hasVoice,
    audioDataUrl: r.audioDataUrl,
    isFavorite: r.isFavorite,
    _brandKey: r.brandKey,
    _rating: r.rating,
    _dateMonth: `${y}-${String(m).padStart(2, '0')}`,
    _dateDay: Number(d),
    _price: r.price || 0,
    _record: r,
  };
}

/** 按日期分组 */
function groupByDate(receipts: IReceiptWithMeta[]): Map<string, IReceiptWithMeta[]> {
  const map = new Map<string, IReceiptWithMeta[]>();
  for (const r of receipts) {
    const key = `${r._dateMonth}-${String(r._dateDay).padStart(2, '0')}`;
    if (!map.has(key)) map.set(key, []);
    map.get(key)!.push(r);
  }
  return map;
}

function formatDateLabel(dateKey: string): string {
  const [year, month, day] = dateKey.split('-');
  return `${year}年${Number(month)}月${Number(day)}日`;
}

/** 同日期小票轮播组件 */
function ReceiptCarousel({ receipts, onCardClick, onToggleFavorite }: {
  receipts: IReceiptWithMeta[];
  onCardClick?: (r: IReceiptWithMeta) => void;
  onToggleFavorite?: (id: string, current: boolean) => void;
}) {
  const [activeIndex, setActiveIndex] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);

  const handleScroll = useCallback(() => {
    if (!scrollRef.current) return;
    const idx = Math.round(scrollRef.current.scrollLeft / scrollRef.current.clientWidth);
    setActiveIndex(idx);
  }, []);

  if (receipts.length === 1) {
    const r = receipts[0];
    const { _brandKey, _rating, _dateMonth, _dateDay, _price, _record, ...props } = r;
    return (
      <div onClick={() => onCardClick?.(r)} style={{ cursor: 'pointer' }}>
        <ReceiptCard
          {...props}
          onToggleFavorite={onToggleFavorite ? () => onToggleFavorite(r.id!, !!r.isFavorite) : undefined}
        />
      </div>
    );
  }

  return (
    <div className="receipt-carousel">
      <div
        className="receipt-carousel__track"
        ref={scrollRef}
        onScroll={handleScroll}
      >
        {receipts.map((r) => {
          const { _brandKey, _rating, _dateMonth, _dateDay, _price, _record, ...props } = r;
          return (
            <div key={r.id} className="receipt-carousel__page" onClick={() => onCardClick?.(r)} style={{ cursor: 'pointer' }}>
              <ReceiptCard
                {...props}
                onToggleFavorite={onToggleFavorite ? () => onToggleFavorite(r.id!, !!r.isFavorite) : undefined}
              />
            </div>
          );
        })}
      </div>
      <div className="receipt-carousel__dots">
        {receipts.map((_, i) => (
          <button
            key={i}
            className={`receipt-carousel__dot${i === activeIndex ? ' receipt-carousel__dot--active' : ''}`}
            onClick={() => {
              if (scrollRef.current) {
                scrollRef.current.scrollTo({
                  left: scrollRef.current.clientWidth * i,
                  behavior: 'smooth',
                });
              }
            }}
            aria-label={`第 ${i + 1} 张`}
          />
        ))}
      </div>
    </div>
  );
}

export function ListPage() {
  const navigate = useNavigate();
  const [filterOpen, setFilterOpen] = useState(false);
  const [listMonth, setListMonth] = useState(getCurrentMonth);
  const [activeFilters, setActiveFilters] = useState<IFilterState>({
    brands: [],
    rating: null,
    dateMonth: null,
    dateDay: null,
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [searchOpen, setSearchOpen] = useState(false);
  const [sortBy, setSortBy] = useState<SortOption>('newest');
  const [selectedReceipt, setSelectedReceipt] = useState<IReceiptWithMeta | null>(null);

  const handleToggleFavorite = useCallback((id: string, current: boolean) => {
    updateRecord(id, { isFavorite: !current });
  }, []);

  // 订阅数据变化
  const [tick, setTick] = useState(0);
  useEffect(() => {
    return subscribeRecords(() => setTick(t => t + 1));
  }, []);

  // 从 recordStore 获取所有记录
  const allReceipts = useMemo(() => getAllRecords().map(toReceiptWithMeta), [tick]);

  const filterActive =
    activeFilters.brands.length > 0 ||
    activeFilters.rating !== null ||
    activeFilters.dateMonth !== null ||
    activeFilters.dateDay !== null;

  const handleApplyFilter = useCallback((filters: IFilterState) => {
    setActiveFilters(filters);
  }, []);

  const handleRemoveBrand = useCallback((key: string) => {
    setActiveFilters(prev => ({
      ...prev,
      brands: prev.brands.filter(b => b !== key),
    }));
  }, []);

  const handleRemoveRating = useCallback(() => {
    setActiveFilters(prev => ({ ...prev, rating: null }));
  }, []);

  const handleRemoveDate = useCallback(() => {
    setActiveFilters(prev => ({ ...prev, dateMonth: null, dateDay: null }));
  }, []);

  const handleClearAllFilters = useCallback(() => {
    setActiveFilters({ brands: [], rating: null, dateMonth: null, dateDay: null });
  }, []);

  const activeChips = useMemo(
    () => buildFilterChips(
      activeFilters.brands,
      activeFilters.rating,
      activeFilters.dateMonth,
      activeFilters.dateDay,
      handleRemoveBrand,
      handleRemoveRating,
      handleRemoveDate,
    ),
    [activeFilters, handleRemoveBrand, handleRemoveRating, handleRemoveDate],
  );

  const changeMonth = useCallback((delta: number) => {
    setListMonth(prev => {
      const [y, m] = prev.split('-').map(Number);
      const d = new Date(y, m - 1 + delta, 1);
      return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    });
  }, []);

  /** 过滤 + 文本搜索 + 排序 + 按日期分组 */
  const dateGroups = useMemo(() => {
    let filtered = allReceipts.filter(card => {
      if (card._dateMonth !== listMonth) return false;
      if (activeFilters.brands.length > 0 && !activeFilters.brands.includes(card._brandKey)) return false;
      if (activeFilters.rating !== null && card._rating !== activeFilters.rating) return false;
      if (activeFilters.dateMonth !== null && card._dateMonth !== activeFilters.dateMonth) return false;
      if (activeFilters.dateDay !== null && card._dateDay !== activeFilters.dateDay) return false;
      return true;
    });

    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      filtered = filtered.filter(card =>
        (card.name ?? '').toLowerCase().includes(q) ||
        (card.brand ?? '').toLowerCase().includes(q)
      );
    }

    const sortFn = (() => {
      switch (sortBy) {
        case 'oldest':
          return (a: IReceiptWithMeta, b: IReceiptWithMeta) =>
            a._dateMonth.localeCompare(b._dateMonth) || a._dateDay - b._dateDay;
        case 'price-desc':
          return (a: IReceiptWithMeta, b: IReceiptWithMeta) => b._price - a._price;
        case 'price-asc':
          return (a: IReceiptWithMeta, b: IReceiptWithMeta) => a._price - b._price;
        case 'rating-desc':
          return (a: IReceiptWithMeta, b: IReceiptWithMeta) => b._rating - a._rating;
        case 'newest':
        default:
          return (a: IReceiptWithMeta, b: IReceiptWithMeta) =>
            b._dateMonth.localeCompare(a._dateMonth) || b._dateDay - a._dateDay;
      }
    })();
    filtered = [...filtered].sort(sortFn);

    const grouped = groupByDate(filtered);
    const groupEntries = [...grouped.entries()];
    if (sortBy === 'oldest') {
      groupEntries.sort((a, b) => a[0].localeCompare(b[0]));
    } else {
      groupEntries.sort((a, b) => b[0].localeCompare(a[0]));
    }
    return groupEntries;
  }, [allReceipts, activeFilters, listMonth, searchQuery, sortBy]);

  const [dispYear, dispMonth] = listMonth.split('-').map(Number);
  const isCurrentMonth = listMonth === getCurrentMonth();

  return (
    <div style={{ minHeight: '100dvh', display: 'flex', flexDirection: 'column' }}>
      <ListHeader
        onBack={() => navigate(-1)}
        onSearch={() => setSearchOpen(prev => !prev)}
        onFilter={() => setFilterOpen(prev => !prev)}
        filterActive={filterActive}
        titleClassName="header__title--lg"
      />

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', position: 'relative' }}>
        <FilterPanel
          isOpen={filterOpen}
          onClose={() => setFilterOpen(false)}
          initial={activeFilters}
          currentMonth={listMonth}
          onApply={handleApplyFilter}
        />

        {/* 搜索悬浮面板 */}
        {searchOpen && (
          <div className="search-overlay">
            <div className="search-overlay__panel">
              <SearchInput value={searchQuery} onChange={setSearchQuery} />
            </div>
            <div className="search-overlay__backdrop" onClick={() => setSearchOpen(false)} />
          </div>
        )}

        {/* 激活的筛选标签 */}
        <FilterChips filters={activeChips} onClearAll={handleClearAllFilters} />

        {/* 月份切换栏 + 排序 — grid 布局确保手机端不重叠 */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr auto 1fr',
          alignItems: 'center',
          padding: 'var(--spacing-2) var(--spacing-3)',
          borderBottom: '1px solid var(--color-divider)',
          background: 'var(--color-surface)',
          minHeight: 48,
          gap: 'var(--spacing-1)',
        }}>
          {/* 左侧：上个月箭头 */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-start' }}>
            <button onClick={() => changeMonth(-1)} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 32, height: 32, borderRadius: '50%', color: 'var(--color-text-secondary)', cursor: 'pointer', border: 'none', background: 'transparent', flexShrink: 0 }} aria-label="上个月">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 18l-6-6 6-6" /></svg>
            </button>
          </div>

          {/* 中间：日期 + 本月按钮 — grid auto 列确保真居中 */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--spacing-1)',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
          }}>
            <span className="list-month-label" style={{ fontFamily: 'var(--font-family-display)', fontSize: 'var(--text-md)', fontWeight: 'var(--font-weight-semibold)', color: 'var(--color-text-primary)', userSelect: 'none' }}>{dispYear}年{dispMonth}月</span>
            <button onClick={() => setListMonth(getCurrentMonth())} disabled={isCurrentMonth} className="list-month-today-btn" style={{ fontFamily: 'var(--font-family-body)', fontSize: 'var(--text-xs)', fontWeight: 'var(--font-weight-medium)', color: 'var(--color-text-secondary)', background: 'var(--color-tea-50)', border: '1px solid var(--color-divider)', borderRadius: 'var(--radius-md)', padding: '4px 10px', cursor: isCurrentMonth ? 'default' : 'pointer', lineHeight: 1.4, whiteSpace: 'nowrap', flexShrink: 0, visibility: isCurrentMonth ? 'hidden' : 'visible' }}>本月</button>
          </div>

          {/* 右侧：排序 + 下个月箭头 */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 'var(--spacing-1)' }}>
            <SortSelector value={sortBy} onChange={setSortBy} />
            <button onClick={() => changeMonth(1)} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 32, height: 32, borderRadius: '50%', color: 'var(--color-text-secondary)', cursor: 'pointer', border: 'none', background: 'transparent', flexShrink: 0 }} aria-label="下个月">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18l6-6-6-6" /></svg>
            </button>
          </div>
        </div>

        {/* 按日期分组的小票列表 */}
        <div style={{ flex: 1, overflow: 'auto', padding: 'var(--spacing-4)', display: 'flex', flexDirection: 'column', gap: 'var(--spacing-4)' }}>
          {dateGroups.length === 0 ? (
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-text-hint)', fontFamily: 'var(--font-family-display)', fontSize: 'var(--text-base)' }}>
              <p>没有匹配的记录</p>
            </div>
          ) : (
            dateGroups.map(([dateKey, receipts]) => (
              <div key={dateKey} className="receipt-date-group">
                <div className="receipt-date-group__header">
                  <span className="receipt-date-group__label">{formatDateLabel(dateKey)}</span>
                  <span className="receipt-date-group__count">{receipts.length}杯</span>
                </div>
                <ReceiptCarousel receipts={receipts} onCardClick={setSelectedReceipt} onToggleFavorite={handleToggleFavorite} />
              </div>
            ))
          )}
        </div>
      </div>

      {/* 小票详情弹层 */}
      {selectedReceipt && (() => {
        const { _brandKey, _rating, _dateMonth, _dateDay, _price, _record, audioDataUrl, ...props } = selectedReceipt;
        return (
          <ReceiptModal
            isOpen={true}
            onClose={() => setSelectedReceipt(null)}
            audioDataUrl={audioDataUrl}
            onToggleFavorite={() => handleToggleFavorite(selectedReceipt.id!, !!selectedReceipt.isFavorite)}
            {...props}
          />
        );
      })()}
    </div>
  );
}
