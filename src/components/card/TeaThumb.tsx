import { memo, useMemo } from 'react';

interface ITeaThumbProps {
  src?: string;
  alt?: string;
  index?: number;
  size?: 'md' | 'lg' | 'xl';
}

/** 确定性旋转 — 基于 index 做伪随机 hash，保持跨渲染稳定 */
function useStableRotation(seed: number): number {
  return useMemo(() => {
    const hash = ((seed * 2654435761) >>> 0) % 5;
    return hash - 2;
  }, [seed]);
}

const SIZE_CLASS: Record<string, string> = {
  md: '',
  lg: 'tea-thumb--lg',
  xl: 'tea-thumb--xl',
};

export const TeaThumb = memo(function TeaThumb({
  src,
  alt = '奶茶缩略图',
  index = 0,
  size = 'md',
}: ITeaThumbProps) {
  const rotation = useStableRotation(index);
  const sizeClass = SIZE_CLASS[size] || '';

  if (!src) {
    return (
      <div
        className={`tea-thumb tea-thumb--empty ${sizeClass}`.trim()}
        style={{ transform: `rotate(${rotation}deg)` }}
        role="img"
        aria-label={alt}
      >
        <svg
          width="14" height="14" viewBox="0 0 24 24"
          fill="none" stroke="var(--color-tea-400)" strokeWidth="1.5"
          strokeLinecap="round" strokeLinejoin="round"
        >
          <path d="M17 8h1a4 4 0 010 8h-1" />
          <path d="M3 8h14v9a4 4 0 01-4 4H7a4 4 0 01-4-4V8z" />
          <line x1="6" y1="2" x2="6" y2="4" />
          <line x1="10" y1="2" x2="10" y2="4" />
          <line x1="14" y1="2" x2="14" y2="4" />
        </svg>
      </div>
    );
  }

  return (
    <div
      className={`tea-thumb ${sizeClass}`.trim()}
      style={{ transform: `rotate(${rotation}deg)` }}
    >
      <img
        className="tea-thumb__img"
        src={src}
        alt={alt}
        loading="lazy"
        onError={(e) => {
          const el = e.currentTarget;
          el.style.display = 'none';
          el.parentElement?.classList.add('tea-thumb--empty');
        }}
      />
    </div>
  );
});
