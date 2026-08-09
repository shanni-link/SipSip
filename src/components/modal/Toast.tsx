import { memo, useState, useEffect, useCallback, useRef } from 'react';

/* ═══════════════════════ 类型 ═══════════════════════ */

export type ToastVariant = 'success' | 'error' | 'info';

export interface IToast {
  id: number;
  message: string;
  variant: ToastVariant;
  /** 是否正在退场 */
  exiting: boolean;
}

export interface IToastOptions {
  /** 类型（默认 info） */
  variant?: ToastVariant;
  /** 显示时长 ms（默认 2500） */
  duration?: number;
}

/* ═══════════════════════ 全局 toast 管理 ═══════════════════════ */

let nextId = 1;
const DEFAULT_DURATION = 2500;
type Listener = (toasts: IToast[]) => void;
const listeners = new Set<Listener>();

function emit(toasts: IToast[]) {
  listeners.forEach(fn => fn(toasts));
}

/** 弹出 toast */
export function notify(message: string, options: IToastOptions = {}): number {
  const { variant = 'info', duration = DEFAULT_DURATION } = options;
  const id = nextId++;

  // 添加 toast
  const current = getToasts();
  const toast: IToast = { id, message, variant, exiting: false };
  current.push(toast);
  emit([...current]);

  // 到期后标记退场
  setTimeout(() => {
    const list = getToasts();
    const idx = list.findIndex(t => t.id === id);
    if (idx !== -1) {
      list[idx] = { ...list[idx], exiting: true };
      emit([...list]);

      // 退场动画结束后移除
      setTimeout(() => {
        const after = getToasts().filter(t => t.id !== id);
        emit(after);
      }, 250);
    }
  }, duration);

  return id;
}

/** 手动关闭 toast */
export function dismissToast(id: number): void {
  const list = getToasts();
  const idx = list.findIndex(t => t.id === id);
  if (idx !== -1) {
    list[idx] = { ...list[idx], exiting: true };
    emit([...list]);
    setTimeout(() => {
      const after = getToasts().filter(t => t.id !== id);
      emit(after);
    }, 250);
  }
}

/* ── 快捷方法 ── */

export const toast = {
  success(msg: string, duration?: number) {
    return notify(msg, { variant: 'success', duration });
  },
  error(msg: string, duration?: number) {
    return notify(msg, { variant: 'error', duration });
  },
  info(msg: string, duration?: number) {
    return notify(msg, { variant: 'info', duration });
  },
};

/* ═══════════════════════ 内部 helpers ═══════════════════════ */

// 模块闭包存储（避免外部直接修改）
const _toasts: IToast[] = [];

function getToasts(): IToast[] {
  return _toasts;
}

/* ═══════════════════════ Toast 图标 ═══════════════════════ */

function ToastIcon({ variant }: { variant: ToastVariant }) {
  switch (variant) {
    case 'success':
      return (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="20 6 9 17 4 12" />
        </svg>
      );
    case 'error':
      return (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10" />
          <line x1="15" y1="9" x2="9" y2="15" />
          <line x1="9" y1="9" x2="15" y2="15" />
        </svg>
      );
    case 'info':
      return (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="16" x2="12" y2="12" />
          <line x1="12" y1="8" x2="12.01" y2="8" />
        </svg>
      );
  }
}

/* ═══════════════════════ ToastContainer ═══════════════════════ */

/**
 * ToastContainer — 挂载一次（通常在 App 根组件），
 * 之后用 `notify()` / `toast.xxx()` 即可弹出 toast。
 */
export const ToastContainer = memo(function ToastContainer() {
  const [toasts, setToasts] = useState<IToast[]>([]);
  const mountedRef = useRef(false);

  useEffect(() => {
    mountedRef.current = true;
    const listener: Listener = (newToasts) => {
      if (mountedRef.current) {
        setToasts(newToasts);
      }
    };
    listeners.add(listener);
    return () => {
      mountedRef.current = false;
      listeners.delete(listener);
    };
  }, []);

  const handleDismiss = useCallback((id: number) => {
    dismissToast(id);
  }, []);

  if (toasts.length === 0) return null;

  return (
    <div className="toast-container" aria-live="polite" aria-label="通知">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`toast toast--${t.variant}${t.exiting ? ' toast--exiting' : ''}`}
          role="status"
        >
          <span className="toast__icon">
            <ToastIcon variant={t.variant} />
          </span>
          <span className="toast__message">{t.message}</span>
          <button
            className="toast__close"
            onClick={() => handleDismiss(t.id)}
            aria-label="关闭"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
      ))}
    </div>
  );
});
