import { BrowserRouter, Routes, Route } from 'react-router';
import { TopNav } from './components/TopNav';
import { Dashboard } from './components/Dashboard';
import { SourceQueue } from './components/SourceQueue';
import { RegulationReview } from './components/RegulationReview';
import { RegulationReviewTable } from './components/RegulationReviewTable';
import { SearchExport } from './components/SearchExport';
import { NotFound } from './components/NotFound';
import { ErrorBoundary } from './components/ErrorBoundary';

export default function App() {
  return (
    <ErrorBoundary>
    <BrowserRouter>
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        overflow: 'hidden',
        fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
        fontSize: '16px',
        background: '#f0f4f8',
      }}>
        <TopNav />
        <main style={{ flex: 1, overflow: 'auto', minWidth: 0 }}>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/sources" element={<SourceQueue />} />
            <Route path="/sources/:sourceId" element={<RegulationReviewTable />} />
            <Route path="/regulations" element={<RegulationReviewTable />} />
            <Route path="/regulations/:regulationId" element={<RegulationReview />} />
            <Route path="/search" element={<SearchExport />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
    </ErrorBoundary>
  );
}
