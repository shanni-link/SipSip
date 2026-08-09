import { memo, useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDraft } from './useDraft';
import { resetDraft } from './draftStore';
import { saveRecord, type ITeaRecord } from '../../stores/recordStore';
import { ReceiptCard } from '../../components/card/ReceiptCard';
import { toast } from '../../components/modal';
import './Step6Preview.css';

function formatDate(dateStr: string): string {
  const [y, m, d] = dateStr.split('-');
  return `${y}.${String(m).padStart(2, '0')}.${String(d).padStart(2, '0')}`;
}

function generateId(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

/* ═══════════════════════ 锯齿撕边 SVG（撕票线） ═══════════════════════ */

function TearEdgeSVG({ color = '#e0d5c0' }: { color?: string }) {
  return (
    <svg
      width="100%" height="12"
      viewBox="0 0 200 12"
      preserveAspectRatio="none"
      style={{ display: 'block' }}
      aria-hidden="true"
    >
      <path
        d="M0,12 L8,2 L14,10 L22,1 L32,9 L38,3 L48,11 L56,2 L64,12 L74,0 L84,10 L90,4 L100,12 L110,2 L118,8 L128,0 L138,11 L146,4 L158,12 L166,1 L174,9 L184,3 L192,12 L200,5 L200,12 L0,12 Z"
        fill={color}
      />
    </svg>
  );
}

/* ═══════════════════════ 打印阶段 ═══════════════════════ */

type PrintPhase = 'printing' | 'ready' | 'tearing';

const PRINT_DURATION_MS = 1800;

/* ═══════════════════════ Step6Preview（打印 → 撕下 → 飞回日历） ═══════════════════════ */

export const Step6Preview = memo(function Step6Preview() {
  const navigate = useNavigate();
  const [draft] = useDraft();

  const recordIdRef = useRef(generateId()); // Stable across StrictMode remounts
  const [savedRecord, setSavedRecord] = useState<ITeaRecord | null>(null);
  const [saveFailed, setSaveFailed] = useState(false);
  const saveAttemptedRef = useRef(false);
  const recordRef = useRef<ITeaRecord | null>(null);

  // ── 打印机阶段状态 ──
  const [printPhase, setPrintPhase] = useState<PrintPhase>('printing');

  // ── 手势拖拽状态 ──
  const [dragY, setDragY] = useState(0);
  const dragYRef = useRef(0);
  const [isDragging, setIsDragging] = useState(false);
  const isDraggingRef = useRef(false);
  const dragStartY = useRef(0);
  const dragStartTime = useRef(0);

  const TEAR_THRESHOLD = 120;

  // 进入页面立即保存（StrictMode 安全：ID 稳定，重复保存覆盖同一记录）
  useEffect(() => {
    let cancelled = false;
    const doSave = async () => {
      const record: ITeaRecord = {
        id: recordIdRef.current,
        photoDataUrl: draft.photoDataUrl || '',
        cutoutDataUrl: draft.cutoutDataUrl || '',
        date: draft.date,
        time: draft.time,
        name: draft.name,
        brand: draft.brand,
        brandKey: draft.brandKey,
        store: draft.store,
        cupSize: draft.cupSize,
        sweetness: draft.sweetness,
        temperature: draft.temperature,
        toppings: draft.toppings,
        price: parseFloat(draft.price) || 0,
        rating: draft.rating,
        moodText: draft.moodText,
        hasVoice: draft.hasVoice,
        audioDataUrl: draft.audioDataUrl,
        isFavorite: draft.isFavorite,
        createdAt: Date.now(),
      };
      const ok = await saveRecord(record);
      if (cancelled) return;
      if (!ok) {
        setSaveFailed(true);
        toast.error('保存失败：存储空间不足，请清理部分旧记录后重试', 5000);
        return;
      }
      setSavedRecord(record);
      recordRef.current = record;

      // 打印动画结束后进入撕下阶段
      setTimeout(() => {
        if (!cancelled) setPrintPhase('ready');
      }, PRINT_DURATION_MS);
    };
    doSave();
    return () => { cancelled = true; };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ── 手势处理（ref 守卫解决 state 闭包滞后） ──

  const handleDragStart = useCallback((clientY: number) => {
    if (printPhase !== 'ready') return;
    isDraggingRef.current = true;
    setIsDragging(true);
    dragStartY.current = clientY;
    dragStartTime.current = Date.now();
  }, [printPhase]);

  const handleDragMove = useCallback((clientY: number) => {
    if (!isDraggingRef.current) return;
    const dy = clientY - dragStartY.current;
    if (dy > 0) {
      const v = Math.min(dy, 400);
      dragYRef.current = v;
      setDragY(v);
    }
  }, []);

  const handleDragEnd = useCallback(() => {
    isDraggingRef.current = false;
    setIsDragging(false);
    const finalDragY = dragYRef.current;
    const dt = Math.max(Date.now() - dragStartTime.current, 1);
    const velocity = finalDragY / dt * 1000;

    if (finalDragY > TEAR_THRESHOLD || velocity > 200) {
      // 触发撕下动画
      setPrintPhase('tearing');
      // 撕下动画播完后留在当前页短暂展示"已撕下"状态，再回日历
      setTimeout(() => {
        const record = recordRef.current;
        resetDraft();
        navigate('/', { state: { flyIn: record } });
      }, 700);
    } else {
      dragYRef.current = 0;
      setDragY(0);
    }
  }, [navigate]);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    handleDragStart(e.touches[0].clientY);
  }, [handleDragStart]);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    e.preventDefault();
    handleDragMove(e.touches[0].clientY);
  }, [handleDragMove]);

  const handleTouchEnd = useCallback(() => {
    handleDragEnd();
  }, [handleDragEnd]);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    handleDragStart(e.clientY);
    const onMouseMove = (ev: MouseEvent) => handleDragMove(ev.clientY);
    const onMouseUp = () => {
      handleDragEnd();
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
  }, [handleDragStart, handleDragMove, handleDragEnd]);

  const tearProgress = Math.min(dragY / TEAR_THRESHOLD, 1);
  const receiptRotation = tearProgress * 10;
  const receiptOpacity = 1 - tearProgress * 0.3;
  const isPrinting = printPhase === 'printing';
  const isTearing = printPhase === 'tearing';

  // ── 保存失败状态 ──
  if (saveFailed) {
    return (
      <div style={{ minHeight: '100dvh', position: 'fixed', inset: 0, zIndex: 1000 }}>
        <div className="tear-overlay">
          <div className="tear-overlay__backdrop" />
          <div className="tear-overlay__receipt-draggable" style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: 280,
            background: 'var(--color-surface)',
            borderRadius: 12,
            padding: 32,
            textAlign: 'center',
            boxShadow: '0 8px 32px rgba(47,31,18,0.2)',
          }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>⚠️</div>
            <p style={{
              fontFamily: 'var(--font-family-display)',
              fontSize: 'var(--text-base)',
              color: 'var(--color-text-primary)',
              margin: '0 0 8px',
            }}>
              保存失败
            </p>
            <p style={{
              fontFamily: 'var(--font-family-body)',
              fontSize: 'var(--text-sm)',
              color: 'var(--color-text-hint)',
              margin: '0 0 20px',
              lineHeight: 1.5,
            }}>
              存储空间不足，请返回列表页清理部分旧记录后重试
            </p>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
              <button
                onClick={() => { setSaveFailed(false); saveAttemptedRef.current = false; }}
                style={{
                  padding: '10px 24px',
                  borderRadius: 8,
                  border: '1.5px solid var(--color-tea-300)',
                  background: 'var(--color-surface)',
                  fontFamily: 'var(--font-family-body)',
                  fontSize: 'var(--text-sm)',
                  cursor: 'pointer',
                }}
              >
                重试
              </button>
              <button
                onClick={() => { resetDraft(); navigate('/list'); }}
                style={{
                  padding: '10px 24px',
                  borderRadius: 8,
                  border: 'none',
                  background: 'var(--color-tea-700)',
                  color: '#ffffff',
                  fontFamily: 'var(--font-family-body)',
                  fontSize: 'var(--text-sm)',
                  cursor: 'pointer',
                }}
              >
                去清理
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!savedRecord) return null;

  return (
    <div style={{ minHeight: '100dvh', position: 'fixed', inset: 0, zIndex: 1000 }}>
      <div className="tear-overlay">
        {/* 背景遮罩 */}
        <div className="tear-overlay__backdrop" />

        {/* ═══════════════════════ 复古打印机 ═══════════════════════ */}
        <div className={`printer-slot${isPrinting ? ' printer-slot--active' : ''}`}>
          <div className="printer-slot__body">
            <span className="printer-slot__label">🧾 打印中...</span>
            <div className="printer-slot__opening" />
          </div>
        </div>

        {/* ═══════════════════════ 撕离线 ═══════════════════════ */}
        {printPhase === 'ready' && (
          <div className="tear-overlay__tear-line">
            <p className="tear-overlay__tear-hint">
              {tearProgress > 0.3
                ? '继续下拉撕下小票！'
                : '👇 向下滑动撕下小票'}
            </p>
            <div className="tear-overlay__tear-dash" />
            <TearEdgeSVG color="var(--color-tea-200)" />
          </div>
        )}

        {/* ═══════════════════════ 撕下按钮（点击即撕） ═══════════════════════ */}
        {printPhase === 'ready' && (
          <div className="tear-overlay__tear-btn-row">
            <button
              className="tear-overlay__tear-btn"
              onClick={() => {
                setPrintPhase('tearing');
                setTimeout(() => {
                  const record = recordRef.current;
                  resetDraft();
                  navigate('/', { state: { flyIn: record } });
                }, 700);
              }}
            >
              <span className="tear-overlay__tear-btn-icon">🧻</span>
              <span>撕下小票</span>
            </button>
          </div>
        )}

        {/* ═══════════════════════ 小票主体（ReceiptCard + 撕边包裹） ═══════════════════════ */}
        <div
          className={`tear-overlay__receipt-draggable${isPrinting ? ' tear-overlay__receipt-draggable--printing' : ''}${isTearing ? ' tear-overlay__receipt-draggable--tearing' : ''}`}
          style={{
            transform: isPrinting
              ? 'translateX(-50%)'
              : `translateX(-50%) translateY(${dragY}px) rotate(${receiptRotation}deg)`,
            opacity: isPrinting ? 1 : receiptOpacity,
            top: 34,
            transition: isDragging ? 'none' : 'opacity 0.3s ease',
            cursor: isTearing ? 'default' : isPrinting ? 'default' : isDragging ? 'grabbing' : 'grab',
            pointerEvents: isTearing ? 'none' : isPrinting ? 'none' : 'auto',
            maxHeight: isPrinting ? undefined : 'calc(100dvh - 200px)',
            overflowY: isPrinting ? undefined : 'auto',
          }}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          onMouseDown={handleMouseDown}
        >
          {/* 顶部锯齿撕边 */}
          <TearEdgeSVG color="var(--color-tea-100)" />

          {/* ════ 使用 ReceiptCard 组件，与收集盒内小票完全一致 ════ */}
          <ReceiptCard
            className="receipt-card--printing"
            id={savedRecord.id}
            date={formatDate(savedRecord.date)}
            cutoutImage={savedRecord.cutoutDataUrl}
            name={savedRecord.name}
            brand={savedRecord.brand}
            brandKey={savedRecord.brandKey}
            store={savedRecord.store}
            cupSize={savedRecord.cupSize}
            sweetness={savedRecord.sweetness}
            temperature={savedRecord.temperature}
            toppings={savedRecord.toppings}
            price={savedRecord.price}
            rating={savedRecord.rating}
            moodText={savedRecord.moodText}
            hasVoice={savedRecord.hasVoice}
            audioDataUrl={savedRecord.audioDataUrl}
          />

          {/* 底部锯齿撕边 */}
          <TearEdgeSVG color="var(--color-tea-100)" />
        </div>
      </div>
    </div>
  );
});
