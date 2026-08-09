import { memo, useState, useCallback } from 'react';

/* ═══════════════════════ Props ═══════════════════════ */

export interface IConfirmDialogProps {
  /** 是否打开 */
  isOpen: boolean;
  /** 标题 */
  title: string;
  /** 正文 */
  message: string;
  /** 确认按钮文字（默认"确认"） */
  confirmLabel?: string;
  /** 取消按钮文字（默认"取消"） */
  cancelLabel?: string;
  /** 变体：danger = 红色确认按钮 */
  variant?: 'danger' | 'default';
  /** 确认回调 */
  onConfirm: () => void;
  /** 取消/关闭回调 */
  onCancel: () => void;
}

const CLOSE_DURATION_MS = 200;

/* ═══════════════════════ ConfirmDialog ═══════════════════════ */

export const ConfirmDialog = memo(function ConfirmDialog({
  isOpen,
  title,
  message,
  confirmLabel = '确认',
  cancelLabel = '取消',
  variant = 'default',
  onConfirm,
  onCancel,
}: IConfirmDialogProps) {
  const [closing, setClosing] = useState(false);

  const handleCancel = useCallback(() => {
    setClosing(true);
    setTimeout(() => {
      setClosing(false);
      onCancel();
    }, CLOSE_DURATION_MS);
  }, [onCancel]);

  const handleConfirm = useCallback(() => {
    setClosing(true);
    setTimeout(() => {
      setClosing(false);
      onConfirm();
    }, CLOSE_DURATION_MS);
  }, [onConfirm]);

  // 遮罩点击 → 取消
  const handleBackdropClick = useCallback((e: React.MouseEvent) => {
    if (e.target === e.currentTarget) handleCancel();
  }, [handleCancel]);

  if (!isOpen && !closing) return null;

  const variantClass = variant === 'danger'
    ? 'confirm-dialog--danger'
    : 'confirm-dialog--default';

  const backdropClass = [
    'confirm-dialog__backdrop',
    closing ? 'confirm-dialog__backdrop--closing' : '',
  ].filter(Boolean).join(' ');

  const dialogClass = [
    'confirm-dialog',
    variantClass,
    closing ? 'confirm-dialog--closing' : '',
  ].filter(Boolean).join(' ');

  return (
    <>
      {/* 遮罩 */}
      <div
        className={backdropClass}
        onClick={handleBackdropClick}
        aria-hidden="true"
      />

      {/* 对话框 */}
      <div
        className={dialogClass}
        role="alertdialog"
        aria-modal="true"
        aria-label={title}
      >
        {/* 标题 */}
        <h3 className="confirm-dialog__title">{title}</h3>

        {/* 正文 */}
        <p className="confirm-dialog__message">{message}</p>

        {/* 按钮组 */}
        <div className="confirm-dialog__actions">
          <button
            className="confirm-dialog__btn confirm-dialog__btn--cancel"
            onClick={handleCancel}
          >
            {cancelLabel}
          </button>
          <button
            className={`confirm-dialog__btn confirm-dialog__btn--confirm${variant === 'danger' ? ' confirm-dialog__btn--danger' : ''}`}
            onClick={handleConfirm}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </>
  );
});
