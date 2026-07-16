import { useState } from 'react';
import { useParams, useNavigate } from 'react-router';
import {
  ChevronDown, Check, X, XCircle, Edit2, Send, FileText, ChevronLeft, ChevronRight,
  Highlighter, Tag, Info, Flag, MessageSquare, AlertTriangle, FileQuestion,
} from 'lucide-react';
import { K, statusStyle } from './kiaa-tokens';
import { Badge } from './KBadge';
import { LoadingState, ErrorState } from './StateViews';
import {
  fetchReviewSources, getReviewSources, getReviewSourceById, getRegulationById, getHighlightRanges,
  acceptField, rejectField, flagField, resetField,
  editFieldValue, addFieldComment, acceptAllFields, getReviewStats,
  type RegulationResponse,
} from '../../services/regulations';
import { useApi } from '../../services/useApi';
import type { ReviewableField, FieldStatus } from '../../types';

// ---------------------------------------------------------------------------
// Field-status styling
// ---------------------------------------------------------------------------

const fieldStatusStyle = (s: FieldStatus) => {
  if (s === 'Accepted') return { bg: 'rgba(22,163,74,0.08)', text: '#16a34a', border: 'rgba(22,163,74,0.18)' };
  if (s === 'Rejected') return { bg: 'rgba(239,68,68,0.08)', text: '#dc2626', border: 'rgba(239,68,68,0.18)' };
  if (s === 'Flagged')  return { bg: 'rgba(245,158,11,0.08)', text: '#d97706', border: 'rgba(245,158,11,0.18)' };
  return { bg: 'rgba(107,114,128,0.08)', text: '#6b7280', border: 'rgba(107,114,128,0.18)' };
};

function FieldStatusBadge({ status }: { status: FieldStatus }) {
  const s = fieldStatusStyle(status);
  return <Badge label={status} style={s} />;
}

function ConfidenceIndicator({ pct }: { pct: number }) {
  const color = pct >= 90 ? K.accent : pct >= 75 ? '#d97706' : '#dc2626';
  const label = pct >= 90 ? 'High' : pct >= 75 ? 'Medium' : 'Low';
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
      <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: color }} />
      <span style={{ fontSize: '10px', color, fontWeight: 600 }}>{pct}% {label}</span>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export function RegulationReview() {
  const { regulationId } = useParams<{ regulationId: string }>();
  const navigate = useNavigate();

  const sourceId = Number(regulationId) || 0;

  // Fetch review sources list from API
  const { data: allSources, loading: sourcesLoading } = useApi(
    () => fetchReviewSources(), [],
  );

  const [activeFieldId, setActiveFieldId] = useState<number | null>(null);
  const [editingFieldId, setEditingFieldId] = useState<number | null>(null);
  const [editValue, setEditValue] = useState('');
  const [commentFieldId, setCommentFieldId] = useState<number | null>(null);
  const [commentText, setCommentText] = useState('');
  const [evidenceOpen, setEvidenceOpen] = useState(true);

  const { data: regulation, loading: regLoading, error: regError, reload } = useApi(
    () => getRegulationById(sourceId), [sourceId],
  );

  if (sourcesLoading || regLoading) return <LoadingState message="Loading regulation\u2026" />;

  const sourcesList = allSources ?? [];
  const source = sourcesList.find(s => s.id === sourceId);

  if (!source && !regulation) {
    return (
      <div style={{ minHeight: 'calc(100vh - 52px)', background: K.pageBg }}>
        <ErrorState
          title="Regulation not found"
          message={`No regulation with ID ${regulationId ?? '?'} exists.`}
          onRetry={() => navigate('/regulations')}
        />
      </div>
    );
  }

  if (regError || !regulation) return <ErrorState title="Failed to load regulation" message={regError ?? undefined} onRetry={reload} />;

  const fields = regulation.fields ?? [];
  const stats = getReviewStats(fields);
  const sourceTextContent = regulation.sourceText ?? '';
  const hasSourceText = sourceTextContent.trim().length > 0;
  const activeField = activeFieldId ? fields.find(f => f.id === activeFieldId) : null;

  // Derive display metadata from source (review list) or regulation (API)
  const displayFlag = source?.flag ?? regulation.flag ?? '';
  const displayTitle = source?.title ?? regulation.title ?? 'Untitled';
  const displaySourceName = source?.sourceName ?? regulation.sourceName ?? '';
  const displayCountry = source?.country ?? regulation.country ?? '';
  const displayDocType = source?.docType ?? regulation.docType ?? '';

  // Source text highlighting ranges (by field name)
  const highlightRanges = getHighlightRanges();

  // Prev/next navigation
  const currentIdx = sourcesList.findIndex(s => s.id === sourceId);
  const hasPrev = currentIdx > 0;
  const hasNext = currentIdx < sourcesList.length - 1;
  const goPrev = () => { if (hasPrev) navigate(`/regulations/${sourcesList[currentIdx - 1].id}`); };
  const goNext = () => { if (hasNext) navigate(`/regulations/${sourcesList[currentIdx + 1].id}`); };

  // Unsaved-change check
  const hasUnsavedEdit = editingFieldId !== null;
  const confirmNavigate = (fn: () => void) => {
    if (hasUnsavedEdit) {
      if (window.confirm('You have an unsaved edit. Discard changes?')) {
        setEditingFieldId(null);
        fn();
      }
    } else {
      fn();
    }
  };

  // Actions
  const doAccept = async (fid: number) => { await acceptField(sourceId, fid); reload(); };
  const doReject = async (fid: number) => { await rejectField(sourceId, fid); reload(); };
  const doFlag = async (fid: number) => { await flagField(sourceId, fid); reload(); };
  const doReset = async (fid: number) => { await resetField(sourceId, fid); reload(); };
  const startEdit = (f: ReviewableField) => {
    setEditingFieldId(f.id);
    setEditValue(f.reviewedValue ?? f.extractedValue);
  };
  const saveEdit = async () => {
    if (editingFieldId !== null) {
      await editFieldValue(sourceId, editingFieldId, editValue);
      setEditingFieldId(null);
      reload();
    }
  };
  const cancelEdit = () => setEditingFieldId(null);
  const startComment = (fid: number, existing: string | null) => {
    setCommentFieldId(fid);
    setCommentText(existing ?? '');
  };
  const saveComment = async () => {
    if (commentFieldId !== null) {
      await addFieldComment(sourceId, commentFieldId, commentText);
      setCommentFieldId(null);
      reload();
    }
  };
  const doAcceptAll = async () => { await acceptAllFields(sourceId); reload(); };

  const rate = stats.total > 0 ? Math.round(((stats.accepted + stats.rejected) / stats.total) * 100) : 0;
  const allReviewed = stats.pending === 0 && stats.total > 0;
  const headerSs = statusStyle(allReviewed ? 'Approved' : 'Ready for Review');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 52px)', background: K.pageBg, fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif" }}>
      {/* Top bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 24px', background: '#fff', borderBottom: `1px solid ${K.border}`, flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ display: 'flex', gap: '4px' }}>
            <button onClick={() => confirmNavigate(goPrev)} disabled={!hasPrev} style={{ padding: '4px 8px', borderRadius: '5px', border: `1px solid ${K.border}`, background: '#fff', color: hasPrev ? K.textMuted : K.textFaint, cursor: hasPrev ? 'pointer' : 'default', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '3px', fontFamily: 'inherit' }}><ChevronLeft size={13} /> Prev</button>
            <button onClick={() => confirmNavigate(goNext)} disabled={!hasNext} style={{ padding: '4px 8px', borderRadius: '5px', border: `1px solid ${K.border}`, background: '#fff', color: hasNext ? K.textMuted : K.textFaint, cursor: hasNext ? 'pointer' : 'default', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '3px', fontFamily: 'inherit' }}>Next <ChevronRight size={13} /></button>
          </div>
          <div>
            <h1 style={{ fontSize: '14px', fontWeight: 700, color: K.textPrimary, margin: 0, maxWidth: '500px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {displayFlag} {displayTitle}
            </h1>
            <div style={{ fontSize: '11px', color: K.textMuted, marginTop: '1px' }}>
              {displaySourceName} &middot; {currentIdx >= 0 ? `${currentIdx + 1} of ${sourcesList.length}` : ''} &middot; {rate}% reviewed
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <Badge label={allReviewed ? 'Reviewed' : 'In Review'} style={headerSs} />
          <button onClick={doAcceptAll} style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '6px 12px', background: '#fff', border: `1px solid ${K.border}`, borderRadius: '6px', fontSize: '12px', fontWeight: 500, color: K.textSecondary, cursor: 'pointer', fontFamily: 'inherit' }}>
            <Check size={12} /> Accept All Pending
          </button>
          <button onClick={() => navigate(`/sources/${sourceId}`)} style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '6px 14px', background: K.accent, border: 'none', borderRadius: '6px', fontSize: '12px', fontWeight: 600, color: '#fff', cursor: 'pointer', fontFamily: 'inherit' }}>
            <Send size={12} /> Table View
          </button>
        </div>
      </div>

      {/* 3-column body */}
      <div style={{ display: 'grid', gridTemplateColumns: evidenceOpen ? '1fr 1.1fr 0.9fr' : '1fr 1.1fr 0px', gap: 0, flex: 1, overflow: 'hidden', transition: 'grid-template-columns 0.2s ease' }}>

        {/* Left — Source preview */}
        <div style={{ borderRight: `1px solid ${K.border}`, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          <div style={{ padding: '12px 16px', borderBottom: `1px solid ${K.border}`, background: '#fff', display: 'flex', alignItems: 'center', gap: '7px', flexShrink: 0 }}>
            <FileText size={13} style={{ color: K.textMuted }} />
            <span style={{ fontSize: '12px', fontWeight: 600, color: K.textPrimary }}>Source Document</span>
            <span style={{ fontSize: '11px', color: K.textFaint, marginLeft: 'auto' }}>{displayCountry} &middot; {displayDocType}</span>
          </div>
          <div style={{ flex: 1, overflow: 'auto', padding: '16px', background: '#fff' }}>
            {hasSourceText ? (
              <div style={{ fontSize: '11.5px', lineHeight: 1.9, color: K.textSecondary, whiteSpace: 'pre-wrap', fontFamily: "'Inter', system-ui, sans-serif" }}>
                {sourceTextContent.split('\n').map((line, idx) => {
                  const range = activeField ? highlightRanges[activeField.field] : null;
                  const isHighlighted = range ? idx >= range[0] && idx <= range[1] : false;
                  return (
                    <div key={idx} style={{ background: isHighlighted ? 'rgba(22,163,74,0.12)' : 'transparent', borderLeft: isHighlighted ? `3px solid ${K.accent}` : '3px solid transparent', paddingLeft: '6px', marginLeft: '-6px', transition: 'background 0.2s' }}>
                      {line || ' '}
                    </div>
                  );
                })}
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: '12px', color: K.textFaint }}>
                <FileQuestion size={32} style={{ opacity: 0.4 }} />
                <div style={{ fontSize: '13px', fontWeight: 600, color: K.textMuted }}>Original document text unavailable</div>
                <div style={{ fontSize: '11px', textAlign: 'center', maxWidth: '240px', lineHeight: 1.5 }}>
                  Extracted field values and evidence excerpts are shown in the panels to the right.
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Center — Extracted fields */}
        <div style={{ borderRight: `1px solid ${K.border}`, display: 'flex', flexDirection: 'column', overflow: 'hidden', background: K.pageBg }}>
          <div style={{ padding: '12px 16px', borderBottom: `1px solid ${K.border}`, background: '#fff', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ fontSize: '12px', fontWeight: 600, color: K.textPrimary }}>Extracted Fields</span>
              <span style={{ fontSize: '10px', color: K.textFaint }}>
                {stats.accepted}A &middot; {stats.rejected}R &middot; {stats.flagged}F &middot; {stats.pending}P
              </span>
            </div>
            <button
              onClick={() => setEvidenceOpen(o => !o)}
              style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '3px 9px', border: `1px solid ${evidenceOpen ? K.accentBorder : K.border}`, borderRadius: '5px', background: evidenceOpen ? K.accentSubtle : '#f8fafc', color: evidenceOpen ? K.accentText : K.textMuted, fontSize: '11px', fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit' }}
            >
              <Highlighter size={11} />
              {evidenceOpen ? 'Hide evidence' : 'Show evidence'}
            </button>
          </div>
          <div style={{ flex: 1, overflow: 'auto', padding: '14px 16px' }}>
            {fields.map(f => {
              const isActive = activeFieldId === f.id;
              const isEditing = editingFieldId === f.id;
              const isCommenting = commentFieldId === f.id;
              const displayValue = f.reviewedValue ?? f.extractedValue;
              const wasEdited = f.reviewedValue !== null && f.reviewedValue !== f.extractedValue;

              return (
                <div key={f.id}
                  onClick={() => setActiveFieldId(isActive ? null : f.id)}
                  style={{
                    padding: '10px 12px', borderRadius: '7px',
                    border: `1px solid ${isActive ? K.accentBorder : K.borderSubtle}`,
                    background: isActive ? K.accentSubtle : '#fff',
                    cursor: 'pointer', marginBottom: '8px', transition: 'all 0.15s',
                  }}
                >
                  {/* Field header */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span style={{ fontSize: '10px', fontWeight: 600, color: isActive ? K.accentText : K.textFaint, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{f.field}</span>
                      <span style={{ fontSize: '9px', padding: '1px 5px', borderRadius: '3px', background: 'rgba(0,0,0,0.04)', color: K.textFaint }}>{f.category}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <ConfidenceIndicator pct={f.confidence} />
                      <FieldStatusBadge status={f.status} />
                    </div>
                  </div>

                  {/* Value display or edit */}
                  {isEditing ? (
                    <div onClick={e => e.stopPropagation()} style={{ marginTop: '4px' }}>
                      <input value={editValue} onChange={e => setEditValue(e.target.value)} autoFocus
                        style={{ width: '100%', padding: '5px 8px', fontSize: '12px', border: `1px solid ${K.accentBorder}`, borderRadius: '5px', fontFamily: 'inherit', background: K.inputBg, color: K.textPrimary, outline: 'none', boxSizing: 'border-box' }} />
                      <div style={{ display: 'flex', gap: '5px', marginTop: '6px' }}>
                        <button onClick={saveEdit} style={{ padding: '3px 10px', background: K.accent, border: 'none', borderRadius: '4px', color: '#fff', fontSize: '11px', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>Save</button>
                        <button onClick={cancelEdit} style={{ padding: '3px 10px', background: '#fff', border: `1px solid ${K.border}`, borderRadius: '4px', color: K.textMuted, fontSize: '11px', cursor: 'pointer', fontFamily: 'inherit' }}>Cancel</button>
                      </div>
                    </div>
                  ) : (
                    <div style={{ fontSize: '12px', color: K.textPrimary, lineHeight: 1.5, marginTop: '2px' }}>
                      {displayValue}
                      {wasEdited && (
                        <span style={{ fontSize: '10px', color: K.textFaint, marginLeft: '6px' }}>(edited)</span>
                      )}
                    </div>
                  )}

                  {/* Comment display */}
                  {f.comment && !isCommenting && (
                    <div style={{ marginTop: '6px', padding: '6px 8px', background: 'rgba(59,130,246,0.06)', border: '1px solid rgba(59,130,246,0.12)', borderRadius: '5px', fontSize: '11px', color: '#2563eb', display: 'flex', gap: '5px', alignItems: 'flex-start' }}>
                      <MessageSquare size={10} style={{ marginTop: '2px', flexShrink: 0 }} />
                      <span>{f.comment}</span>
                    </div>
                  )}

                  {/* Comment input */}
                  {isCommenting && (
                    <div onClick={e => e.stopPropagation()} style={{ marginTop: '6px' }}>
                      <textarea value={commentText} onChange={e => setCommentText(e.target.value)} rows={2} autoFocus placeholder="Add a reviewer comment\u2026"
                        style={{ width: '100%', padding: '5px 8px', fontSize: '11px', border: `1px solid ${K.accentBorder}`, borderRadius: '5px', fontFamily: 'inherit', background: K.inputBg, color: K.textPrimary, outline: 'none', boxSizing: 'border-box', resize: 'vertical', lineHeight: 1.5 }} />
                      <div style={{ display: 'flex', gap: '5px', marginTop: '4px' }}>
                        <button onClick={saveComment} style={{ padding: '3px 10px', background: K.accent, border: 'none', borderRadius: '4px', color: '#fff', fontSize: '11px', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>Save Comment</button>
                        <button onClick={() => setCommentFieldId(null)} style={{ padding: '3px 10px', background: '#fff', border: `1px solid ${K.border}`, borderRadius: '4px', color: K.textMuted, fontSize: '11px', cursor: 'pointer', fontFamily: 'inherit' }}>Cancel</button>
                      </div>
                    </div>
                  )}

                  {/* Action buttons (shown when field is active) */}
                  {isActive && !isEditing && !isCommenting && (
                    <div onClick={e => e.stopPropagation()} style={{ display: 'flex', gap: '5px', marginTop: '8px', flexWrap: 'wrap' }}>
                      {f.status !== 'Accepted' && (
                        <SmallBtn icon={<Check size={10} />} label="Accept" color={K.accent} onClick={() => doAccept(f.id)} />
                      )}
                      {f.status !== 'Rejected' && (
                        <SmallBtn icon={<XCircle size={10} />} label="Reject" color="#dc2626" onClick={() => doReject(f.id)} />
                      )}
                      {f.status !== 'Flagged' && (
                        <SmallBtn icon={<Flag size={10} />} label="Flag" color="#d97706" onClick={() => doFlag(f.id)} />
                      )}
                      <SmallBtn icon={<Edit2 size={10} />} label="Edit" color={K.textMuted} onClick={() => startEdit(f)} />
                      <SmallBtn icon={<MessageSquare size={10} />} label="Comment" color={K.textMuted} onClick={() => startComment(f.id, f.comment)} />
                      {f.status !== 'Pending' && (
                        <SmallBtn icon={<X size={10} />} label="Reset" color={K.textFaint} onClick={() => doReset(f.id)} />
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Right — Field evidence */}
        <div style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden', background: '#fff', borderLeft: evidenceOpen ? `1px solid ${K.border}` : 'none', minWidth: 0, opacity: evidenceOpen ? 1 : 0, transition: 'opacity 0.15s ease' }}>
          <div style={{ padding: '12px 16px', borderBottom: `1px solid ${K.border}`, display: 'flex', alignItems: 'center', gap: '7px', flexShrink: 0 }}>
            <Highlighter size={13} style={{ color: K.textMuted }} />
            <span style={{ fontSize: '12px', fontWeight: 600, color: K.textPrimary }}>Field Evidence</span>
          </div>
          <div style={{ flex: 1, overflow: 'auto', padding: '16px' }}>
            {activeField && (activeField as any).evidence ? (
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '12px' }}>
                  <span style={{ padding: '2px 8px', background: K.accentSubtle, border: `1px solid ${K.accentBorder}`, borderRadius: '4px', fontSize: '10px', fontWeight: 600, color: K.accentText, textTransform: 'uppercase' }}>{activeField.field}</span>
                  {(activeField as any).evidenceSection && <span style={{ fontSize: '10px', color: K.textFaint }}>{(activeField as any).evidenceSection}</span>}
                </div>
                <div style={{ padding: '14px', background: 'rgba(22,163,74,0.06)', border: `1px solid ${K.accentBorder}`, borderRadius: '8px', fontSize: '12px', lineHeight: 1.7, color: K.textSecondary, position: 'relative' }}>
                  <div style={{ width: '3px', position: 'absolute', left: 0, top: 0, bottom: 0, background: K.accent, borderRadius: '3px 0 0 3px' }} />
                  {(activeField as any).evidence}
                </div>
                <div style={{ marginTop: '12px', padding: '10px 12px', background: '#fafafa', border: `1px solid ${K.border}`, borderRadius: '7px' }}>
                  <div style={{ fontSize: '10px', fontWeight: 600, color: K.textFaint, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '6px' }}>Confidence</div>
                  <div style={{ height: '4px', background: K.progressBg, borderRadius: '2px', overflow: 'hidden', marginBottom: '5px' }}>
                    <div style={{ height: '100%', width: `${activeField.confidence}%`, background: activeField.confidence >= 90 ? K.accent : activeField.confidence >= 75 ? '#d97706' : '#dc2626', borderRadius: '2px' }} />
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: '11px', color: K.textMuted }}>AI extracted</span>
                    <span style={{ fontSize: '11px', fontWeight: 600, color: activeField.confidence >= 90 ? K.accentText : activeField.confidence >= 75 ? '#d97706' : '#dc2626' }}>{activeField.confidence}%</span>
                  </div>
                </div>
              </div>
            ) : activeField ? (
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '12px' }}>
                  <span style={{ padding: '2px 8px', background: K.accentSubtle, border: `1px solid ${K.accentBorder}`, borderRadius: '4px', fontSize: '10px', fontWeight: 600, color: K.accentText, textTransform: 'uppercase' }}>{activeField.field}</span>
                </div>
                <div style={{ padding: '14px', background: '#fafafa', border: `1px solid ${K.border}`, borderRadius: '8px', fontSize: '12px', lineHeight: 1.7, color: K.textSecondary }}>
                  {activeField.evidence}
                </div>
                <div style={{ marginTop: '12px', padding: '10px 12px', background: '#fafafa', border: `1px solid ${K.border}`, borderRadius: '7px' }}>
                  <div style={{ fontSize: '10px', fontWeight: 600, color: K.textFaint, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '6px' }}>Confidence</div>
                  <div style={{ height: '4px', background: K.progressBg, borderRadius: '2px', overflow: 'hidden', marginBottom: '5px' }}>
                    <div style={{ height: '100%', width: `${activeField.confidence}%`, background: activeField.confidence >= 90 ? K.accent : activeField.confidence >= 75 ? '#d97706' : '#dc2626', borderRadius: '2px' }} />
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: '11px', color: K.textMuted }}>AI extracted</span>
                    <span style={{ fontSize: '11px', fontWeight: 600, color: K.accentText }}>{activeField.confidence}%</span>
                  </div>
                </div>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '200px', gap: '10px', color: K.textFaint }}>
                <Info size={24} style={{ opacity: 0.4 }} />
                <p style={{ fontSize: '12px', textAlign: 'center', margin: 0 }}>Click a field in the centre<br />panel to view its source evidence</p>
              </div>
            )}

            {/* All fields quick list */}
            <div style={{ marginTop: '20px' }}>
              <div style={{ fontSize: '10px', fontWeight: 600, color: K.textFaint, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '8px' }}>All Fields ({fields.length})</div>
              {fields.map(f => (
                <button key={f.id} onClick={() => setActiveFieldId(f.id === activeFieldId ? null : f.id)}
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', padding: '6px 10px', marginBottom: '3px', borderRadius: '6px', border: `1px solid ${activeFieldId === f.id ? K.accentBorder : K.borderSubtle}`, background: activeFieldId === f.id ? K.accentSubtle : '#fff', cursor: 'pointer', fontFamily: 'inherit' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                    <FieldStatusBadge status={f.status} />
                    <span style={{ fontSize: '11px', fontWeight: 500, color: activeFieldId === f.id ? K.accentText : K.textSecondary }}>{f.field}</span>
                  </div>
                  <span style={{ fontSize: '10px', color: K.textFaint }}>{f.confidence}%</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function SmallBtn({ icon, label, color, onClick }: { icon: React.ReactNode; label: string; color: string; onClick: () => void }) {
  return (
    <button onClick={onClick} style={{
      display: 'flex', alignItems: 'center', gap: '3px', padding: '3px 8px',
      background: '#fff', border: `1px solid ${K.border}`, borderRadius: '4px',
      fontSize: '10px', fontWeight: 600, color, cursor: 'pointer', fontFamily: 'inherit', whiteSpace: 'nowrap',
    }}>
      {icon} {label}
    </button>
  );
}
