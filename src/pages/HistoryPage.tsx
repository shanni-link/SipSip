import { memo, useMemo, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ListHeader } from '../components/header';
import { TeaThumb } from '../components/card';
import { getAllFavorites, subscribeRecords } from '../stores/recordStore';
import '../components/header/Header.css';
import '../components/card/TeaThumb.css';
import '../components/card/HistoryPage.css';

function formatDate(dateStr: string): string {
  const [y, m, d] = dateStr.split('-');
  return `${Number(y)}年${Number(m)}月${Number(d)}日`;
}

export const HistoryPage = memo(function HistoryPage() {
  const navigate = useNavigate();

  const [tick, setTick] = useState(0);
  useEffect(() => {
    return subscribeRecords(() => setTick(t => t + 1));
  }, []);

  const favorites = useMemo(() => getAllFavorites(), [tick]);

  if (favorites.length === 0) {
    return (
      <div style={{ minHeight: '100dvh', display: 'flex', flexDirection: 'column' }}>
        <ListHeader onBack={() => navigate('/')} title="收藏详情" />
        <div style={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'var(--color-text-hint)',
          fontFamily: 'var(--font-family-display)',
          fontSize: 'var(--text-base)',
        }}>
          <p>还没有收藏记录哦</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100dvh', display: 'flex', flexDirection: 'column' }}>
      <ListHeader onBack={() => navigate('/')} title="收藏详情" />

      <div style={{
        flex: 1,
        overflow: 'auto',
        padding: 'var(--spacing-4)',
      }}>
        <div className="history-list">
          {favorites.map((entry, i) => (
            <div key={entry.id} className="history-list__item">
              <div className="history-list__thumb">
                <TeaThumb src={entry.cutoutDataUrl} alt={entry.name} index={i} />
              </div>
              <div className="history-list__info">
                <span className="history-list__name">{entry.name}</span>
                <span className="history-list__date">{formatDate(entry.date)}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
});
