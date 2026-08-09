import { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { MonthHeader, MonthPicker } from '../components/header';
import { BottomNavBar } from '../components/sidebar';
import { DayCell, MonthlySummary, HistoricalFavorite, DayDetailModal } from '../components/card';
import type { IFavoriteEntry, IReceiptData } from '../components/card';
import {
  getTeasForDay,
  getMonthStats,
  getMonthFavorites,
  getHistoryFavorites,
  subscribeRecords,
  type ITeaRecord,
} from '../stores/recordStore';
import { toast } from '../components/modal';
import '../components/header/Header.css';
import '../components/sidebar/BottomNavBar.css';
import '../components/card/DayCell.css';
import '../components/card/TeaThumb.css';
import '../components/card/TeaStack.css';
import '../components/card/MonthlySummary.css';
import '../components/card/HistoricalFavorite.css';
import '../components/card/DayDetailModal.css';

/** 生成当月日历数据 */
function buildCalendarData(year: number, month: number, todayYear: number, todayMonth: number, todayDay: number) {
  const firstDay = new Date(year, month - 1, 1).getDay();
  const daysInMonth = new Date(year, month, 0).getDate();

  const cells: Array<{ date: number; isToday: boolean; isCurrentMonth: boolean } | null> = [];

  for (let i = 0; i < firstDay; i++) {
    cells.push(null);
  }

  for (let d = 1; d <= daysInMonth; d++) {
    cells.push({
      date: d,
      isToday: year === todayYear && month === todayMonth && d === todayDay,
      isCurrentMonth: true,
    });
  }

  return { cells, daysInMonth, firstDay };
}

/** 将 ITeaRecord 转为 DayCell 需要的格式 */
function toDayCellTeas(records: ITeaRecord[]) {
  return records.map(r => ({
    id: r.id,
    cutoutImage: r.cutoutDataUrl || '',
  }));
}

/** ITeaRecord → IReceiptData（DayDetailModal 用） */
function toReceiptData(r: ITeaRecord): IReceiptData {
  const [y, m, d] = r.date.split('-');
  return {
    id: r.id,
    date: `${y}.${String(m).padStart(2, '0')}.${String(d).padStart(2, '0')}`,
    name: r.name,
    brand: r.brand,
    brandKey: r.brandKey,
    store: r.store,
    cupSize: r.cupSize,
    sweetness: r.sweetness,
    temperature: r.temperature,
    toppings: r.toppings,
    price: r.price,
    rating: r.rating,
    moodText: r.moodText,
    hasVoice: r.hasVoice,
    audioDataUrl: r.audioDataUrl,
    cutoutImage: r.cutoutDataUrl,
    isFavorite: r.isFavorite,
  };
}

const WEEKDAYS = ['日', '一', '二', '三', '四', '五', '六'];

export function CalendarPage() {
  const navigate = useNavigate();
  const today = new Date();
  const todayYear = today.getFullYear();
  const todayMonth = today.getMonth() + 1;
  const todayDay = today.getDate();

  const [viewYear, setViewYear] = useState(todayYear);
  const [viewMonth, setViewMonth] = useState(todayMonth);
  const [pickerOpen, setPickerOpen] = useState(false);

  // 日期详情模态框
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  // ── 飞入动画（从撕小票页导航过来） ──
  const location = useLocation();
  const [flyInRecord, setFlyInRecord] = useState<ITeaRecord | null>(null);

  // 检测导航状态中的飞入记录
  useEffect(() => {
    const state = location.state as { flyIn?: ITeaRecord } | null;
    if (state?.flyIn) {
      const record = state.flyIn;
      setFlyInRecord(record);
      // 切换到记录所在月份，确保目标日历格可见
      const [y, m] = record.date.split('-').map(Number);
      setViewYear(y);
      setViewMonth(m);
      // 滚动到顶部确保日历可见
      window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
      // 清除导航状态，避免刷新时重复触发
      navigate('.', { replace: true, state: {} });
    }
  }, [location.state, navigate]);

  // 飞入动画完成后的清理
  useEffect(() => {
    if (!flyInRecord) return;
    const timer = setTimeout(() => {
      setFlyInRecord(null);
      setFlyTargets(null);
      toast.success('奶茶记录已保存！🧋');
    }, 2800);
    return () => clearTimeout(timer);
  }, [flyInRecord]);

  // ── 日历网格 ref（用于飞入动画定位测量） ──
  const gridWrapperRef = useRef<HTMLDivElement>(null);

  // ── 飞行目标位置（DOM 测量，精准匹配实际渲染） ──
  const [flyTargets, setFlyTargets] = useState<{
    calendar: { x: number; y: number };
    collection: { x: number; y: number };
  } | null>(null);

  useEffect(() => {
    if (!flyInRecord) return;

    // 双 RAF：确保 React commit + 浏览器 layout/paint 都已完成再测量
    let raf1: number;
    let raf2: number;

    raf1 = requestAnimationFrame(() => {
      raf2 = requestAnimationFrame(() => {
        const dateKey = flyInRecord.date; // YYYY-MM-DD
        const cellEl = document.querySelector(`[data-date="${dateKey}"]`);

        if (cellEl) {
          const rect = cellEl.getBoundingClientRect();
          setFlyTargets({
            calendar: { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 },
            collection: { x: window.innerWidth - 56, y: 32 },
          });
        } else {
          // fallback：DOM 未找到时用网格容器位置精确计算（含 padding/gap）
          const vw = window.innerWidth;
          const [year, month, day] = flyInRecord.date.split('-').map(Number);
          const firstDay = new Date(year, month - 1, 1).getDay();
          const dayIndex = day - 1;
          const col = (firstDay + dayIndex) % 7;
          const row = Math.floor((firstDay + dayIndex) / 7);

          const gridEl = gridWrapperRef.current;
          // 默认值（用于 gridEl 为 null 的极端情况）
          let gridLeft = 24;   // margin(16) + border(1.5) + padding(8) ≈ 24
          let gridTop = 140;
          let cellW = 43;

          if (gridEl) {
            const gridRect = gridEl.getBoundingClientRect();
            const gridPadding = 8; // var(--spacing-2)
            const colGap = 4;      // var(--spacing-1)
            const contentWidth = gridRect.width - gridPadding * 2;
            cellW = (contentWidth - colGap * 6) / 7;
            gridLeft = gridRect.left + gridPadding;
            gridTop = gridRect.top + gridPadding;
          }

          setFlyTargets({
            calendar: {
              x: gridLeft + col * (cellW + 4) + cellW / 2,
              y: gridTop + row * (cellW + 4) + cellW / 2,
            },
            collection: { x: vw - 56, y: 32 },
          });
        }
      });
    });

    return () => {
      cancelAnimationFrame(raf1);
      cancelAnimationFrame(raf2);
    };
  }, [flyInRecord, viewYear, viewMonth]);

  // 订阅数据变化
  const [tick, setTick] = useState(0);
  useEffect(() => {
    return subscribeRecords(() => setTick(t => t + 1));
  }, []);

  const isCurrentMonth = viewYear === todayYear && viewMonth === todayMonth;

  const calendar = useMemo(
    () => buildCalendarData(viewYear, viewMonth, todayYear, todayMonth, todayDay),
    [viewYear, viewMonth, todayYear, todayMonth, todayDay],
  );

  // 从 recordStore 读取数据
  const monthStats = useMemo(() => getMonthStats(viewYear, viewMonth), [viewYear, viewMonth, tick]);
  const monthFavorites = useMemo(() => getMonthFavorites(viewYear, viewMonth), [viewYear, viewMonth, tick]);
  const historyFavorites = useMemo(() => getHistoryFavorites(), [tick]);

  // 按日期索引奶茶（飞入动画播放期间隐藏对应贴纸，避免动画前就出现）
  const teasByDay = useMemo(() => {
    const map: Record<number, ReturnType<typeof toDayCellTeas>> = {};
    for (let d = 1; d <= calendar.daysInMonth; d++) {
      const records = getTeasForDay(viewYear, viewMonth, d);
      // 飞入动画播放中：过滤掉正在飞的记录，动画完成后才显示
      const visible = flyInRecord
        ? records.filter(r => r.id !== flyInRecord.id)
        : records;
      if (visible.length > 0) {
        map[d] = toDayCellTeas(visible);
      }
    }
    return map;
  }, [viewYear, viewMonth, calendar.daysInMonth, tick, flyInRecord]);

  const handleDateSelect = useCallback((year: number, month: number) => {
    setViewYear(year);
    setViewMonth(month);
    setPickerOpen(false);
  }, []);

  const handleBackToToday = useCallback(() => {
    setViewYear(todayYear);
    setViewMonth(todayMonth);
  }, [todayYear, todayMonth]);

  // 左右滑动切换月份
  const touchStartX = useRef(0);
  const touchStartY = useRef(0);

  const changeMonth = useCallback((delta: number) => {
    const d = new Date(viewYear, viewMonth - 1 + delta, 1);
    setViewYear(d.getFullYear());
    setViewMonth(d.getMonth() + 1);
  }, [viewYear, viewMonth]);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
  }, []);

  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    const dx = e.changedTouches[0].clientX - touchStartX.current;
    const dy = e.changedTouches[0].clientY - touchStartY.current;
    // 仅水平滑动（排除垂直滚动）
    if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 50) {
      changeMonth(dx > 0 ? -1 : 1);
    }
  }, [changeMonth]);

  const isFutureDay = useCallback((date: number) => {
    if (viewYear > todayYear) return true;
    if (viewYear === todayYear && viewMonth > todayMonth) return true;
    if (viewYear === todayYear && viewMonth === todayMonth && date > todayDay) return true;
    return false;
  }, [viewYear, viewMonth, todayYear, todayMonth, todayDay]);

  const handleDayPress = useCallback((date: number) => {
    setSelectedDay(date);
    setModalOpen(true);
  }, []);

  // 当前选中日期的记录
  const selectedDayReceipts = useMemo(() => {
    if (selectedDay === null) return [];
    return getTeasForDay(viewYear, viewMonth, selectedDay).map(toReceiptData);
  }, [viewYear, viewMonth, selectedDay, tick]);

  // 本月最爱 → IFavoriteEntry[]
  const currentFavorites: IFavoriteEntry[] = monthFavorites.map(f => ({
    year: viewYear, month: viewMonth, name: f.name, cutout: f.cutout, count: f.count,
  }));

  return (
    <div style={{ minHeight: '100dvh', display: 'flex', flexDirection: 'column', paddingBottom: 'calc(60px + env(safe-area-inset-bottom, 0px))' }}>
      <MonthHeader
        year={viewYear}
        month={viewMonth}
        day={todayDay}
        isCurrentMonth={isCurrentMonth}
        collectionCount={monthStats.cupCount}
        onDatePickerOpen={() => setPickerOpen(true)}
        onBackToToday={handleBackToToday}
        onCollectionClick={() => navigate('/list')}
      />

      {/* 星期标题行 + 日历网格（可滑动切换月份）— 框起来 */}
      <div
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        style={{
          margin: '0 var(--spacing-4)',
          border: '1.5px dashed var(--color-tea-300)',
          borderRadius: 'var(--radius-lg)',
          background: '#ffffff',
          overflow: 'hidden',
        }}
      >
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(7, 1fr)',
        background: '#ffffff',
        padding: 'var(--spacing-2) var(--spacing-2) 0',
      }}>
        {WEEKDAYS.map(w => (
          <div
            key={w}
            style={{
              textAlign: 'center',
              padding: 'var(--spacing-1) 0',
              fontFamily: 'var(--font-family-display)',
              fontSize: 'var(--text-sm)',
              fontWeight: 'var(--font-weight-bold)',
              color: 'var(--color-text-primary)',
            }}
          >
            {w}
          </div>
        ))}
      </div>

      {/* 日历网格 */}
      <div
        ref={gridWrapperRef}
        style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(7, 1fr)',
        alignContent: 'start',
        gap: 'var(--spacing-1)',
        padding: 'var(--spacing-2)',
        background: '#ffffff',
      }}>
        {calendar.cells.map((cell, i) =>
          cell === null ? (
            <div key={`empty-${i}`} style={{ aspectRatio: '1' }} />
          ) : (
            <DayCell
              key={cell.date}
              date={cell.date}
              isToday={cell.isToday}
              isCurrentMonth={cell.isCurrentMonth}
              teas={teasByDay[cell.date]}
              onPress={() => handleDayPress(cell.date)}
              dataDate={`${viewYear}-${String(viewMonth).padStart(2,'0')}-${String(cell.date).padStart(2,'0')}`}
            />
          ),
        )}
      </div>
      </div>{/* end 滑动切换月份 wrapper */}

      {/* 月度统计 + 本月最爱（滚动区） */}
      <div style={{
        flex: 1,
        overflow: 'auto',
        padding: 'var(--spacing-4)',
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--spacing-4)',
      }}>
        <MonthlySummary
          month={`${viewYear}-${String(viewMonth).padStart(2, '0')}`}
          cupCount={monthStats.cupCount}
          shopCount={monthStats.shopCount}
          totalAmount={monthStats.totalAmount}
          topCutouts={monthStats.topCutouts}
        />
        <HistoricalFavorite
          currentFavorites={currentFavorites}
          history={historyFavorites}
        />
      </div>

      {/* 年月选择器弹层 */}
      <MonthPicker
        year={viewYear}
        month={viewMonth}
        isOpen={pickerOpen}
        onSelect={handleDateSelect}
        onClose={() => setPickerOpen(false)}
      />

      {/* 日期详情模态框 */}
      <DayDetailModal
        date={selectedDay ? `${viewYear}年${viewMonth}月${selectedDay}日` : ''}
        dateKey={selectedDay ? `${viewYear}-${String(viewMonth).padStart(2, '0')}-${String(selectedDay).padStart(2, '0')}` : undefined}
        receipts={selectedDayReceipts}
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        isFutureDate={selectedDay ? isFutureDay(selectedDay) : false}
        isToday={selectedDay === todayDay && isCurrentMonth}
      />

      {/* 底部导航栏 */}
      <BottomNavBar />

      {/* ── 飞入动画覆盖层（从撕小票页导航过来时播放） ── */}
      <AnimatePresence>
        {flyInRecord && flyTargets && (
          <motion.div
            style={{
              position: 'fixed',
              inset: 0,
              zIndex: 2000,
              pointerEvents: 'none',
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
{/* 收集盒起点标记（右上角） */}
            <motion.div
              style={{
                position: 'absolute',
                left: flyTargets.collection.x,
                top: flyTargets.collection.y,
                transform: 'translate(-50%, -50%)',
                zIndex: 2001,
              }}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.4, delay: 0.6 }}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--color-tea-600)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 8l2-4h12l2 4" />
                <rect x="3" y="8" width="18" height="13" rx="1.5" />
                <line x1="9" y1="13" x2="15" y2="13" />
                <line x1="12" y1="8" x2="12" y2="21" />
              </svg>
            </motion.div>

            {/* 奶茶抠图 — 飞向日历格（使用 left/top 像素定位，消除 transform 链误差） */}
            <motion.img
              src={flyInRecord.cutoutDataUrl}
              alt={flyInRecord.name}
              style={{
                position: 'absolute',
                width: 120,
                height: 120,
                objectFit: 'contain',
                zIndex: 2002,
                left: '50%',
                top: '50%',
              }}
              initial={{
                x: -60,
                y: -60,
                scale: 1,
                rotate: 0,
                opacity: 1,
              }}
              animate={{
                x: flyTargets.calendar.x - window.innerWidth / 2 - 60,
                y: flyTargets.calendar.y - window.innerHeight / 2 - 60,
                scale: 0.24,
                rotate: -6,
                opacity: 0.95,
              }}
              transition={{
                duration: 2.0,
                delay: 0.1,
                ease: [0.25, 0.1, 0.25, 1],
              }}
            />

            {/* 小票 — 飞向收集盒 */}
            <motion.div
              style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                width: 160,
                background: '#ffffff',
                borderRadius: 8,
                padding: 12,
                boxShadow: '0 8px 32px rgba(47,31,18,0.2)',
                zIndex: 2002,
                fontFamily: 'var(--font-family-receipt)',
                textAlign: 'center' as const,
              }}
              initial={{
                x: -80,
                y: -40,
                scale: 1,
                rotate: 0,
                opacity: 1,
              }}
              animate={{
                x: flyTargets.collection.x - window.innerWidth / 2 - 80,
                y: flyTargets.collection.y - window.innerHeight / 2 - 40,
                scale: 0.15,
                rotate: -15,
                opacity: 0.3,
              }}
              transition={{
                duration: 1.5,
                delay: 0.05,
                ease: [0.4, 0, 0.2, 1],
              }}
            >
              <div style={{ fontSize: 10, fontWeight: 'bold', color: 'var(--color-text-primary)' }}>
                {flyInRecord.name}
              </div>
              <div style={{ fontSize: 8, color: 'var(--color-text-hint)', marginTop: 2 }}>
                {formatDateForReceipt(flyInRecord.date)}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/** 日期格式化（飞入动画小票用） */
function formatDateForReceipt(dateStr: string): string {
  const [y, m, d] = dateStr.split('-');
  return `${y}.${String(m).padStart(2, '0')}.${String(d).padStart(2, '0')}`;
}
