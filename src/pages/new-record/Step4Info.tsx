import { memo, useCallback, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { StepHeader } from '../../components/header';
import { PageFooter } from '../../components/footer';
import { PopupSheet } from '../../components/modal/PopupSheet';
import { useDraft } from './useDraft';
import {
  BRAND_PRESETS,
  SWEETNESS_OPTIONS,
  TEMPERATURE_OPTIONS,
  CUP_SIZE_OPTIONS,
  TOPPING_OPTIONS,
} from './presets';
import '../../components/header/Header.css';
import '../../components/card/StepIndicator.css';
import '../../components/footer/PageFooter.css';
import '../../components/modal/PopupSheet.css';
import './Step4Info.css';

/* ═══════════════════════ 评分印章 ═══════════════════════ */

function StampDot({ filled, onClick }: { filled: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      className={`info-stamp${filled ? ' info-stamp--filled' : ''}`}
      onClick={onClick}
      aria-label={filled ? '已评分' : '未评分'}
    >
      {filled ? '★' : ''}
    </button>
  );
}

/* ═══════════════════════ Step4Info（信息+心情 合一） ═══════════════════════ */

export const Step4Info = memo(function Step4Info() {
  const navigate = useNavigate();
  const [draft, update] = useDraft();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ── 抠图预览：叉掉后显示重新上传 ──
  const [cutoutDismissed, setCutoutDismissed] = useState(false);

  // ── 弹窗开关 ──
  const [brandOpen, setBrandOpen] = useState(false);
  const [cupSizeOpen, setCupSizeOpen] = useState(false);
  const [sweetnessOpen, setSweetnessOpen] = useState(false);
  const [temperatureOpen, setTemperatureOpen] = useState(false);

  // ── 品牌自定义输入 ──
  const [brandSearch, setBrandSearch] = useState('');

  // ── 语音录制（录音 + 同步转文字） ──
  const [recording, setRecording] = useState(false);
  const [recorded, setRecorded] = useState(draft.hasVoice);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [elapsed, setElapsed] = useState(0);
  const recognitionRef = useRef<any>(null);
  const moodTextRef = useRef(draft.moodText);

  // 保持 ref 同步
  moodTextRef.current = draft.moodText;

  // 品牌选择
  const handleBrandPick = useCallback((key: string, name: string) => {
    if (draft.brandKey === key) {
      update({ brandKey: '', brand: '' });
    } else {
      update({ brandKey: key, brand: name });
    }
    setBrandSearch('');
    setBrandOpen(false);
  }, [draft.brandKey, update]);

  const handleCustomBrandSubmit = useCallback(() => {
    const val = brandSearch.trim();
    if (val) {
      update({ brandKey: '', brand: val });
      setBrandOpen(false);
      setBrandSearch('');
    }
  }, [brandSearch, update]);

  // 小料切换
  const handleToppingToggle = useCallback((topping: string) => {
    const next = draft.toppings.includes(topping)
      ? draft.toppings.filter(t => t !== topping)
      : [...draft.toppings, topping];
    update({ toppings: next });
  }, [draft.toppings, update]);

  // 评分
  const handleRating = useCallback((n: number) => {
    update({ rating: draft.rating === n ? 0 : n });
  }, [draft.rating, update]);

  // 收藏切换
  const handleFavoriteToggle = useCallback(() => {
    update({ isFavorite: !draft.isFavorite });
  }, [draft.isFavorite, update]);

  // 叉掉抠图预览
  const handleDismissCutout = useCallback(() => {
    setCutoutDismissed(true);
  }, []);

  // 重新上传
  const handleReUpload = useCallback((capture?: boolean) => {
    const input = fileInputRef.current;
    if (!input) return;
    if (capture) input.setAttribute('capture', 'environment');
    input.click();
    if (capture) input.removeAttribute('capture');
  }, []);

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      update({ photoDataUrl: reader.result as string, cutoutDataUrl: null });
      setCutoutDismissed(false);
      navigate('/new/photo');
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  }, [update, navigate]);

  // ── 语音录制（录音 + 同步语音转文字） ──
  const [sttUnsupported, setSttUnsupported] = useState(false);

  const handleStartRecord = useCallback(() => {
    setRecording(true);
    setElapsed(0);
    timerRef.current = setInterval(() => setElapsed(prev => prev + 1), 1000);
    update({ hasVoice: true });

    // 快照录音前的文字
    const preRecordingText = moodTextRef.current;

    const SpeechRecognitionCtor = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognitionCtor) {
      console.warn('SpeechRecognition not supported in this browser');
      setSttUnsupported(true);
      return;
    }

    try {
      const recognition = new SpeechRecognitionCtor();
      recognition.lang = 'zh-CN';
      recognition.interimResults = true;
      recognition.continuous = true;
      let sessionText = '';
      let hasSpeech = false;

      recognition.onresult = (event: any) => {
        hasSpeech = true;
        let interim = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          if (event.results[i].isFinal) {
            sessionText += event.results[i][0].transcript;
          } else {
            interim += event.results[i][0].transcript;
          }
        }
        update({ moodText: (preRecordingText + ' ' + sessionText + (interim ? ' ' + interim : '')).trim() });
      };

      recognition.onerror = (event: any) => {
        console.warn('SpeechRecognition error:', event.error);
        if (event.error === 'not-allowed') {
          setSttUnsupported(true);
          // 麦克风权限被拒绝 — 停止录音 UI
          setRecording(false);
          if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
        }
      };

      recognition.onend = () => {
        // continuous=true 时，若无语音输入则自然结束
        if (!hasSpeech && recording) {
          console.log('No speech detected — recognition ended');
        }
      };

      recognitionRef.current = recognition;
      recognition.start();
      console.log('SpeechRecognition started successfully');
    } catch (err) {
      console.warn('SpeechRecognition init failed:', err);
      setSttUnsupported(true);
    }
  }, [update, recording]);

  const handleStopRecord = useCallback(() => {
    setRecording(false);
    setRecorded(true);
    // 先清除 timer（避免 onend 看到 timer 还在而自动重启）
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    recognitionRef.current?.stop();
  }, []);

  const handleReRecord = useCallback(() => {
    setRecorded(false);
    setElapsed(0);
    update({ hasVoice: false });
  }, [update]);

  const formatTime = (s: number) => {
    const min = Math.floor(s / 60);
    const sec = s % 60;
    return `${min}:${String(sec).padStart(2, '0')}`;
  };

  // 表单完整性
  const canNext = draft.name.trim().length > 0 && draft.brand.length > 0;

  return (
    <div className="step-info">
      <StepHeader currentStep={2} totalSteps={2} onBack={() => navigate('/new/photo')} />

      <div className="step-info__body">
        {/* ═══════════════════════ 抠图预览 ═══════════════════════ */}
        {draft.cutoutDataUrl && !cutoutDismissed ? (
          /* ✅ 抠图成功 — 显示透明 PNG */
          <div className="info-cutout-preview">
            <div className="info-cutout-preview__img-wrap">
              <img
                className="info-cutout-preview__img"
                src={draft.cutoutDataUrl}
                alt="奶茶抠图预览"
              />
              <button
                className="info-cutout-preview__close"
                onClick={handleDismissCutout}
                aria-label="移除抠图"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
          </div>
        ) : !cutoutDismissed && draft.photoDataUrl ? (
          /* ⚠️ 抠图未完成/失败 — 显示原图，显示具体错误 */
          <div className="info-cutout-preview info-cutout-preview--no-cutout">
            <div className="info-cutout-preview__img-wrap">
              <img
                className="info-cutout-preview__img"
                src={draft.photoDataUrl}
                alt="原图（抠图未完成）"
                style={{ opacity: 0.7 }}
              />
              <div className="info-cutout-preview__no-cutout-badge">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8" x2="12" y2="12" />
                  <line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
                <span>AI 抠图失败</span>
              </div>
              <button
                className="info-cutout-preview__close"
                onClick={handleDismissCutout}
                aria-label="关闭提示"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
            {draft.cutoutError && (
              <p className="info-cutout-preview__error-msg">{draft.cutoutError}</p>
            )}
            <p className="info-cutout-preview__retry-hint">
              <button className="info-cutout-preview__retry-link" onClick={() => {
                update({ cutoutDataUrl: null, cutoutError: null });
                navigate('/new/photo');
              }}>
                返回重新拍照
              </button>
              <span> 或直接填写下方信息后保存（无抠图）</span>
            </p>
          </div>
        ) : (draft.photoDataUrl || draft.cutoutDataUrl) && cutoutDismissed ? (
          <div className="info-cutout-preview info-cutout-preview--dismissed">
            <p className="info-cutout-preview__dismissed-text">抠图已移除</p>
            <div className="info-cutout-preview__actions">
              <button className="step-photo__btn step-photo__btn--camera" onClick={() => handleReUpload(true)}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z" />
                  <circle cx="12" cy="13" r="4" />
                </svg>
                <span>拍照</span>
              </button>
              <button className="step-photo__btn step-photo__btn--gallery" onClick={() => handleReUpload()}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                  <circle cx="8.5" cy="8.5" r="1.5" />
                  <polyline points="21 15 16 10 5 21" />
                </svg>
                <span>图库</span>
              </button>
            </div>
          </div>
        ) : null}

        {/* ── 名称 + 收藏 ── */}
        <div className="info-field">
          <label className="info-field__label">名称</label>
          <div className="info-name-row">
            <input
              className="info-field__input"
              type="text"
              placeholder="如：多肉葡萄、伯牙绝弦"
              value={draft.name}
              onChange={e => update({ name: e.target.value })}
            />
            <button
              type="button"
              className={`info-favorite-star${draft.isFavorite ? ' info-favorite-star--active' : ''}`}
              onClick={handleFavoriteToggle}
              aria-label={draft.isFavorite ? '取消收藏' : '收藏'}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill={draft.isFavorite ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
              </svg>
            </button>
          </div>
        </div>

        {/* ── 日期（自动从日历点击或 EXIF 提取，支持手动修改） ── */}
        <div className="info-field">
          <label className="info-field__label">日期</label>
          <input
            className="info-field__input"
            type="date"
            value={draft.date}
            onChange={e => update({ date: e.target.value })}
          />
        </div>

        {/* ── 品牌（点击弹出选择框） ── */}
        <div className="info-field">
          <label className="info-field__label">品牌</label>
          <button
            type="button"
            className={`info-select-box${draft.brand ? ' info-select-box--filled' : ''}`}
            onClick={() => setBrandOpen(true)}
          >
            <span className={draft.brand ? 'info-select-box__text' : 'info-select-box__placeholder'}>
              {draft.brand || '点击选择品牌'}
            </span>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </button>
        </div>

        {/* ── 门店 ── */}
        <div className="info-field">
          <label className="info-field__label">门店 <span className="info-field__optional">选填</span></label>
          <input
            className="info-field__input"
            type="text"
            placeholder="如：正佳广场店"
            value={draft.store}
            onChange={e => update({ store: e.target.value })}
          />
        </div>

        {/* ── 杯型 · 甜度 · 温度（同一行，弹窗选择） ── */}
        <div className="info-field">
          <label className="info-field__label">杯型 · 甜度 · 温度</label>
          <div className="info-triple-row">
            <button
              type="button"
              className={`info-select-box info-select-box--inline${draft.cupSize ? ' info-select-box--filled' : ''}`}
              onClick={() => setCupSizeOpen(true)}
            >
              <span className={draft.cupSize ? 'info-select-box__text' : 'info-select-box__placeholder'}>
                {draft.cupSize || '杯型'}
              </span>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 12 15 18 9" /></svg>
            </button>
            <button
              type="button"
              className={`info-select-box info-select-box--inline${draft.sweetness ? ' info-select-box--filled' : ''}`}
              onClick={() => setSweetnessOpen(true)}
            >
              <span className={draft.sweetness ? 'info-select-box__text' : 'info-select-box__placeholder'}>
                {draft.sweetness || '甜度'}
              </span>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 12 15 18 9" /></svg>
            </button>
            <button
              type="button"
              className={`info-select-box info-select-box--inline${draft.temperature ? ' info-select-box--filled' : ''}`}
              onClick={() => setTemperatureOpen(true)}
            >
              <span className={draft.temperature ? 'info-select-box__text' : 'info-select-box__placeholder'}>
                {draft.temperature || '温度'}
              </span>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 12 15 18 9" /></svg>
            </button>
          </div>
        </div>

        {/* ── 小料 ── */}
        <div className="info-field">
          <label className="info-field__label">小料 <span className="info-field__optional">多选</span></label>
          <div className="info-topping-grid">
            {TOPPING_OPTIONS.map(topping => (
              <button
                key={topping}
                type="button"
                className={`info-topping-tag${draft.toppings.includes(topping) ? ' info-topping-tag--selected' : ''}`}
                onClick={() => handleToppingToggle(topping)}
              >
                {draft.toppings.includes(topping) && (
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                )}
                +{topping}
              </button>
            ))}
          </div>
        </div>

        {/* ── 价格 ── */}
        <div className="info-field">
          <label className="info-field__label">价格</label>
          <div className="info-price-wrap">
            <span className="info-price-unit">¥</span>
            <input
              className="info-field__input info-field__input--price"
              type="number"
              inputMode="decimal"
              placeholder="0.00"
              min="0"
              step="0.01"
              value={draft.price}
              onChange={e => update({ price: e.target.value })}
            />
          </div>
        </div>

        {/* ── 评分 ── */}
        <div className="info-field">
          <label className="info-field__label">评分</label>
          <div className="info-rating-row">
            {[1, 2, 3, 4, 5].map(n => (
              <StampDot
                key={n}
                filled={n <= draft.rating}
                onClick={() => handleRating(n)}
              />
            ))}
          </div>
        </div>

        {/* ═══════════════════════ 心情记录（紧凑一行） ═══════════════════════ */}
        <div className="info-field">
          <label className="info-field__label">心情</label>
          <div className="info-mood-row">
            {/* 录音按钮（左侧图标） */}
            {recording ? (
              <button
                type="button"
                className="info-mood-mic info-mood-mic--recording"
                onClick={handleStopRecord}
                aria-label="停止录音"
              >
                <span className="info-mood-mic__dot" />
                <span className="info-mood-mic__time">{formatTime(elapsed)}</span>
              </button>
            ) : recorded ? (
              <button
                type="button"
                className="info-mood-mic info-mood-mic--done"
                onClick={handleReRecord}
                aria-label="重新录音"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--color-success)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </button>
            ) : (
              <button
                type="button"
                className="info-mood-mic"
                onClick={handleStartRecord}
                aria-label="开始录音"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 1a3 3 0 00-3 3v8a3 3 0 006 0V4a3 3 0 00-3-3z" />
                  <path d="M19 10v2a7 7 0 01-14 0v-2" />
                  <line x1="12" y1="19" x2="12" y2="23" />
                  <line x1="8" y1="23" x2="16" y2="23" />
                </svg>
              </button>
            )}

            {/* 文字输入（右侧） */}
            <input
              className="info-field__input info-mood-text-input"
              type="text"
              placeholder="录下心情或打字记录..."
              value={draft.moodText}
              onChange={e => update({ moodText: e.target.value })}
            />
          </div>
          {recording && !sttUnsupported && (
            <p className="info-mood-hint">正在录音并同步转文字...</p>
          )}
          {recording && sttUnsupported && (
            <p className="info-mood-hint info-mood-hint--warn">语音转文字暂不支持此浏览器，请手动输入心情</p>
          )}
        </div>
      </div>

      {/* ═══════════════════════ 弹窗选择器 ═══════════════════════ */}

      {/* 品牌弹窗 */}
      <PopupSheet isOpen={brandOpen} title="选择品牌" onClose={() => setBrandOpen(false)}>
        <div className="info-popup-grid">
          {BRAND_PRESETS.map(b => (
            <button
              key={b.key}
              type="button"
              className={`info-popup-option${draft.brandKey === b.key ? ' info-popup-option--selected' : ''}`}
              onClick={() => handleBrandPick(b.key, b.name)}
            >
              {b.name}
            </button>
          ))}
        </div>
        <div className="info-popup-custom">
          <input
            className="info-field__input"
            type="text"
            placeholder="或输入其他品牌..."
            value={brandSearch}
            onChange={e => {
              setBrandSearch(e.target.value);
              if (draft.brandKey) update({ brandKey: '', brand: '' });
            }}
            onKeyDown={e => { if (e.key === 'Enter') handleCustomBrandSubmit(); }}
          />
          <button
            type="button"
            className="info-popup-custom__btn"
            onClick={handleCustomBrandSubmit}
            disabled={!brandSearch.trim()}
          >
            确定
          </button>
        </div>
      </PopupSheet>

      {/* 杯型弹窗 */}
      <PopupSheet isOpen={cupSizeOpen} title="选择杯型" onClose={() => setCupSizeOpen(false)}>
        <div className="info-popup-grid">
          {CUP_SIZE_OPTIONS.map(size => (
            <button
              key={size}
              type="button"
              className={`info-popup-option${draft.cupSize === size ? ' info-popup-option--selected' : ''}`}
              onClick={() => { update({ cupSize: draft.cupSize === size ? '' : size }); setCupSizeOpen(false); }}
            >
              {size}
            </button>
          ))}
        </div>
      </PopupSheet>

      {/* 甜度弹窗 */}
      <PopupSheet isOpen={sweetnessOpen} title="选择甜度" onClose={() => setSweetnessOpen(false)}>
        <div className="info-popup-grid">
          {SWEETNESS_OPTIONS.map(s => (
            <button
              key={s}
              type="button"
              className={`info-popup-option${draft.sweetness === s ? ' info-popup-option--selected' : ''}`}
              onClick={() => { update({ sweetness: draft.sweetness === s ? '' : s }); setSweetnessOpen(false); }}
            >
              {s}
            </button>
          ))}
        </div>
      </PopupSheet>

      {/* 温度弹窗 */}
      <PopupSheet isOpen={temperatureOpen} title="选择温度" onClose={() => setTemperatureOpen(false)}>
        <div className="info-popup-grid">
          {TEMPERATURE_OPTIONS.map(t => (
            <button
              key={t}
              type="button"
              className={`info-popup-option${draft.temperature === t ? ' info-popup-option--selected' : ''}`}
              onClick={() => { update({ temperature: draft.temperature === t ? '' : t }); setTemperatureOpen(false); }}
            >
              {t}
            </button>
          ))}
        </div>
      </PopupSheet>

      {/* 隐藏 file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        style={{ display: 'none' }}
        onChange={handleFileChange}
      />

      <PageFooter
        currentStep={2}
        totalSteps={2}
        onPrev={() => navigate('/new/photo')}
        onNext={() => navigate('/new/preview')}
        nextDisabled={!canNext}
      />
    </div>
  );
});
