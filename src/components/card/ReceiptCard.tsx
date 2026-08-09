import { memo, useMemo, useState, useCallback } from 'react';

/* ═══════════════════════ 毛边 SVG（不规则撕纸边缘） ═══════════════════════ */

function TornEdgeSVG({ variant = 'top' }: { variant?: 'top' | 'bottom' }) {
  const pathD = variant === 'top'
    // 顶部毛边：不规则在上，平坦在下
    ? 'M0,8 L5,3 L12,7 L18,1 L25,6 L31,2 L38,8 L44,3 L50,7 L58,2 L64,6 L71,1 L78,5 L85,8 L92,3 L98,7 L105,1 L112,6 L119,2 L125,8 L132,4 L139,7 L145,1 L152,6 L159,3 L166,8 L173,2 L180,5 L187,1 L194,7 L200,3 L200,10 L0,10 Z'
    // 底部毛边：平坦在上，不规则在下
    : 'M0,0 L5,7 L12,3 L18,9 L25,4 L31,8 L38,2 L44,7 L50,3 L58,8 L64,4 L71,9 L78,5 L85,2 L92,7 L98,3 L105,9 L112,4 L119,8 L125,2 L132,6 L139,3 L145,9 L152,4 L159,7 L166,2 L173,8 L180,5 L187,9 L194,3 L200,7 L200,0 L0,0 Z';
  return (
    <svg
      className="receipt-card__torn-edge"
      width="100%" height="8"
      viewBox="0 0 200 10"
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      <path d={pathD} />
    </svg>
  );
}

/* ═══════════════════════ 确定性旋转 hash ═══════════════════════ */

function useCardRotation(seed: string): number {
  return useMemo(() => {
    let hash = 0;
    for (let i = 0; i < seed.length; i++) {
      hash = ((hash << 5) - hash) + seed.charCodeAt(i);
      hash |= 0;
    }
    return (Math.abs(hash) % 5) - 2; // -2 ~ +2
  }, [seed]);
}

/* ═══════════════════════ 静态品牌 key 集 ═══════════════════════ */

const VALID_BRAND_KEYS = new Set(['heytea', 'nayuki', 'mxbc', 'chabaidao', 'bwcj']);

/* ═══════════════════════ ReceiptCard ═══════════════════════ */

export interface IReceiptCardProps {
  id?: string;
  date?: string;            // "2026-06-22"
  cutoutImage?: string;
  name?: string;            // 奶茶名
  brand?: string;           // 品牌显示名
  brandKey?: string;        // 品牌 key → 颜色映射
  store?: string;           // 门店
  cupSize?: string;         // 中杯 / 大杯 / 超大杯
  sweetness?: string;       // 甜度
  temperature?: string;     // 冰量
  toppings?: string[];      // 小料
  price?: number;           // 价格
  rating?: number;          // 1-5
  moodText?: string;        // 心情文字
  hasVoice?: boolean;       // 是否有语音
  audioDataUrl?: string | null; // 语音录音 data URL
  isFavorite?: boolean;     // 是否已收藏
  onToggleFavorite?: () => void;
  onPlayVoice?: () => void;
  className?: string;
  style?: React.CSSProperties;
}

export const ReceiptCard = memo(function ReceiptCard({
  id = '',
  date,
  cutoutImage,
  name,
  brand,
  brandKey,
  store,
  cupSize,
  sweetness,
  temperature,
  toppings,
  price,
  rating = 0,
  moodText,
  hasVoice = false,
  audioDataUrl,
  isFavorite = false,
  onToggleFavorite,
  onPlayVoice,
  className,
  style,
}: IReceiptCardProps) {
  const rotation = useCardRotation(id || name || 'default');
  const [voicePlaying, setVoicePlaying] = useState(false);

  // 品牌 CSS 类：只允许已知品牌 key
  const brandClass = brandKey && VALID_BRAND_KEYS.has(brandKey)
    ? `receipt-card--${brandKey}`
    : 'receipt-card--default';

  // 规格行
  const specParts = [cupSize, temperature, sweetness].filter(Boolean);
  const specText = specParts.join(' · ');

  // ★ 星星文本
  const starsText = rating > 0
    ? '★★★★★'.slice(0, rating) + '☆☆☆☆☆'.slice(rating)
    : '';

  // 打印时间：date 格式化为 "YYYY-MM-DD HH:MM:SS"
  const printTime = date
    ? `打印时间 ${date} ${new Date().toTimeString().slice(0, 8)}`
    : '';

  // 是否有心情区内容
  const hasMoodSection = moodText || hasVoice;

  // 语音播放
  const handleVoiceClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    // 如果有外部回调，优先使用
    if (onPlayVoice) {
      onPlayVoice();
      return;
    }
    // 内部播放 audioDataUrl
    if (audioDataUrl && !voicePlaying) {
      setVoicePlaying(true);
      const audio = new Audio(audioDataUrl);
      audio.onended = () => setVoicePlaying(false);
      audio.onerror = () => setVoicePlaying(false);
      audio.play().catch(() => setVoicePlaying(false));
    }
  }, [audioDataUrl, voicePlaying, onPlayVoice]);

  return (
    <div
      className={`receipt-card ${brandClass}${className ? ` ${className}` : ''}`}
      style={{
        transform: `rotate(${rotation}deg)`,
        ...style,
      }}
    >
      {/* ════ 顶部毛边 ════ */}
      <TornEdgeSVG variant="top" />

      {/* ── 收藏星标（右上角） ── */}
      {onToggleFavorite && (
        <button
          className={`receipt-card__fav-star${isFavorite ? ' receipt-card__fav-star--active' : ''}`}
          onClick={(e) => {
            e.stopPropagation();
            onToggleFavorite();
          }}
          aria-label={isFavorite ? '取消收藏' : '收藏'}
          title={isFavorite ? '取消收藏' : '收藏'}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill={isFavorite ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
          </svg>
        </button>
      )}

      {/* ── 抠图置顶 ── */}
      {cutoutImage ? (
        <div className="receipt-card__cutout-top">
          <img
            src={cutoutImage}
            alt={name ?? '奶茶'}
            loading="lazy"
          />
        </div>
      ) : (
        <div className="receipt-card__cutout-top receipt-card__cutout-top--empty">
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#c9b896" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M17 8h1a4 4 0 010 8h-1" />
            <path d="M3 8h14v9a4 4 0 01-4 4H7a4 4 0 01-4-4V8z" />
            <line x1="6" y1="2" x2="6" y2="4" />
            <line x1="10" y1="2" x2="10" y2="4" />
            <line x1="14" y1="2" x2="14" y2="4" />
          </svg>
        </div>
      )}

      <div className="receipt-card__divider"></div>

      {/* ── 店名 · 门店 ── */}
      {brand && (
        <div className="receipt-card__row">
          <span className="receipt-card__label">店名</span>
          <span className="receipt-card__brand-name">{brand}</span>
        </div>
      )}
      {store && (
        <div className="receipt-card__row">
          <span className="receipt-card__label">门店</span>
          <span className="receipt-card__store">{store}</span>
        </div>
      )}

      <div className="receipt-card__divider"></div>

      {/* ── 序号 · 品名 · 价格 ── */}
      {name && (
        <div className="receipt-card__item-row">
          <span className="receipt-card__item-no">01</span>
          <span className="receipt-card__item-name">{name}</span>
          {price !== undefined && price !== null && (
            <span className="receipt-card__item-price">¥{price.toFixed(2)}</span>
          )}
        </div>
      )}

      {/* ── 规格 ── */}
      {specText && <div className="receipt-card__specs">{specText}</div>}

      {/* ── 小料 ── */}
      {toppings && toppings.length > 0 && (
        <div className="receipt-card__specs">
          {toppings.map(t => `+ ${t}`).join(' / ')}
        </div>
      )}

      <div className="receipt-card__divider"></div>

      {/* ── 评分 ── */}
      {rating > 0 && (
        <div className="receipt-card__row">
          <span className="receipt-card__label">评分</span>
          <span className="receipt-card__stars">{starsText}</span>
        </div>
      )}

      {/* ── 合计 ── */}
      {price !== undefined && price !== null && (
        <div className="receipt-card__row">
          <span className="receipt-card__label">合计</span>
          <span className="receipt-card__item-price">¥ {price.toFixed(2)}</span>
        </div>
      )}

      <div className="receipt-card__divider"></div>

      {/* ── 心情 + 语音 ── */}
      {hasMoodSection && (
        <div className="receipt-card__mood-row">
          <span className="receipt-card__mood-label">心情</span>
          <div className="receipt-card__mood-content">
            {moodText && (
              <span className="receipt-card__mood-text">"{moodText}"</span>
            )}
            {hasVoice && (
              <button
                className={`receipt-card__voice-btn${voicePlaying ? ' receipt-card__voice-btn--playing' : ''}`}
                onClick={handleVoiceClick}
                aria-label={voicePlaying ? '正在播放...' : '播放心情语音'}
                title={voicePlaying ? '正在播放...' : '播放心情语音'}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
                  <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
                </svg>
              </button>
            )}
          </div>
        </div>
      )}

      <div className="receipt-card__divider--dots" style={{ margin: '5px 0' }}></div>

      {/* ── 打印时间 ── */}
      {printTime && (
        <div className="receipt-card__footer">{printTime}</div>
      )}

      {/* ════ 底部毛边 ════ */}
      <TornEdgeSVG variant="bottom" />
    </div>
  );
});
