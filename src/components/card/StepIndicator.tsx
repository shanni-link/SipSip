import { memo } from 'react';

interface IStepIndicatorProps {
  currentStep: number; // 1-based
  totalSteps?: number; // 默认 6
}

/**
 * StepIndicator — 步骤指示器
 * ●──●──●──○──○──○   done / current / pending
 * 提取自 Header.css，可独立使用
 */
export const StepIndicator = memo(function StepIndicator({
  currentStep,
  totalSteps = 6,
}: IStepIndicatorProps) {
  return (
    <div
      className="step-indicator"
      role="progressbar"
      aria-valuenow={currentStep}
      aria-valuemin={1}
      aria-valuemax={totalSteps}
    >
      {Array.from({ length: totalSteps }, (_, i) => {
        const stepNum = i + 1;
        const isDone = stepNum < currentStep;
        const isCurrent = stepNum === currentStep;

        return (
          <span key={stepNum} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            {/* 连线 (非第一个) */}
            {i > 0 && (
              <span className={`step-line ${isDone ? 'step-line--done' : ''}`} />
            )}
            {/* 圆点 */}
            <span
              className={`step-dot ${
                isCurrent ? 'step-dot--current'
                  : isDone ? 'step-dot--done'
                  : ''
              }`}
            />
          </span>
        );
      })}
    </div>
  );
});
