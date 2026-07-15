import { useState } from 'react';
import { useNavigate } from 'react-router';
import { TrendingUp, TrendingDown, Bell, Globe, ChevronDown, Filter, AlertTriangle, RefreshCw } from 'lucide-react';
import { K, impactStyle, statusStyle } from './kiaa-tokens';
import { Badge } from './KBadge';
import { getDashboardData } from '../../services/dashboard';

const dashboardData = getDashboardData();

function FilterDropdown({ label, options }: { label: string; options: string[] }) {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState('All');
  return (
    <div style={{ position: 'relative' }}>
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          display: 'flex', alignItems: 'center', gap: '5px', padding: '5px 10px',
          background: selected !== 'All' ? K.accentSubtle : '#fff',
          border: `1px solid ${selected !== 'All' ? K.accentBorder : K.inputBorder}`,
          borderRadius: '6px', cursor: 'pointer', fontSize: '12px', fontWeight: 500,
          color: selected !== 'All' ? K.accentText : K.textSecondary,
          fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
        }}
      >
        <span style={{ color: K.textFaint, fontWeight: 400 }}>{label}:</span>
        <span>{selected}</span>
        <ChevronDown size={11} />
      </button>
      {open && (
        <div style={{
          position: 'absolute', top: 'calc(100% + 4px)', left: 0, zIndex: 100,
          background: '#fff', border: `1px solid ${K.border}`, borderRadius: '8px',
          boxShadow: '0 8px 24px rgba(0,0,0,0.09)', minWidth: '150px', overflow: 'hidden',
        }}>
          {['All', ...options].map(opt => (
            <button key={opt} onClick={() => { setSelected(opt); setOpen(false); }}
              style={{
                display: 'block', width: '100%', textAlign: 'left', padding: '7px 12px',
                background: selected === opt ? K.accentSubtle : 'transparent',
                color: selected === opt ? K.accentText : K.textSecondary,
                fontSize: '12px', fontWeight: selected === opt ? 600 : 400,
                border: 'none', cursor: 'pointer',
                fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
              }}
            >{opt}</button>
          ))}
        </div>
      )}
    </div>
  );
}

export function Dashboard() {
  const navigate = useNavigate();
  const { kpis, jurisdictions, alerts } = dashboardData;

  return (
    <div style={{ padding: '24px', background: K.pageBg, minHeight: '100vh', fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif" }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '20px' }}>
        <div>
          <h1 style={{ fontSize: '20px', fontWeight: 800, color: K.textPrimary, margin: 0, lineHeight: 1.2 }}>
            Regulatory Intelligence
          </h1>
          <p style={{ fontSize: '12px', color: K.textMuted, marginTop: '3px' }}>
            Tobacco & Nicotine &middot; Dashboard &middot; Jul 15, 2026
          </p>
        </div>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <button style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '7px 12px', background: '#fff', border: `1px solid ${K.border}`, borderRadius: '6px', fontSize: '12px', fontWeight: 500, color: K.textSecondary, cursor: 'pointer', fontFamily: 'inherit' }}>
            <RefreshCw size={13} /> Refresh
          </button>
          <button style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '7px 12px', background: '#fff', border: `1px solid ${K.border}`, borderRadius: '6px', fontSize: '12px', fontWeight: 500, color: K.textSecondary, cursor: 'pointer', fontFamily: 'inherit' }}>
            <Bell size={13} /> <span>Alerts</span> <span style={{ background: K.accent, color: '#fff', fontSize: '10px', fontWeight: 700, borderRadius: '9px', padding: '0 5px', marginLeft: '2px' }}>6</span>
          </button>
          <button style={{ padding: '7px 14px', background: K.accent, border: 'none', borderRadius: '6px', fontSize: '12px', fontWeight: 600, color: '#fff', cursor: 'pointer', fontFamily: 'inherit' }}>
            Export Report
          </button>
        </div>
      </div>

      {/* Filter bar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 14px', background: '#fff', border: `1px solid ${K.border}`, borderRadius: '8px', marginBottom: '20px' }}>
        <Filter size={13} style={{ color: K.textFaint }} />
        <span style={{ fontSize: '12px', color: K.textFaint, marginRight: '4px' }}>Filters</span>
        <div style={{ width: '1px', height: '16px', background: K.border, margin: '0 4px' }} />
        <FilterDropdown label="Country" options={['Taiwan', 'Denmark', 'Finland', 'Poland', 'South Korea', 'Vietnam']} />
        <FilterDropdown label="Status" options={['New', 'Processing', 'Ready for Review', 'Irrelevant']} />
        <FilterDropdown label="Product" options={['Cigarettes', 'E-cigarettes', 'Nicotine Pouches', 'Heated Tobacco', 'Cigars', 'Smokeless Tobacco']} />
        <FilterDropdown label="Date" options={['Last 7 days', 'Last 30 days', 'Last 90 days', 'This year', 'Custom range']} />
      </div>

      {/* KPI cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '14px', marginBottom: '20px' }}>
        {kpis.map(kpi => (
          <div key={kpi.label} style={{ background: '#fff', border: `1px solid ${K.border}`, borderRadius: '10px', padding: '18px 20px', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
            <div style={{ fontSize: '11px', fontWeight: 500, color: K.textMuted, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '10px' }}>{kpi.label}</div>
            <div style={{ fontSize: '30px', fontWeight: 700, color: K.textPrimary, lineHeight: 1 }}>{kpi.value}</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '5px', marginTop: '10px' }}>
              {kpi.up
                ? <TrendingUp size={12} color={K.accent} />
                : <TrendingDown size={12} color="#dc2626" />}
              <span style={{ fontSize: '11px', color: kpi.up ? K.accent : '#dc2626', fontWeight: 500 }}>{kpi.delta}</span>
            </div>
            <div style={{ fontSize: '11px', color: K.textFaint, marginTop: '3px' }}>{kpi.sub}</div>
          </div>
        ))}
      </div>

      {/* Lower grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>

        {/* Jurisdiction Coverage */}
        <div style={{ background: '#fff', border: `1px solid ${K.border}`, borderRadius: '10px', padding: '20px', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
              <Globe size={15} style={{ color: K.textMuted }} />
              <h3 style={{ fontSize: '13px', fontWeight: 600, color: K.textPrimary, margin: 0 }}>Jurisdiction Coverage</h3>
            </div>
            <span style={{ fontSize: '11px', color: K.textFaint }}>6 jurisdictions</span>
          </div>

          {/* Column headers */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 60px 55px 55px', gap: '4px', marginBottom: '10px', padding: '0 2px' }}>
            {['Country', 'Covered', 'Pending', 'High'].map(h => (
              <span key={h} style={{ fontSize: '10px', fontWeight: 600, color: K.textFaint, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{h}</span>
            ))}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {jurisdictions.map(j => {
              const pct = Math.round((j.covered / j.total) * 100);
              return (
                <div key={j.country}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 60px 55px 55px', gap: '4px', alignItems: 'center', marginBottom: '5px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
                      <span style={{ fontSize: '15px', lineHeight: 1 }}>{j.flag}</span>
                      <span style={{ fontSize: '12px', fontWeight: 500, color: K.textPrimary }}>{j.country}</span>
                    </div>
                    <span style={{ fontSize: '11px', color: K.textSecondary }}>{j.covered}/{j.total}</span>
                    <span style={{ fontSize: '11px', color: K.textMuted }}>{j.pending}</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      {j.high > 15 && <AlertTriangle size={10} style={{ color: '#dc2626' }} />}
                      <span style={{ fontSize: '11px', color: j.high > 15 ? '#dc2626' : K.textMuted }}>{j.high}</span>
                    </div>
                  </div>
                  <div style={{ height: '4px', background: K.progressBg, borderRadius: '2px', overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${pct}%`, background: pct > 80 ? K.accent : pct > 65 ? '#d97706' : '#ef4444', borderRadius: '2px', transition: 'width 0.3s' }} />
                  </div>
                  <div style={{ fontSize: '10px', color: K.textFaint, marginTop: '2px', textAlign: 'right' }}>{pct}%</div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Recent Alerts */}
        <div style={{ background: '#fff', border: `1px solid ${K.border}`, borderRadius: '10px', padding: '20px', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
              <Bell size={15} style={{ color: K.textMuted }} />
              <h3 style={{ fontSize: '13px', fontWeight: 600, color: K.textPrimary, margin: 0 }}>Recent Alerts</h3>
            </div>
            <button
              onClick={() => navigate('/sources')}
              style={{ fontSize: '11px', color: K.accentText, fontWeight: 500, background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}
            >View all &rarr;</button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '7px' }}>
            {alerts.map(a => {
              const is = impactStyle(a.impact);
              const ss = statusStyle(a.status);
              return (
                <div
                  key={a.id}
                  onClick={() => navigate(`/regulations/${a.id}`)}
                  style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', padding: '10px 11px', border: `1px solid ${K.borderSubtle}`, borderRadius: '7px', cursor: 'pointer', transition: 'background 0.12s, border-color 0.12s' }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = K.cardBgHover; (e.currentTarget as HTMLElement).style.borderColor = K.accentBorder; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent'; (e.currentTarget as HTMLElement).style.borderColor = K.borderSubtle; }}
                >
                  <div style={{ display: 'flex', gap: '8px', flex: 1, minWidth: 0 }}>
                    <span style={{ fontSize: '16px', lineHeight: 1.3 }}>{a.flag}</span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: '12px', fontWeight: 500, color: K.textPrimary, lineHeight: 1.35, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{a.title}</div>
                      <div style={{ fontSize: '11px', color: K.textFaint, marginTop: '2px' }}>{a.country} &middot; {a.date}</div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px', marginLeft: '10px', flexShrink: 0 }}>
                    <Badge label={a.impact} style={is} />
                    <Badge label={a.status} style={ss} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
