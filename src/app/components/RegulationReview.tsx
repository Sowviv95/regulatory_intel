import { useState } from 'react';
import { useParams, useNavigate } from 'react-router';
import { ChevronDown, Check, X, Edit2, Send, FileText, ChevronLeft, ChevronRight, Highlighter, Tag, Info } from 'lucide-react';
import { K, statusStyle } from './kiaa-tokens';
import { Badge } from './KBadge';
import { ErrorState } from './StateViews';
import { getRegulationDetail, getSourceText, getEvidenceMap } from '../../services/regulations';

function FieldRow({ label, field, activeField, setActiveField, evidenceMap, children }: {
  label: string; field: string; activeField: string | null; setActiveField: (f: string | null) => void; evidenceMap: Record<string, { text: string; lines: string }>; children: React.ReactNode;
}) {
  const active = activeField === field;
  return (
    <div
      onClick={() => setActiveField(active ? null : field)}
      style={{ padding: '10px 12px', borderRadius: '7px', border: `1px solid ${active ? K.accentBorder : K.borderSubtle}`, background: active ? K.accentSubtle : '#fff', cursor: 'pointer', marginBottom: '8px', transition: 'all 0.15s' }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
        <span style={{ fontSize: '10px', fontWeight: 600, color: active ? K.accentText : K.textFaint, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{label}</span>
        {evidenceMap[field] && <span style={{ fontSize: '10px', color: active ? K.accentText : K.textFaint, display: 'flex', alignItems: 'center', gap: '3px' }}><Highlighter size={9} />{evidenceMap[field].lines}</span>}
      </div>
      {children}
    </div>
  );
}

function SelectField({ value, options }: { value: string; options: string[] }) {
  const [open, setOpen] = useState(false);
  const [val, setVal] = useState(value);
  return (
    <div style={{ position: 'relative' }}>
      <button onClick={e => { e.stopPropagation(); setOpen(o => !o); }} style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '4px 8px', background: '#f8fafc', border: `1px solid ${K.inputBorder}`, borderRadius: '5px', fontSize: '12px', fontWeight: 500, color: K.textSecondary, cursor: 'pointer', fontFamily: 'inherit', width: '100%', justifyContent: 'space-between' }}>
        <span>{val}</span><ChevronDown size={11} style={{ color: K.textFaint }} />
      </button>
      {open && (
        <div style={{ position: 'absolute', top: 'calc(100% + 3px)', left: 0, zIndex: 200, background: '#fff', border: `1px solid ${K.border}`, borderRadius: '7px', boxShadow: '0 8px 24px rgba(0,0,0,0.10)', minWidth: '160px', overflow: 'hidden' }}>
          {options.map(o => (
            <button key={o} onClick={e => { e.stopPropagation(); setVal(o); setOpen(false); }} style={{ display: 'block', width: '100%', textAlign: 'left', padding: '7px 12px', background: val === o ? K.accentSubtle : 'transparent', color: val === o ? K.accentText : K.textSecondary, fontSize: '12px', fontWeight: val === o ? 600 : 400, border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}>{o}</button>
          ))}
        </div>
      )}
    </div>
  );
}

export function RegulationReview() {
  const { regulationId } = useParams<{ regulationId: string }>();
  const navigate = useNavigate();
  const regulation = getRegulationDetail(Number(regulationId) || 1);
  const sourceTextContent = getSourceText();
  const evMap = getEvidenceMap();

  const [activeField, setActiveField] = useState<string | null>('summary');
  const [editing, setEditing] = useState(false);
  const [approved, setApproved] = useState(false);
  const [summaryVal, setSummaryVal] = useState(regulation?.summary ?? '');
  const [products, setProducts] = useState(regulation?.products ?? []);
  const [evidenceOpen, setEvidenceOpen] = useState(true);

  if (!regulation) {
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

  const evidence = activeField ? evMap[activeField] : null;
  const ss = statusStyle(approved ? 'Approved' : regulation.status);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 52px)', background: K.pageBg, fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif" }}>
      {/* Top bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 24px', background: '#fff', borderBottom: `1px solid ${K.border}`, flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ display: 'flex', gap: '4px' }}>
            <button style={{ padding: '4px 8px', borderRadius: '5px', border: `1px solid ${K.border}`, background: '#fff', color: K.textMuted, cursor: 'pointer', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '3px', fontFamily: 'inherit' }}><ChevronLeft size={13} /> Prev</button>
            <button style={{ padding: '4px 8px', borderRadius: '5px', border: `1px solid ${K.border}`, background: '#fff', color: K.textMuted, cursor: 'pointer', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '3px', fontFamily: 'inherit' }}>Next <ChevronRight size={13} /></button>
          </div>
          <div>
            <h1 style={{ fontSize: '14px', fontWeight: 700, color: K.textPrimary, margin: 0, maxWidth: '500px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {regulation.flag} {regulation.title}
            </h1>
            <div style={{ fontSize: '11px', color: K.textMuted, marginTop: '1px' }}>Source Queue #1 &middot; {regulation.sourceName}</div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <Badge label={approved ? 'Approved' : regulation.status} style={ss} />
          <button
            onClick={() => setEditing(e => !e)}
            style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '6px 12px', background: editing ? K.accentSubtle : '#fff', border: `1px solid ${editing ? K.accentBorder : K.border}`, borderRadius: '6px', fontSize: '12px', fontWeight: 500, color: editing ? K.accentText : K.textSecondary, cursor: 'pointer', fontFamily: 'inherit' }}>
            <Edit2 size={12} /> {editing ? 'Editing' : 'Edit'}
          </button>
          <button
            onClick={() => setApproved(true)}
            disabled={approved}
            style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '6px 14px', background: approved ? '#f3f4f6' : K.accent, border: 'none', borderRadius: '6px', fontSize: '12px', fontWeight: 600, color: approved ? K.textFaint : '#fff', cursor: approved ? 'default' : 'pointer', fontFamily: 'inherit' }}>
            <Check size={13} /> {approved ? 'Approved' : 'Approve'}
          </button>
          <button style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '6px 14px', background: '#fff', border: `1px solid ${K.border}`, borderRadius: '6px', fontSize: '12px', fontWeight: 600, color: K.textSecondary, cursor: 'pointer', fontFamily: 'inherit' }}>
            <Send size={12} /> Publish
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
            <span style={{ fontSize: '11px', color: K.textFaint, marginLeft: 'auto' }}>ZH-TW &middot; Legislative Amendment</span>
          </div>
          <div style={{ flex: 1, overflow: 'auto', padding: '16px', background: '#fff' }}>
            <div style={{ fontSize: '11.5px', lineHeight: 1.9, color: K.textSecondary, whiteSpace: 'pre-wrap', fontFamily: "'Inter', system-ui, sans-serif" }}>
              {sourceTextContent.split('\n').map((line, idx) => {
                const isHighlighted = evidence && (
                  (activeField === 'title' && idx >= 2 && idx <= 4) ||
                  (activeField === 'summary' && idx >= 11 && idx <= 15) ||
                  (activeField === 'products' && idx >= 18 && idx <= 20) ||
                  (activeField === 'sectorImpact' && idx >= 41 && idx <= 42) ||
                  (activeField === 'effectiveDate' && idx >= 45 && idx <= 46) ||
                  (activeField === 'commentDeadline' && idx >= 49 && idx <= 50)
                );
                return (
                  <div key={idx} style={{ background: isHighlighted ? 'rgba(22,163,74,0.12)' : 'transparent', borderLeft: isHighlighted ? `3px solid ${K.accent}` : '3px solid transparent', paddingLeft: isHighlighted ? '6px' : '6px', marginLeft: '-6px', transition: 'background 0.2s' }}>
                    {line || ' '}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Center — Extracted fields */}
        <div style={{ borderRight: `1px solid ${K.border}`, display: 'flex', flexDirection: 'column', overflow: 'hidden', background: K.pageBg }}>
          <div style={{ padding: '12px 16px', borderBottom: `1px solid ${K.border}`, background: '#fff', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '12px', fontWeight: 600, color: K.textPrimary }}>Extracted Fields</span>
            <button
              onClick={() => setEvidenceOpen(o => !o)}
              style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '3px 9px', border: `1px solid ${evidenceOpen ? K.accentBorder : K.border}`, borderRadius: '5px', background: evidenceOpen ? K.accentSubtle : '#f8fafc', color: evidenceOpen ? K.accentText : K.textMuted, fontSize: '11px', fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit' }}
            >
              <Highlighter size={11} />
              {evidenceOpen ? 'Hide evidence' : 'Show evidence'}
            </button>
          </div>
          <div style={{ flex: 1, overflow: 'auto', padding: '14px 16px' }}>

            {/* Two-col grid for small fields */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '8px' }}>
              <div style={{ padding: '10px 12px', borderRadius: '7px', border: `1px solid ${K.borderSubtle}`, background: '#fff' }}>
                <div style={{ fontSize: '10px', fontWeight: 600, color: K.textFaint, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '4px' }}>Jurisdiction</div>
                {editing
                  ? <SelectField value={regulation.jurisdiction} options={['Taiwan', 'Denmark', 'Finland', 'Poland', 'South Korea', 'Vietnam']} />
                  : <div style={{ fontSize: '12px', fontWeight: 500, color: K.textPrimary, display: 'flex', gap: '5px', alignItems: 'center' }}><span>{regulation.flag}</span> {regulation.jurisdiction}</div>}
              </div>
              <div style={{ padding: '10px 12px', borderRadius: '7px', border: `1px solid ${K.borderSubtle}`, background: '#fff' }}>
                <div style={{ fontSize: '10px', fontWeight: 600, color: K.textFaint, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '4px' }}>Status</div>
                <SelectField value={approved ? 'Approved' : regulation.status} options={['New', 'Processing', 'Ready for Review', 'Approved', 'Published', 'Irrelevant']} />
              </div>
            </div>

            <div style={{ padding: '10px 12px', borderRadius: '7px', border: `1px solid ${K.borderSubtle}`, background: '#fff', marginBottom: '8px' }}>
              <div style={{ fontSize: '10px', fontWeight: 600, color: K.textFaint, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '4px' }}>Source Name</div>
              {editing
                ? <input defaultValue={regulation.sourceName} style={{ width: '100%', padding: '4px 8px', fontSize: '12px', border: `1px solid ${K.inputBorder}`, borderRadius: '5px', fontFamily: 'inherit', background: K.inputBg, color: K.textPrimary, boxSizing: 'border-box', outline: 'none' }} />
                : <div style={{ fontSize: '12px', color: K.textSecondary, lineHeight: 1.4 }}>{regulation.sourceName}</div>}
            </div>

            <FieldRow label="Title" field="title" activeField={activeField} setActiveField={setActiveField} evidenceMap={evMap}>
              {editing
                ? <input defaultValue={regulation.title} style={{ width: '100%', padding: '4px 8px', fontSize: '12px', border: `1px solid ${K.inputBorder}`, borderRadius: '5px', fontFamily: 'inherit', background: K.inputBg, color: K.textPrimary, boxSizing: 'border-box', outline: 'none' }} onClick={e => e.stopPropagation()} />
                : <div style={{ fontSize: '12px', fontWeight: 500, color: K.textPrimary, lineHeight: 1.4 }}>{regulation.title}</div>}
            </FieldRow>

            <FieldRow label="Summary" field="summary" activeField={activeField} setActiveField={setActiveField} evidenceMap={evMap}>
              {editing
                ? <textarea value={summaryVal} onChange={e => setSummaryVal(e.target.value)} onClick={e => e.stopPropagation()} rows={4} style={{ width: '100%', padding: '5px 8px', fontSize: '12px', border: `1px solid ${K.inputBorder}`, borderRadius: '5px', fontFamily: 'inherit', background: K.inputBg, color: K.textSecondary, boxSizing: 'border-box', resize: 'vertical', outline: 'none', lineHeight: 1.5 }} />
                : <div style={{ fontSize: '12px', color: K.textSecondary, lineHeight: 1.6 }}>{summaryVal}</div>}
            </FieldRow>

            <FieldRow label="Products Impacted" field="products" activeField={activeField} setActiveField={setActiveField} evidenceMap={evMap}>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
                {products.map(p => (
                  <span key={p} style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '2px 8px', background: K.accentSubtle, border: `1px solid ${K.accentBorder}`, borderRadius: '12px', fontSize: '11px', fontWeight: 500, color: K.accentText }}>
                    <Tag size={9} /> {p}
                    {editing && <button onClick={e => { e.stopPropagation(); setProducts(products.filter(x => x !== p)); }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: K.accentText, padding: 0, lineHeight: 1 }}><X size={9} /></button>}
                  </span>
                ))}
                {editing && <button onClick={e => e.stopPropagation()} style={{ padding: '2px 8px', border: `1px dashed ${K.accentBorder}`, borderRadius: '12px', fontSize: '11px', color: K.accentText, background: 'transparent', cursor: 'pointer', fontFamily: 'inherit' }}>+ Add</button>}
              </div>
            </FieldRow>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '8px' }}>
              <div style={{ padding: '10px 12px', borderRadius: '7px', border: `1px solid ${K.borderSubtle}`, background: '#fff' }}>
                <div style={{ fontSize: '10px', fontWeight: 600, color: K.textFaint, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '4px' }}>Source Type</div>
                <SelectField value={regulation.sourceType} options={['Legislative Amendment', 'Regulatory Notice', 'Implementation Decree', 'Technical Standard', 'Public Consultation', 'Ministerial Circular']} />
              </div>
              <div style={{ padding: '10px 12px', borderRadius: '7px', border: `1px solid ${K.borderSubtle}`, background: '#fff' }}>
                <div style={{ fontSize: '10px', fontWeight: 600, color: K.textFaint, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '4px' }}>Proposer</div>
                {editing
                  ? <input defaultValue={regulation.proposer} style={{ width: '100%', padding: '4px 8px', fontSize: '12px', border: `1px solid ${K.inputBorder}`, borderRadius: '5px', fontFamily: 'inherit', background: K.inputBg, color: K.textPrimary, boxSizing: 'border-box', outline: 'none' }} />
                  : <div style={{ fontSize: '12px', color: K.textSecondary }}>{regulation.proposer}</div>}
              </div>
            </div>

            <FieldRow label="Sector Impact" field="sectorImpact" activeField={activeField} setActiveField={setActiveField} evidenceMap={evMap}>
              <SelectField value={regulation.sectorImpact} options={['Low', 'Medium', 'High', 'Critical']} />
            </FieldRow>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '8px' }}>
              <div style={{ padding: '10px 12px', borderRadius: '7px', border: `1px solid ${K.borderSubtle}`, background: '#fff' }}>
                <div style={{ fontSize: '10px', fontWeight: 600, color: K.textFaint, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '4px' }}>Likelihood</div>
                <SelectField value={regulation.likelihood} options={['Speculative', 'Likely', 'Probable', 'Confirmed']} />
              </div>
              <FieldRow label="Effective Date" field="effectiveDate" activeField={activeField} setActiveField={setActiveField} evidenceMap={evMap}>
                {editing
                  ? <input defaultValue={regulation.effectiveDate} type="text" style={{ width: '100%', padding: '4px 8px', fontSize: '12px', border: `1px solid ${K.inputBorder}`, borderRadius: '5px', fontFamily: 'inherit', background: K.inputBg, color: K.textPrimary, boxSizing: 'border-box', outline: 'none' }} onClick={e => e.stopPropagation()} />
                  : <div style={{ fontSize: '12px', fontWeight: 500, color: K.textPrimary }}>{regulation.effectiveDate}</div>}
              </FieldRow>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
              <div style={{ padding: '10px 12px', borderRadius: '7px', border: `1px solid ${K.borderSubtle}`, background: '#fff' }}>
                <div style={{ fontSize: '10px', fontWeight: 600, color: K.textFaint, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '4px' }}>Notice Date</div>
                <div style={{ fontSize: '12px', color: K.textSecondary }}>{regulation.noticeDate}</div>
              </div>
              <FieldRow label="Comment Deadline" field="commentDeadline" activeField={activeField} setActiveField={setActiveField} evidenceMap={evMap}>
                <div style={{ fontSize: '12px', fontWeight: 500, color: '#dc2626' }}>{regulation.commentDeadline}</div>
              </FieldRow>
            </div>

          </div>
        </div>

        {/* Right — Field evidence */}
        <div style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden', background: '#fff', borderLeft: evidenceOpen ? `1px solid ${K.border}` : 'none', minWidth: 0, opacity: evidenceOpen ? 1 : 0, transition: 'opacity 0.15s ease' }}>
          <div style={{ padding: '12px 16px', borderBottom: `1px solid ${K.border}`, display: 'flex', alignItems: 'center', gap: '7px', flexShrink: 0 }}>
            <Highlighter size={13} style={{ color: K.textMuted }} />
            <span style={{ fontSize: '12px', fontWeight: 600, color: K.textPrimary }}>Field Evidence</span>
          </div>
          <div style={{ flex: 1, overflow: 'auto', padding: '16px' }}>
            {evidence ? (
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '12px' }}>
                  <span style={{ padding: '2px 8px', background: K.accentSubtle, border: `1px solid ${K.accentBorder}`, borderRadius: '4px', fontSize: '10px', fontWeight: 600, color: K.accentText, textTransform: 'uppercase' }}>{activeField}</span>
                  <span style={{ fontSize: '10px', color: K.textFaint }}>{evidence.lines}</span>
                </div>
                <div style={{ padding: '14px', background: 'rgba(22,163,74,0.06)', border: `1px solid ${K.accentBorder}`, borderRadius: '8px', fontSize: '12px', lineHeight: 1.7, color: K.textSecondary, position: 'relative' }}>
                  <div style={{ width: '3px', position: 'absolute', left: 0, top: 0, bottom: 0, background: K.accent, borderRadius: '3px 0 0 3px' }} />
                  {evidence.text}
                </div>
                <div style={{ marginTop: '12px', padding: '10px 12px', background: '#fafafa', border: `1px solid ${K.border}`, borderRadius: '7px' }}>
                  <div style={{ fontSize: '10px', fontWeight: 600, color: K.textFaint, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '6px' }}>Confidence</div>
                  <div style={{ height: '4px', background: K.progressBg, borderRadius: '2px', overflow: 'hidden', marginBottom: '5px' }}>
                    <div style={{ height: '100%', width: '87%', background: K.accent, borderRadius: '2px' }} />
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: '11px', color: K.textMuted }}>AI extracted</span>
                    <span style={{ fontSize: '11px', fontWeight: 600, color: K.accentText }}>87%</span>
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
              <div style={{ fontSize: '10px', fontWeight: 600, color: K.textFaint, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '8px' }}>All Evidenced Fields</div>
              {Object.entries(evMap).map(([field, ev]) => (
                <button key={field} onClick={() => setActiveField(field === activeField ? null : field)}
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', padding: '7px 10px', marginBottom: '4px', borderRadius: '6px', border: `1px solid ${activeField === field ? K.accentBorder : K.borderSubtle}`, background: activeField === field ? K.accentSubtle : '#fff', cursor: 'pointer', fontFamily: 'inherit' }}>
                  <span style={{ fontSize: '11px', fontWeight: 500, color: activeField === field ? K.accentText : K.textSecondary, textTransform: 'capitalize' }}>{field}</span>
                  <span style={{ fontSize: '10px', color: K.textFaint }}>{ev.lines}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
