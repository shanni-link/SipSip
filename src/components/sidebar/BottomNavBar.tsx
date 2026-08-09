import { memo, useState, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { usePhotoCapture } from '../../pages/new-record/usePhotoCapture';

/**
 * BottomNavBar — 底部导航栏（仅日历首页显示）
 * 2 个元素：📅 日历标签（始终高亮） + 🧋 FAB 新增按钮（突出 18px）
 * FAB 点击弹出拍照/图库选择面板（不跳转中间页）
 */
export const BottomNavBar = memo(function BottomNavBar() {
  const location = useLocation();
  const navigate = useNavigate();
  const isCalendarActive = location.pathname === '/';
  const [sheetOpen, setSheetOpen] = useState(false);

  const { triggerCamera, triggerGallery, fileInputElement } = usePhotoCapture();

  const handleFabClick = useCallback(() => {
    setSheetOpen(true);
  }, []);

  const handleCamera = useCallback(() => {
    setSheetOpen(false);
    // 等待 sheet 关闭动画后再触发（避免与 React 渲染冲突）
    setTimeout(() => triggerCamera(), 200);
  }, [triggerCamera]);

  const handleGallery = useCallback(() => {
    setSheetOpen(false);
    setTimeout(() => triggerGallery(), 200);
  }, [triggerGallery]);

  const handleCancel = useCallback(() => {
    setSheetOpen(false);
  }, []);

  const handleBackdropClick = useCallback((e: React.MouseEvent) => {
    if (e.target === e.currentTarget) handleCancel();
  }, [handleCancel]);

  return (
    <>
      <nav className="bottom-nav" role="navigation" aria-label="底部导航">
        {/* 日历标签 */}
        <button
          className={`bottom-nav__tab${isCalendarActive ? ' bottom-nav__tab--active' : ''}`}
          onClick={() => navigate('/')}
          aria-label="日历首页"
          aria-current={isCalendarActive ? 'page' : undefined}
        >
          <span className="bottom-nav__tab-icon">
            <CalendarIcon active={isCalendarActive} />
          </span>
          <span>日历</span>
        </button>

        {/* FAB — 新增记录 */}
        <div className="bottom-nav__fab-wrapper">
          <button
            className="bottom-nav__fab"
            onClick={handleFabClick}
            aria-label="新增记录"
          >
            <span className="bottom-nav__fab-icon">
              <TeaCupPlusIcon />
            </span>
          </button>
        </div>
      </nav>

      {/* 隐藏 file input — 拍照/图库直接触发 */}
      {fileInputElement}

      {/* 拍照/图库 选择面板 */}
      {sheetOpen && (
        <div
          className="photo-action-sheet__backdrop"
          onClick={handleBackdropClick}
        >
          <div className={`photo-action-sheet${sheetOpen ? ' photo-action-sheet--open' : ''}`}>
            <p className="photo-action-sheet__title">记录一杯奶茶</p>
            <div className="photo-action-sheet__actions">
              <button
                className="photo-action-sheet__btn photo-action-sheet__btn--camera"
                onClick={handleCamera}
              >
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
                  <circle cx="12" cy="13" r="4"/>
                </svg>
                <span>拍照</span>
              </button>
              <button
                className="photo-action-sheet__btn photo-action-sheet__btn--gallery"
                onClick={handleGallery}
              >
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                  <circle cx="8.5" cy="8.5" r="1.5"/>
                  <polyline points="21 15 16 10 5 21"/>
                </svg>
                <span>图库</span>
              </button>
            </div>
            <button
              className="photo-action-sheet__cancel"
              onClick={handleCancel}
            >
              取消
            </button>
          </div>
        </div>
      )}
    </>
  );
});

/* ═══════════════════════════════════════
   手绘风 SVG 图标
   ═══════════════════════════════════════ */

/** 日历图标 — 折角日历本 */
function CalendarIcon({ active }: { active: boolean }) {
  const color = active ? 'var(--color-tea-700)' : 'var(--color-text-secondary)';
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="3.5" y="5.5" width="17" height="16" rx="1.5" />
      <line x1="7.5" y1="3.5" x2="7.5" y2="7.5" />
      <line x1="16.5" y1="3.5" x2="16.5" y2="7.5" />
      <path d="M17.5 5.5 L17.5 9.5 L13.5 9.5" fill="var(--color-tea-50)" stroke={color} />
      <line x1="7" y1="12.5" x2="10" y2="12.5" />
      <line x1="7" y1="16" x2="13" y2="16" />
    </svg>
  );
}

/** 奶茶杯 + 加号 — FAB 专用图标 */
function TeaCupPlusIcon() {
  return (
    <svg
      width="28"
      height="28"
      viewBox="0 0 28 28"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M4 10 L6 5 L20 5 L22 10 Z" />
      <line x1="4" y1="10" x2="22" y2="10" />
      <path d="M22 12 C23.5 12.5 24 15 22.5 17" />
      <path d="M6.5 8.5 Q8 7 9.5 8.5 T12.5 8.5 T15.5 8.5 T18.5 8.5" />
      <line x1="13" y1="15.5" x2="13" y2="21.5" />
      <line x1="10" y1="18.5" x2="16" y2="18.5" />
    </svg>
  );
}
