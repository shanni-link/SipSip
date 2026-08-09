import { memo, useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { StepHeader } from '../../components/header';
import { useDraft } from './useDraft';
import { readExifDateTime } from '../../utils/exif';
import { compressImage, processCutoutResult } from '../../utils/imageUtils';
import '../../components/header/Header.css';
import './Step1Photo.css';

/* ═══════════════════════ 常量 ═══════════════════════ */

/** 抠图超时（small 模型 ~17MB，给 60s） */
const CUTOUT_TIMEOUT_MS = 60_000;

/* ═══════════════════════ Step1Photo ═══════════════════════ */

/**
 * 判断文件是否为可接受的图片。
 * iOS Safari 从相册选图时 file.type 经常为空字符串。
 */
function isImageFile(file: File): boolean {
  if (file.type.startsWith('image/')) return true;
  if (!file.type) {
    const name = file.name.toLowerCase();
    if (/\.(jpe?g|png|gif|webp|heic|heif|bmp|svg)$/.test(name)) return true;
  }
  return false;
}

export const Step1Photo = memo(function Step1Photo() {
  const navigate = useNavigate();
  const [draft, update] = useDraft();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);
  const [processing, setProcessing] = useState(() => !!draft.photoDataUrl && !draft.cutoutDataUrl);
  const [progress, setProgress] = useState(0);
  const [progressPhase, setProgressPhase] = useState<'download' | 'inference'>('download');
  const autoStarted = useRef(false);

  // 自动检测：photoDataUrl 已由外部设置 → 直接抠图
  useEffect(() => {
    if (autoStarted.current) return;
    if (draft.photoDataUrl && !draft.cutoutDataUrl) {
      autoStarted.current = true;
      runCutout(draft.photoDataUrl, undefined);
    }
  }, [draft.photoDataUrl, draft.cutoutDataUrl]);

  /** 执行 AI 抠图 + 压缩 + EXIF */
  const runCutout = useCallback(async (dataUrl: string, file?: File) => {
    setProcessing(true);
    setProgress(0);
    setProgressPhase('download');

    try {
      // AI 抠图（模型从本地 public/ 加载，不走被墙 CDN）
      const cutoutPromise = (async () => {
        try {
          const { removeBackground } = await import('@imgly/background-removal');

          const cutoutTask = removeBackground(dataUrl, {
            model: 'small',
            publicPath: location.origin + '/',  // 本地模型文件
            debug: true,
            output: { format: 'image/png' },
            progress: (_key: string, current: number, total: number) => {
              const pct = Math.round((current / total) * 100);
              setProgress(pct);
              if (pct > 90) setProgressPhase('inference');
            },
          }).then(blob => processCutoutResult(blob));

          const timeoutTask = new Promise<string>((_, reject) =>
            setTimeout(() => reject(new Error('Cutout timeout')), CUTOUT_TIMEOUT_MS)
          );

          return await Promise.race([cutoutTask, timeoutTask]);
        } catch (err) {
          console.warn('Background removal failed, using original:', err);
          return compressImage(dataUrl);
        }
      })();

      const photoPromise = compressImage(dataUrl);
      const exifPromise = file ? readExifDateTime(file) : Promise.resolve(null);

      const [cutoutDataUrl, exifResult, photoDataUrl] = await Promise.all([
        cutoutPromise,
        exifPromise,
        photoPromise,
      ]);

      update({
        photoDataUrl,
        cutoutDataUrl,
        date: exifResult?.date ?? draft.date,
        time: exifResult?.time ?? draft.time,
      });
    } catch (err) {
      console.error('Cutout flow crashed:', err);
      update({
        photoDataUrl: dataUrl,
        cutoutDataUrl: dataUrl,
      });
    } finally {
      setProcessing(false);
      navigate('/new/info');
    }
  }, [draft.date, update, navigate]);

  /* ── 文件处理 ── */

  const handleFile = useCallback((file: File) => {
    if (!isImageFile(file)) return;
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      update({ photoDataUrl: dataUrl });
      runCutout(dataUrl, file);
    };
    reader.readAsDataURL(file);
  }, [update, runCutout]);

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
    e.target.value = '';
  }, [handleFile]);

  const handleCamera = useCallback(() => {
    const input = fileInputRef.current;
    if (input) {
      input.setAttribute('capture', 'environment');
      input.click();
      input.removeAttribute('capture');
    }
  }, []);

  const handleGallery = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  // 拖拽上传
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  }, [handleFile]);

  const hasPhoto = !!draft.photoDataUrl;

  return (
    <div className="step-photo">
      <StepHeader currentStep={1} totalSteps={2} onBack={() => navigate('/')} />

      <div className="step-photo__body">
        {/* ── AI 抠图处理中 ── */}
        {processing ? (
          <div className="step-photo__processing">
            <img
              className="step-photo__processing-img"
              src={draft.photoDataUrl!}
              alt=""
            />
            <div className="step-photo__processing-overlay">
              {/* SVG 环形进度 */}
              <svg className="step-photo__processing-ring" viewBox="0 0 100 100">
                <circle className="step-photo__processing-ring-bg" cx="50" cy="50" r="42" />
                <circle
                  className="step-photo__processing-ring-fill"
                  cx="50" cy="50" r="42"
                  style={{
                    strokeDasharray: `${2 * Math.PI * 42}`,
                    strokeDashoffset: `${2 * Math.PI * 42 * (1 - Math.max(progress, 3) / 100)}`,
                  }}
                />
              </svg>
              <p className="step-photo__processing-text">
                {progressPhase === 'download' ? '准备中...' : `${progress}%`}
              </p>
              <p className="step-photo__processing-sub">
                {progressPhase === 'download' ? '首次下载约 17MB' : '正在提取奶茶'}
              </p>
            </div>
          </div>
        ) : hasPhoto ? (
          /* ── 照片已就绪，正准备 ── */
          <div className="step-photo__processing">
            <img
              className="step-photo__processing-img"
              src={draft.photoDataUrl!}
              alt=""
            />
            <div className="step-photo__processing-overlay">
              <div className="step-photo__processing-spinner" />
              <p className="step-photo__processing-text">准备中...</p>
            </div>
          </div>
        ) : (
          /* ── 未拍照 — 上传区域 ── */
          <div
            className={`step-photo__upload${dragOver ? ' step-photo__upload--drag-over' : ''}`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <div className="step-photo__upload-inner">
              <div className="step-photo__illustration">
                <svg width="80" height="100" viewBox="0 0 80 100" fill="none">
                  <path
                    d="M25 30 L28 85 L52 85 L55 30 Z"
                    fill="var(--color-tea-50)"
                    stroke="var(--color-tea-300)"
                    strokeWidth="1.5"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M24 30 Q40 26 56 30"
                    fill="var(--color-tea-100)"
                    stroke="var(--color-tea-300)"
                    strokeWidth="1.5"
                  />
                  <line x1="42" y1="10" x2="38" y2="30" stroke="var(--color-tea-400)" strokeWidth="2" strokeLinecap="round" />
                  <circle cx="34" cy="55" r="2.5" fill="var(--color-tea-500)" opacity="0.6" />
                  <circle cx="44" cy="65" r="2.5" fill="var(--color-tea-500)" opacity="0.6" />
                  <circle cx="38" cy="72" r="2.5" fill="var(--color-tea-500)" opacity="0.6" />
                </svg>
              </div>

              <p className="step-photo__upload-title">拍下你的奶茶</p>
              <p className="step-photo__upload-hint">拍照或从相册选择一张照片</p>

              <div className="step-photo__actions">
                <button className="step-photo__btn step-photo__btn--camera" onClick={handleCamera}>
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z" />
                    <circle cx="12" cy="13" r="4" />
                  </svg>
                  <span>拍照</span>
                </button>
                <button className="step-photo__btn step-photo__btn--gallery" onClick={handleGallery}>
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                    <circle cx="8.5" cy="8.5" r="1.5" />
                    <polyline points="21 15 16 10 5 21" />
                  </svg>
                  <span>图库</span>
                </button>
              </div>

              <p className="step-photo__upload-or">或拖拽照片到此处</p>
            </div>
          </div>
        )}
      </div>

      {/* 隐藏的 file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="step-photo__file-input"
        onChange={handleFileChange}
        aria-hidden="true"
      />
    </div>
  );
});
