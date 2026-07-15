import { useState } from 'react';
import { ChevronDown, Check, X, Edit2, Send, FileText, ChevronLeft, ChevronRight, Highlighter, Tag, Info } from 'lucide-react';
import { K, statusStyle } from './kiaa-tokens';
import { Badge } from './KBadge';

const regulation = {
  id: 1,
  jurisdiction: 'Taiwan',
  flag: '🇹🇼',
  sourceName: 'Health Promotion Administration, Ministry of Health and Welfare',
  title: 'Tobacco Hazards Prevention Act — Amendment 2026 (Enforcement of Electronic Nicotine Delivery Systems)',
  summary: 'This amendment introduces comprehensive regulations governing electronic nicotine delivery systems (ENDS) and heated tobacco products (HTP) in Taiwan. Key provisions include mandatory registration of all ENDS devices, standardised warning labels covering ≥50% of packaging, restrictions on flavoured products, and prohibition of online retail channels. Enforcement penalties are significantly increased for non-compliant distributors.',
  products: ['E-cigarettes', 'Heated Tobacco Products', 'Nicotine Pouches'],
  status: 'Ready for Review',
  sourceType: 'Legislative Amendment',
  proposer: 'Ministry of Health and Welfare',
  sectorImpact: 'High',
  likelihood: 'Confirmed',
  effectiveDate: 'Jan 1, 2027',
  noticeDate: 'Jul 14, 2026',
  commentDeadline: 'Sep 30, 2026',
};

const sourceText = `衛生福利部
健康促進署

公文字號：部授食字第1140300421號

主旨：預告「菸害防制法」修正草案，公告周知。

依據：《行政程序法》第154條。

說明：

一、修正說明
本次修正草案係依據世界衛生組織菸草控制框架公約（WHO FCTC）第9、10條之相關建議，及近年電子煙（ENDS）市場快速擴張所衍生之公共衛生疑慮，針對電子煙及加熱菸草產品之管理規範進行全面檢討與修正。

二、修正重點

（一）產品登記制度
所有電子煙裝置（含煙彈、煙液）及加熱菸草產品，須於本法施行日起六個月內向主管機關完成產品登記，未登記者不得於市場流通銷售。
申請登記須檢附：產品成分清單、毒理學評估報告、製造工廠審核文件及消費者安全數據。

（二）健康警語標示規定
所有菸草及尼古丁相關產品之包裝，須依本法規定標示健康警語，其面積不得小於正反面各百分之五十（50%），並應加印全彩圖形警示。

（三）特定口味限制
禁止生產、進口或販售具有糖果、水果、薄荷醇（薄荷除外）及其他吸引未成年人之特定口味的電子煙及加熱菸草產品。

（四）通路限制
全面禁止電子煙及加熱菸草產品透過網路、郵購或其他非實體通路進行銷售。實體零售業者需取得特許執照方可販售。

（五）罰則加重
違反本法規定者，處新台幣二十萬元以上二百萬元以下罰鍰；情節重大者得廢止其營業執照。

三、施行日期
本修正案預計於中華民國116年1月1日（西元2027年1月1日）起正式施行。

四、意見徵集
本草案公告期間自民國115年7月14日起至115年9月30日止，歡迎社會各界踴躍提供書面意見。

衛生福利部部長  薛xx
中華民國一一五年七月十四日`;

const evidenceMap: Record<string, { text: string; lines: string }> = {
  title: {
    text: '菸害防制法」修正草案（電子尼古丁傳送系統執法）',
    lines: 'Lines 3–5',
  },
  summary: {
    text: '本次修正草案係依據世界衛生組織菸草控制框架公約（WHO FCTC）第9、10條之相關建議，及近年電子煙（ENDS）市場快速擴張所衍生之公共衛生疑慮，針對電子煙及加熱菸草產品之管理規範進行全面檢討與修正。',
    lines: 'Lines 12–16',
  },
  products: {
    text: '所有電子煙裝置（含煙彈、煙液）及加熱菸草產品，須於本法施行日起六個月內向主管機關完成產品登記。',
    lines: 'Lines 19–21',
  },
  sectorImpact: {
    text: '違反本法規定者，處新台幣二十萬元以上二百萬元以下罰鍰；情節重大者得廢止其營業執照。',
    lines: 'Lines 42–43',
  },
  effectiveDate: {
    text: '本修正案預計於中華民國116年1月1日（西元2027年1月1日）起正式施行。',
    lines: 'Lines 46–47',
  },
  commentDeadline: {
    text: '本草案公告期間自民國115年7月14日起至115年9月30日止，歡迎社會各界踴躍提供書面意見。',
    lines: 'Lines 50–51',
  },
};

function FieldRow({ label, field, activeField, setActiveField, children }: {
  label: string; field: string; activeField: string | null; setActiveField: (f: string | null) => void; children: React.ReactNode;
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
  const [activeField, setActiveField] = useState<string | null>('summary');
  const [editing, setEditing] = useState(false);
  const [approved, setApproved] = useState(false);
  const [summaryVal, setSummaryVal] = useState(regulation.summary);
  const [products, setProducts] = useState(regulation.products);
  const [evidenceOpen, setEvidenceOpen] = useState(true);

  const evidence = activeField ? evidenceMap[activeField] : null;

  const ss = statusStyle(approved ? 'Approved' : regulation.status);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', background: K.pageBg, fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif" }}>
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
            <div style={{ fontSize: '11px', color: K.textMuted, marginTop: '1px' }}>Source Queue #1 · {regulation.sourceName}</div>
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
            <span style={{ fontSize: '11px', color: K.textFaint, marginLeft: 'auto' }}>ZH-TW · Legislative Amendment</span>
          </div>
          <div style={{ flex: 1, overflow: 'auto', padding: '16px', background: '#fff' }}>
            <div style={{ fontSize: '11.5px', lineHeight: 1.9, color: K.textSecondary, whiteSpace: 'pre-wrap', fontFamily: "'Inter', system-ui, sans-serif" }}>
              {sourceText.split('\n').map((line, idx) => {
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
                    {line || ' '}
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

            <FieldRow label="Title" field="title" activeField={activeField} setActiveField={setActiveField}>
              {editing
                ? <input defaultValue={regulation.title} style={{ width: '100%', padding: '4px 8px', fontSize: '12px', border: `1px solid ${K.inputBorder}`, borderRadius: '5px', fontFamily: 'inherit', background: K.inputBg, color: K.textPrimary, boxSizing: 'border-box', outline: 'none' }} onClick={e => e.stopPropagation()} />
                : <div style={{ fontSize: '12px', fontWeight: 500, color: K.textPrimary, lineHeight: 1.4 }}>{regulation.title}</div>}
            </FieldRow>

            <FieldRow label="Summary" field="summary" activeField={activeField} setActiveField={setActiveField}>
              {editing
                ? <textarea value={summaryVal} onChange={e => setSummaryVal(e.target.value)} onClick={e => e.stopPropagation()} rows={4} style={{ width: '100%', padding: '5px 8px', fontSize: '12px', border: `1px solid ${K.inputBorder}`, borderRadius: '5px', fontFamily: 'inherit', background: K.inputBg, color: K.textSecondary, boxSizing: 'border-box', resize: 'vertical', outline: 'none', lineHeight: 1.5 }} />
                : <div style={{ fontSize: '12px', color: K.textSecondary, lineHeight: 1.6 }}>{summaryVal}</div>}
            </FieldRow>

            <FieldRow label="Products Impacted" field="products" activeField={activeField} setActiveField={setActiveField}>
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

            <FieldRow label="Sector Impact" field="sectorImpact" activeField={activeField} setActiveField={setActiveField}>
              <SelectField value={regulation.sectorImpact} options={['Low', 'Medium', 'High', 'Critical']} />
            </FieldRow>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '8px' }}>
              <div style={{ padding: '10px 12px', borderRadius: '7px', border: `1px solid ${K.borderSubtle}`, background: '#fff' }}>
                <div style={{ fontSize: '10px', fontWeight: 600, color: K.textFaint, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '4px' }}>Likelihood</div>
                <SelectField value={regulation.likelihood} options={['Speculative', 'Likely', 'Probable', 'Confirmed']} />
              </div>
              <FieldRow label="Effective Date" field="effectiveDate" activeField={activeField} setActiveField={setActiveField}>
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
              <FieldRow label="Comment Deadline" field="commentDeadline" activeField={activeField} setActiveField={setActiveField}>
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
              {Object.entries(evidenceMap).map(([field, ev]) => (
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
