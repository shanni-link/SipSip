import { memo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { TeaThumb } from './TeaThumb';

export interface IFavoriteEntry {
  year: number;
  month?: number;
  name: string;
  cutout: string;
  count: number;
}

interface IHistoricalFavoriteProps {
  currentFavorites?: IFavoriteEntry[];
  history?: IFavoriteEntry[];
}

export const HistoricalFavorite = memo(function HistoricalFavorite({
  currentFavorites,
  history,
}: IHistoricalFavoriteProps) {
  const navigate = useNavigate();

  const handleViewAll = useCallback(() => {
    navigate('/history');
  }, [navigate]);

  /** 照片墙旋转角度 — 5 张各不同，与 MonthlySummary 刻意错开 */
  const PHOTO_ROTATIONS = [6, -9, -3, 8, -5];

  const hasFavorites = currentFavorites && currentFavorites.length > 0;
  const hasHistory = history && history.length > 0;

  // 本月收藏总数
  const totalFavCups = currentFavorites?.reduce((sum, f) => sum + f.count, 0) ?? 0;

  // 收藏抠图列表（用于照片墙）
  const favCutouts = currentFavorites?.map(f => f.cutout).filter(Boolean) ?? [];

  // 完全空态
  if (!hasFavorites && !hasHistory) {
    return (
      <div className="historical-favorite__card historical-favorite__card--empty">
        <p className="historical-favorite__empty-text">还没有收藏的饮品哦</p>
      </div>
    );
  }

  return (
    <div className="historical-favorite">
      <div className="historical-favorite__card">
        {/* 顶行：左侧标签 + 右侧抠图层叠 */}
        <div className="historical-favorite__top-row">
          <h3 className="historical-favorite__header">
            <span className="historical-favorite__header-text">
              本月最爱{favCutouts.length > 0 ? ` · ${totalFavCups}杯` : ''}
            </span>
          </h3>

          {favCutouts.length > 0 && (
            <div className="historical-favorite__photo-wall">
              {favCutouts.slice(0, 5).map((src, i) => (
                <div
                  key={i}
                  className="historical-favorite__photo"
                  style={{
                    transform: `rotate(${PHOTO_ROTATIONS[i % PHOTO_ROTATIONS.length] ?? 0}deg)`,
                    zIndex: 5 - i,
                  }}
                >
                  <TeaThumb src={src} alt={`收藏 ${i + 1}`} index={i} />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 查看详情按钮 */}
        {(hasFavorites || hasHistory) && (
          <button className="historical-favorite__view-all" onClick={handleViewAll}>
            <span>查看详情</span>
            <svg
              width="14" height="14" viewBox="0 0 24 24"
              fill="none" stroke="currentColor" strokeWidth="2"
              strokeLinecap="round" strokeLinejoin="round"
            >
              <path d="M9 18l6-6-6-6" />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
});
