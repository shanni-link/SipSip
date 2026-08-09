import { memo } from 'react';
import { StepIndicator } from '../card';

interface IStepHeaderProps {
  currentStep: number; // 1-6
  totalSteps?: number;
  onBack: () => void;
}

/**
 * StepHeader — 新增记录流程顶部栏
 * 返回按钮 + 步骤指示器 (●○○○○○)
 */
export const StepHeader = memo(function StepHeader({
  currentStep,
  totalSteps = 6,
  onBack,
}: IStepHeaderProps) {
  return (
    <header className="header">
      {/* 左：返回 */}
      <div className="header__side">
        <button
          className="header__icon-btn"
          onClick={onBack}
          aria-label="返回上一步"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M15 18l-6-6 6-6" />
          </svg>
        </button>
      </div>

      {/* 中：步骤文字 */}
      <span className="header__title">
        {currentStep}/{totalSteps}
      </span>

      {/* 右：步骤指示器 */}
      <div className="header__side header__side--right">
        <StepIndicator currentStep={currentStep} totalSteps={totalSteps} />
      </div>
    </header>
  );
});
