import { memo, useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { StepHeader } from '../../components/header';
import { PageFooter } from '../../components/footer';
import { useDraft } from './useDraft';
import '../../components/header/Header.css';
import '../../components/card/StepIndicator.css';
import '../../components/footer/PageFooter.css';
import './Step3Cutout.css';

export const Step3Cutout = memo(function Step3Cutout() {
  const navigate = useNavigate();
  const [draft, update] = useDraft();
  const [processing, setProcessing] = useState(false);
  const [mode, setMode] = useState<'local' | 'removebg'>('local');

  const handleProcessCutout = useCallback(async () => {
    if (!draft.photoDataUrl) return;
    setProcessing(true);
    try {
      const { removeBackground } = await import('@imgly/background-removal');
      const blob = await removeBackground(draft.photoDataUrl, {
        model: 'medium',
        publicPath: new URL(import.meta.env.BASE_URL, location.origin).href,
        output: { format: 'image/png' },
        progress: (key: string, current: number, total: number) => {
          console.log(`[抠图] ${key}: ${Math.round((current / total) * 100)}%`);
        },
      });
      const cutoutDataUrl = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });
      update({ cutoutDataUrl });
    } catch (err) {
      console.error('AI 抠图失败:', err);
    } finally {
      setProcessing(false);
    }
  }, [draft.photoDataUrl, update]);

  const handleRetry = useCallback(() => {
    update({ cutoutDataUrl: null });
  }, [update]);

  const handleSwitchMode = useCallback(() => {
    setMode(prev => prev === 'local' ? 'removebg' : 'local');
  }, []);

  const hasCutout = !!draft.cutoutDataUrl;
  const hasPhoto = !!draft.photoDataUrl;

  return (
    <div className="step-cutout">
      <StepHeader currentStep={3} onBack={() => navigate(-1)} />

      <div className="step-cutout__body">
        {!hasPhoto ? (
          <div className="step-cutout__empty">
            <p>请先返回上一步拍照</p>
          </div>
        ) : hasCutout ? (
          /* 抠图结果 — 对比展示 */
          <div className="step-cutout__result">
            <p className="step-cutout__result-title">抠图完成 ✨</p>

            <div className="step-cutout__compare">
              <div className="step-cutout__compare-item">
                <p className="step-cutout__compare-label">原图</p>
                <div className="step-cutout__compare-img-wrap">
                  <img src={draft.photoDataUrl!} alt="原图" className="step-cutout__compare-img" />
                </div>
              </div>
              <div className="step-cutout__compare-arrow">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--color-tea-300)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 12h14" />
                  <path d="M12 5l7 7-7 7" />
                </svg>
              </div>
              <div className="step-cutout__compare-item">
                <p className="step-cutout__compare-label">抠图</p>
                <div className="step-cutout__compare-img-wrap step-cutout__compare-img-wrap--cutout">
                  <img src={draft.cutoutDataUrl!} alt="抠图结果" className="step-cutout__compare-img" />
                </div>
              </div>
            </div>

            <div className="step-cutout__actions">
              <button className="step-cutout__action-btn step-cutout__action-btn--retry" onClick={handleRetry}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M23 4v6h-6" />
                  <path d="M1 20v-6h6" />
                  <path d="M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15" />
                </svg>
                <span>重新抠图</span>
              </button>
              <button className="step-cutout__action-btn step-cutout__action-btn--switch" onClick={handleSwitchMode}>
                {mode === 'local'
                  ? '切换到 Remove.bg（专业效果）'
                  : '切换回本地模型'}
              </button>
            </div>
          </div>
        ) : processing ? (
          /* 处理中 */
          <div className="step-cutout__processing">
            <div className="step-cutout__spinner" />
            <p className="step-cutout__processing-text">AI 正在识别奶茶...</p>
            <p className="step-cutout__processing-hint">
              {mode === 'local' ? '浏览器本地处理，完全离线' : '使用 Remove.bg 专业模型'}
            </p>
          </div>
        ) : (
          /* 未处理 — 显示原图 + 开始按钮 */
          <div className="step-cutout__start">
            <div className="step-cutout__original">
              <img src={draft.photoDataUrl!} alt="原图" className="step-cutout__original-img" />
            </div>

            <div className="step-cutout__start-actions">
              <button className="step-cutout__process-btn" onClick={handleProcessCutout}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
                </svg>
                <span>开始 AI 抠图</span>
              </button>

              <p className="step-cutout__mode-hint">
                当前：{mode === 'local' ? '🖥️ 本地模型（免费）' : '☁️ Remove.bg（专业）'}
                <button className="step-cutout__mode-switch" onClick={handleSwitchMode}>切换</button>
              </p>
            </div>
          </div>
        )}
      </div>

      <PageFooter
        currentStep={3}
        onPrev={() => navigate('/new/date')}
        onNext={() => navigate('/new/info')}
        nextDisabled={!hasCutout}
      />
    </div>
  );
});
