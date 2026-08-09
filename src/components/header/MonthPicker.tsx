import { memo, useState } from 'react';

interface IMonthPickerProps {
  year: number;
  month: number;
  isOpen: boolean;
  onSelect: (year: number, month: number) => void;
  onClose: () => void;
}

const MONTHS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];

/**
 * MonthPicker — 年月选择器
 * 点击 Header 日期区域弹出，顶部年份左右切换 + 12个月网格
 */
export const MonthPicker = memo(function MonthPicker({
  year,
  month,
  isOpen,
  onSelect,
  onClose,
}: IMonthPickerProps) {
  const [pickerYear, setPickerYear] = useState(year);

  if (!isOpen) return null;

  return (
    <div className="month-picker-overlay" onClick={onClose}>
      <div
        className="month-picker"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-label="选择年月"
      >
        {/* 年份选择行 */}
        <div className="month-picker__year-row">
          <button
            className="month-picker__year-btn"
            onClick={() => setPickerYear(y => y - 1)}
            aria-label="上一年"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M15 18l-6-6 6-6" />
            </svg>
          </button>
          <span className="month-picker__year-label">{pickerYear}</span>
          <button
            className="month-picker__year-btn"
            onClick={() => setPickerYear(y => y + 1)}
            aria-label="下一年"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 18l6-6-6-6" />
            </svg>
          </button>
        </div>

        {/* 月份网格 */}
        <div className="month-picker__grid">
          {MONTHS.map(m => {
            const isSelected = pickerYear === year && m === month;
            const isCurrentMonth =
              pickerYear === new Date().getFullYear() &&
              m === new Date().getMonth() + 1;

            return (
              <button
                key={m}
                className={`month-picker__cell ${
                  isSelected ? 'month-picker__cell--selected' : ''
                } ${isCurrentMonth ? 'month-picker__cell--today' : ''}`}
                onClick={() => onSelect(pickerYear, m)}
              >
                {m}月
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
});
