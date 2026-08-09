import { memo, useState, useCallback, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ReceiptCard } from './ReceiptCard';
import { ConfirmDialog, toast } from '../modal';
import { deleteRecord, updateRecord } from '../../stores/recordStore';
import { usePhotoCapture } from '../../pages/new-record/usePhotoCapture';
import '../modal/ConfirmDialog.css';

/** 小票数据（纯数据，不含 UI 回调） */
export interface IReceiptData {
  id: string;
  date: string;
  name: string;
  brand: string;
  brandKey?: string;
  store?: string;
  cupSize?: string;
  sweetness?: string;
  temperature?: string;
  toppings?: string[];
  price?: number;
  rating?: number;
  moodText?: string;
  hasVoice?: boolean;
  audioDataUrl?: string | null;
  cutoutImage?: string;
  isFavorite?: boolean;
}

interface IDayDetailModalProps {
  date: string;
  dateKey?: string; // YYYY-MM-DD，用于传递到新建记录页
  receipts: IReceiptData[];
  isOpen: boolean;
  onClose: () => void;
  isFutureDate?: boolean;
  isToday?: boolean;
}

const CLOSE_DURATION_MS = 150;

export const DayDetailModal = memo(function DayDetailModal({
  date,
  dateKey,
  receipts,
  isOpen,
  onClose,
  isFutureDate = false,
  isToday = false,
}: IDayDetailModalProps) {
  const navigate = useNavigate();
  const [closing, setClosing] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);
  const prevOpenRef = useRef(false);

  // 仅在首次打开时重置轮播位置
  useEffect(() => {
    if (isOpen && !prevOpenRef.current) {
      setActiveIndex(0);
      // 等待 DOM 渲染后重置滚动
      const id = setTimeout(() => {
        if (scrollRef.current) {
          scrollRef.current.scrollLeft = 0;
        }
      }, 50);
      prevOpenRef.current = true;
      return () => clearTimeout(id);
    }
    if (!isOpen) {
      prevOpenRef.current = false;
    }
  }, [isOpen]);

  const handleClose = useCallback(() => {
    setClosing(true);
    setTimeout(() => {
      setClosing(false);
      onClose();
    }, CLOSE_DURATION_MS);
  }, [onClose]);

  const handleBackdropClick = useCallback((e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      handleClose();
    }
  }, [handleClose]);

  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);

  const handleEdit = useCallback((id: string) => {
    navigate(`/edit/${id}`);
    handleClose();
  }, [navigate, handleClose]);

  const handleDelete = useCallback((id: string) => {
    setDeleteTarget(id);
  }, []);

  const handleDeleteConfirm = useCallback(() => {
    if (deleteTarget) {
      deleteRecord(deleteTarget);
      toast.success('记录已删除');
    }
    setDeleteTarget(null);
    handleClose();
  }, [deleteTarget, handleClose]);

  const handleDeleteCancel = useCallback(() => {
    setDeleteTarget(null);
  }, []);

  const handleToggleFavorite = useCallback((id: string, current: boolean) => {
    updateRecord(id, { isFavorite: !current });
  }, []);

  // 内嵌拍照/图库 Hook — 直接触发相机，不跳转中间页
  const { triggerCamera, triggerGallery, fileInputElement } = usePhotoCapture(dateKey);

  /** 监听滚动 → 更新当前页 */
  const handleScroll = useCallback(() => {
    if (!scrollRef.current) return;
    const el = scrollRef.current;
    const idx = Math.round(el.scrollLeft / el.clientWidth);
    setActiveIndex(idx);
  }, []);

  if (!isOpen && !closing) return null;

  const isEmpty = receipts.length === 0;
  const hasMultiple = receipts.length > 1;
  const dayLabel = isToday ? '今日' : '这天';

  return (
    <>
      {/* 半透明遮罩 */}
      <div
        className={`day-detail-modal__backdrop${closing ? ' day-detail-modal__backdrop--closing' : ''}`}
        onClick={handleBackdropClick}
        aria-hidden="true"
      />

      <div className={`day-detail-modal${closing ? ' day-detail-modal--closing' : ''}`}>
        {/* Header: 日期 + 关闭 */}
        <div className="day-detail-modal__header">
          <h2 className="day-detail-modal__title">{date}</h2>
          <button
            className="day-detail-modal__close"
            onClick={handleClose}
            aria-label="关闭"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* 未来日期：简洁提示，无图案 */}
        {isFutureDate ? (
          <div className="day-detail-modal__body day-detail-modal__body--hint">
            <p className="day-detail-modal__hint-text">还不能记录未来的奶茶哦</p>
          </div>
        ) : isEmpty ? (
          /* 空态：还没有记录 */
          <div className="day-detail-modal__body day-detail-modal__body--empty">
            <div className="day-detail-modal__empty-icon">🧋</div>
            <p className="day-detail-modal__empty-text">{dayLabel}还没有记录</p>
            <p className="day-detail-modal__empty-hint">来记录一杯吧</p>

            <div className="day-detail-modal__upload-actions">
              <button
                className="day-detail-modal__upload-btn day-detail-modal__upload-btn--camera"
                onClick={triggerCamera}
              >
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
                  <circle cx="12" cy="13" r="4"/>
                </svg>
                <span>拍照</span>
              </button>
              <button
                className="day-detail-modal__upload-btn day-detail-modal__upload-btn--gallery"
                onClick={triggerGallery}
              >
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                  <circle cx="8.5" cy="8.5" r="1.5"/>
                  <polyline points="21 15 16 10 5 21"/>
                </svg>
                <span>图库</span>
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* 小票轮播（多张时左右滑动切换） */}
            <div className="day-detail-modal__body">
              {hasMultiple ? (
                <>
                  <div
                    className="day-detail-modal__carousel"
                    ref={scrollRef}
                    onScroll={handleScroll}
                  >
                    {receipts.map((r) => (
                      <div key={r.id} className="day-detail-modal__carousel-page">
                        <ReceiptCard
                          className="receipt-card--modal"
                          id={r.id}
                          date={r.date}
                          name={r.name}
                          brand={r.brand}
                          brandKey={r.brandKey}
                          store={r.store}
                          cupSize={r.cupSize}
                          sweetness={r.sweetness}
                          temperature={r.temperature}
                          toppings={r.toppings}
                          price={r.price}
                          rating={r.rating}
                          moodText={r.moodText}
                          hasVoice={r.hasVoice}
                          audioDataUrl={r.audioDataUrl}
                          cutoutImage={r.cutoutImage}
                          isFavorite={r.isFavorite}
                          onToggleFavorite={() => handleToggleFavorite(r.id, !!r.isFavorite)}
                        />
                      </div>
                    ))}
                  </div>
                  {/* 页码指示器 */}
                  <div className="day-detail-modal__dots">
                    {receipts.map((_, i) => (
                      <button
                        key={i}
                        className={`day-detail-modal__dot${i === activeIndex ? ' day-detail-modal__dot--active' : ''}`}
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
                </>
              ) : (
                <div className="day-detail-modal__receipt-wrapper">
                  <ReceiptCard
                    className="receipt-card--modal"
                    id={receipts[0].id}
                    date={receipts[0].date}
                    name={receipts[0].name}
                    brand={receipts[0].brand}
                    brandKey={receipts[0].brandKey}
                    store={receipts[0].store}
                    cupSize={receipts[0].cupSize}
                    sweetness={receipts[0].sweetness}
                    temperature={receipts[0].temperature}
                    toppings={receipts[0].toppings}
                    price={receipts[0].price}
                    rating={receipts[0].rating}
                    moodText={receipts[0].moodText}
                    hasVoice={receipts[0].hasVoice}
                    audioDataUrl={receipts[0].audioDataUrl}
                    cutoutImage={receipts[0].cutoutImage}
                    isFavorite={receipts[0].isFavorite}
                    onToggleFavorite={() => handleToggleFavorite(receipts[0].id, !!receipts[0].isFavorite)}
                  />
                </div>
              )}
            </div>

            {/* 底部操作：编辑 / 删除 */}
            <div className="day-detail-modal__actions">
              <button
                className="day-detail-modal__btn day-detail-modal__btn--edit"
                onClick={() => handleEdit(receipts[activeIndex].id)}
              >
                编辑
              </button>
              <button
                className="day-detail-modal__btn day-detail-modal__btn--delete"
                onClick={() => handleDelete(receipts[activeIndex].id)}
              >
                删除
              </button>
            </div>
          </>
        )}
      </div>

      {/* 隐藏 file input — 拍照/图库直接触发 */}
      {fileInputElement}

      {/* 删除确认弹窗 */}
      <ConfirmDialog
        isOpen={deleteTarget !== null}
        title="删除记录"
        message="确定要删除这条奶茶记录吗？删除后无法恢复哦。"
        confirmLabel="删除"
        cancelLabel="取消"
        variant="danger"
        onConfirm={handleDeleteConfirm}
        onCancel={handleDeleteCancel}
      />
    </>
  );
});
