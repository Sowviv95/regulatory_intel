import { useState, useRef, useEffect } from 'react';
import { Search, Download, Bell, ChevronDown, Check, X, BookmarkPlus, FileSpreadsheet, FileText, SlidersHorizontal, Star, Library } from 'lucide-react';
import { K, impactStyle } from './kiaa-tokens';
import { Badge } from './KBadge';

const allResults = [
  { id: 1,  flag: '🇹🇼', jurisdiction: 'Taiwan',      title: 'Tobacco Hazards Prevention Act Amendment 2026',            products: ['E-cigarettes', 'HTP'],              regStatus: 'Approved',   impact: 'High',   sourceType: 'Legislative Amendment', date: 'Jul 14, 2026' },
  { id: 2,  flag: '🇰🇷', jurisdiction: 'South Korea', title: 'Electronic Cigarette Content Disclosure Rules',            products: ['E-cigarettes'],                     regStatus: 'Published',  impact: 'High',   sourceType: 'Regulatory Notice',     date: 'Jul 13, 2026' },
  { id: 3,  flag: '🇻🇳', jurisdiction: 'Vietnam',     title: 'Tobacco Control Law Phase 3 Implementation Decree',        products: ['Cigarettes', 'HTP'],                regStatus: 'Approved',   impact: 'High',   sourceType: 'Implementation Decree', date: 'Jul 12, 2026' },
  { id: 4,  flag: '🇩🇰', jurisdiction: 'Denmark',     title: 'Nicotine Pouch Maximum Strength Regulation',               products: ['Nicotine Pouches'],                 regStatus: 'Approved',   impact: 'Medium', sourceType: 'Regulatory Guidance',   date: 'Jul 11, 2026' },
  { id: 5,  flag: '🇫🇮', jurisdiction: 'Finland',     title: 'E-cigarette Point-of-Sale Display Restrictions',           products: ['E-cigarettes'],                     regStatus: 'Published',  impact: 'Low',    sourceType: 'Amendment Proposal',    date: 'Jul 10, 2026' },
  { id: 6,  flag: '🇵🇱', jurisdiction: 'Poland',      title: 'Heated Tobacco Product Labeling Requirements',             products: ['HTP'],                              regStatus: 'Approved',   impact: 'Medium', sourceType: 'Technical Standard',    date: 'Jul 9, 2026'  },
  { id: 7,  flag: '🇹🇼', jurisdiction: 'Taiwan',      title: 'Online Tobacco Advertising Prohibition Enforcement',       products: ['Cigarettes', 'E-cigarettes'],        regStatus: 'Published',  impact: 'High',   sourceType: 'Enforcement Notice',    date: 'Jul 7, 2026'  },
  { id: 8,  flag: '🇰🇷', jurisdiction: 'South Korea', title: 'Flavored Tobacco Product Import Restriction',              products: ['Cigarettes', 'E-cigarettes'],        regStatus: 'Published',  impact: 'Medium', sourceType: 'Import Restriction',    date: 'Jul 5, 2026'  },
  { id: 9,  flag: '🇻🇳', jurisdiction: 'Vietnam',     title: 'Tobacco Retailer Licensing Ministerial Circular',          products: ['Cigarettes'],                        regStatus: 'Approved',   impact: 'Low',    sourceType: 'Ministerial Circular',  date: 'Jun 30, 2026' },
  { id: 10, flag: '🇩🇰', jurisdiction: 'Denmark',     title: 'ENDS Device Safety Standards Consultation (Closed)',       products: ['E-cigarettes'],                     regStatus: 'Published',  impact: 'Low',    sourceType: 'Public Consultation',   date: 'Jun 28, 2026' },
  { id: 11, flag: '🇵🇱', jurisdiction: 'Poland',      title: 'Nicotine Replacement Product Registration Requirements',   products: ['Nicotine Pouches'],                 regStatus: 'Approved',   impact: 'Medium', sourceType: 'Regulatory Update',     date: 'Jun 25, 2026' },
  { id: 12, flag: '🇫🇮', jurisdiction: 'Finland',     title: 'Flavoured E-liquid Ban — Valvira Enforcement Notice',      products: ['E-cigarettes'],                     regStatus: 'Published',  impact: 'High',   sourceType: 'Enforcement Notice',    date: 'Jun 20, 2026' },
];

const savedViews = [
  { id: 1, name: 'High Impact — APAC',    count: 14, starred: true  },
  { id: 2, name: 'EU Nicotine Pouches',   count: 8,  starred: true  },
  { id: 3, name: 'E-cigarette Watch',     count: 32, starred: false },
  { id: 4, name: 'Nordic Market',         count: 18, starred: false },
  { id: 5, name: 'Published This Month',  count: 9,  starred: false },
];

const REG_STATUSES = ['Approved', 'Published'];

function regStatusStyle(s: string) {
  if (s === 'Published') return { bg: 'rgba(99,102,241,0.08)', text: '#4f46e5', border: 'rgba(99,102,241,0.18)' };
  return { bg: 'rgba(22,163,74,0.08)', text: '#16a34a', border: 'rgba(22,163,74,0.18)' };
}

function FilterChip({ label, options, value, onChange }: { label: string; options: string[]; value: string; onChange: (v: string) => void }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    function h(e: MouseEvent) { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); }
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
        {active && <button onClick={e => { e.stopPropagation(); onChange('All'); }} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, color: K.accentText, display: 'flex', lineHeight: 1 }}><X size={10} /></button>}
      </button>
      {open && (
        <div style={{ position: 'absolute', top: 'calc(100% + 4px)', left: 0, zIndex: 100, background: '#fff', border: `1px solid ${K.border}`, borderRadius: '8px', boxShadow: '0 8px 24px rgba(0,0,0,0.09)', minWidth: '160px', overflow: 'hidden' }}>
          {['All', ...options].map(opt => (
            <button key={opt} onClick={() => { onChange(opt); setOpen(false); }} style={{ display: 'block', width: '100%', textAlign: 'left', padding: '7px 12px', background: value === opt ? K.accentSubtle : 'transparent', color: value === opt ? K.accentText : K.textSecondary, fontSize: '12px', fontWeight: value === opt ? 600 : 400, border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}>{opt}</button>
          ))}
        </div>
      )}
    </div>
  );
}

export function SearchExport() {
  const [query, setQuery]             = useState('');
  const [jurisdiction, setJurisdiction] = useState('All');
  const [product, setProduct]         = useState('All');
  const [regStatus, setRegStatus]     = useState('All');
  const [sourceType, setSourceType]   = useState('All');
  const [impact, setImpact]           = useState('All');
  const [dateRange, setDateRange]     = useState('All');
  const [selected, setSelected]       = useState<Set<number>>(new Set());
  const [activeView, setActiveView]   = useState<number | null>(1);
  const [showAlert, setShowAlert]     = useState(false);
  const [alertName, setAlertName]     = useState('');
  const [alertFreq, setAlertFreq]     = useState('Daily digest');
  const [exported, setExported]       = useState<string | null>(null);

  const filtered = allResults.filter(r => {
    const q = query.toLowerCase();
    const matchQ   = !q || r.title.toLowerCase().includes(q) || r.jurisdiction.toLowerCase().includes(q);
    const matchJ   = jurisdiction === 'All' || r.jurisdiction === jurisdiction;
    const matchP   = product === 'All' || r.products.some(p => p.toLowerCase().includes(product.toLowerCase()));
    const matchS   = regStatus === 'All' || r.regStatus === regStatus;
    const matchT   = sourceType === 'All' || r.sourceType === sourceType;
    const matchI   = impact === 'All' || r.impact === impact;
    return matchQ && matchJ && matchP && matchS && matchT && matchI;
  });

  const toggleRow = (id: number) => setSelected(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });
  const toggleAll = () => selected.size === filtered.length ? setSelected(new Set()) : setSelected(new Set(filtered.map(r => r.id)));
  const clearFilters = () => { setJurisdiction('All'); setProduct('All'); setRegStatus('All'); setSourceType('All'); setImpact('All'); setDateRange('All'); };
  const hasFilters = [jurisdiction, product, regStatus, sourceType, impact, dateRange].some(v => v !== 'All');

  const handleExport = (fmt: string) => { setExported(fmt); setTimeout(() => setExported(null), 2500); };

  const thStyle: React.CSSProperties = { padding: '9px 14px', fontSize: '11px', fontWeight: 600, color: K.textMuted, textTransform: 'uppercase', letterSpacing: '0.05em', textAlign: 'left', borderBottom: `1px solid ${K.border}`, background: '#fafafa', whiteSpace: 'nowrap' };
  const tdStyle: React.CSSProperties = { padding: '10px 14px', fontSize: '12px', color: K.textSecondary, borderBottom: `1px solid ${K.borderSubtle}`, verticalAlign: 'middle' };

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
          {savedViews.map(view => (
            <button key={view.id} onClick={() => setActiveView(view.id)}
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
              <p style={{ fontSize: '11px', color: K.textMuted, marginTop: '2px' }}>{filtered.length} approved records · Tobacco & Nicotine regulatory intelligence</p>
            </div>
            <div style={{ display: 'flex', gap: '7px', alignItems: 'center' }}>
              {exported && (
                <span style={{ padding: '5px 10px', background: K.accentSubtle, border: `1px solid ${K.accentBorder}`, borderRadius: '6px', fontSize: '11px', color: K.accentText, fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Check size={11} /> Exported as {exported.toUpperCase()}
                </span>
              )}
              <button onClick={() => setShowAlert(true)} style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '6px 12px', background: '#fff', border: `1px solid ${K.border}`, borderRadius: '6px', fontSize: '12px', fontWeight: 500, color: K.textSecondary, cursor: 'pointer', fontFamily: 'inherit' }}>
                <Bell size={12} /> Create Alert
              </button>
              <button onClick={() => handleExport('CSV')} style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '6px 12px', background: '#fff', border: `1px solid ${K.border}`, borderRadius: '6px', fontSize: '12px', fontWeight: 500, color: K.textSecondary, cursor: 'pointer', fontFamily: 'inherit' }}>
                <FileText size={12} style={{ color: '#2563eb' }} /> CSV
              </button>
              <button onClick={() => handleExport('Excel')} style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '6px 13px', background: K.accent, border: 'none', borderRadius: '6px', fontSize: '12px', fontWeight: 600, color: '#fff', cursor: 'pointer', fontFamily: 'inherit' }}>
                <FileSpreadsheet size={12} /> Excel
              </button>
            </div>
          </div>

          {/* Search */}
          <div style={{ position: 'relative', marginBottom: '10px' }}>
            <Search size={14} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: K.textFaint }} />
            <input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search by regulation title, jurisdiction, or keyword…"
              style={{ width: '100%', padding: '9px 36px 9px 34px', background: '#fff', border: `1px solid ${K.inputBorder}`, borderRadius: '8px', fontSize: '13px', color: K.textPrimary, outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }} />
            {query && <button onClick={() => setQuery('')} style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: K.textFaint, padding: 0, display: 'flex' }}><X size={14} /></button>}
          </div>

          {/* Filters */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', paddingBottom: '14px', flexWrap: 'wrap' }}>
            <SlidersHorizontal size={12} style={{ color: K.textFaint, flexShrink: 0 }} />
            <FilterChip label="Jurisdiction" options={['Taiwan', 'Denmark', 'Finland', 'Poland', 'South Korea', 'Vietnam']} value={jurisdiction} onChange={setJurisdiction} />
            <FilterChip label="Product" options={['Cigarettes', 'E-cigarettes', 'HTP', 'Nicotine Pouches']} value={product} onChange={setProduct} />
            <FilterChip label="Reg. Status" options={REG_STATUSES} value={regStatus} onChange={setRegStatus} />
            <FilterChip label="Source Type" options={['Legislative Amendment', 'Regulatory Notice', 'Implementation Decree', 'Technical Standard', 'Public Consultation', 'Enforcement Notice', 'Ministerial Circular', 'Import Restriction', 'Regulatory Update', 'Regulatory Guidance', 'Amendment Proposal']} value={sourceType} onChange={setSourceType} />
            <FilterChip label="Sector Impact" options={['High', 'Medium', 'Low']} value={impact} onChange={setImpact} />
            <FilterChip label="Date" options={['Last 30 days', 'Last 90 days', 'This year']} value={dateRange} onChange={setDateRange} />
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
                  <th style={{ ...thStyle, width: '38px' }}>
                    <input type="checkbox" checked={selected.size === filtered.length && filtered.length > 0} onChange={toggleAll} style={{ cursor: 'pointer' }} />
                  </th>
                  <th style={thStyle}>Regulation Title</th>
                  <th style={thStyle}>Jurisdiction</th>
                  <th style={thStyle}>Products Affected</th>
                  <th style={thStyle}>Status</th>
                  <th style={thStyle}>Impact</th>
                  <th style={thStyle}>Relevant Date</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((row, i) => {
                  const isSel = selected.has(row.id);
                  const is = impactStyle(row.impact);
                  const rs = regStatusStyle(row.regStatus);
                  const bg = isSel ? 'rgba(22,163,74,0.04)' : i % 2 === 0 ? '#fff' : '#fafafa';
                  return (
                    <tr key={row.id} style={{ background: bg, cursor: 'pointer', transition: 'background 0.1s' }}
                      onMouseEnter={e => { if (!isSel) (e.currentTarget as HTMLElement).style.background = K.cardBgHover; }}
                      onMouseLeave={e => { if (!isSel) (e.currentTarget as HTMLElement).style.background = bg; }}
                    >
                      <td style={tdStyle} onClick={() => toggleRow(row.id)}>
                        <input type="checkbox" checked={isSel} onChange={() => toggleRow(row.id)} style={{ cursor: 'pointer' }} />
                      </td>
                      <td style={{ ...tdStyle, maxWidth: '300px' }}>
                        <div style={{ fontWeight: 500, color: K.textPrimary, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{row.title}</div>
                        <div style={{ fontSize: '11px', color: K.textFaint, marginTop: '2px' }}>{row.sourceType}</div>
                      </td>
                      <td style={tdStyle}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', whiteSpace: 'nowrap' }}>
                          <span style={{ fontSize: '15px' }}>{row.flag}</span>
                          <span style={{ fontWeight: 500, color: K.textPrimary }}>{row.jurisdiction}</span>
                        </div>
                      </td>
                      <td style={tdStyle}>
                        <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                          {row.products.map(p => (
                            <span key={p} style={{ padding: '1px 6px', background: 'rgba(0,0,0,0.04)', border: `1px solid ${K.border}`, borderRadius: '4px', fontSize: '10px', color: K.textMuted, whiteSpace: 'nowrap' }}>{p}</span>
                          ))}
                        </div>
                      </td>
                      <td style={tdStyle}><Badge label={row.regStatus} style={rs} /></td>
                      <td style={tdStyle}><Badge label={row.impact} style={is} /></td>
                      <td style={{ ...tdStyle, color: K.textMuted, whiteSpace: 'nowrap' }}>{row.date}</td>
                    </tr>
                  );
                })}
                {filtered.length === 0 && (
                  <tr><td colSpan={7} style={{ padding: '48px', textAlign: 'center', color: K.textFaint, fontSize: '13px' }}>No records match your filters.</td></tr>
                )}
              </tbody>
            </table>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '11px 16px', borderTop: `1px solid ${K.border}`, background: '#fafafa' }}>
              <span style={{ fontSize: '12px', color: K.textMuted }}>
                {selected.size > 0 ? `${selected.size} of ${filtered.length} selected` : `${filtered.length} records`}
              </span>
              <div style={{ display: 'flex', gap: '6px' }}>
                <button onClick={() => handleExport('CSV')} style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '5px 11px', background: '#fff', border: `1px solid ${K.border}`, borderRadius: '5px', fontSize: '11px', fontWeight: 500, color: K.textSecondary, cursor: 'pointer', fontFamily: 'inherit' }}><FileText size={11} /> Export CSV</button>
                <button onClick={() => handleExport('Excel')} style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '5px 11px', background: K.accent, border: 'none', borderRadius: '5px', fontSize: '11px', fontWeight: 600, color: '#fff', cursor: 'pointer', fontFamily: 'inherit' }}><FileSpreadsheet size={11} /> Export Excel</button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Create Alert modal */}
      {showAlert && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.32)', zIndex: 500, display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={() => setShowAlert(false)}>
          <div style={{ background: '#fff', borderRadius: '12px', padding: '28px', width: '420px', boxShadow: '0 24px 60px rgba(0,0,0,0.15)', position: 'relative' }} onClick={e => e.stopPropagation()}>
            <button onClick={() => setShowAlert(false)} style={{ position: 'absolute', top: '16px', right: '16px', background: 'none', border: 'none', cursor: 'pointer', color: K.textFaint }}><X size={16} /></button>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
              <div style={{ width: '36px', height: '36px', background: K.accentSubtle, border: `1px solid ${K.accentBorder}`, borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Bell size={17} color={K.accent} /></div>
              <div>
                <h2 style={{ fontSize: '15px', fontWeight: 700, color: K.textPrimary, margin: 0 }}>Create Alert</h2>
                <p style={{ fontSize: '11px', color: K.textMuted, margin: 0 }}>Notify when new records match your current filters</p>
              </div>
            </div>
            <div style={{ marginBottom: '14px' }}>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: K.textMuted, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '5px' }}>Alert Name</label>
              <input value={alertName} onChange={e => setAlertName(e.target.value)} placeholder="e.g. High Impact APAC Watch" style={{ width: '100%', padding: '8px 10px', border: `1px solid ${K.inputBorder}`, borderRadius: '7px', fontSize: '13px', color: K.textPrimary, background: K.inputBg, outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box' }} />
            </div>
            <div style={{ marginBottom: '14px' }}>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: K.textMuted, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '5px' }}>Filter Conditions</label>
              <div style={{ padding: '10px 12px', background: '#f8fafc', border: `1px solid ${K.border}`, borderRadius: '7px', fontSize: '12px', color: K.textSecondary, lineHeight: 1.7 }}>
                {!hasFilters && <span style={{ color: K.textFaint }}>No filters active — alert will match all records</span>}
                {jurisdiction !== 'All' && <div>Jurisdiction: <strong>{jurisdiction}</strong></div>}
                {product !== 'All' && <div>Product: <strong>{product}</strong></div>}
                {regStatus !== 'All' && <div>Status: <strong>{regStatus}</strong></div>}
                {impact !== 'All' && <div>Sector Impact: <strong>{impact}</strong></div>}
                {sourceType !== 'All' && <div>Source Type: <strong>{sourceType}</strong></div>}
              </div>
            </div>
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: K.textMuted, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '5px' }}>Frequency</label>
              <div style={{ display: 'flex', gap: '6px' }}>
                {['Immediate', 'Daily digest', 'Weekly summary'].map(f => (
                  <button key={f} onClick={() => setAlertFreq(f)}
                    style={{ flex: 1, padding: '6px', border: `1px solid ${alertFreq === f ? K.accentBorder : K.border}`, borderRadius: '6px', background: alertFreq === f ? K.accentSubtle : '#fff', color: alertFreq === f ? K.accentText : K.textSecondary, fontSize: '11px', fontWeight: alertFreq === f ? 600 : 400, cursor: 'pointer', fontFamily: 'inherit' }}>{f}</button>
                ))}
              </div>
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button onClick={() => setShowAlert(false)} style={{ flex: 1, padding: '9px', border: `1px solid ${K.border}`, borderRadius: '7px', background: '#fff', color: K.textSecondary, fontSize: '13px', fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit' }}>Cancel</button>
              <button onClick={() => { setShowAlert(false); setAlertName(''); }} style={{ flex: 2, padding: '9px', border: 'none', borderRadius: '7px', background: K.accent, color: '#fff', fontSize: '13px', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>Create Alert</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
