import { useState, useRef, useEffect, useLayoutEffect, useCallback } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router';
import { Check, Flag, Edit2, ChevronLeft, ChevronRight, ChevronDown, Send, RotateCcw, Search, X, XCircle, MessageSquare } from 'lucide-react';
import { K } from './kiaa-tokens';
import { LoadingState, EmptyState, ErrorState } from './StateViews';
import {
  fetchReviewSources, getReviewSources, getReviewSourceById, getFieldsForSource,
  acceptField, rejectField, flagField, resetField, editFieldValue,
  addFieldComment, acceptAllFields, getReviewStats,
} from '../../services/regulations';
import { useApi } from '../../services/useApi';
import type { ReviewSource, ReviewableField, FieldStatus } from '../../types';

const categories = ['All', 'Metadata', 'Content', 'Assessment', 'Dates'];
const statuses = ['All Statuses', 'Pending', 'Accepted', 'Rejected', 'Flagged'];

function ConfidenceDot({ pct }: { pct: number }) {
  const color = pct >= 90 ? K.accent : pct >= 80 ? '#d97706' : '#dc2626';
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
      <div style={{ width: '7px', height: '7px', borderRadius: '50%', background: color, flexShrink: 0 }} />
      <span style={{ fontSize: '12px', fontWeight: 600, color }}>{pct}%</span>
    </div>
  );
}

function StatusChip({ status }: { status: FieldStatus }) {
  const map: Record<FieldStatus, { bg: string; text: string; border: string }> = {
    Pending:  { bg: 'rgba(107,114,128,0.08)', text: '#6b7280', border: 'rgba(107,114,128,0.18)' },
    Accepted: { bg: 'rgba(22,163,74,0.08)',   text: '#16a34a', border: 'rgba(22,163,74,0.18)'   },
    Rejected: { bg: 'rgba(239,68,68,0.08)',   text: '#dc2626', border: 'rgba(239,68,68,0.18)'   },
    Flagged:  { bg: 'rgba(245,158,11,0.10)',  text: '#d97706', border: 'rgba(245,158,11,0.22)'  },
  };
  const s = map[status];
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '11px', fontWeight: 600, padding: '2px 8px', borderRadius: '4px', background: s.bg, color: s.text, border: `1px solid ${s.border}`, whiteSpace: 'nowrap' }}>
      {status === 'Flagged'  && <Flag  size={9} />}
      {status === 'Accepted' && <Check size={9} />}
      {status === 'Rejected' && <XCircle size={9} />}
      {status}
    </span>
  );
}

function CategoryBadge({ cat }: { cat: string }) {
  const colors: Record<string, { bg: string; text: string }> = {
    Metadata:   { bg: 'rgba(99,102,241,0.08)',  text: '#4f46e5' },
    Content:    { bg: 'rgba(22,163,74,0.08)',   text: '#16a34a' },
    Assessment: { bg: 'rgba(245,158,11,0.08)', text: '#d97706' },
    Dates:      { bg: 'rgba(59,130,246,0.08)',  text: '#2563eb' },
  };
  const c = colors[cat] ?? { bg: 'rgba(107,114,128,0.08)', text: '#6b7280' };
  return (
    <span style={{ fontSize: '10px', fontWeight: 600, padding: '2px 7px', borderRadius: '4px', background: c.bg, color: c.text, whiteSpace: 'nowrap' }}>{cat}</span>
  );
}

function FilterSelect({ value, options, onChange }: { value: string; options: string[]; onChange: (v: string) => void }) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ position: 'relative' }}>
      <button onClick={() => setOpen(o => !o)} style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '5px 10px', background: '#fff', border: `1px solid ${K.inputBorder}`, borderRadius: '6px', fontSize: '12px', fontWeight: 500, color: K.textSecondary, cursor: 'pointer', fontFamily: 'inherit' }}>
        {value} <ChevronDown size={11} style={{ color: K.textFaint }} />
      </button>
      {open && (
        <div style={{ position: 'absolute', top: 'calc(100% + 3px)', left: 0, zIndex: 100, background: '#fff', border: `1px solid ${K.border}`, borderRadius: '7px', boxShadow: '0 8px 24px rgba(0,0,0,0.09)', minWidth: '140px', overflow: 'hidden' }}>
          {options.map(o => (
            <button key={o} onClick={() => { onChange(o); setOpen(false); }} style={{ display: 'block', width: '100%', textAlign: 'left', padding: '7px 12px', background: value === o ? K.accentSubtle : 'transparent', color: value === o ? K.accentText : K.textSecondary, fontSize: '12px', fontWeight: value === o ? 600 : 400, border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}>{o}</button>
          ))}
        </div>
      )}
    </div>
  );
}

function SourceSearch({ selected, onSelect, sources }: { selected: ReviewSource; onSelect: (s: ReviewSource) => void; sources: ReviewSource[] }) {
  const [open, setOpen]   = useState(false);
  const [query, setQuery] = useState('');
  const ref = useRef<HTMLDivElement>(null);
  const allSources = sources;

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const matches = allSources.filter(s =>
    !query ||
    s.title.toLowerCase().includes(query.toLowerCase()) ||
    s.country.toLowerCase().includes(query.toLowerCase()) ||
    s.sourceName.toLowerCase().includes(query.toLowerCase()) ||
    s.docType.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div ref={ref} style={{ position: 'relative', minWidth: 0 }}>
      <button onClick={() => { setOpen(o => !o); setQuery(''); }} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '7px 12px', background: '#fff', border: `1px solid ${K.inputBorder}`, borderRadius: '8px', cursor: 'pointer', fontFamily: 'inherit', width: '100%', textAlign: 'left', boxShadow: open ? `0 0 0 2px ${K.accentBorder}` : 'none', transition: 'box-shadow 0.15s' }}>
        <span style={{ fontSize: '18px', flexShrink: 0 }}>{selected.flag}</span>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: '13px', fontWeight: 600, color: K.textPrimary, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{selected.title}</div>
          <div style={{ fontSize: '11px', color: K.textMuted }}>{selected.sourceName} &middot; {selected.docType} &middot; {selected.date}</div>
        </div>
        <ChevronDown size={14} style={{ color: K.textFaint, flexShrink: 0, transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 0.15s' }} />
      </button>
      {open && (
        <div style={{ position: 'absolute', top: 'calc(100% + 6px)', left: 0, right: 0, zIndex: 200, background: '#fff', border: `1px solid ${K.border}`, borderRadius: '10px', boxShadow: '0 12px 32px rgba(0,0,0,0.12)', overflow: 'hidden' }}>
          <div style={{ padding: '10px 12px', borderBottom: `1px solid ${K.border}`, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Search size={13} style={{ color: K.textFaint, flexShrink: 0 }} />
            <input autoFocus value={query} onChange={e => setQuery(e.target.value)} placeholder="Search by title, country, source or type\u2026" style={{ flex: 1, border: 'none', outline: 'none', fontSize: '13px', color: K.textPrimary, fontFamily: 'inherit', background: 'transparent' }} />
            {query && <button onClick={() => setQuery('')} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, color: K.textFaint, display: 'flex' }}><X size={13} /></button>}
          </div>
          <div style={{ maxHeight: '280px', overflowY: 'auto' }}>
            {matches.length === 0 ? (
              <div style={{ padding: '20px', textAlign: 'center', color: K.textFaint, fontSize: '12px' }}>No matching sources</div>
            ) : matches.map(s => {
              const isActive = s.id === selected.id;
              // stats would require async call; show date instead
              return (
                <button key={s.id} onClick={() => { onSelect(s); setOpen(false); setQuery(''); }} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', width: '100%', padding: '10px 14px', border: 'none', cursor: 'pointer', fontFamily: 'inherit', background: isActive ? K.accentSubtle : 'transparent', borderLeft: `3px solid ${isActive ? K.accent : 'transparent'}`, textAlign: 'left', transition: 'background 0.1s' }}
                  onMouseEnter={e => { if (!isActive) (e.currentTarget as HTMLElement).style.background = '#f8fafc'; }}
                  onMouseLeave={e => { if (!isActive) (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
                >
                  <span style={{ fontSize: '18px', flexShrink: 0, lineHeight: 1.3 }}>{s.flag}</span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: '12px', fontWeight: isActive ? 600 : 500, color: isActive ? K.accentText : K.textPrimary, lineHeight: 1.35 }}>{s.title}</div>
                    <div style={{ fontSize: '11px', color: K.textMuted, marginTop: '2px' }}>{s.country} &middot; {s.docType} &middot; {s.date}</div>
                  </div>
                  {isActive && <Check size={13} style={{ color: K.accent, flexShrink: 0, marginTop: '2px' }} />}
                </button>
              );
            })}
          </div>
          <div style={{ padding: '8px 14px', borderTop: `1px solid ${K.border}`, background: '#fafafa' }}>
            <span style={{ fontSize: '11px', color: K.textFaint }}>{matches.length} of {allSources.length} sources</span>
          </div>
        </div>
      )}
    </div>
  );
}

export function RegulationReviewTable() {
  const { sourceId: paramSourceId } = useParams<{ sourceId: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const sourceFromParam = paramSourceId ? Number(paramSourceId) : undefined;
  const sourceFromQuery = searchParams.get('source') ? Number(searchParams.get('source')) : undefined;
  const initialSourceId = sourceFromParam ?? sourceFromQuery;

  // Fetch review sources from API
  const { data: allSources, loading: sourcesLoading } = useApi(
    () => fetchReviewSources(), [],
  );

  const [selectedSource, setSelectedSource] = useState<ReviewSource | null>(null);
  const [catFilter, setCatFilter]           = useState('All');
  const [statusFilter, setStatusFilter]     = useState('All Statuses');
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editValue, setEditValue] = useState('');
  const [commentId, setCommentId] = useState<number | null>(null);
  const [commentText, setCommentText] = useState('');

  const resolvedSource = allSources && initialSourceId
    ? allSources.find(s => s.id === initialSourceId)
    : allSources?.[0];

  const activeSource = selectedSource ?? resolvedSource ?? (allSources ? allSources[0] : null);

  // Load fields from API (always called, even when activeSource is null)
  const { data: fields, loading: fieldsLoading, error: fieldsError, reload } = useApi(
    () => activeSource ? getFieldsForSource(activeSource.id) : Promise.resolve([]),
    [activeSource?.id],
  );

  useLayoutEffect(() => {
    if (resolvedSource && (!selectedSource || (initialSourceId && selectedSource.id !== initialSourceId))) {
      setSelectedSource(resolvedSource);
      setCatFilter('All');
      setStatusFilter('All Statuses');
      setEditingId(null);
    }
  }, [resolvedSource?.id, initialSourceId]);

  if (sourcesLoading || !allSources) return <LoadingState message="Loading sources\u2026" />;

  if (initialSourceId && !resolvedSource) {
    return (
      <div style={{ minHeight: 'calc(100vh - 52px)', background: K.pageBg }}>
        <ErrorState title="Source not found" message={`No source with ID ${paramSourceId} exists.`} onRetry={() => navigate('/sources')} />
      </div>
    );
  }

  if (!activeSource) {
    return (
      <div style={{ minHeight: 'calc(100vh - 52px)', background: K.pageBg }}>
        <EmptyState title="No sources available" message="There are no sources with regulations yet." />
      </div>
    );
  }

  const handleSelectSource = (s: ReviewSource) => {
    setSelectedSource(s);
    setCatFilter('All');
    setStatusFilter('All Statuses');
    setEditingId(null);
    setCommentId(null);
    navigate(`/regulations?source=${s.id}`, { replace: true });
  };

  const currentIdx = allSources.findIndex(s => s.id === activeSource.id);
  const goTo = (idx: number) => { if (idx >= 0 && idx < allSources.length) handleSelectSource(allSources[idx]); };

  if (fieldsLoading) return <LoadingState message="Loading fields\u2026" />;
  if (fieldsError || !fields) return <ErrorState title="Failed to load fields" message={fieldsError ?? undefined} onRetry={reload} />;

  const stats = getReviewStats(fields);

  const doAccept   = async (id: number) => { await acceptField(activeSource.id, id); reload(); };
  const doReject   = async (id: number) => { await rejectField(activeSource.id, id); reload(); };
  const doFlag     = async (id: number) => { await flagField(activeSource.id, id); reload(); };
  const doReset    = async (id: number) => { await resetField(activeSource.id, id); reload(); };
  const doAcceptAll = async () => { await acceptAllFields(activeSource.id); reload(); };

  const startEdit = (row: ReviewableField) => { setEditingId(row.id); setEditValue(row.reviewedValue ?? row.extractedValue); };
  const saveEdit  = async (id: number) => { await editFieldValue(activeSource.id, id, editValue); setEditingId(null); reload(); };
  const startComment = (row: ReviewableField) => { setCommentId(row.id); setCommentText(row.comment ?? ''); };
  const saveComment = async (id: number) => { await addFieldComment(activeSource.id, id, commentText); setCommentId(null); reload(); };

  const visible = fields.filter(r => {
    const matchCat    = catFilter    === 'All'          || r.category === catFilter;
    const matchStatus = statusFilter === 'All Statuses' || r.status   === statusFilter;
    return matchCat && matchStatus;
  });

  const rate = stats.total > 0 ? Math.round(((stats.accepted + stats.rejected) / stats.total) * 100) : 0;

  if (allSources.length === 0) {
    return (
      <div style={{ minHeight: 'calc(100vh - 52px)', background: K.pageBg }}>
        <EmptyState title="No sources available" message="There are no sources ready for review yet." />
      </div>
    );
  }

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
    <div style={{ padding: '24px', background: K.pageBg, minHeight: '100%', fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif" }}>

      {/* Source selector */}
      <div style={{ marginBottom: '20px' }}>
        <div style={{ fontSize: '11px', fontWeight: 600, color: K.textFaint, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '6px' }}>Source</div>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <button onClick={() => goTo(currentIdx - 1)} disabled={currentIdx === 0} style={{ padding: '7px 10px', borderRadius: '6px', border: `1px solid ${K.border}`, background: '#fff', color: currentIdx === 0 ? K.textFaint : K.textSecondary, cursor: currentIdx === 0 ? 'default' : 'pointer', display: 'flex', alignItems: 'center', flexShrink: 0, fontFamily: 'inherit' }}><ChevronLeft size={14} /></button>
          <div style={{ flex: 1 }}>
            <SourceSearch selected={activeSource} onSelect={handleSelectSource} sources={allSources} />
          </div>
          <button onClick={() => goTo(currentIdx + 1)} disabled={currentIdx === allSources.length - 1} style={{ padding: '7px 10px', borderRadius: '6px', border: `1px solid ${K.border}`, background: '#fff', color: currentIdx === allSources.length - 1 ? K.textFaint : K.textSecondary, cursor: currentIdx === allSources.length - 1 ? 'default' : 'pointer', display: 'flex', alignItems: 'center', flexShrink: 0, fontFamily: 'inherit' }}><ChevronRight size={14} /></button>
          <span style={{ fontSize: '11px', color: K.textFaint, flexShrink: 0, whiteSpace: 'nowrap' }}>{currentIdx + 1} / {allSources.length}</span>
        </div>
      </div>

      {/* KPI cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '12px', marginBottom: '20px' }}>
        {[
          { label: 'Total Fields', value: String(stats.total),    color: K.textPrimary },
          { label: 'Accepted',     value: String(stats.accepted), color: K.accent      },
          { label: 'Rejected',     value: String(stats.rejected), color: '#dc2626'     },
          { label: 'Flagged',      value: String(stats.flagged),  color: '#d97706'     },
          { label: 'Review Rate',  value: `${rate}%`,             color: rate === 100 ? K.accent : K.textPrimary },
        ].map(kpi => (
          <div key={kpi.label} style={{ background: '#fff', border: `1px solid ${K.border}`, borderRadius: '9px', padding: '16px 18px', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
            <div style={{ fontSize: '26px', fontWeight: 700, color: kpi.color, lineHeight: 1 }}>{kpi.value}</div>
            <div style={{ fontSize: '11px', color: K.textMuted, marginTop: '5px' }}>{kpi.label}</div>
          </div>
        ))}
      </div>

      {/* Filter bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '12px', color: K.textMuted, fontWeight: 500 }}>Filter:</span>
          <FilterSelect value={catFilter}    options={categories} onChange={setCatFilter} />
          <FilterSelect value={statusFilter} options={statuses}   onChange={setStatusFilter} />
        </div>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <span style={{ fontSize: '12px', color: K.textFaint }}>Showing {visible.length} of {stats.total}</span>
          <button onClick={doAcceptAll} style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '6px 12px', background: '#fff', border: `1px solid ${K.border}`, borderRadius: '6px', fontSize: '12px', fontWeight: 500, color: K.textSecondary, cursor: 'pointer', fontFamily: 'inherit' }}>
            <Check size={12} /> Accept All Pending
          </button>
          <button onClick={() => navigate(`/regulations/${activeSource.id}`)} style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '6px 14px', background: K.accent, border: 'none', borderRadius: '6px', fontSize: '12px', fontWeight: 600, color: '#fff', cursor: 'pointer', fontFamily: 'inherit' }}>
            <Send size={12} /> Detail View
          </button>
        </div>
      </div>

      {/* Table */}
      <div style={{ background: '#fff', border: `1px solid ${K.border}`, borderRadius: '10px', overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th style={thStyle}>Category</th>
              <th style={thStyle}>Field</th>
              <th style={{ ...thStyle, minWidth: '220px' }}>Value</th>
              <th style={{ ...thStyle, minWidth: '220px' }}>Source Evidence</th>
              <th style={thStyle}>Confidence</th>
              <th style={thStyle}>Status</th>
              <th style={{ ...thStyle, textAlign: 'center' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {visible.map((row, i) => {
              const isEditing = editingId === row.id;
              const isCommenting = commentId === row.id;
              const displayValue = row.reviewedValue ?? row.extractedValue;
              const wasEdited = row.reviewedValue !== null && row.reviewedValue !== row.extractedValue;
              const rowBg = row.status === 'Accepted' ? 'rgba(22,163,74,0.02)' : row.status === 'Rejected' ? 'rgba(239,68,68,0.02)' : row.status === 'Flagged' ? 'rgba(245,158,11,0.03)' : i % 2 === 0 ? '#fff' : '#fafafa';
              return (
                <tr key={row.id} style={{ background: rowBg, transition: 'background 0.1s' }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = K.cardBgHover; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = rowBg; }}
                >
                  <td style={tdStyle}><CategoryBadge cat={row.category} /></td>
                  <td style={{ ...tdStyle, fontWeight: 500, color: K.textPrimary, whiteSpace: 'nowrap' }}>{row.field}</td>
                  <td style={tdStyle}>
                    {isEditing ? (
                      <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                        <input value={editValue} onChange={e => setEditValue(e.target.value)} autoFocus style={{ flex: 1, padding: '4px 8px', fontSize: '12px', border: `1px solid ${K.accentBorder}`, borderRadius: '5px', fontFamily: 'inherit', background: K.inputBg, color: K.textPrimary, outline: 'none' }} />
                        <button onClick={() => saveEdit(row.id)} style={{ padding: '3px 8px', background: K.accent, border: 'none', borderRadius: '4px', color: '#fff', fontSize: '11px', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>Save</button>
                        <button onClick={() => setEditingId(null)} style={{ padding: '3px 6px', background: '#fff', border: `1px solid ${K.border}`, borderRadius: '4px', color: K.textMuted, fontSize: '11px', cursor: 'pointer', fontFamily: 'inherit' }}>&times;</button>
                      </div>
                    ) : isCommenting ? (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <input value={commentText} onChange={e => setCommentText(e.target.value)} autoFocus placeholder="Add comment\u2026" style={{ padding: '4px 8px', fontSize: '11px', border: `1px solid ${K.accentBorder}`, borderRadius: '5px', fontFamily: 'inherit', background: K.inputBg, color: K.textPrimary, outline: 'none' }} />
                        <div style={{ display: 'flex', gap: '4px' }}>
                          <button onClick={() => saveComment(row.id)} style={{ padding: '2px 8px', background: K.accent, border: 'none', borderRadius: '4px', color: '#fff', fontSize: '10px', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>Save</button>
                          <button onClick={() => setCommentId(null)} style={{ padding: '2px 6px', background: '#fff', border: `1px solid ${K.border}`, borderRadius: '4px', color: K.textMuted, fontSize: '10px', cursor: 'pointer', fontFamily: 'inherit' }}>&times;</button>
                        </div>
                      </div>
                    ) : (
                      <div>
                        <span style={{ color: K.textPrimary, lineHeight: 1.4, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{displayValue}</span>
                        {wasEdited && <span style={{ fontSize: '10px', color: K.textFaint, marginLeft: '4px' }}>(edited)</span>}
                        {row.comment && (
                          <div style={{ fontSize: '10px', color: '#2563eb', marginTop: '3px', display: 'flex', alignItems: 'center', gap: '3px' }}>
                            <MessageSquare size={9} /> {row.comment}
                          </div>
                        )}
                      </div>
                    )}
                  </td>
                  <td style={{ ...tdStyle, color: K.textFaint, fontSize: '11px', lineHeight: 1.5 }}>
                    <span style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{row.evidence}</span>
                  </td>
                  <td style={tdStyle}><ConfidenceDot pct={row.confidence} /></td>
                  <td style={tdStyle}><StatusChip status={row.status} /></td>
                  <td style={{ ...tdStyle, textAlign: 'center' }}>
                    <div style={{ display: 'flex', gap: '4px', justifyContent: 'center', flexWrap: 'wrap' }}>
                      {row.status !== 'Accepted' && (
                        <button onClick={() => doAccept(row.id)} title="Accept" style={{ width: '26px', height: '26px', borderRadius: '5px', border: '1px solid rgba(22,163,74,0.25)', background: 'rgba(22,163,74,0.08)', color: K.accent, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Check size={12} /></button>
                      )}
                      {row.status !== 'Rejected' && (
                        <button onClick={() => doReject(row.id)} title="Reject" style={{ width: '26px', height: '26px', borderRadius: '5px', border: '1px solid rgba(239,68,68,0.25)', background: 'rgba(239,68,68,0.08)', color: '#dc2626', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><XCircle size={12} /></button>
                      )}
                      {row.status !== 'Flagged' && (
                        <button onClick={() => doFlag(row.id)} title="Flag" style={{ width: '26px', height: '26px', borderRadius: '5px', border: '1px solid rgba(245,158,11,0.25)', background: 'rgba(245,158,11,0.08)', color: '#d97706', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Flag size={12} /></button>
                      )}
                      {row.status !== 'Pending' && (
                        <button onClick={() => doReset(row.id)} title="Reset" style={{ width: '26px', height: '26px', borderRadius: '5px', border: `1px solid ${K.border}`, background: '#f8fafc', color: K.textFaint, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><RotateCcw size={11} /></button>
                      )}
                      <button onClick={() => startEdit(row)} title="Edit" style={{ width: '26px', height: '26px', borderRadius: '5px', border: `1px solid ${K.border}`, background: '#f8fafc', color: K.textMuted, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Edit2 size={11} /></button>
                      <button onClick={() => startComment(row)} title="Comment" style={{ width: '26px', height: '26px', borderRadius: '5px', border: `1px solid ${K.border}`, background: row.comment ? 'rgba(59,130,246,0.08)' : '#f8fafc', color: row.comment ? '#2563eb' : K.textMuted, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><MessageSquare size={11} /></button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
