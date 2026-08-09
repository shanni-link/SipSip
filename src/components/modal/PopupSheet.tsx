/* ═══════════════════════════════════════════════════
   PopupSheet — 底部弹出选择框（品牌/杯型/甜度/温度）
   ═══════════════════════════════════════════════════ */

import { memo, useCallback, useEffect } from 'react';
import './PopupSheet.css';

export interface IPopupSheetProps {
  isOpen: boolean;
  title?: string;
  children: React.ReactNode;
  onClose: () => void;
}

export const PopupSheet = memo(function PopupSheet({
  isOpen,
  title,
  children,
  onClose,
}: IPopupSheetProps) {
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') onClose();
  }, [onClose]);

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isOpen, handleKeyDown]);

  if (!isOpen) return null;

  return (
    <div className="popup-sheet" onClick={onClose}>
      <div className="popup-sheet__panel" onClick={e => e.stopPropagation()}>
        <div className="popup-sheet__handle" />
        {title && <div className="popup-sheet__title">{title}</div>}
        <div className="popup-sheet__body">
          {children}
        </div>
      </div>
    </div>
  );
});
