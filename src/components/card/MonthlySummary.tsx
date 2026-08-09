import { memo } from 'react';
import { TeaThumb } from './TeaThumb';

interface IMonthlySummaryProps {
  month: string;         // "2026-06"
  cupCount: number;
  shopCount: number;
  totalAmount: number;
  topCutouts: string[];  // 按日期降序，最多 5 张
}

/** 照片墙用的旋转角度 — 5 张各不同，跨度拉大制造错落感 */
const PHOTO_ROTATIONS = [-10, -4, 7, -7, 2];

export const MonthlySummary = memo(function MonthlySummary({
  month,
  cupCount,
  shopCount,
  totalAmount,
  topCutouts,
}: IMonthlySummaryProps) {
  // 空态
  if (cupCount === 0) {
    return (
      <div className="monthly-summary monthly-summary--empty">
        <div className="monthly-summary__empty-icon">🧋</div>
        <p className="monthly-summary__empty-text">这个月还没有记录哦</p>
      </div>
    );
  }

  const [, monthNum] = month.split('-');
  const displayMonth = `${Number(monthNum)}月`;

  return (
    <div className="monthly-summary">
      {/* 顶行：左侧标题 + 右侧抠图层叠 */}
      <div className="monthly-summary__top-row">
        <h3 className="monthly-summary__header">
          <span className="monthly-summary__header-text">
            {displayMonth} · {cupCount}杯 · {shopCount}家店
          </span>
        </h3>

        {topCutouts.length > 0 && (
          <div className="monthly-summary__photo-wall">
            {topCutouts.slice(0, 5).map((src, i) => (
              <div
                key={i}
                className="monthly-summary__photo"
                style={{
                  transform: `rotate(${PHOTO_ROTATIONS[i % PHOTO_ROTATIONS.length] ?? 0}deg)`,
                  zIndex: 5 - i,
                }}
              >
                <TeaThumb src={src} alt={`Top ${i + 1}`} index={i} />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 金额（缩小、去强调） */}
      <p className="monthly-summary__amount">¥ {totalAmount.toFixed(2)}</p>
    </div>
  );
});
