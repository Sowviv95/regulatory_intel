import { useNavigate } from 'react-router';
import {
  TrendingUp, TrendingDown, Bell, Globe, Activity, Clock, CheckCircle2,
  XCircle, Flag, AlertTriangle, RefreshCw, FileText, ShieldCheck,
} from 'lucide-react';
import { K, impactStyle, statusStyle } from './kiaa-tokens';
import { Badge } from './KBadge';
import { LoadingState, ErrorState } from './StateViews';
import { getDashboardData } from '../../services/dashboard';
import { useApi } from '../../services/useApi';

export function Dashboard() {
  const navigate = useNavigate();
  const { data, loading, error, reload } = useApi(() => getDashboardData(), []);

  if (loading) return <LoadingState message="Loading dashboard\u2026" />;
  if (error || !data) return <ErrorState title="Failed to load dashboard" message={error ?? undefined} onRetry={reload} />;

  const { kpis, stats, jurisdictions, alerts, recentActivity, oldestPending } = data;

  const decisionIcon = (d: string) => {
    if (d === 'Accepted') return <CheckCircle2 size={11} color={K.accent} />;
    if (d === 'Rejected') return <XCircle size={11} color="#dc2626" />;
    if (d === 'Flagged') return <Flag size={11} color="#d97706" />;
    return <Activity size={11} color={K.textMuted} />;
  };

  return (
    <div style={{ padding: '24px', background: K.pageBg, minHeight: '100vh', fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif" }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '20px' }}>
        <div>
          <h1 style={{ fontSize: '20px', fontWeight: 800, color: K.textPrimary, margin: 0, lineHeight: 1.2 }}>
            Regulatory Intelligence
          </h1>
          <p style={{ fontSize: '12px', color: K.textMuted, marginTop: '3px' }}>
            Tobacco & Nicotine &middot; Dashboard
          </p>
        </div>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <button onClick={reload} style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '7px 12px', background: '#fff', border: `1px solid ${K.border}`, borderRadius: '6px', fontSize: '12px', fontWeight: 500, color: K.textSecondary, cursor: 'pointer', fontFamily: 'inherit' }}>
            <RefreshCw size={13} /> Refresh
          </button>
          <button onClick={() => navigate('/sources')} style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '7px 12px', background: '#fff', border: `1px solid ${K.border}`, borderRadius: '6px', fontSize: '12px', fontWeight: 500, color: K.textSecondary, cursor: 'pointer', fontFamily: 'inherit' }}>
            <Bell size={13} /> <span>Alerts</span> <span style={{ background: K.accent, color: '#fff', fontSize: '10px', fontWeight: 700, borderRadius: '9px', padding: '0 5px', marginLeft: '2px' }}>{alerts.length}</span>
          </button>
          <button onClick={() => navigate('/search')} style={{ padding: '7px 14px', background: K.accent, border: 'none', borderRadius: '6px', fontSize: '12px', fontWeight: 600, color: '#fff', cursor: 'pointer', fontFamily: 'inherit' }}>
            Export Report
          </button>
        </div>
      </div>

      {/* KPI cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '14px', marginBottom: '20px' }}>
        {kpis.map(kpi => (
          <div
            key={kpi.label}
            onClick={() => kpi.nav && navigate(kpi.nav)}
            style={{ background: '#fff', border: `1px solid ${K.border}`, borderRadius: '10px', padding: '18px 20px', boxShadow: '0 1px 4px rgba(0,0,0,0.04)', cursor: kpi.nav ? 'pointer' : 'default', transition: 'border-color 0.12s' }}
            onMouseEnter={e => { if (kpi.nav) (e.currentTarget as HTMLElement).style.borderColor = K.accentBorder; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = K.border; }}
          >
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

      {/* Stats bar */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '10px', marginBottom: '20px' }}>
        {[
          { label: 'Regulations', value: stats.totalRegulations, icon: <FileText size={13} color={K.textMuted} />, nav: '/search' },
          { label: 'Accepted', value: stats.acceptedFields, icon: <CheckCircle2 size={13} color={K.accent} />, nav: '/search?status=Accepted' },
          { label: 'Rejected', value: stats.rejectedFields, icon: <XCircle size={13} color="#dc2626" />, nav: '/search?status=Rejected' },
          { label: 'Flagged', value: stats.flaggedFields, icon: <Flag size={13} color="#d97706" />, nav: '/search?status=Flagged' },
          { label: 'Low Confidence', value: stats.lowConfidenceFields, icon: <AlertTriangle size={13} color="#dc2626" />, nav: '/search?confidence=Low' },
          { label: 'Evidence', value: `${stats.evidenceCoverage}%`, icon: <ShieldCheck size={13} color={K.accent} />, nav: '/search' },
        ].map(s => (
          <div
            key={s.label}
            onClick={() => navigate(s.nav)}
            style={{ background: '#fff', border: `1px solid ${K.border}`, borderRadius: '8px', padding: '12px 14px', cursor: 'pointer', transition: 'border-color 0.12s' }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = K.accentBorder; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = K.border; }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '5px', marginBottom: '6px' }}>
              {s.icon}
              <span style={{ fontSize: '10px', fontWeight: 600, color: K.textMuted, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{s.label}</span>
            </div>
            <div style={{ fontSize: '20px', fontWeight: 700, color: K.textPrimary }}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* Lower grid: 2 columns */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '20px' }}>

        {/* Jurisdiction Coverage */}
        <div style={{ background: '#fff', border: `1px solid ${K.border}`, borderRadius: '10px', padding: '20px', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
              <Globe size={15} style={{ color: K.textMuted }} />
              <h3 style={{ fontSize: '13px', fontWeight: 600, color: K.textPrimary, margin: 0 }}>Jurisdiction Coverage</h3>
            </div>
            <span style={{ fontSize: '11px', color: K.textFaint }}>{jurisdictions.length} jurisdictions</span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 60px 55px 55px', gap: '4px', marginBottom: '10px', padding: '0 2px' }}>
            {['Country', 'Covered', 'Pending', 'High'].map(h => (
              <span key={h} style={{ fontSize: '10px', fontWeight: 600, color: K.textFaint, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{h}</span>
            ))}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {jurisdictions.map(j => {
              const pct = j.total > 0 ? Math.round((j.covered / j.total) * 100) : 0;
              return (
                <div
                  key={j.country}
                  onClick={() => navigate(`/sources?country=${encodeURIComponent(j.country)}`)}
                  style={{ cursor: 'pointer' }}
                >
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 60px 55px 55px', gap: '4px', alignItems: 'center', marginBottom: '5px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
                      <span style={{ fontSize: '15px', lineHeight: 1 }}>{j.flag}</span>
                      <span style={{ fontSize: '12px', fontWeight: 500, color: K.textPrimary }}>{j.country}</span>
                    </div>
                    <span style={{ fontSize: '11px', color: K.textSecondary }}>{j.covered}/{j.total}</span>
                    <span style={{ fontSize: '11px', color: K.textMuted }}>{j.pending}</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      {j.high > 5 && <AlertTriangle size={10} style={{ color: '#dc2626' }} />}
                      <span style={{ fontSize: '11px', color: j.high > 5 ? '#dc2626' : K.textMuted }}>{j.high}</span>
                    </div>
                  </div>
                  <div style={{ height: '4px', background: K.progressBg, borderRadius: '2px', overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${pct}%`, background: pct > 80 ? K.accent : pct > 50 ? '#d97706' : '#ef4444', borderRadius: '2px', transition: 'width 0.3s' }} />
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
              <h3 style={{ fontSize: '13px', fontWeight: 600, color: K.textPrimary, margin: 0 }}>Recent Sources</h3>
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
                  onClick={() => navigate(`/sources/${a.id}`)}
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

      {/* Bottom row: Recent Activity + Oldest Pending */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>

        {/* Recent Review Activity */}
        <div style={{ background: '#fff', border: `1px solid ${K.border}`, borderRadius: '10px', padding: '20px', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
              <Activity size={15} style={{ color: K.textMuted }} />
              <h3 style={{ fontSize: '13px', fontWeight: 600, color: K.textPrimary, margin: 0 }}>Recent Review Activity</h3>
            </div>
          </div>
          {recentActivity.length === 0 ? (
            <div style={{ fontSize: '12px', color: K.textFaint, textAlign: 'center', padding: '20px 0' }}>No review activity yet</div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {recentActivity.map((a, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', padding: '8px 0', borderBottom: i < recentActivity.length - 1 ? `1px solid ${K.borderSubtle}` : 'none' }}>
                  {decisionIcon(a.decision)}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: '12px', color: K.textPrimary }}>
                      <span style={{ fontWeight: 600 }}>{a.decision}</span> {a.fieldName}
                    </div>
                    <div style={{ fontSize: '11px', color: K.textFaint, marginTop: '2px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {a.sourceTitle} &middot; {a.country}
                    </div>
                  </div>
                  <span style={{ fontSize: '10px', color: K.textFaint, flexShrink: 0 }}>{a.createdAt}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Oldest Pending */}
        <div style={{ background: '#fff', border: `1px solid ${K.border}`, borderRadius: '10px', padding: '20px', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
              <Clock size={15} style={{ color: K.textMuted }} />
              <h3 style={{ fontSize: '13px', fontWeight: 600, color: K.textPrimary, margin: 0 }}>Queue Ageing</h3>
            </div>
            <button
              onClick={() => navigate('/sources?status=New')}
              style={{ fontSize: '11px', color: K.accentText, fontWeight: 500, background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}
            >View queue &rarr;</button>
          </div>
          {oldestPending.length === 0 ? (
            <div style={{ fontSize: '12px', color: K.textFaint, textAlign: 'center', padding: '20px 0' }}>No pending items</div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {oldestPending.map(p => {
                const ss = statusStyle(p.status);
                return (
                  <div
                    key={p.id}
                    onClick={() => navigate(`/sources/${p.id}`)}
                    style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 10px', border: `1px solid ${K.borderSubtle}`, borderRadius: '7px', cursor: 'pointer', transition: 'background 0.12s' }}
                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = K.cardBgHover; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
                  >
                    <span style={{ fontSize: '14px' }}>{p.flag}</span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: '12px', fontWeight: 500, color: K.textPrimary, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.title}</div>
                      <div style={{ fontSize: '11px', color: K.textFaint }}>{p.country} &middot; {p.discovered}</div>
                    </div>
                    <Badge label={p.status} style={ss} />
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
