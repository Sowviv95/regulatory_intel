import { useState } from 'react';
import { TopNav } from './components/TopNav';
import { Dashboard } from './components/Dashboard';
import { SourceQueue } from './components/SourceQueue';
import { RegulationReview } from './components/RegulationReview';
import { RegulationReviewTable } from './components/RegulationReviewTable';
import { SearchExport } from './components/SearchExport';
import type { Screen } from './components/kiaa-tokens';

export default function App() {
  const [screen, setScreen] = useState<Screen>('dashboard');
  const [sourceId, setSourceId] = useState<number | undefined>(undefined);

  const navigateTo = (s: Screen, item?: string) => {
    setScreen(s);
    if (s === 'review-table' && item) setSourceId(Number(item));
  };

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      height: '100vh',
      overflow: 'hidden',
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
      fontSize: '16px',
      background: '#f0f4f8',
    }}>
      <TopNav current={screen} onNavigate={s => navigateTo(s)} />
      <main style={{ flex: 1, overflow: 'auto', minWidth: 0 }}>
        {screen === 'dashboard' && <Dashboard onNavigate={navigateTo} />}
        {screen === 'source-queue' && <SourceQueue onNavigate={navigateTo} />}
        {screen === 'regulation-review' && <RegulationReview />}
        {screen === 'review-table' && <RegulationReviewTable initialSourceId={sourceId} />}
        {screen === 'search-export' && <SearchExport />}
      </main>
    </div>
  );
}
