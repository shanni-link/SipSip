import { memo } from 'react';

interface IListHeaderProps {
  title?: string;
  titleClassName?: string;
  filterActive?: boolean;
  onBack: () => void;
  onSearch?: () => void;
  onFilter?: () => void;
}

/**
 * ListHeader — 小票列表页顶部栏
 * 返回按钮 + 标题 + 搜索/筛选图标
 */
export const ListHeader = memo(function ListHeader({
  title = '小票存根',
  titleClassName = '',
  filterActive = false,
  onBack,
  onSearch,
  onFilter,
}: IListHeaderProps) {
  return (
    <header className="header">
      {/* 左：返回按钮 */}
      <div className="header__side">
        <button
          className="header__icon-btn"
          onClick={onBack}
          aria-label="返回"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M15 18l-6-6 6-6" />
          </svg>
        </button>
      </div>

      {/* 中：标题 */}
      <h1 className={`header__title ${titleClassName}`.trim()}>{title}</h1>

      {/* 右：搜索 + 筛选 */}
      <div className="header__side header__side--right">
        {onSearch && (
          <button
            className="header__icon-btn"
            onClick={onSearch}
            aria-label="搜索"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8" />
              <path d="M21 21l-4.35-4.35" />
            </svg>
          </button>
        )}
        {onFilter && (
          <button
            className={`header__icon-btn ${filterActive ? 'header__icon-btn--active' : ''}`}
            onClick={onFilter}
            aria-label="筛选"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
            </svg>
          </button>
        )}
      </div>
    </header>
  );
});
