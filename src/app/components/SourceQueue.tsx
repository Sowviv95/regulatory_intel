import { useState, useCallback, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router';
import {
  Play, RotateCcw, EyeOff, ArrowRight, RefreshCw, Loader, CheckCircle, AlertCircle,
  Search, X, ChevronDown, ChevronUp, Eye, FileText, Clock, Hash,
} from 'lucide-react';
import { K, statusStyle } from './kiaa-tokens';
import { Badge } from './KBadge';
import { LoadingState, ErrorState } from './StateViews';
import { getSources, updateSourceStatus, bulkUpdateStatus } from '../../services/sources';
import { useApi } from '../../services/useApi';
import type { Source, SourceStatus, ProcessingStage } from '../../types';

const ALL_TABS: SourceStatus[] = ['New', 'Processing', 'Ready for Review', 'Irrelevant'];

// ---------------------------------------------------------------------------
// Small sub-components
// ---------------------------------------------------------------------------

function StageChip({ stage }: { stage: ProcessingStage }) {
  const map: Record<ProcessingStage, { color: string; bg: string }> = {
    'Awaiting Extraction': { color: '#6b7280', bg: 'rgba(107,114,128,0.08)' },
    Translating:           { color: '#2563eb', bg: 'rgba(59,130,246,0.08)'  },
    'AI Extraction':       { color: '#7c3aed', bg: 'rgba(124,58,237,0.08)'  },
    'Quality Check':       { color: '#d97706', bg: 'rgba(245,158,11,0.08)'  },
    'Analyst Review':      { color: '#16a34a', bg: 'rgba(22,163,74,0.08)'   },
    Discarded:             { color: '#9ca3af', bg: 'rgba(156,163,175,0.08)' },
  };
  const s = map[stage];
  return (
    <span style={{ fontSize: '11px', fontWeight: 500, padding: '2px 8px', borderRadius: '4px', background: s.bg, color: s.color, whiteSpace: 'nowrap' }}>
      {stage}
    </span>
  );
}

function ActionBtn({ icon, label, accent, onClick }: { icon: React.ReactNode; label: string; accent?: boolean; onClick: () => void }) {
  return (
    <button onClick={e => { e.stopPropagation(); onClick(); }} style={{
      display: 'flex', alignItems: 'center', gap: '4px', padding: '4px 10px',
      background: accent ? K.accentSubtle : '#f8fafc',
      border: `1px solid ${accent ? K.accentBorder : K.border}`,
      borderRadius: '5px', fontSize: '11px', fontWeight: 600,
      color: accent ? K.accentText : K.textSecondary,
      cursor: 'pointer', fontFamily: 'inherit', whiteSpace: 'nowrap',
    }}>
      {icon} {label}
    </button>
  );
}

function FilterDropdown({ label, value, options, onChange }: {
  label: string; value: string; options: string[]; onChange: (v: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const h = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);
  const active = value !== 'All';
  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <button onClick={() => setOpen(o => !o)} style={{
        display: 'flex', alignItems: 'center', gap: '4px', padding: '5px 10px',
        background: active ? K.accentSubtle : '#fff',
        border: `1px solid ${active ? K.accentBorder : K.inputBorder}`,
        borderRadius: '6px', cursor: 'pointer', fontSize: '12px', fontWeight: 500,
        color: active ? K.accentText : K.textSecondary, fontFamily: 'inherit', whiteSpace: 'nowrap',
      }}>
        <span style={{ color: active ? K.accentText : K.textFaint, fontWeight: 400 }}>{label}:</span>
        <span>{value}</span>
        <ChevronDown size={10} />
        {active && (
          <span onClick={e => { e.stopPropagation(); onChange('All'); }} style={{ display: 'flex', cursor: 'pointer', color: K.accentText }}><X size={10} /></span>
        )}
      </button>
      {open && (
        <div style={{ position: 'absolute', top: 'calc(100% + 4px)', left: 0, zIndex: 100, background: '#fff', border: `1px solid ${K.border}`, borderRadius: '8px', boxShadow: '0 8px 24px rgba(0,0,0,0.09)', minWidth: '170px', overflow: 'hidden', maxHeight: '260px', overflowY: 'auto' }}>
          {['All', ...options].map(opt => (
            <button key={opt} onClick={() => { onChange(opt); setOpen(false); }} style={{
              display: 'block', width: '100%', textAlign: 'left', padding: '7px 12px',
              background: value === opt ? K.accentSubtle : 'transparent',
              color: value === opt ? K.accentText : K.textSecondary,
              fontSize: '12px', fontWeight: value === opt ? 600 : 400,
              border: 'none', cursor: 'pointer', fontFamily: 'inherit',
            }}>{opt}</button>
          ))}
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Detail panel
// ---------------------------------------------------------------------------

function DetailPanel({ source, onClose }: { source: Source; onClose: () => void }) {
  const ss = statusStyle(source.status);
  return (
    <div style={{ position: 'fixed', top: 0, right: 0, bottom: 0, width: '380px', background: '#fff', borderLeft: `1px solid ${K.border}`, boxShadow: '-8px 0 32px rgba(0,0,0,0.08)', zIndex: 300, display: 'flex', flexDirection: 'column', fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif" }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', borderBottom: `1px solid ${K.border}`, flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <FileText size={14} style={{ color: K.textMuted }} />
          <span style={{ fontSize: '13px', fontWeight: 700, color: K.textPrimary }}>Source Details</span>
        </div>
        <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: K.textFaint, padding: '4px', display: 'flex' }}><X size={16} /></button>
      </div>
      <div style={{ flex: 1, overflow: 'auto', padding: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
          <span style={{ fontSize: '22px' }}>{source.flag}</span>
          <div>
            <div style={{ fontSize: '14px', fontWeight: 600, color: K.textPrimary, lineHeight: 1.3 }}>{source.title}</div>
            <div style={{ fontSize: '11px', color: K.textMuted, marginTop: '2px' }}>{source.source}</div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '6px', marginBottom: '20px' }}>
          <Badge label={source.status} style={ss} />
          <StageChip stage={source.stage} />
        </div>

        {source.failureMessage && (
          <div style={{ padding: '10px 12px', background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.15)', borderRadius: '7px', marginBottom: '16px' }}>
            <div style={{ fontSize: '10px', fontWeight: 600, color: '#dc2626', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px' }}>Failure</div>
            <div style={{ fontSize: '12px', color: '#b91c1c', lineHeight: 1.5 }}>{source.failureMessage}</div>
          </div>
        )}

        {[
          { label: 'Country', value: `${source.flag} ${source.country}` },
          { label: 'Language', value: source.language },
          { label: 'Document Type', value: source.docType },
          { label: 'Discovered', value: source.discovered },
          { label: 'Regulations Extracted', value: String(source.regulationCount) },
          { label: 'Review Required', value: String(source.reviewRequiredCount) },
          { label: 'Processing Started', value: source.startedAt ?? '\u2014' },
          { label: 'Processing Completed', value: source.completedAt ?? '\u2014' },
        ].map(item => (
          <div key={item.label} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: `1px solid ${K.borderSubtle}` }}>
            <span style={{ fontSize: '12px', color: K.textMuted }}>{item.label}</span>
            <span style={{ fontSize: '12px', fontWeight: 500, color: K.textPrimary, textAlign: 'right', maxWidth: '200px' }}>{item.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export function SourceQueue() {
  const navigate = useNavigate();

  // Filters
  const [activeTab, setActiveTab] = useState<SourceStatus | 'All'>('All');
  const [query, setQuery] = useState('');
  const [countryFilter, setCountryFilter] = useState('All');
  const [docTypeFilter, setDocTypeFilter] = useState('All');
  const [sortBy, setSortBy] = useState<'discovered' | 'country' | null>(null);
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');

  // Selection
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [detailSource, setDetailSource] = useState<Source | null>(null);

  // Load all sources from API, filter client-side for tabs/search
  const { data: allRows, loading, error, reload } = useApi(
    () => getSources({ country: countryFilter, docType: docTypeFilter, q: query || undefined }),
    [query, countryFilter, docTypeFilter],
  );

  if (loading) return <LoadingState message="Loading sources\u2026" />;
  if (error || !allRows) return <ErrorState title="Failed to load sources" message={error ?? undefined} onRetry={reload} />;

  // Tab counts from full dataset
  const counts: Record<string, number> = { New: 0, Processing: 0, 'Ready for Review': 0, Irrelevant: 0 };
  for (const r of allRows) if (r.status in counts) counts[r.status]++;

  // Tab filter
  let filtered = activeTab === 'All' ? allRows : allRows.filter(r => r.status === activeTab);

  // Client-side sort
  if (sortBy) {
    const dir = sortDir === 'desc' ? -1 : 1;
    filtered = [...filtered].sort((a, b) => {
      const av = a[sortBy]; const bv = b[sortBy];
      return av < bv ? -1 * dir : av > bv ? 1 * dir : 0;
    });
  }

  const activeJobs = counts['Processing'];
  const readyForReview = counts['Ready for Review'];
  const failures = allRows.filter(r => r.failureMessage).length;

  // Async actions
  const act = async (fn: () => Promise<unknown>) => {
    await fn();
    setSelected(new Set());
    reload();
  };
  const startProcessing = (id: number) => act(() => updateSourceStatus(id, 'Processing', 'Translating'));
  const markIrrelevant = (id: number) => act(() => updateSourceStatus(id, 'Irrelevant', 'Discarded'));
  const retry = (id: number) => act(() => updateSourceStatus(id, 'Processing', 'AI Extraction'));
  const restore = (id: number) => act(() => updateSourceStatus(id, 'New', 'Awaiting Extraction'));
  const processAll = () => act(async () => {
    const newSources = filtered.filter(s => s.status === 'New');
    await Promise.all(newSources.map(s => updateSourceStatus(s.id, 'Processing', 'Translating')));
  });
  const bulkProcess = () => act(() => bulkUpdateStatus([...selected], 'Processing', 'Translating'));
  const bulkIrrelevant = () => act(() => bulkUpdateStatus([...selected], 'Irrelevant', 'Discarded'));

  // Selection helpers
  const toggleRow = (id: number) => setSelected(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });
  const toggleAll = () => {
    if (selected.size === filtered.length && filtered.length > 0) setSelected(new Set());
    else setSelected(new Set(filtered.map(r => r.id)));
  };

  // Sort toggle
  const toggleSort = (col: 'discovered' | 'country') => {
    if (sortBy === col) {
      if (sortDir === 'desc') setSortDir('asc');
      else { setSortBy(null); setSortDir('desc'); }
    } else {
      setSortBy(col);
      setSortDir('desc');
    }
  };
  const SortIcon = ({ col }: { col: 'discovered' | 'country' }) => {
    if (sortBy !== col) return null;
    return sortDir === 'asc' ? <ChevronUp size={10} /> : <ChevronDown size={10} />;
  };

  const totalCount = Object.values(counts).reduce((a, b) => a + b, 0);
  const hasFilters = query || countryFilter !== 'All' || docTypeFilter !== 'All';

  const thStyle: React.CSSProperties = {
    padding: '9px 14px', fontSize: '11px', fontWeight: 600, color: K.textMuted,
    textTransform: 'uppercase', letterSpacing: '0.05em', textAlign: 'left',
    borderBottom: `1px solid ${K.border}`, background: '#fafafa', whiteSpace: 'nowrap',
  };
  const tdStyle: React.CSSProperties = {
    padding: '11px 14px', fontSize: '12px', color: K.textSecondary,
    borderBottom: `1px solid ${K.borderSubtle}`, verticalAlign: 'middle',
  };

  return (
    <div style={{ padding: '24px', background: K.pageBg, minHeight: '100vh', fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif" }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '20px' }}>
        <div>
          <h1 style={{ fontSize: '20px', fontWeight: 800, color: K.textPrimary, margin: 0 }}>Source Queue</h1>
          <p style={{ fontSize: '12px', color: K.textMuted, marginTop: '3px' }}>
            Intake and processing pipeline &middot; {totalCount} sources &middot; Last updated Jul 15, 2026 09:14
          </p>
        </div>
        <div style={{ display: 'flex', gap: '7px' }}>
          {selected.size > 0 && (
            <>
              <ActionBtn icon={<Play size={11} />} label={`Process (${selected.size})`} accent onClick={bulkProcess} />
              <ActionBtn icon={<EyeOff size={11} />} label={`Irrelevant (${selected.size})`} onClick={bulkIrrelevant} />
            </>
          )}
          <button onClick={processAll} style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '7px 14px', background: K.accent, border: 'none', borderRadius: '6px', fontSize: '12px', fontWeight: 600, color: '#fff', cursor: 'pointer', fontFamily: 'inherit' }}>
            <Play size={12} /> Process All New
          </button>
          <button onClick={refresh} style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '7px 13px', background: '#fff', border: `1px solid ${K.border}`, borderRadius: '6px', fontSize: '12px', fontWeight: 500, color: K.textSecondary, cursor: 'pointer', fontFamily: 'inherit' }}>
            <RefreshCw size={13} /> Refresh
          </button>
        </div>
      </div>

      {/* Processing summary */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginBottom: '20px' }}>
        {[
          { label: 'Active Jobs',      value: activeJobs,    icon: <Loader size={14} color="#7c3aed" />,      accent: '#7c3aed', bg: 'rgba(124,58,237,0.07)' },
          { label: 'Ready for Review',  value: readyForReview, icon: <CheckCircle size={14} color={K.accent} />, accent: K.accent,  bg: K.accentSubtle },
          { label: 'Failures',          value: failures,      icon: <AlertCircle size={14} color="#dc2626" />,   accent: '#dc2626', bg: 'rgba(239,68,68,0.07)' },
        ].map(card => (
          <div key={card.label} style={{ display: 'flex', alignItems: 'center', gap: '14px', background: '#fff', border: `1px solid ${K.border}`, borderRadius: '9px', padding: '14px 18px', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: card.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              {card.icon}
            </div>
            <div>
              <div style={{ fontSize: '22px', fontWeight: 700, color: card.accent, lineHeight: 1 }}>{card.value}</div>
              <div style={{ fontSize: '11px', color: K.textMuted, marginTop: '3px' }}>{card.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Search + filters */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px', flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: '1 1 220px', maxWidth: '320px' }}>
          <Search size={13} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: K.textFaint }} />
          <input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search sources\u2026"
            style={{ width: '100%', padding: '7px 30px 7px 30px', background: '#fff', border: `1px solid ${K.inputBorder}`, borderRadius: '7px', fontSize: '12px', color: K.textPrimary, outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box' }} />
          {query && <button onClick={() => setQuery('')} style={{ position: 'absolute', right: '8px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: K.textFaint, padding: 0, display: 'flex' }}><X size={12} /></button>}
        </div>
        <FilterDropdown label="Country" value={countryFilter} options={countries} onChange={setCountryFilter} />
        <FilterDropdown label="Type" value={docTypeFilter} options={docTypes} onChange={setDocTypeFilter} />
        {hasFilters && (
          <button onClick={() => { setQuery(''); setCountryFilter('All'); setDocTypeFilter('All'); }} style={{ display: 'flex', alignItems: 'center', gap: '3px', padding: '5px 8px', border: 'none', borderRadius: '5px', background: 'transparent', color: K.textMuted, fontSize: '11px', cursor: 'pointer', fontFamily: 'inherit' }}>
            <X size={10} /> Clear
          </button>
        )}
      </div>

      {/* Status tabs */}
      <div style={{ display: 'flex', gap: '4px', marginBottom: '14px' }}>
        {/* All tab */}
        <button onClick={() => setActiveTab('All')}
          style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 14px', borderRadius: '7px', border: `1px solid ${activeTab === 'All' ? K.accentBorder : K.border}`, background: activeTab === 'All' ? K.accentSubtle : '#fff', color: activeTab === 'All' ? K.accentText : K.textMuted, fontSize: '12px', fontWeight: activeTab === 'All' ? 600 : 400, cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.12s' }}>
          All
          <span style={{ fontSize: '11px', fontWeight: 600, padding: '0 5px', borderRadius: '9px', background: activeTab === 'All' ? 'rgba(0,0,0,0.08)' : K.progressBg, color: activeTab === 'All' ? K.accentText : K.textFaint }}>
            {totalCount}
          </span>
        </button>
        {ALL_TABS.map(tab => {
          const active = activeTab === tab;
          const ss = statusStyle(tab);
          return (
            <button key={tab} onClick={() => setActiveTab(tab)}
              style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 14px', borderRadius: '7px', border: `1px solid ${active ? ss.border : K.border}`, background: active ? ss.bg : '#fff', color: active ? ss.text : K.textMuted, fontSize: '12px', fontWeight: active ? 600 : 400, cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.12s' }}>
              {tab}
              <span style={{ fontSize: '11px', fontWeight: 600, padding: '0 5px', borderRadius: '9px', background: active ? 'rgba(0,0,0,0.08)' : K.progressBg, color: active ? ss.text : K.textFaint }}>
                {counts[tab]}
              </span>
            </button>
          );
        })}
      </div>

      {/* Results count */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
        <span style={{ fontSize: '12px', color: K.textFaint }}>
          {filtered.length === totalCount ? `${totalCount} sources` : `${filtered.length} of ${totalCount} sources`}
          {selected.size > 0 && ` \u00B7 ${selected.size} selected`}
        </span>
      </div>

      {/* Table */}
      <div style={{ background: '#fff', border: `1px solid ${K.border}`, borderRadius: '10px', overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th style={{ ...thStyle, width: '38px' }}>
                <input type="checkbox" checked={selected.size === filtered.length && filtered.length > 0} onChange={toggleAll} style={{ cursor: 'pointer' }} />
              </th>
              <th style={{ ...thStyle, cursor: 'pointer' }} onClick={() => toggleSort('country')}>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '3px' }}>Country <SortIcon col="country" /></span>
              </th>
              <th style={thStyle}>Source / Title</th>
              <th style={thStyle}>Language</th>
              <th style={thStyle}>Document Type</th>
              <th style={{ ...thStyle, cursor: 'pointer' }} onClick={() => toggleSort('discovered')}>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '3px' }}>Discovered <SortIcon col="discovered" /></span>
              </th>
              <th style={thStyle}>Stage</th>
              <th style={thStyle}>Status</th>
              <th style={{ ...thStyle, textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 && (
              <tr>
                <td colSpan={9} style={{ padding: '48px', textAlign: 'center', color: K.textFaint, fontSize: '13px' }}>
                  {hasFilters || query
                    ? 'No sources match your search or filters.'
                    : 'No documents in this stage.'}
                </td>
              </tr>
            )}
            {filtered.map((row, i) => {
              const isSel = selected.has(row.id);
              const baseBg = isSel ? 'rgba(22,163,74,0.04)' : i % 2 === 0 ? '#fff' : '#fafafa';
              const ss = statusStyle(row.status);
              return (
                <tr key={row.id}
                  style={{ background: baseBg, transition: 'background 0.1s', cursor: 'pointer' }}
                  onMouseEnter={e => { if (!isSel) (e.currentTarget as HTMLElement).style.background = K.cardBgHover; }}
                  onMouseLeave={e => { if (!isSel) (e.currentTarget as HTMLElement).style.background = baseBg; }}
                  onClick={() => setDetailSource(row)}
                >
                  <td style={tdStyle} onClick={e => { e.stopPropagation(); toggleRow(row.id); }}>
                    <input type="checkbox" checked={isSel} onChange={() => toggleRow(row.id)} style={{ cursor: 'pointer' }} />
                  </td>
                  <td style={tdStyle}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
                      <span style={{ fontSize: '16px' }}>{row.flag}</span>
                      <span style={{ fontWeight: 500, color: K.textPrimary }}>{row.country}</span>
                    </div>
                  </td>
                  <td style={{ ...tdStyle, maxWidth: '240px' }}>
                    <div style={{ fontWeight: 500, color: K.textPrimary, fontSize: '12px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{row.title}</div>
                    <div style={{ fontSize: '11px', color: K.textFaint, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginTop: '1px' }}>{row.source}</div>
                  </td>
                  <td style={tdStyle}>
                    <span style={{ padding: '2px 7px', borderRadius: '4px', background: 'rgba(0,0,0,0.04)', color: K.textMuted, fontSize: '11px', fontWeight: 600, fontFamily: 'monospace' }}>{row.language}</span>
                  </td>
                  <td style={{ ...tdStyle, fontSize: '11px' }}>{row.docType}</td>
                  <td style={{ ...tdStyle, color: K.textMuted, whiteSpace: 'nowrap', fontSize: '11px' }}>{row.discovered}</td>
                  <td style={tdStyle}><StageChip stage={row.stage} /></td>
                  <td style={tdStyle}><Badge label={row.status} style={ss} /></td>
                  <td style={{ ...tdStyle, textAlign: 'right' }} onClick={e => e.stopPropagation()}>
                    <div style={{ display: 'flex', gap: '5px', justifyContent: 'flex-end', flexWrap: 'nowrap' }}>
                      {row.status === 'New' && (
                        <>
                          <ActionBtn icon={<Play size={11} />} label="Process" accent onClick={() => startProcessing(row.id)} />
                          <ActionBtn icon={<EyeOff size={11} />} label="Irrelevant" onClick={() => markIrrelevant(row.id)} />
                        </>
                      )}
                      {row.status === 'Processing' && (
                        <>
                          <ActionBtn icon={<RotateCcw size={11} />} label="Retry" onClick={() => retry(row.id)} />
                          <ActionBtn icon={<EyeOff size={11} />} label="Irrelevant" onClick={() => markIrrelevant(row.id)} />
                        </>
                      )}
                      {row.status === 'Ready for Review' && (
                        <>
                          <ActionBtn icon={<ArrowRight size={11} />} label="Review" accent onClick={() => navigate(`/sources/${row.sourceId}`)} />
                          <ActionBtn icon={<Eye size={11} />} label="Details" onClick={() => setDetailSource(row)} />
                        </>
                      )}
                      {row.status === 'Irrelevant' && (
                        <ActionBtn icon={<RotateCcw size={11} />} label="Restore" onClick={() => restore(row.id)} />
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Detail panel */}
      {detailSource && <DetailPanel source={detailSource} onClose={() => setDetailSource(null)} />}
    </div>
  );
}
