import { memo, type ReactNode } from 'react';

interface ISafeAreaProps {
  children?: ReactNode;
  /** 额外 class */
  className?: string;
}

/**
 * SafeArea — iPhone 底部安全区适配容器
 * 在元素底部添加 safe-area-inset-bottom 间距
 */
export const SafeArea = memo(function SafeArea({
  children,
  className = '',
}: ISafeAreaProps) {
  return (
    <div className={`safe-area ${className}`.trim()}>
      {children}
      <div className="safe-area__spacer" />
    </div>
  );
});
