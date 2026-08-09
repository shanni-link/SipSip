import { memo } from 'react';
import { TeaThumb } from './TeaThumb';

interface ITeaStackProps {
  thumbs: string[];
  max?: number; // 最多显示几张，默认 3
}

export const TeaStack = memo(function TeaStack({
  thumbs,
  max = 3,
}: ITeaStackProps) {
  if (!thumbs || thumbs.length === 0) return null;

  const visibleCount = Math.min(thumbs.length, max);
  const overflow = thumbs.length - visibleCount;

  // 容器尺寸 = 单张 28px + (visible-1) × 6px 偏移
  const containerW = 28 + (visibleCount - 1) * 6;
  const containerH = 28 + (visibleCount - 1) * 6;

  return (
    <div
      className="tea-stack"
      style={{ width: containerW, height: containerH }}
    >
      {/* 从底到顶渲染（第一张在最底下，最后一张在最上面） */}
      {thumbs.slice(0, visibleCount).map((src, i) => (
        <div
          key={i}
          className="tea-stack__thumb"
          style={{
            position: 'absolute',
            top: i * 6,
            left: i * 6,
            zIndex: i,
          }}
        >
          <TeaThumb src={src} alt={`奶茶 ${i + 1}`} index={i} />
        </div>
      ))}

      {/* +N 溢出标记 */}
      {overflow > 0 && (
        <span
          className="tea-stack__badge"
          style={{
            position: 'absolute',
            top: (visibleCount - 1) * 6 + 28 - 7,
            left: (visibleCount - 1) * 6 + 28 - 7,
            zIndex: visibleCount,
          }}
        >
          +{overflow}
        </span>
      )}
    </div>
  );
});
