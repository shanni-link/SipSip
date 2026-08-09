import { memo, useState, useCallback, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ReceiptCard, type IReceiptCardProps } from '../card/ReceiptCard';

/* ═══════════════════════ Props ═══════════════════════ */

export interface IReceiptModalProps extends IReceiptCardProps {
  /** 是否打开 */
  isOpen: boolean;
  /** 关闭回调 */
  onClose: () => void;
  /** 编辑回调（默认跳转 /edit/:id） */
  onEdit?: (id: string) => void;
  /** 删除回调（默认弹出 ConfirmDialog 逻辑） */
  onDelete?: (id: string) => void;
  /** 语音录音 data URL（用于真实播放） */
  audioDataUrl?: string | null;
}

const CLOSE_DURATION_MS = 250;

/* ═══════════════════════ ReceiptModal ═══════════════════════ */

export const ReceiptModal = memo(function ReceiptModal({
  isOpen,
  onClose,
  onEdit,
  onDelete,
  audioDataUrl,
  ...receiptProps
}: IReceiptModalProps) {
  const navigate = useNavigate();
  const [closing, setClosing] = useState(false);
  const [voicePlaying, setVoicePlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const touchStartY = useRef<number | null>(null);
  const sheetRef = useRef<HTMLDivElement>(null);

  // 打开时锁定 body 滚动
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // 关闭动效
  const handleClose = useCallback(() => {
    setClosing(true);
    setTimeout(() => {
      setClosing(false);
      setVoicePlaying(false);
      onClose();
    }, CLOSE_DURATION_MS);
  }, [onClose]);

  // 遮罩点击
  const handleBackdropClick = useCallback((e: React.MouseEvent) => {
    if (e.target === e.currentTarget) handleClose();
  }, [handleClose]);

  // 下滑关闭（手势）
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    touchStartY.current = e.touches[0].clientY;
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (touchStartY.current === null) return;
    const delta = e.touches[0].clientY - touchStartY.current;
    if (delta > 60) {
      handleClose();
      touchStartY.current = null;
    }
  }, [handleClose]);

  const handleTouchEnd = useCallback(() => {
    touchStartY.current = null;
  }, []);

  // 编辑
  const handleEdit = useCallback(() => {
    if (onEdit) {
      onEdit(receiptProps.id ?? '');
    } else if (receiptProps.id) {
      navigate(`/edit/${receiptProps.id}`);
    }
    handleClose();
  }, [onEdit, receiptProps.id, navigate, handleClose]);

  // 删除
  const handleDelete = useCallback(() => {
    if (onDelete) {
      onDelete(receiptProps.id ?? '');
    } else if (window.confirm('确定要删除这条奶茶记录吗？')) {
      handleClose();
    }
  }, [onDelete, receiptProps.id, handleClose]);

  // 语音播放（真实音频）
  const handleVoice = useCallback(() => {
    if (!audioDataUrl) {
      // 无录音时模拟
      if (voicePlaying) {
        setVoicePlaying(false);
        return;
      }
      setVoicePlaying(true);
      setTimeout(() => setVoicePlaying(false), 2000);
      return;
    }

    if (voicePlaying) {
      audioRef.current?.pause();
      setVoicePlaying(false);
      return;
    }

    if (!audioRef.current) {
      audioRef.current = new Audio(audioDataUrl);
      audioRef.current.onended = () => setVoicePlaying(false);
      audioRef.current.onerror = () => setVoicePlaying(false);
    }
    audioRef.current.currentTime = 0;
    audioRef.current.play().catch(() => setVoicePlaying(false));
    setVoicePlaying(true);
  }, [audioDataUrl, voicePlaying]);

  if (!isOpen && !closing) return null;

  const modalClass = [
    'receipt-modal',
    closing ? 'receipt-modal--closing' : '',
  ].filter(Boolean).join(' ');

  const backdropClass = [
    'receipt-modal__backdrop',
    closing ? 'receipt-modal__backdrop--closing' : '',
  ].filter(Boolean).join(' ');

  return (
    <>
      {/* 半透明遮罩 */}
      <div
        className={backdropClass}
        onClick={handleBackdropClick}
        aria-hidden="true"
      />

      {/* 底部抽屉 */}
      <div
        className={modalClass}
        ref={sheetRef}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        role="dialog"
        aria-modal="true"
        aria-label="小票详情"
      >
        {/* 拖拽指示条 */}
        <div className="receipt-modal__handle">
          <div className="receipt-modal__handle-bar" />
        </div>

        {/* 小票主体 */}
        <div className="receipt-modal__body">
          <ReceiptCard
            {...receiptProps}
            onPlayVoice={receiptProps.hasVoice ? handleVoice : undefined}
          />
        </div>

        {/* 语音播放指示器 */}
        {receiptProps.hasVoice && (
          <div className="receipt-modal__voice-bar">
            <button
              className={`receipt-modal__voice-btn${voicePlaying ? ' receipt-modal__voice-btn--playing' : ''}`}
              onClick={handleVoice}
              aria-label={voicePlaying ? '停止播放' : '播放语音'}
            >
              {/* 播放/波浪图标 */}
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                {voicePlaying ? (
                  <>
                    <rect x="6" y="6" width="4" height="12" rx="1" />
                    <rect x="14" y="6" width="4" height="12" rx="1" />
                  </>
                ) : (
                  <>
                    <polygon points="5 3 19 12 5 21 5 3" />
                  </>
                )}
              </svg>
              <span>{voicePlaying ? '播放中...' : '听心情'}</span>
            </button>
            {voicePlaying && (
              <div className="receipt-modal__voice-waves">
                <span className="receipt-modal__wave" />
                <span className="receipt-modal__wave" />
                <span className="receipt-modal__wave" />
              </div>
            )}
          </div>
        )}

        {/* 操作按钮 */}
        <div className="receipt-modal__actions">
          <button
            className="receipt-modal__btn receipt-modal__btn--edit"
            onClick={handleEdit}
          >
            编辑
          </button>
          <button
            className="receipt-modal__btn receipt-modal__btn--delete"
            onClick={handleDelete}
          >
            删除
          </button>
        </div>

        {/* 安全区 */}
        <div className="receipt-modal__safe-area" />
      </div>
    </>
  );
});
