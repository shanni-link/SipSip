import { memo } from 'react';

interface IMonthHeaderProps {
  year: number;
  month: number;
  day: number;
  isCurrentMonth: boolean;
  collectionCount?: number;
  onDatePickerOpen: () => void;
  onBackToToday: () => void;
  onCollectionClick: () => void;
}

/**
 * MonthHeader — 日历首页顶部栏
 * 两行布局：第一行"今日"居中放大，第二行日期在左 + 收集盒在右
 * 点击"今日/日期"弹出年月选择器
 */
export const MonthHeader = memo(function MonthHeader({
  year,
  month,
  day,
  isCurrentMonth,
  collectionCount = 0,
  onDatePickerOpen,
  onBackToToday,
  onCollectionClick,
}: IMonthHeaderProps) {
  const weekDayNames = ['日', '一', '二', '三', '四', '五', '六'];
  const dateObj = new Date(year, month - 1, day);
  const weekDay = weekDayNames[dateObj.getDay()];

  return (
    <header className="header header--month">
      {/* 第一行：今日 — 居中放大 */}
      <button
        className="date-trigger"
        onClick={onDatePickerOpen}
        aria-label={`选择日期，当前${year}年${month}月`}
      >
        {isCurrentMonth ? (
          <span className="date-trigger__today">今 日</span>
        ) : (
          <span className="date-trigger__title">
            {year}年{month}月
          </span>
        )}
      </button>

      {/* 第二行：日期居中 + 收集盒在右 */}
      <div className="header__sub-row">
        {/* 左占位 — 与右侧收集盒等宽，确保日期视觉居中 */}
        <span />

        {isCurrentMonth ? (
          <span className="date-trigger__detail">
            {year}年{month}月{day}日 星期{weekDay}
          </span>
        ) : (
          <button className="date-trigger__back" onClick={onBackToToday}>
            ← 回到今日
          </button>
        )}

        <button
          className="collection-box"
          onClick={onCollectionClick}
          aria-label={`收集盒，${collectionCount}张小票`}
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M4 8l2-4h12l2 4" />
            <rect x="3" y="8" width="18" height="13" rx="1.5" />
            <line x1="9" y1="13" x2="15" y2="13" />
            <line x1="12" y1="8" x2="12" y2="21" />
          </svg>
          {collectionCount > 0 && (
            <span className="collection-box__badge">
              {collectionCount > 99 ? '99+' : collectionCount}
            </span>
          )}
        </button>
      </div>
    </header>
  );
});
