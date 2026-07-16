import { useState, useRef, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router';
import {
  Search, Bell, ChevronDown, ChevronUp, Check, X, BookmarkPlus,
  FileSpreadsheet, FileText, SlidersHorizontal, Star, Library,
  Eye, Download, AlertCircle, MessageSquare,
} from 'lucide-react';
import { K } from './kiaa-tokens';
import { Badge } from './KBadge';
import { LoadingState, ErrorState } from './StateViews';
import {
  searchRecords, getUniqueJurisdictions, getUniqueSourceTitles,
  generateCsv, downloadCsv, getExportSummary,
} from '../../services/search';
import { useApi } from '../../services/useApi';
import type { SearchableRecord, FieldStatus } from '../../types';

// ---------------------------------------------------------------------------
// Saved view definitions — each maps to a set of client-side filter criteria.
// Counts are computed dynamically from live data.
// ---------------------------------------------------------------------------

interface ViewFilter {
  id: number;
  name: string;
  starred: boolean;
  match: (r: SearchableRecord) => boolean;
}

const VIEW_DEFINITIONS: ViewFilter[] = [
  { id: 0, name: 'All Regulations', starred: false,
    match: () => true },
  { id: 1, name: 'APAC Region', starred: true,
    match: r => ['Taiwan', 'South Korea', 'Vietnam'].includes(r.jurisdiction) },
  { id: 2, name: 'EU / EEA', starred: true,
    match: r => ['Denmark', 'Poland', 'Finland'].includes(r.jurisdiction) },
  { id: 3, name: 'Middle East', starred: false,
    match: r => r.jurisdiction === 'United Arab Emirates' },
  { id: 4, name: 'Assessment Fields', starred: false,
    match: r => r.category === 'Assessment' },
  { id: 5, name: 'Low Confidence', starred: false,
    match: r => r.confidence < 75 },
];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const fieldStatusStyle = (s: FieldStatus) => {
  if (s === 'Accepted') return { bg: 'rgba(22,163,74,0.08)', text: '#16a34a', border: 'rgba(22,163,74,0.18)' };
  if (s === 'Rejected') return { bg: 'rgba(239,68,68,0.08)', text: '#dc2626', border: 'rgba(239,68,68,0.18)' };
  if (s === 'Flagged')  return { bg: 'rgba(245,158,11,0.08)', text: '#d97706', border: 'rgba(245,158,11,0.18)' };
  return { bg: 'rgba(107,114,128,0.08)', text: '#6b7280', border: 'rgba(107,114,128,0.18)' };
};

function ConfidenceDot({ pct }: { pct: number }) {
  const color = pct >= 90 ? K.accent : pct >= 80 ? '#d97706' : '#dc2626';
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
      <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: color, flexShrink: 0 }} />
      <span style={{ fontSize: '11px', fontWeight: 600, color }}>{pct}%</span>
    </div>
  );
}

function FilterChip({ label, options, value, onChange }: { label: string; options: string[]; value: string; onChange: (v: string) => void }) {
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
      <button onClick={() => setOpen(o => !o)} style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '5px 10px', background: active ? K.accentSubtle : '#fff', border: `1px solid ${active ? K.accentBorder : K.inputBorder}`, borderRadius: '6px', cursor: 'pointer', fontSize: '12px', fontWeight: 500, color: active ? K.accentText : K.textSecondary, fontFamily: 'inherit', whiteSpace: 'nowrap' }}>
        {active && <Check size={10} />}
        <span style={{ color: active ? K.accentText : K.textFaint, fontWeight: 400 }}>{label}:</span>
        <span>{value}</span>
        <ChevronDown size={10} />
        {active && <span onClick={e => { e.stopPropagation(); onChange('All'); }} style={{ display: 'flex', cursor: 'pointer', color: K.accentText }}><X size={10} /></span>}
      </button>
      {open && (
        <div style={{ position: 'absolute', top: 'calc(100% + 4px)', left: 0, zIndex: 100, background: '#fff', border: `1px solid ${K.border}`, borderRadius: '8px', boxShadow: '0 8px 24px rgba(0,0,0,0.09)', minWidth: '160px', maxHeight: '240px', overflowY: 'auto' }}>
          {['All', ...options].map(opt => (
            <button key={opt} onClick={() => { onChange(opt); setOpen(false); }} style={{ display: 'block', width: '100%', textAlign: 'left', padding: '7px 12px', background: value === opt ? K.accentSubtle : 'transparent', color: value === opt ? K.accentText : K.textSecondary, fontSize: '12px', fontWeight: value === opt ? 600 : 400, border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}>{opt}</button>
          ))}
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Evidence Drawer
// ---------------------------------------------------------------------------

function EvidenceDrawer({ record, onClose }: { record: SearchableRecord; onClose: () => void }) {
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.32)', zIndex: 500, display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={onClose}>
      <div style={{ background: '#fff', borderRadius: '12px', padding: '28px', width: '560px', maxHeight: '80vh', overflow: 'auto', boxShadow: '0 24px 60px rgba(0,0,0,0.15)', position: 'relative', fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif" }} onClick={e => e.stopPropagation()}>
        <button onClick={onClose} style={{ position: 'absolute', top: '16px', right: '16px', background: 'none', border: 'none', cursor: 'pointer', color: K.textFaint }}><X size={16} /></button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
          <Eye size={16} style={{ color: K.accent }} />
          <h2 style={{ fontSize: '15px', fontWeight: 700, color: K.textPrimary, margin: 0 }}>Evidence Inspection</h2>
        </div>

        {/* Source info */}
        <div style={{ padding: '12px', background: '#fafafa', border: `1px solid ${K.border}`, borderRadius: '8px', marginBottom: '16px' }}>
          <div style={{ fontSize: '10px', fontWeight: 600, color: K.textFaint, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '6px' }}>Source</div>
          <div style={{ fontSize: '13px', fontWeight: 600, color: K.textPrimary }}>{record.flag} {record.sourceTitle}</div>
          <div style={{ fontSize: '11px', color: K.textMuted, marginTop: '2px' }}>{record.sourceName} &middot; {record.jurisdiction} &middot; {record.docType}</div>
        </div>

        {/* Field info */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '16px' }}>
          <div style={{ padding: '10px 12px', background: '#fff', border: `1px solid ${K.borderSubtle}`, borderRadius: '7px' }}>
            <div style={{ fontSize: '10px', fontWeight: 600, color: K.textFaint, textTransform: 'uppercase', marginBottom: '4px' }}>Field</div>
            <div style={{ fontSize: '12px', fontWeight: 500, color: K.textPrimary }}>{record.fieldName}</div>
            <span style={{ fontSize: '10px', color: K.textFaint }}>{record.category}</span>
          </div>
          <div style={{ padding: '10px 12px', background: '#fff', border: `1px solid ${K.borderSubtle}`, borderRadius: '7px' }}>
            <div style={{ fontSize: '10px', fontWeight: 600, color: K.textFaint, textTransform: 'uppercase', marginBottom: '4px' }}>Status & Confidence</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Badge label={record.status} style={fieldStatusStyle(record.status)} />
              <ConfidenceDot pct={record.confidence} />
            </div>
          </div>
        </div>

        {/* Values */}
        <div style={{ marginBottom: '16px' }}>
          <div style={{ fontSize: '10px', fontWeight: 600, color: K.textFaint, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '6px' }}>Extracted Value</div>
          <div style={{ padding: '10px 12px', background: '#f8fafc', border: `1px solid ${K.border}`, borderRadius: '7px', fontSize: '12px', color: K.textSecondary, lineHeight: 1.6 }}>
            {record.extractedValue}
          </div>
        </div>

        {record.reviewedValue && record.reviewedValue !== record.extractedValue && (
          <div style={{ marginBottom: '16px' }}>
            <div style={{ fontSize: '10px', fontWeight: 600, color: K.accentText, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '6px' }}>Reviewed Value</div>
            <div style={{ padding: '10px 12px', background: K.accentSubtle, border: `1px solid ${K.accentBorder}`, borderRadius: '7px', fontSize: '12px', color: K.textPrimary, lineHeight: 1.6 }}>
              {record.reviewedValue}
            </div>
          </div>
        )}

        {/* Evidence (immutable) */}
        <div style={{ marginBottom: '16px' }}>
          <div style={{ fontSize: '10px', fontWeight: 600, color: K.textFaint, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '6px' }}>Source Evidence (immutable)</div>
          <div style={{ padding: '14px', background: 'rgba(22,163,74,0.05)', border: `1px solid ${K.accentBorder}`, borderRadius: '8px', fontSize: '12px', lineHeight: 1.7, color: K.textSecondary, position: 'relative' }}>
            <div style={{ width: '3px', position: 'absolute', left: 0, top: 0, bottom: 0, background: K.accent, borderRadius: '3px 0 0 3px' }} />
            {record.evidence}
          </div>
        </div>

        {/* Comment */}
        {record.comment && (
          <div>
            <div style={{ fontSize: '10px', fontWeight: 600, color: K.textFaint, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '6px' }}>Reviewer Comment</div>
            <div style={{ padding: '10px 12px', background: 'rgba(59,130,246,0.06)', border: '1px solid rgba(59,130,246,0.12)', borderRadius: '7px', fontSize: '12px', color: '#2563eb', display: 'flex', gap: '6px', alignItems: 'flex-start' }}>
              <MessageSquare size={12} style={{ marginTop: '2px', flexShrink: 0 }} />
              {record.comment}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Export Summary Modal
// ---------------------------------------------------------------------------

function ExportSummary({ records, onClose, onConfirm }: { records: SearchableRecord[]; onClose: () => void; onConfirm: () => void }) {
  const summary = getExportSummary(records);
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.32)', zIndex: 500, display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={onClose}>
      <div style={{ background: '#fff', borderRadius: '12px', padding: '28px', width: '400px', boxShadow: '0 24px 60px rgba(0,0,0,0.15)', fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif" }} onClick={e => e.stopPropagation()}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
          <Download size={16} style={{ color: K.accent }} />
          <h2 style={{ fontSize: '15px', fontWeight: 700, color: K.textPrimary, margin: 0 }}>Export Summary</h2>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '16px' }}>
          {[
            { label: 'Records', value: summary.total, color: K.textPrimary },
            { label: 'Sources', value: summary.sources, color: K.textPrimary },
            { label: 'Accepted', value: summary.accepted, color: K.accent },
            { label: 'Rejected', value: summary.rejected, color: '#dc2626' },
            { label: 'Flagged', value: summary.flagged, color: '#d97706' },
            { label: 'Pending', value: summary.pending, color: '#6b7280' },
          ].map(item => (
            <div key={item.label} style={{ padding: '10px 12px', background: '#fafafa', border: `1px solid ${K.border}`, borderRadius: '7px' }}>
              <div style={{ fontSize: '20px', fontWeight: 700, color: item.color }}>{item.value}</div>
              <div style={{ fontSize: '11px', color: K.textMuted }}>{item.label}</div>
            </div>
          ))}
        </div>
        {summary.missingEvidence > 0 && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 12px', background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.18)', borderRadius: '7px', marginBottom: '16px', fontSize: '12px', color: '#d97706' }}>
            <AlertCircle size={13} /> {summary.missingEvidence} records have no evidence reference
          </div>
        )}
        <div style={{ fontSize: '11px', color: K.textMuted, marginBottom: '16px' }}>
          The CSV will include: source ID/title, field name, extracted value, reviewed value, final value, review status, confidence, comment, and evidence reference.
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button onClick={onClose} style={{ flex: 1, padding: '9px', border: `1px solid ${K.border}`, borderRadius: '7px', background: '#fff', color: K.textSecondary, fontSize: '13px', fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit' }}>Cancel</button>
          <button onClick={onConfirm} style={{ flex: 2, padding: '9px', border: 'none', borderRadius: '7px', background: K.accent, color: '#fff', fontSize: '13px', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
            <Download size={13} /> Export CSV
          </button>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export function SearchExport() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Initialize filters from URL params (for dashboard navigation)
  const initialStatus = searchParams.get('status') ?? undefined;
  const initialConfidence = searchParams.get('confidence') ?? undefined;

  // Filters
  const [query, setQuery] = useState('');
  const [jurisdiction, setJurisdiction] = useState('All');
  const [category, setCategory] = useState('All');
  const [status, setStatus] = useState(initialStatus ?? 'All');
  const [confidence, setConfidence] = useState(initialConfidence ?? 'All');
  const [source, setSource] = useState('All');
  const [sortBy, setSortBy] = useState<'jurisdiction' | 'fieldName' | 'confidence' | 'status' | 'date' | undefined>(undefined);
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');

  // UI state
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [activeView, setActiveView] = useState<number>(0);
  const [evidenceRecord, setEvidenceRecord] = useState<SearchableRecord | null>(null);
  const [showExportSummary, setShowExportSummary] = useState(false);
  const [exported, setExported] = useState(false);

  // Load all records from API — filters and saved views are applied client-side
  const { data: allRecords, loading, error, reload } = useApi(() => searchRecords({}), []);

  if (loading) return <LoadingState message="Searching records\u2026" />;
  if (error || !allRecords) return <ErrorState title="Search failed" message={error ?? undefined} onRetry={reload} />;

  // Derive filter dropdown options from the full dataset
  const jurisdictions = getUniqueJurisdictions(allRecords);
  const sourceTitles = getUniqueSourceTitles(allRecords);

  // Compute saved-view counts from live data
  const viewCounts = VIEW_DEFINITIONS.map(v => ({
    ...v,
    count: allRecords.filter(v.match).length,
  }));

  // Apply saved-view filter first, then apply filter-chip filters on top
  const activeViewDef = VIEW_DEFINITIONS.find(v => v.id === activeView);
  let filtered = activeViewDef ? allRecords.filter(activeViewDef.match) : allRecords;

  // Apply filter chips (AND logic between filters)
  if (jurisdiction !== 'All') filtered = filtered.filter(r => r.jurisdiction === jurisdiction);
  if (category !== 'All') filtered = filtered.filter(r => r.category === category);
  if (status !== 'All') filtered = filtered.filter(r => r.status === status);
  if (confidence !== 'All') {
    if (confidence === 'High') filtered = filtered.filter(r => r.confidence >= 90);
    else if (confidence === 'Medium') filtered = filtered.filter(r => r.confidence >= 75 && r.confidence < 90);
    else if (confidence === 'Low') filtered = filtered.filter(r => r.confidence < 75);
  }
  if (source !== 'All') filtered = filtered.filter(r => r.sourceTitle === source);

  // Apply text search (match against multiple fields)
  if (query) {
    const q = query.toLowerCase();
    filtered = filtered.filter(r =>
      r.sourceTitle.toLowerCase().includes(q) ||
      r.sourceName.toLowerCase().includes(q) ||
      r.jurisdiction.toLowerCase().includes(q) ||
      r.fieldName.toLowerCase().includes(q) ||
      r.extractedValue.toLowerCase().includes(q) ||
      (r.reviewedValue && r.reviewedValue.toLowerCase().includes(q)) ||
      r.evidence.toLowerCase().includes(q) ||
      (r.comment && r.comment.toLowerCase().includes(q)) ||
      r.category.toLowerCase().includes(q) ||
      r.docType.toLowerCase().includes(q)
    );
  }

  // Client-side sort
  let sorted = filtered;
  if (sortBy) {
    const dir = sortDir === 'desc' ? -1 : 1;
    sorted = [...filtered].sort((a, b) => {
      let av: string | number, bv: string | number;
      switch (sortBy) {
        case 'confidence': av = a.confidence; bv = b.confidence; break;
        case 'jurisdiction': av = a.jurisdiction; bv = b.jurisdiction; break;
        case 'fieldName': av = a.fieldName; bv = b.fieldName; break;
        case 'status': av = a.status; bv = b.status; break;
        case 'date': av = a.date; bv = b.date; break;
        default: av = ''; bv = '';
      }
      return av < bv ? -1 * dir : av > bv ? 1 * dir : 0;
    });
  }
  const displayRecords = sorted;

  // Selection uses composite key sourceId:fieldId
  const recordKey = (r: SearchableRecord) => `${r.sourceId}:${r.fieldId}`;
  const toggleRow = (r: SearchableRecord) => {
    const k = recordKey(r);
    setSelected(prev => { const n = new Set(prev); n.has(k) ? n.delete(k) : n.add(k); return n; });
  };
  const toggleAllRows = () => {
    if (selected.size === displayRecords.length && displayRecords.length > 0) setSelected(new Set());
    else setSelected(new Set(displayRecords.map(recordKey)));
  };

  const hasFilters = [jurisdiction, category, status, confidence, source].some(v => v !== 'All');
  const clearFilters = () => { setJurisdiction('All'); setCategory('All'); setStatus('All'); setConfidence('All'); setSource('All'); setSelected(new Set()); };

  // Saved view click handler — clear chip filters and selection when switching views
  const selectView = (id: number) => {
    setActiveView(id);
    setJurisdiction('All');
    setCategory('All');
    setStatus('All');
    setConfidence('All');
    setSource('All');
    setQuery('');
    setSelected(new Set());
  };

  type SortCol = 'jurisdiction' | 'fieldName' | 'confidence' | 'status' | 'date';
  // Sort toggle
  const toggleSort = (col: SortCol) => {
    if (sortBy === col) {
      if (sortDir === 'desc') setSortDir('asc');
      else { setSortBy(undefined); setSortDir('desc'); }
    } else { setSortBy(col); setSortDir('desc'); }
  };
  const SortIcon = ({ col }: { col: SortCol }) => {
    if (sortBy !== col) return null;
    return sortDir === 'asc' ? <ChevronUp size={9} /> : <ChevronDown size={9} />;
  };

  // Export
  const recordsToExport = selected.size > 0
    ? displayRecords.filter(r => selected.has(recordKey(r)))
    : displayRecords;
  const doExport = () => {
    const csv = generateCsv(recordsToExport);
    downloadCsv(csv, `regulatory-intelligence-export-${Date.now()}.csv`);
    setShowExportSummary(false);
    setExported(true);
    setTimeout(() => setExported(false), 3000);
  };

  const thBase: React.CSSProperties = { padding: '9px 12px', fontSize: '11px', fontWeight: 600, color: K.textMuted, textTransform: 'uppercase', letterSpacing: '0.05em', textAlign: 'left', borderBottom: `1px solid ${K.border}`, background: '#fafafa', whiteSpace: 'nowrap' };
  const tdBase: React.CSSProperties = { padding: '10px 12px', fontSize: '12px', color: K.textSecondary, borderBottom: `1px solid ${K.borderSubtle}`, verticalAlign: 'middle' };

  return (
    <div style={{ display: 'flex', height: 'calc(100vh - 52px)', background: K.pageBg, fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif", overflow: 'hidden' }}>

      {/* Saved views sidebar */}
      <div style={{ width: '210px', minWidth: '210px', background: '#fff', borderRight: `1px solid ${K.border}`, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <div style={{ padding: '16px 16px 10px', borderBottom: `1px solid ${K.border}` }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '10px' }}>
            <Library size={13} style={{ color: K.textMuted }} />
            <span style={{ fontSize: '11px', fontWeight: 600, color: K.textMuted, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Saved Views</span>
          </div>
          <button style={{ display: 'flex', alignItems: 'center', gap: '5px', width: '100%', padding: '6px 8px', borderRadius: '6px', border: `1px dashed ${K.accentBorder}`, background: K.accentSubtle, color: K.accentText, fontSize: '11px', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', justifyContent: 'center' }}>
            <BookmarkPlus size={12} /> Save current view
          </button>
        </div>
        <div style={{ flex: 1, overflow: 'auto', padding: '8px' }}>
          {viewCounts.map(view => (
            <button key={view.id} onClick={() => selectView(view.id)}
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', padding: '8px 10px', marginBottom: '2px', borderRadius: '6px', border: `1px solid ${activeView === view.id ? K.accentBorder : 'transparent'}`, background: activeView === view.id ? K.accentSubtle : 'transparent', cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.12s' }}
              onMouseEnter={e => { if (activeView !== view.id) (e.currentTarget as HTMLElement).style.background = 'rgba(0,0,0,0.03)'; }}
              onMouseLeave={e => { if (activeView !== view.id) (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Star size={11} fill={view.starred ? '#d97706' : 'none'} color={view.starred ? '#d97706' : K.textFaint} />
                <span style={{ fontSize: '12px', fontWeight: activeView === view.id ? 600 : 400, color: activeView === view.id ? K.accentText : K.sidebarText, textAlign: 'left' }}>{view.name}</span>
              </div>
              <span style={{ fontSize: '10px', color: activeView === view.id ? K.accentText : K.textFaint, fontWeight: 500 }}>{view.count}</span>
            </button>
          ))}
        </div>
        <div style={{ padding: '12px', borderTop: `1px solid ${K.border}` }}>
          <div style={{ fontSize: '10px', fontWeight: 600, color: K.textFaint, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '8px' }}>Active Alerts</div>
          {['High Impact APAC', 'EU Nicotine Pouches'].map(a => (
            <div key={a} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '5px 8px', marginBottom: '4px', background: '#fafafa', border: `1px solid ${K.border}`, borderRadius: '5px' }}>
              <span style={{ fontSize: '11px', color: K.textSecondary }}>{a}</span>
              <Bell size={10} style={{ color: K.accent }} />
            </div>
          ))}
        </div>
      </div>

      {/* Main content */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <div style={{ padding: '20px 20px 0', flexShrink: 0 }}>
          {/* Header */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
            <div>
              <h1 style={{ fontSize: '18px', fontWeight: 800, color: K.textPrimary, margin: 0 }}>Intelligence Library</h1>
              <p style={{ fontSize: '11px', color: K.textMuted, marginTop: '2px' }}>{displayRecords.length} field records across {new Set(displayRecords.map(r => r.sourceId)).size} sources</p>
            </div>
            <div style={{ display: 'flex', gap: '7px', alignItems: 'center' }}>
              {exported && (
                <span style={{ padding: '5px 10px', background: K.accentSubtle, border: `1px solid ${K.accentBorder}`, borderRadius: '6px', fontSize: '11px', color: K.accentText, fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Check size={11} /> CSV exported
                </span>
              )}
              <button onClick={() => setShowExportSummary(true)} style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '6px 13px', background: K.accent, border: 'none', borderRadius: '6px', fontSize: '12px', fontWeight: 600, color: '#fff', cursor: 'pointer', fontFamily: 'inherit' }}>
                <FileText size={12} /> Export CSV {selected.size > 0 && `(${selected.size})`}
              </button>
            </div>
          </div>

          {/* Search */}
          <div style={{ position: 'relative', marginBottom: '10px' }}>
            <Search size={14} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: K.textFaint }} />
            <input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search titles, values, evidence, comments, jurisdictions\u2026"
              style={{ width: '100%', padding: '9px 36px 9px 34px', background: '#fff', border: `1px solid ${K.inputBorder}`, borderRadius: '8px', fontSize: '13px', color: K.textPrimary, outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }} />
            {query && <button onClick={() => setQuery('')} style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: K.textFaint, padding: 0, display: 'flex' }}><X size={14} /></button>}
          </div>

          {/* Filters */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', paddingBottom: '14px', flexWrap: 'wrap' }}>
            <SlidersHorizontal size={12} style={{ color: K.textFaint, flexShrink: 0 }} />
            <FilterChip label="Jurisdiction" options={jurisdictions} value={jurisdiction} onChange={setJurisdiction} />
            <FilterChip label="Category" options={['Metadata', 'Content', 'Assessment', 'Dates']} value={category} onChange={setCategory} />
            <FilterChip label="Status" options={['Pending', 'Accepted', 'Rejected', 'Flagged']} value={status} onChange={setStatus} />
            <FilterChip label="Confidence" options={['High', 'Medium', 'Low']} value={confidence} onChange={setConfidence} />
            <FilterChip label="Source" options={sourceTitles} value={source} onChange={setSource} />
            {hasFilters && (
              <button onClick={clearFilters} style={{ display: 'flex', alignItems: 'center', gap: '3px', padding: '5px 8px', border: 'none', borderRadius: '5px', background: 'transparent', color: K.textMuted, fontSize: '11px', cursor: 'pointer', fontFamily: 'inherit' }}>
                <X size={10} /> Clear all
              </button>
            )}
          </div>
        </div>

        {/* Results table */}
        <div style={{ flex: 1, overflow: 'auto', padding: '0 20px 20px' }}>
          <div style={{ background: '#fff', border: `1px solid ${K.border}`, borderRadius: '10px', overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  <th style={{ ...thBase, width: '34px' }}>
                    <input type="checkbox" checked={selected.size === displayRecords.length && displayRecords.length > 0} onChange={toggleAllRows} style={{ cursor: 'pointer' }} />
                  </th>
                  <th style={{ ...thBase, cursor: 'pointer' }} onClick={() => toggleSort('jurisdiction')}>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '3px' }}>Source <SortIcon col="jurisdiction" /></span>
                  </th>
                  <th style={{ ...thBase, cursor: 'pointer' }} onClick={() => toggleSort('fieldName')}>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '3px' }}>Field <SortIcon col="fieldName" /></span>
                  </th>
                  <th style={{ ...thBase, minWidth: '200px' }}>Final Value</th>
                  <th style={{ ...thBase, cursor: 'pointer' }} onClick={() => toggleSort('confidence')}>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '3px' }}>Conf. <SortIcon col="confidence" /></span>
                  </th>
                  <th style={{ ...thBase, cursor: 'pointer' }} onClick={() => toggleSort('status')}>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '3px' }}>Status <SortIcon col="status" /></span>
                  </th>
                  <th style={{ ...thBase, textAlign: 'center' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {displayRecords.length === 0 && (
                  <tr>
                    <td colSpan={7} style={{ padding: '48px', textAlign: 'center', color: K.textFaint, fontSize: '13px' }}>
                      {query || hasFilters ? 'No records match your search or filters.' : 'No field records available yet.'}
                    </td>
                  </tr>
                )}
                {displayRecords.map((row, i) => {
                  const k = recordKey(row);
                  const isSel = selected.has(k);
                  const ss = fieldStatusStyle(row.status);
                  const wasEdited = row.reviewedValue !== null && row.reviewedValue !== row.extractedValue;
                  const bg = isSel ? 'rgba(22,163,74,0.04)' : i % 2 === 0 ? '#fff' : '#fafafa';
                  return (
                    <tr key={k} style={{ background: bg, transition: 'background 0.1s' }}
                      onMouseEnter={e => { if (!isSel) (e.currentTarget as HTMLElement).style.background = K.cardBgHover; }}
                      onMouseLeave={e => { if (!isSel) (e.currentTarget as HTMLElement).style.background = bg; }}
                    >
                      <td style={tdBase} onClick={() => toggleRow(row)}>
                        <input type="checkbox" checked={isSel} onChange={() => toggleRow(row)} style={{ cursor: 'pointer' }} />
                      </td>
                      <td style={tdBase}>
                        <div style={{ fontSize: '12px', fontWeight: 500, color: K.textPrimary }}>{row.flag} {row.jurisdiction}</div>
                        <div style={{ fontSize: '10px', color: K.textFaint, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '160px' }}>{row.sourceTitle}</div>
                      </td>
                      <td style={tdBase}>
                        <div style={{ fontWeight: 500, color: K.textPrimary, fontSize: '12px' }}>{row.fieldName}</div>
                        <span style={{ fontSize: '10px', padding: '1px 5px', borderRadius: '3px', background: 'rgba(0,0,0,0.04)', color: K.textFaint }}>{row.category}</span>
                      </td>
                      <td style={{ ...tdBase, maxWidth: '240px' }}>
                        <span style={{ color: K.textPrimary, lineHeight: 1.4, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', fontSize: '11px' }}>
                          {row.finalValue}
                        </span>
                        {wasEdited && <span style={{ fontSize: '10px', color: K.textFaint, marginLeft: '4px' }}>(edited)</span>}
                        {row.comment && (
                          <div style={{ fontSize: '10px', color: '#2563eb', marginTop: '2px', display: 'flex', alignItems: 'center', gap: '3px' }}>
                            <MessageSquare size={8} /> {row.comment.length > 40 ? row.comment.slice(0, 40) + '\u2026' : row.comment}
                          </div>
                        )}
                      </td>
                      <td style={tdBase}><ConfidenceDot pct={row.confidence} /></td>
                      <td style={tdBase}><Badge label={row.status} style={ss} /></td>
                      <td style={{ ...tdBase, textAlign: 'center' }}>
                        <div style={{ display: 'flex', gap: '4px', justifyContent: 'center' }}>
                          <button onClick={() => setEvidenceRecord(row)} title="View evidence" style={{ width: '26px', height: '26px', borderRadius: '5px', border: `1px solid ${K.accentBorder}`, background: K.accentSubtle, color: K.accentText, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Eye size={12} /></button>
                          <button onClick={() => navigate(`/regulations/${row.sourceId}`)} title="Open detail view" style={{ width: '26px', height: '26px', borderRadius: '5px', border: `1px solid ${K.border}`, background: '#f8fafc', color: K.textMuted, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><FileText size={12} /></button>
                          <button onClick={() => navigate(`/regulations?source=${row.sourceId}`)} title="Open table view" style={{ width: '26px', height: '26px', borderRadius: '5px', border: `1px solid ${K.border}`, background: '#f8fafc', color: K.textMuted, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><FileSpreadsheet size={12} /></button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {/* Footer */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '11px 16px', borderTop: `1px solid ${K.border}`, background: '#fafafa' }}>
              <span style={{ fontSize: '12px', color: K.textMuted }}>
                {selected.size > 0 ? `${selected.size} of ${displayRecords.length} selected` : `${displayRecords.length} records`}
              </span>
              <button onClick={() => setShowExportSummary(true)} style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '5px 11px', background: K.accent, border: 'none', borderRadius: '5px', fontSize: '11px', fontWeight: 600, color: '#fff', cursor: 'pointer', fontFamily: 'inherit' }}>
                <FileText size={11} /> Export CSV {selected.size > 0 && `(${selected.size})`}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Evidence drawer */}
      {evidenceRecord && <EvidenceDrawer record={evidenceRecord} onClose={() => setEvidenceRecord(null)} />}

      {/* Export summary */}
      {showExportSummary && <ExportSummary records={recordsToExport} onClose={() => setShowExportSummary(false)} onConfirm={doExport} />}
    </div>
  );
}
