import { memo, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { StepHeader } from '../../components/header';
import { PageFooter } from '../../components/footer';
import { useDraft } from './useDraft';
import '../../components/header/Header.css';
import '../../components/card/StepIndicator.css';
import '../../components/footer/PageFooter.css';
import './Step2Date.css';

function getToday(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function formatDisplay(dateStr: string): string {
  const [y, m, d] = dateStr.split('-').map(Number);
  const weekdays = ['日', '一', '二', '三', '四', '五', '六'];
  const dt = new Date(y, m - 1, d);
  const wd = weekdays[dt.getDay()];
  return `${y}年${m}月${d}日 星期${wd}`;
}

function offsetDate(dateStr: string, days: number): string {
  const [y, m, d] = dateStr.split('-').map(Number);
  const dt = new Date(y, m - 1, d + days);
  return `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, '0')}-${String(dt.getDate()).padStart(2, '0')}`;
}

export const Step2Date = memo(function Step2Date() {
  const navigate = useNavigate();
  const [draft, update] = useDraft();
  const today = useMemo(getToday, []);

  const isToday = draft.date === today;

  const handlePrev = useCallback(() => {
    update({ date: offsetDate(draft.date, -1) });
  }, [draft.date, update]);

  const handleNext = useCallback(() => {
    update({ date: offsetDate(draft.date, 1) });
  }, [draft.date, update]);

  const handleToday = useCallback(() => {
    update({ date: today });
  }, [today, update]);

  return (
    <div className="step-date">
      <StepHeader currentStep={2} onBack={() => navigate(-1)} />

      <div className="step-date__body">
        <div className="step-date__card">
          <p className="step-date__label">这杯奶茶是哪天喝的？</p>

          {/* 日期选择器 */}
          <div className="step-date__picker">
            <button
              className="step-date__arrow"
              onClick={handlePrev}
              aria-label="前一天"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M15 18l-6-6 6-6" />
              </svg>
            </button>

            <div className="step-date__display">
              <span className="step-date__display-text">
                {formatDisplay(draft.date)}
              </span>
              {isToday && (
                <span className="step-date__today-badge">今天</span>
              )}
            </div>

            <button
              className="step-date__arrow"
              onClick={handleNext}
              aria-label="后一天"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 18l6-6-6-6" />
              </svg>
            </button>
          </div>

          {/* 快捷操作 */}
          <div className="step-date__quick">
            {!isToday && (
              <button className="step-date__quick-btn" onClick={handleToday}>
                回到今天
              </button>
            )}
            <p className="step-date__hint">
              照片拍摄日期将自动识别（即将支持）
            </p>
          </div>
        </div>
      </div>

      <PageFooter
        currentStep={2}
        onPrev={() => navigate('/new/photo')}
        onNext={() => navigate('/new/cutout')}
      />
    </div>
  );
});
