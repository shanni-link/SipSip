import { memo, useMemo } from 'react';

interface ITeaBrief {
  id: string;
  cutoutImage: string;
}

interface IDayCellProps {
  date: number;
  isToday?: boolean;
  isCurrentMonth?: boolean;
  teas?: ITeaBrief[];
  onPress?: () => void;
  dataDate?: string;
}

/** 基于 seed 的稳定旋转（-3° ~ +3°） */
function useStickerRotation(seed: number): number {
  return useMemo(() => {
    const hash = ((seed * 2654435761) >>> 0) % 7;
    return hash - 3;
  }, [seed]);
}

export const DayCell = memo(function DayCell({
  date,
  isToday = false,
  isCurrentMonth = true,
  teas,
  onPress,
  dataDate,
}: IDayCellProps) {
  const hasTeas = teas && teas.length > 0;
  const dateClass = [
    'day-cell__date',
    !isCurrentMonth ? 'day-cell__date--other-month' : '',
  ].filter(Boolean).join(' ');

  // 最多展示 1 张贴纸（主要那张）；多张时显示 +N
  const firstTea = hasTeas ? teas![0] : null;
  const overflow = hasTeas && teas!.length > 1 ? teas!.length - 1 : 0;

  return (
    <button
      className={`day-cell${isToday ? ' day-cell--today' : ''}${!isCurrentMonth ? ' day-cell--other-month' : ''}${hasTeas ? ' day-cell--has-tea' : ''}`}
      onClick={onPress}
      aria-label={`${date}日${hasTeas ? `，${teas!.length}杯奶茶` : ''}`}
      data-date={dataDate}
    >
      {/* 有奶茶：只展示贴纸，不展示日期 */}
      {hasTeas ? (
        <div className="day-cell__stickers">
          <StickerTea
            src={firstTea!.cutoutImage}
            rotation={useStickerRotation(date)}
          />
          {overflow > 0 && (
            <span className="day-cell__sticker-overflow">+{overflow}</span>
          )}
        </div>
      ) : (
        <span className={dateClass}>
          {date}
          {isToday && (
            <svg className="day-cell__hand-circle" viewBox="0 0 32 32" width="24" height="24" aria-hidden="true">
              <ellipse cx="16" cy="16" rx="13" ry="11" fill="none" stroke="var(--color-accent)" strokeWidth="1.6" strokeDasharray="48 3 52 2 44 4 50 1" transform="rotate(-7 16 16)" opacity="0.65" />
            </svg>
          )}
        </span>
      )}
    </button>
  );
});

/** 单张贴纸奶茶 */
function StickerTea({ src, rotation }: { src: string; rotation: number }) {
  if (!src) {
    return (
      <div
        className="day-cell__sticker day-cell__sticker--empty"
        style={{ transform: `rotate(${rotation}deg)` }}
      >
        🧋
      </div>
    );
  }

  return (
    <div
      className="day-cell__sticker"
      style={{ transform: `rotate(${rotation}deg)` }}
    >
      <img
        className="day-cell__sticker-img"
        src={src}
        alt=""
        loading="lazy"
      />
    </div>
  );
}
