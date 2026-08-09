import { memo } from 'react';

interface IPageFooterProps {
  /** 当前步骤 (1-based) */
  currentStep: number;
  /** 总步骤数，默认 6 */
  totalSteps?: number;
  /** 下一步按钮文字，不传则最后一步自动为"确认" */
  nextLabel?: string;
  /** 上一步是否禁用 */
  prevDisabled?: boolean;
  /** 下一步是否禁用 */
  nextDisabled?: boolean;
  onPrev: () => void;
  onNext: () => void;
}

/**
 * PageFooter — 页面底部操作栏
 * 上一步 / 下一步（最后一步为"确认"）
 * 自动适配 iPhone 底部安全区
 */
export const PageFooter = memo(function PageFooter({
  currentStep,
  totalSteps = 6,
  nextLabel,
  prevDisabled = false,
  nextDisabled = false,
  onPrev,
  onNext,
}: IPageFooterProps) {
  const isFirst = currentStep <= 1;
  const isLast = currentStep >= totalSteps;
  const finalNextLabel = nextLabel ?? (isLast ? '确认' : '下一步');

  return (
    <footer className="page-footer">
      <div className="page-footer__inner">
        {/* 上一步 */}
        <button
          className={`page-footer__btn page-footer__btn--prev${isFirst || prevDisabled ? ' page-footer__btn--disabled' : ''}`}
          onClick={onPrev}
          disabled={isFirst || prevDisabled}
          aria-label="上一步"
        >
          上一步
        </button>

        {/* 下一步 / 确认 */}
        <button
          className={`page-footer__btn page-footer__btn--next${isLast ? ' page-footer__btn--confirm' : ''}${nextDisabled ? ' page-footer__btn--disabled' : ''}`}
          onClick={onNext}
          disabled={nextDisabled}
          aria-label={finalNextLabel}
        >
          {finalNextLabel}
        </button>
      </div>

      {/* iPhone 底部安全区 */}
      <div className="page-footer__safe-area" />
    </footer>
  );
});
