import { memo, useState, useCallback, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ListHeader } from '../components/header';
import { PopupSheet } from '../components/modal/PopupSheet';
import { ConfirmDialog, toast } from '../components/modal';
import { getRecordById, updateRecord, deleteRecord, type ITeaRecord } from '../stores/recordStore';
import {
  BRAND_PRESETS,
  SWEETNESS_OPTIONS,
  TEMPERATURE_OPTIONS,
  CUP_SIZE_OPTIONS,
  TOPPING_OPTIONS,
} from './new-record/presets';
import '../components/header/Header.css';
import '../components/modal/PopupSheet.css';
import '../components/modal/ConfirmDialog.css';
import './new-record/Step4Info.css';
import './EditPage.css';

/* ═══════════════════════ 评分印章 ═══════════════════════ */

function StampDot({ filled, onClick }: { filled: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      className={`info-stamp${filled ? ' info-stamp--filled' : ''}`}
      onClick={onClick}
      aria-label={filled ? '已评分' : '未评分'}
    >
      {filled ? '★' : ''}
    </button>
  );
}

/* ═══════════════════════ EditPage（与 Step4Info 保持一致） ═══════════════════════ */

export const EditPage = memo(function EditPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  const [record, setRecord] = useState<ITeaRecord | null>(null);
  const [loading, setLoading] = useState(true);

  // 从 recordStore 加载
  useEffect(() => {
    if (id) {
      const found = getRecordById(id);
      setRecord(found ?? null);
    }
    setLoading(false);
  }, [id]);

  // 表单状态（从 record 初始化）
  const [name, setName] = useState('');
  const [date, setDate] = useState('');
  const [brandKey, setBrandKey] = useState('');
  const [brand, setBrand] = useState('');
  const [store, setStore] = useState('');
  const [cupSize, setCupSize] = useState('');
  const [sweetness, setSweetness] = useState('');
  const [temperature, setTemperature] = useState('');
  const [toppings, setToppings] = useState<string[]>([]);
  const [price, setPrice] = useState('');
  const [rating, setRating] = useState(0);
  const [moodText, setMoodText] = useState('');
  const [isFavorite, setIsFavorite] = useState(false);

  // 当 record 加载完成时，回填表单
  useEffect(() => {
    if (record) {
      setName(record.name);
      setDate(record.date);
      setBrandKey(record.brandKey);
      setBrand(record.brand);
      setStore(record.store);
      setCupSize(record.cupSize);
      setSweetness(record.sweetness);
      setTemperature(record.temperature);
      setToppings(record.toppings);
      setPrice(record.price ? String(record.price) : '');
      setRating(record.rating);
      setMoodText(record.moodText);
      setIsFavorite(record.isFavorite);
    }
  }, [record]);

  // ── 弹窗开关 ──
  const [brandOpen, setBrandOpen] = useState(false);
  const [cupSizeOpen, setCupSizeOpen] = useState(false);
  const [sweetnessOpen, setSweetnessOpen] = useState(false);
  const [temperatureOpen, setTemperatureOpen] = useState(false);
  const [brandSearch, setBrandSearch] = useState('');

  const [deleteOpen, setDeleteOpen] = useState(false);

  // 保存
  const handleSave = useCallback(() => {
    if (!id) return;
    updateRecord(id, {
      name, brandKey, brand, store,
      cupSize, sweetness, temperature,
      toppings,
      price: parseFloat(price) || 0,
      rating, moodText, isFavorite,
    });
    toast.success('修改已保存！');
    navigate(-1);
  }, [id, name, brandKey, brand, store, cupSize, sweetness, temperature, toppings, price, rating, moodText, navigate]);

  const handleDeleteConfirm = useCallback(() => {
    setDeleteOpen(false);
    if (id) deleteRecord(id);
    toast.success('记录已删除');
    navigate('/list');
  }, [id, navigate]);

  // 品牌选择
  const handleBrandPick = useCallback((key: string, name: string) => {
    if (brandKey === key) {
      setBrandKey('');
      setBrand('');
    } else {
      setBrandKey(key);
      setBrand(name);
    }
    setBrandSearch('');
    setBrandOpen(false);
  }, [brandKey]);

  const handleCustomBrandSubmit = useCallback(() => {
    const val = brandSearch.trim();
    if (val) {
      setBrandKey('');
      setBrand(val);
      setBrandOpen(false);
      setBrandSearch('');
    }
  }, [brandSearch]);

  // 小料切换
  const handleToppingToggle = useCallback((topping: string) => {
    setToppings(prev =>
      prev.includes(topping) ? prev.filter(t => t !== topping) : [...prev, topping]
    );
  }, []);

  // 评分
  const handleRating = useCallback((n: number) => {
    setRating(prev => prev === n ? 0 : n);
  }, []);

  // 收藏切换
  const handleFavoriteToggle = useCallback(() => {
    setIsFavorite(prev => !prev);
  }, []);

  // 表单完整性
  const canSave = name.trim().length > 0 && brand.length > 0;

  // 格式化日期显示
  const formatDisplayDate = (dateStr: string) => {
    if (!dateStr) return '';
    const [y, m, d] = dateStr.split('-');
    return `${y}年${m}月${d}日`;
  };

  if (loading) {
    return (
      <div className="edit-page">
        <ListHeader onBack={() => navigate(-1)} titleClassName="header__title--lg" />
        <div className="edit-page__body" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <p style={{ color: 'var(--color-text-hint)', fontFamily: 'var(--font-family-body)' }}>加载中...</p>
        </div>
      </div>
    );
  }

  if (!record) {
    return (
      <div className="edit-page">
        <ListHeader onBack={() => navigate(-1)} titleClassName="header__title--lg" />
        <div className="edit-page__body" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 'var(--spacing-4)' }}>
          <p style={{ color: 'var(--color-text-hint)', fontFamily: 'var(--font-family-display)', fontSize: 'var(--text-lg)' }}>记录不存在</p>
          <button onClick={() => navigate('/list')} style={{ color: 'var(--color-tea-500)', fontFamily: 'var(--font-family-body)', border: 'none', background: 'none', cursor: 'pointer' }}>返回列表</button>
        </div>
      </div>
    );
  }

  return (
    <div className="step-info">
      <ListHeader
        onBack={() => navigate(-1)}
        titleClassName="header__title--lg"
      />

      <div className="step-info__body">
        {/* ── 抠图预览 ── */}
        {record.cutoutDataUrl && (
          <div className="info-cutout-preview">
            <div className="info-cutout-preview__img-wrap">
              <img
                className="info-cutout-preview__img"
                src={record.cutoutDataUrl}
                alt={record.name}
              />
            </div>
          </div>
        )}

        {/* ── 名称 + 收藏 ── */}
        <div className="info-field">
          <label className="info-field__label">名称</label>
          <div className="info-name-row">
            <input
              className="info-field__input"
              type="text"
              placeholder="如：多肉葡萄、伯牙绝弦"
              value={name}
              onChange={e => setName(e.target.value)}
            />
            <button
              type="button"
              className={`info-favorite-star${isFavorite ? ' info-favorite-star--active' : ''}`}
              onClick={handleFavoriteToggle}
              aria-label={isFavorite ? '取消收藏' : '收藏'}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill={isFavorite ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
              </svg>
            </button>
          </div>
        </div>

        {/* ── 日期（只读显示） ── */}
        <div className="info-field">
          <label className="info-field__label">日期</label>
          <div className="info-field__input" style={{
            height: 48,
            display: 'flex',
            alignItems: 'center',
            padding: '0 var(--spacing-4)',
            border: '1.5px solid var(--color-border)',
            borderRadius: 'var(--radius-md)',
            background: 'var(--color-tea-50)',
            fontFamily: 'var(--font-family-body)',
            fontSize: 'var(--text-base)',
            color: 'var(--color-text-secondary)',
            boxSizing: 'border-box',
          }}>
            {formatDisplayDate(date)}
          </div>
        </div>

        {/* ── 品牌（弹出选择） ── */}
        <div className="info-field">
          <label className="info-field__label">品牌</label>
          <button
            type="button"
            className={`info-select-box${brand ? ' info-select-box--filled' : ''}`}
            onClick={() => setBrandOpen(true)}
          >
            <span className={brand ? 'info-select-box__text' : 'info-select-box__placeholder'}>
              {brand || '点击选择品牌'}
            </span>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </button>
        </div>

        {/* ── 门店 ── */}
        <div className="info-field">
          <label className="info-field__label">门店 <span className="info-field__optional">选填</span></label>
          <input
            className="info-field__input"
            type="text"
            placeholder="如：正佳广场店"
            value={store}
            onChange={e => setStore(e.target.value)}
          />
        </div>

        {/* ── 杯型 · 甜度 · 温度（同一行，弹窗选择） ── */}
        <div className="info-field">
          <label className="info-field__label">杯型 · 甜度 · 温度</label>
          <div className="info-triple-row">
            <button
              type="button"
              className={`info-select-box info-select-box--inline${cupSize ? ' info-select-box--filled' : ''}`}
              onClick={() => setCupSizeOpen(true)}
            >
              <span className={cupSize ? 'info-select-box__text' : 'info-select-box__placeholder'}>
                {cupSize || '杯型'}
              </span>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 12 15 18 9" /></svg>
            </button>
            <button
              type="button"
              className={`info-select-box info-select-box--inline${sweetness ? ' info-select-box--filled' : ''}`}
              onClick={() => setSweetnessOpen(true)}
            >
              <span className={sweetness ? 'info-select-box__text' : 'info-select-box__placeholder'}>
                {sweetness || '甜度'}
              </span>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 12 15 18 9" /></svg>
            </button>
            <button
              type="button"
              className={`info-select-box info-select-box--inline${temperature ? ' info-select-box--filled' : ''}`}
              onClick={() => setTemperatureOpen(true)}
            >
              <span className={temperature ? 'info-select-box__text' : 'info-select-box__placeholder'}>
                {temperature || '温度'}
              </span>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 12 15 18 9" /></svg>
            </button>
          </div>
        </div>

        {/* ── 小料 ── */}
        <div className="info-field">
          <label className="info-field__label">小料 <span className="info-field__optional">多选</span></label>
          <div className="info-topping-grid">
            {TOPPING_OPTIONS.map(topping => (
              <button
                key={topping}
                type="button"
                className={`info-topping-tag${toppings.includes(topping) ? ' info-topping-tag--selected' : ''}`}
                onClick={() => handleToppingToggle(topping)}
              >
                {toppings.includes(topping) && (
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                )}
                +{topping}
              </button>
            ))}
          </div>
        </div>

        {/* ── 价格 ── */}
        <div className="info-field">
          <label className="info-field__label">价格</label>
          <div className="info-price-wrap">
            <span className="info-price-unit">¥</span>
            <input
              className="info-field__input info-field__input--price"
              type="number"
              inputMode="decimal"
              placeholder="0.00"
              min="0"
              step="0.01"
              value={price}
              onChange={e => setPrice(e.target.value)}
            />
          </div>
        </div>

        {/* ── 评分 ── */}
        <div className="info-field">
          <label className="info-field__label">评分</label>
          <div className="info-rating-row">
            {[1, 2, 3, 4, 5].map(n => (
              <StampDot
                key={n}
                filled={n <= rating}
                onClick={() => handleRating(n)}
              />
            ))}
          </div>
        </div>

        {/* ── 心情 ── */}
        <div className="info-field">
          <label className="info-field__label">心情</label>
          <input
            className="info-field__input"
            type="text"
            placeholder="写下当时的心情..."
            value={moodText}
            onChange={e => setMoodText(e.target.value)}
          />
        </div>

        {/* ── 操作按钮 ── */}
        <div className="edit-page__actions">
          <button
            className="edit-page__save-btn"
            onClick={handleSave}
            disabled={!canSave}
            style={!canSave ? { opacity: 0.4, cursor: 'not-allowed' } : undefined}
          >
            保存修改
          </button>
          <button className="edit-page__delete-btn" onClick={() => setDeleteOpen(true)}>
            删除此记录
          </button>
        </div>
      </div>

      {/* ═══════════════════════ 弹窗选择器 ═══════════════════════ */}

      {/* 品牌弹窗 */}
      <PopupSheet isOpen={brandOpen} title="选择品牌" onClose={() => setBrandOpen(false)}>
        <div className="info-popup-grid">
          {BRAND_PRESETS.map(b => (
            <button
              key={b.key}
              type="button"
              className={`info-popup-option${brandKey === b.key ? ' info-popup-option--selected' : ''}`}
              onClick={() => handleBrandPick(b.key, b.name)}
            >
              {b.name}
            </button>
          ))}
        </div>
        <div className="info-popup-custom">
          <input
            className="info-field__input"
            type="text"
            placeholder="或输入其他品牌..."
            value={brandSearch}
            onChange={e => {
              setBrandSearch(e.target.value);
              if (brandKey) { setBrandKey(''); setBrand(''); }
            }}
            onKeyDown={e => { if (e.key === 'Enter') handleCustomBrandSubmit(); }}
          />
          <button
            type="button"
            className="info-popup-custom__btn"
            onClick={handleCustomBrandSubmit}
            disabled={!brandSearch.trim()}
          >
            确定
          </button>
        </div>
      </PopupSheet>

      {/* 杯型弹窗 */}
      <PopupSheet isOpen={cupSizeOpen} title="选择杯型" onClose={() => setCupSizeOpen(false)}>
        <div className="info-popup-grid">
          {CUP_SIZE_OPTIONS.map(size => (
            <button
              key={size}
              type="button"
              className={`info-popup-option${cupSize === size ? ' info-popup-option--selected' : ''}`}
              onClick={() => { setCupSize(prev => prev === size ? '' : size); setCupSizeOpen(false); }}
            >
              {size}
            </button>
          ))}
        </div>
      </PopupSheet>

      {/* 甜度弹窗 */}
      <PopupSheet isOpen={sweetnessOpen} title="选择甜度" onClose={() => setSweetnessOpen(false)}>
        <div className="info-popup-grid">
          {SWEETNESS_OPTIONS.map(s => (
            <button
              key={s}
              type="button"
              className={`info-popup-option${sweetness === s ? ' info-popup-option--selected' : ''}`}
              onClick={() => { setSweetness(prev => prev === s ? '' : s); setSweetnessOpen(false); }}
            >
              {s}
            </button>
          ))}
        </div>
      </PopupSheet>

      {/* 温度弹窗 */}
      <PopupSheet isOpen={temperatureOpen} title="选择温度" onClose={() => setTemperatureOpen(false)}>
        <div className="info-popup-grid">
          {TEMPERATURE_OPTIONS.map(t => (
            <button
              key={t}
              type="button"
              className={`info-popup-option${temperature === t ? ' info-popup-option--selected' : ''}`}
              onClick={() => { setTemperature(prev => prev === t ? '' : t); setTemperatureOpen(false); }}
            >
              {t}
            </button>
          ))}
        </div>
      </PopupSheet>

      {/* 删除确认 */}
      <ConfirmDialog
        isOpen={deleteOpen}
        title="删除记录"
        message="确定要删除这条奶茶记录吗？删除后无法恢复哦。"
        confirmLabel="删除"
        cancelLabel="取消"
        variant="danger"
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteOpen(false)}
      />
    </div>
  );
});
