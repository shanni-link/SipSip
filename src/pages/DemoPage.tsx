/**
 * 🧪 DemoPage — 全组件展示页
 * 一站式查看所有已实现的 UI 组件和交互
 */
import { useState, useCallback } from 'react';
import { MonthHeader, ListHeader, StepHeader } from '../components/header';
import {
  ReceiptCard,
  MonthlySummary,
  HistoricalFavorite,
  DayCell,
  TeaThumb,
  TeaStack,
  StepIndicator,
  DayDetailModal,
  type IReceiptCardProps,
  type IFavoriteEntry,
  type IReceiptData,
} from '../components/card';
import { SearchInput, FilterChips, buildFilterChips, SortSelector } from '../components/search';
import type { SortOption } from '../components/search';
import { ReceiptModal, ConfirmDialog, toast, ToastContainer } from '../components/modal';
import { BottomNavBar } from '../components/sidebar';

// CSS imports
import '../components/header/Header.css';
import '../components/card/ReceiptCard.css';
import '../components/card/MonthlySummary.css';
import '../components/card/HistoricalFavorite.css';
import '../components/card/DayCell.css';
import '../components/card/TeaThumb.css';
import '../components/card/TeaStack.css';
import '../components/card/StepIndicator.css';
import '../components/card/DayDetailModal.css';
import '../components/card/HistoryPage.css';
import '../components/search/SearchInput.css';
import '../components/search/FilterChips.css';
import '../components/search/SortSelector.css';
import '../components/sidebar/BottomNavBar.css';
import '../components/modal/ReceiptModal.css';
import '../components/modal/ConfirmDialog.css';
import '../components/modal/Toast.css';
import './new-record/Step1Photo.css';

/* ═══════════════════════ Mock Data ═══════════════════════ */

const MOCK_RECEIPTS: IReceiptCardProps[] = [
  {
    id: 'demo-1',
    date: '2026.06.23',
    name: '多肉葡萄',
    brand: '喜茶',
    brandKey: 'heytea',
    store: '海岸城店',
    cupSize: '中杯',
    sweetness: '少甜',
    temperature: '少冰',
    toppings: ['脆波波', '芝士'],
    price: 29,
    rating: 4,
    moodText: '今天心情超好！',
    hasVoice: true,
  },
  {
    id: 'demo-2',
    date: '2026.06.22',
    name: '霸气草莓',
    brand: '奈雪的茶',
    brandKey: 'nayuki',
    store: '万象天地店',
    cupSize: '大杯',
    sweetness: '半糖',
    temperature: '去冰',
    toppings: ['珍珠'],
    price: 25,
    rating: 3,
    moodText: '还行吧',
  },
  {
    id: 'demo-3',
    date: '2026.06.21',
    name: '柠檬水',
    brand: '蜜雪冰城',
    brandKey: 'mxbc',
    cupSize: '大杯',
    sweetness: '正常糖',
    temperature: '正常冰',
    price: 4,
    rating: 5,
    moodText: '便宜好喝！',
    hasVoice: true,
  },
  {
    id: 'demo-4',
    date: '2026.06.20',
    name: '茉莉奶绿',
    brand: '茶百道',
    brandKey: 'chabaidao',
    store: '科技园店',
    cupSize: '中杯',
    sweetness: '微甜',
    temperature: '去冰',
    toppings: ['椰果', '仙草'],
    price: 16,
    rating: 4,
  },
  {
    id: 'demo-5',
    date: '2026.06.19',
    name: '伯牙绝弦',
    brand: '霸王茶姬',
    brandKey: 'bwcj',
    store: '壹方城店',
    cupSize: '大杯',
    sweetness: '无糖',
    temperature: '热',
    price: 22,
    rating: 5,
    moodText: '茶味很正！',
    hasVoice: true,
  },
  {
    id: 'demo-6',
    date: '2026.06.18',
    name: '经典珍珠奶茶',
    brand: '其他品牌',
    store: '街角小店',
    cupSize: '中杯',
    sweetness: '全糖',
    temperature: '少冰',
    toppings: ['珍珠', '布丁'],
    price: 12,
    rating: 3,
    moodText: '童年的味道',
  },
];

const MOCK_MONTHLY_SUMMARY = {
  month: '2026-06',
  cupCount: 6,
  shopCount: 5,
  totalAmount: 108,
  topCutouts: [] as string[],
};

const MOCK_CURRENT_FAVORITE: IFavoriteEntry = {
  year: 2026,
  month: 6,
  name: '多肉葡萄',
  cutout: '',
  count: 2,
};

const MOCK_HISTORY: IFavoriteEntry[] = [
  { year: 2026, month: 5, name: '霸气草莓', cutout: '', count: 3 },
  { year: 2026, month: 4, name: '伯牙绝弦', cutout: '', count: 2 },
  { year: 2026, month: 3, name: '柠檬水', cutout: '', count: 5 },
];

const MOCK_DAY_RECEIPTS: IReceiptData[] = [
  {
    id: 'day-1',
    date: '2026.06.23',
    name: '多肉葡萄',
    brand: '喜茶',
    brandKey: 'heytea',
    store: '海岸城店',
    cupSize: '中杯',
    sweetness: '少甜',
    temperature: '少冰',
    toppings: ['脆波波', '芝士'],
    price: 29,
    rating: 4,
    moodText: '今天心情超好！',
    hasVoice: true,
  },
  {
    id: 'day-2',
    date: '2026.06.23',
    name: '柠檬水',
    brand: '蜜雪冰城',
    brandKey: 'mxbc',
    cupSize: '大杯',
    sweetness: '正常糖',
    temperature: '正常冰',
    price: 4,
    rating: 5,
    moodText: '便宜好喝！',
  },
];

/* ═══════════════════════ Section Wrapper ═══════════════════════ */

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section style={{ marginBottom: 32 }}>
      <h2 style={{
        fontFamily: 'var(--font-family-display)',
        fontSize: 'var(--text-lg)',
        fontWeight: 'var(--font-weight-semibold)',
        color: 'var(--color-tea-700)',
        marginBottom: 16,
        padding: '0 4px',
        borderBottom: '2px solid var(--color-tea-100)',
        paddingBottom: 8,
      }}>
        {title}
      </h2>
      {children}
    </section>
  );
}

/* ═══════════════════════ DemoPage ═══════════════════════ */

export default function DemoPage() {
  // Modal state
  const [receiptModalOpen, setReceiptModalOpen] = useState(false);
  const [dayDetailOpen, setDayDetailOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [sortBy, setSortBy] = useState<SortOption>('newest');
  const [searchText, setSearchText] = useState('');

  // Filter chips demo
  const [demoBrands, setDemoBrands] = useState<string[]>(['heytea', 'mxbc']);
  const [demoRating, setDemoRating] = useState<number | null>(4);

  const handleRemoveBrand = useCallback((key: string) => {
    setDemoBrands(prev => prev.filter(b => b !== key));
  }, []);
  const handleRemoveRating = useCallback(() => setDemoRating(null), []);
  const handleRemoveDate = useCallback(() => {}, []);

  const demoChips = buildFilterChips(
    demoBrands, demoRating, null, null,
    handleRemoveBrand, handleRemoveRating, handleRemoveDate,
  );

  return (
    <div style={{
      maxWidth: 480,
      margin: '0 auto',
      padding: '16px 16px 100px',
      background: 'var(--color-bg)',
      minHeight: '100dvh',
    }}>
      {/* ═══════ Page Header ═══════ */}
      <div style={{
        textAlign: 'center',
        marginBottom: 24,
        padding: '20px 0 12px',
      }}>
        <h1 style={{
          fontFamily: 'var(--font-family-display)',
          fontSize: '28px',
          fontWeight: 'var(--font-weight-bold)',
          color: 'var(--color-text-primary)',
          margin: '0 0 4px',
          letterSpacing: '0.06em',
        }}>
          🧋 组件展示
        </h1>
        <p style={{
          fontFamily: 'var(--font-family-body)',
          fontSize: 'var(--text-sm)',
          color: 'var(--color-text-hint)',
          margin: 0,
        }}>
          所有 UI 组件一览 — 点击交互查看效果
        </p>
      </div>

      {/* ═══════ 1. Headers ═══════ */}
      <Section title="📱 顶部栏 Headers">
        <div style={{ background: 'var(--color-surface)', borderRadius: 12, overflow: 'hidden', marginBottom: 12 }}>
          <MonthHeader
            year={2026} month={6} day={23}
            isCurrentMonth={true}
            collectionCount={6}
            onDatePickerOpen={() => toast.info('打开月份选择器')}
            onBackToToday={() => toast.success('已回到今天')}
            onCollectionClick={() => toast.info('打开收集盒列表')}
          />
        </div>
        <div style={{ background: 'var(--color-surface)', borderRadius: 12, overflow: 'hidden', marginBottom: 12 }}>
          <ListHeader
            onBack={() => toast.info('返回')}
            title="全部记录"
            onSearch={() => toast.info('打开搜索')}
            onFilter={() => toast.info('打开筛选')}
            filterActive={false}
            titleClassName="header__title--lg"
          />
        </div>
        <div style={{ background: 'var(--color-surface)', borderRadius: 12, overflow: 'hidden' }}>
          <StepHeader currentStep={3} totalSteps={6} onBack={() => toast.info('返回上一步')} />
        </div>
      </Section>

      {/* ═══════ 2. StepIndicator ═══════ */}
      <Section title="📍 步骤指示器 StepIndicator">
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 16,
          alignItems: 'center',
          background: 'var(--color-surface)',
          borderRadius: 12,
          padding: 20,
        }}>
          {[1, 3, 6].map(step => (
            <div key={step} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <span style={{
                fontFamily: 'var(--font-family-body)',
                fontSize: 'var(--text-sm)',
                color: 'var(--color-text-secondary)',
                width: 48,
                textAlign: 'right',
              }}>
                步骤{step}/6
              </span>
              <StepIndicator currentStep={step} totalSteps={6} />
            </div>
          ))}
        </div>
      </Section>

      {/* ═══════ 3. ReceiptCard — 品牌色画廊 ═══════ */}
      <Section title="🎫 小票卡片 ReceiptCard · 5 品牌色">
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))',
          gap: 12,
        }}>
          {MOCK_RECEIPTS.slice(0, 5).map(r => (
            <div key={r.id} style={{ transform: 'scale(0.85)', transformOrigin: 'top center' }}>
              <ReceiptCard {...r} />
            </div>
          ))}
        </div>
        <p style={{
          textAlign: 'center',
          color: 'var(--color-text-hint)',
          fontSize: 'var(--text-xs)',
          marginTop: 8,
        }}>
          ↑ 喜茶 / 奈雪 / 蜜雪冰城 / 茶百道 / 霸王茶姬
        </p>
      </Section>

      {/* ═══════ 4. ReceiptCard — 功能演示 ═══════ */}
      <Section title="🎫 小票卡片 · 功能变体">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* 完整版（最多信息） */}
          <div>
            <p style={{
              fontFamily: 'var(--font-family-body)',
              fontSize: 'var(--text-xs)',
              color: 'var(--color-text-hint)',
              marginBottom: 8,
              textAlign: 'center',
            }}>
              ↓ 完整信息（评分 + 价格 + 心情 + 语音 + 日期）
            </p>
            <ReceiptCard {...MOCK_RECEIPTS[0]} />
          </div>

          {/* 最小版（只有名称） */}
          <div>
            <p style={{
              fontFamily: 'var(--font-family-body)',
              fontSize: 'var(--text-xs)',
              color: 'var(--color-text-hint)',
              marginBottom: 8,
              textAlign: 'center',
            }}>
              ↓ 精简版（仅名称 + 品牌）
            </p>
            <ReceiptCard
              id="minimal"
              name="纯茶"
              brand="无印良品"
              brandKey="other"
            />
          </div>

          {/* 无图版 */}
          <div>
            <p style={{
              fontFamily: 'var(--font-family-body)',
              fontSize: 'var(--text-xs)',
              color: 'var(--color-text-hint)',
              marginBottom: 8,
              textAlign: 'center',
            }}>
              ↓ 无抠图（空态占位图）
            </p>
            <ReceiptCard
              id="no-photo"
              date="2026.06.24"
              name="杨枝甘露"
              brand="七分甜"
              price={18}
              rating={3}
              cupSize="大杯"
              sweetness="半糖"
              temperature="少冰"
              toppings={['芒果', '西柚']}
            />
          </div>
        </div>
      </Section>

      {/* ═══════ 5. MonthlySummary ═══════ */}
      <Section title="📊 月度统计 MonthlySummary">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <MonthlySummary
            month="2026-06"
            cupCount={6}
            shopCount={5}
            totalAmount={108}
            topCutouts={MOCK_MONTHLY_SUMMARY.topCutouts}
          />
          {/* 空态 */}
          <MonthlySummary
            month="2026-01"
            cupCount={0}
            shopCount={0}
            totalAmount={0}
            topCutouts={[]}
          />
        </div>
      </Section>

      {/* ═══════ 6. HistoricalFavorite ═══════ */}
      <Section title="🏆 历史最爱 HistoricalFavorite">
        <HistoricalFavorite
          currentFavorites={[MOCK_CURRENT_FAVORITE]}
          history={MOCK_HISTORY}
        />
        <div style={{ marginTop: 8, textAlign: 'center' }}>
          <p style={{
            fontFamily: 'var(--font-family-body)',
            fontSize: 'var(--text-xs)',
            color: 'var(--color-text-hint)',
          }}>
            ↑ 点击"查看历史最爱"可跳转 /history 页面
          </p>
        </div>
      </Section>

      {/* ═══════ 7. DayCell ═══════ */}
      <Section title="📅 日历格子 DayCell">
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(7, 1fr)',
          gap: 4,
          background: 'var(--color-surface)',
          borderRadius: 12,
          padding: 16,
        }}>
          {/* 普通日期 */}
          <DayCell date={15} onPress={() => toast.info('点击了 15 日')} />
          {/* 今天 */}
          <DayCell date={23} isToday onPress={() => toast.info('点击了今天')} />
          {/* 有奶茶的日期 (空图占位) */}
          <DayCell
            date={20}
            teas={[{ id: 't1', cutoutImage: '' }, { id: 't2', cutoutImage: '' }]}
            onPress={() => toast.info('20 日有 2 杯')}
          />
          <DayCell date={21} onPress={() => {}} />
          <DayCell date={22} onPress={() => {}} />
          <DayCell date={24} onPress={() => {}} />
          <DayCell date={25} onPress={() => {}} />
        </div>
        <p style={{
          textAlign: 'center',
          color: 'var(--color-text-hint)',
          fontSize: 'var(--text-xs)',
          marginTop: 8,
        }}>
          ↑ 普通日 · 今日（红圈手绘） · 有奶茶日（叠杯缩略图）
        </p>
      </Section>

      {/* ═══════ 8. TeaThumb + TeaStack ═══════ */}
      <Section title="🖼️ 缩略图 TeaThumb · TeaStack">
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 16,
          alignItems: 'center',
          background: 'var(--color-surface)',
          borderRadius: 12,
          padding: 20,
        }}>
          <div>
            <p style={{
              fontFamily: 'var(--font-family-body)',
              fontSize: 'var(--text-xs)',
              color: 'var(--color-text-hint)',
              marginBottom: 8,
              textAlign: 'center',
            }}>
              TeaThumb · 带图 / 空态
            </p>
            <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
              <TeaThumb src="" alt="空态" index={0} />
              <TeaThumb src="" alt="空态" index={1} />
              <TeaThumb src="" alt="空态" index={2} />
              <TeaThumb src="" alt="空态" index={3} />
            </div>
          </div>
          <div>
            <p style={{
              fontFamily: 'var(--font-family-body)',
              fontSize: 'var(--text-xs)',
              color: 'var(--color-text-hint)',
              marginBottom: 8,
              textAlign: 'center',
            }}>
              TeaStack · 叠杯效果（最多 3 层）
            </p>
            <TeaStack thumbs={['', '', '', '']} max={3} />
          </div>
        </div>
      </Section>

      {/* ═══════ 9. Search / Filter ═══════ */}
      <Section title="🔍 搜索筛选 Search · Filter · Sort">
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 12,
          background: 'var(--color-surface)',
          borderRadius: 12,
          padding: 16,
        }}>
          {/* SearchInput */}
          <div>
            <p style={{
              fontFamily: 'var(--font-family-body)',
              fontSize: 'var(--text-xs)',
              color: 'var(--color-text-hint)',
              marginBottom: 4,
            }}>
              SearchInput
            </p>
            <SearchInput value={searchText} onChange={setSearchText} />
          </div>

          {/* FilterChips */}
          <div>
            <p style={{
              fontFamily: 'var(--font-family-body)',
              fontSize: 'var(--text-xs)',
              color: 'var(--color-text-hint)',
              marginBottom: 4,
            }}>
              FilterChips（点击 × 可移除）
            </p>
            <FilterChips
              filters={demoChips}
              onClearAll={() => { setDemoBrands([]); setDemoRating(null); }}
            />
          </div>

          {/* SortSelector */}
          <div>
            <p style={{
              fontFamily: 'var(--font-family-body)',
              fontSize: 'var(--text-xs)',
              color: 'var(--color-text-hint)',
              marginBottom: 4,
            }}>
              SortSelector
            </p>
            <SortSelector value={sortBy} onChange={setSortBy} />
          </div>
        </div>
      </Section>

      {/* ═══════ 10. Modals ═══════ */}
      <Section title="🪟 模态框 Modals">
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: 8,
        }}>
          <button
            onClick={() => setReceiptModalOpen(true)}
            style={modalBtnStyle}
          >
            📋 小票详情<br /><small>ReceiptModal</small>
          </button>
          <button
            onClick={() => setDayDetailOpen(true)}
            style={modalBtnStyle}
          >
            📅 日期详情<br /><small>DayDetailModal</small>
          </button>
          <button
            onClick={() => setConfirmOpen(true)}
            style={modalBtnStyle}
          >
            ⚠️ 删除确认<br /><small>ConfirmDialog</small>
          </button>
          <button
            onClick={() => toast.success('操作成功！')}
            style={modalBtnStyle}
          >
            ✅ 成功提示<br /><small>Toast</small>
          </button>
          <button
            onClick={() => toast.error('操作失败')}
            style={{ ...modalBtnStyle, background: 'var(--color-accent)' }}
          >
            ❌ 错误提示<br /><small>Toast</small>
          </button>
          <button
            onClick={() => toast.info('温馨提示')}
            style={{ ...modalBtnStyle, background: 'var(--color-tea-600)' }}
          >
            💡 信息提示<br /><small>Toast</small>
          </button>
        </div>
      </Section>

      {/* ═══════ 11. AI 抠图 ═══════ */}
      <Section title="🤖 AI 抠图测试 (同 /test)">
        <CutoutTest />
      </Section>

      {/* ═══════ Modals (rendered at root level) ═══════ */}

      {/* ReceiptModal */}
      {receiptModalOpen && (
        <ReceiptModal
          isOpen={true}
          onClose={() => setReceiptModalOpen(false)}
          {...MOCK_RECEIPTS[0]}
        />
      )}

      {/* DayDetailModal */}
      <DayDetailModal
        date="2026年6月23日"
        receipts={MOCK_DAY_RECEIPTS}
        isOpen={dayDetailOpen}
        onClose={() => setDayDetailOpen(false)}
        isToday={true}
      />

      {/* ConfirmDialog */}
      <ConfirmDialog
        isOpen={confirmOpen}
        title="删除记录"
        message="确定要删除这条奶茶记录吗？删除后无法恢复哦。"
        confirmLabel="删除"
        cancelLabel="取消"
        variant="danger"
        onConfirm={() => { setConfirmOpen(false); toast.success('已删除'); }}
        onCancel={() => setConfirmOpen(false)}
      />

      {/* Toast */}
      <ToastContainer />

      {/* BottomNavBar */}
      <BottomNavBar />
    </div>
  );
}

/* ═══════════════════════ Modal Button Style ═══════════════════════ */

const modalBtnStyle: React.CSSProperties = {
  padding: '14px 12px',
  border: '1.5px solid var(--color-tea-200)',
  borderRadius: 'var(--radius-md)',
  background: 'var(--color-tea-50)',
  color: 'var(--color-text-primary)',
  fontFamily: 'var(--font-family-body)',
  fontSize: 'var(--text-sm)',
  fontWeight: 'var(--font-weight-medium)',
  cursor: 'pointer',
  textAlign: 'center',
  lineHeight: 1.5,
  transition: 'all 150ms ease',
};

/* ═══════════════════════ Cutout Test (inline from TestCutout) ═══════════════════════ */

function CutoutTest() {
  const [logs, setLogs] = useState<Array<{ time: string; msg: string; type: 'info' | 'error' | 'success' }>>([]);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState('');

  const log = useCallback((msg: string, type: 'info' | 'error' | 'success' = 'info') => {
    const time = new Date().toLocaleTimeString();
    setLogs(prev => [...prev, { time, msg, type }]);
  }, []);

  const handleFile = useCallback(async (file: File) => {
    setLogs([]);
    setResultUrl(null);
    setProcessing(true);
    setProgress('');

    log(`📁 收到文件: ${file.name} (${(file.size / 1024).toFixed(1)} KB)`);

    const reader = new FileReader();
    reader.onload = async () => {
      const dataUrl = reader.result as string;
      log(`✅ 文件读取完成, data URL 长度: ${dataUrl.length} 字符`);

      try {
        log('📦 动态导入 @imgly/background-removal...');
        const startTime = performance.now();
        const { removeBackground } = await import('@imgly/background-removal');
        log(`✅ 导入成功 (${(performance.now() - startTime).toFixed(0)}ms)`);

        log('🔍 调用 removeBackground()...');
        const publicPath = new URL(import.meta.env.BASE_URL, location.origin).href;
        log(`   配置: model=medium, publicPath=${publicPath}, debug=true`);

        const blob = await removeBackground(dataUrl, {
          model: 'medium',
          publicPath,
          debug: true,
          output: { format: 'image/png' },
          progress: (key: string, current: number, total: number) => {
            const pct = Math.round((current / total) * 100);
            const msg = `📊 ${key}: ${pct}% (${(current / 1024 / 1024).toFixed(1)}MB / ${(total / 1024 / 1024).toFixed(1)}MB)`;
            setProgress(msg);
            log(msg);
          },
        });

        const elapsed = ((performance.now() - startTime) / 1000).toFixed(1);
        log(`🎉 抠图完成! 耗时 ${elapsed}s, 结果大小: ${(blob.size / 1024).toFixed(1)} KB`, 'success');

        const url = URL.createObjectURL(blob);
        setResultUrl(url);
      } catch (err: any) {
        log(`❌ 抠图失败: ${err.message || err}`, 'error');
        if (err.stack) {
          log(`   Stack: ${err.stack.split('\n').slice(0, 3).join(' | ')}`, 'error');
        }
      } finally {
        setProcessing(false);
      }
    };

    reader.onerror = () => {
      log('❌ FileReader 读取失败!', 'error');
      setProcessing(false);
    };

    reader.readAsDataURL(file);
  }, [log]);

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
    e.target.value = '';
  }, [handleFile]);

  return (
    <div>
      {/* 上传区域 */}
      <div style={{
        border: '2px dashed var(--color-accent)',
        borderRadius: 12,
        padding: 24,
        textAlign: 'center',
        background: 'var(--color-surface)',
        marginBottom: 12,
      }}>
        <input
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          style={{ display: 'none' }}
          id="demo-file-input"
        />
        <label
          htmlFor="demo-file-input"
          style={{
            display: 'block',
            padding: '12px 24px',
            background: 'var(--color-accent)',
            color: '#fff',
            borderRadius: 8,
            fontSize: 14,
            fontWeight: 600,
            cursor: processing ? 'not-allowed' : 'pointer',
            opacity: processing ? 0.5 : 1,
            fontFamily: 'var(--font-family-body)',
          }}
        >
          {processing ? '⏳ 处理中...' : '📷 选择照片测试抠图'}
        </label>
        <p style={{
          color: 'var(--color-text-hint)',
          fontSize: 'var(--text-xs)',
          marginTop: 8,
          fontFamily: 'var(--font-family-body)',
        }}>
          选择一张奶茶照片，观察下方日志确认模型加载和推理过程
        </p>
      </div>

      {/* 进度 */}
      {progress && (
        <div style={{
          background: 'var(--color-surface)',
          borderRadius: 8,
          padding: 10,
          marginBottom: 12,
          border: '1px solid var(--color-divider)',
          fontSize: 12,
          fontFamily: 'monospace',
          color: 'var(--color-text-primary)',
        }}>
          {progress}
        </div>
      )}

      {/* 结果预览 */}
      {resultUrl && (
        <div style={{
          background: 'var(--color-surface)',
          borderRadius: 12,
          padding: 12,
          marginBottom: 12,
          textAlign: 'center',
          border: '2px solid #4caf50',
        }}>
          <p style={{ color: '#4caf50', fontWeight: 600, marginBottom: 8, fontSize: 13 }}>✅ 抠图成功!</p>
          <div style={{
            background: 'repeating-conic-gradient(#f0f0f0 0% 25%, #fff 0% 50%) 50% / 20px 20px',
            borderRadius: 8,
            padding: 12,
            display: 'inline-block',
          }}>
            <img
              src={resultUrl}
              alt="Cutout result"
              style={{
                maxWidth: 200,
                maxHeight: 200,
                objectFit: 'contain',
                filter: [
                  'drop-shadow(1px 0 0 #fff)',
                  'drop-shadow(-1px 0 0 #fff)',
                  'drop-shadow(0 1px 0 #fff)',
                  'drop-shadow(0 -1px 0 #fff)',
                  'drop-shadow(1px 1px 0 #fff)',
                  'drop-shadow(-1px -1px 0 #fff)',
                  'drop-shadow(1px -1px 0 #fff)',
                  'drop-shadow(-1px 1px 0 #fff)',
                  'drop-shadow(2px 4px 12px rgba(47,31,18,0.2))',
                ].join(' '),
              }}
            />
          </div>
          <p style={{
            color: 'var(--color-text-hint)',
            fontSize: 11,
            marginTop: 6,
            fontFamily: 'var(--font-family-body)',
          }}>
            ↑ 棋盘格 = 透明区域，白线描边沿轮廓
          </p>
        </div>
      )}

      {/* 日志区 */}
      <div style={{
        background: '#1e1e1e',
        borderRadius: 8,
        padding: 10,
        maxHeight: 200,
        overflowY: 'auto',
        fontFamily: 'monospace',
        fontSize: 11,
      }}>
        <div style={{ color: '#888', marginBottom: 6 }}>📋 运行日志:</div>
        {logs.length === 0 && (
          <div style={{ color: '#666' }}>等待操作...</div>
        )}
        {logs.map((entry, i) => (
          <div key={i} style={{
            color: entry.type === 'error' ? '#ff6b6b' : entry.type === 'success' ? '#4caf50' : '#aaa',
            marginBottom: 1,
            lineHeight: 1.4,
          }}>
            <span style={{ color: '#666' }}>[{entry.time}]</span> {entry.msg}
          </div>
        ))}
      </div>
    </div>
  );
}
