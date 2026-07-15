import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router';
import { Play, RotateCcw, EyeOff, ArrowRight, RefreshCw, Loader, CheckCircle, AlertCircle } from 'lucide-react';
import { K, statusStyle } from './kiaa-tokens';
import { Badge } from './KBadge';
import { getSources, updateSourceStatus, updateAllNewToProcessing } from '../../services/sources';
import type { Source, SourceStatus, ProcessingStage } from '../../types';

const TABS: SourceStatus[] = ['New', 'Processing', 'Ready for Review', 'Irrelevant'];

function StageChip({ stage }: { stage: ProcessingStage }) {
  const map: Record<ProcessingStage, { color: string; bg: string }> = {
    'Awaiting Extraction': { color: '#6b7280', bg: 'rgba(107,114,128,0.08)' },
    'Translating':         { color: '#2563eb', bg: 'rgba(59,130,246,0.08)'  },
    'AI Extraction':       { color: '#7c3aed', bg: 'rgba(124,58,237,0.08)'  },
    'Quality Check':       { color: '#d97706', bg: 'rgba(245,158,11,0.08)'  },
    'Analyst Review':      { color: '#16a34a', bg: 'rgba(22,163,74,0.08)'   },
    'Discarded':           { color: '#9ca3af', bg: 'rgba(156,163,175,0.08)' },
  };
  const s = map[stage];
  return (
    <span style={{ fontSize: '11px', fontWeight: 500, padding: '2px 8px', borderRadius: '4px', background: s.bg, color: s.color, whiteSpace: 'nowrap' }}>
      {stage}
    </span>
  );
}

export function SourceQueue() {
  const navigate = useNavigate();
  // Force re-render counter — services mutate in-memory data
  const [, setTick] = useState(0);
  const refresh = useCallback(() => setTick(t => t + 1), []);

  const rows = getSources();
  const [activeTab, setActiveTab] = useState<SourceStatus>('New');

  const startProcessing = (id: number) => {
    updateSourceStatus(id, 'Processing', 'Translating');
    refresh();
  };
  const markIrrelevant = (id: number) => {
    updateSourceStatus(id, 'Irrelevant', 'Discarded');
    refresh();
  };
  const retry = (id: number) => {
    updateSourceStatus(id, 'Processing', 'AI Extraction');
    refresh();
  };
  const restore = (id: number) => {
    updateSourceStatus(id, 'New', 'Awaiting Extraction');
    refresh();
  };
  const processAll = () => {
    updateAllNewToProcessing();
    refresh();
  };

  const tabCounts = TABS.reduce((acc, t) => ({ ...acc, [t]: rows.filter(r => r.status === t).length }), {} as Record<string, number>);
  const visible = rows.filter(r => r.status === activeTab);

  const activeJobs    = rows.filter(r => r.status === 'Processing').length;
  const completed     = rows.filter(r => r.status === 'Ready for Review').length;
  const failures      = 1;

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
          <p style={{ fontSize: '12px', color: K.textMuted, marginTop: '3px' }}>Intake and processing pipeline &middot; Last updated Jul 15, 2026 09:14</p>
        </div>
        <div style={{ display: 'flex', gap: '7px' }}>
          <button
            onClick={processAll}
            style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '7px 14px', background: K.accent, border: 'none', borderRadius: '6px', fontSize: '12px', fontWeight: 600, color: '#fff', cursor: 'pointer', fontFamily: 'inherit' }}>
            <Play size={12} /> Process All
          </button>
          <button style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '7px 13px', background: '#fff', border: `1px solid ${K.border}`, borderRadius: '6px', fontSize: '12px', fontWeight: 500, color: K.textSecondary, cursor: 'pointer', fontFamily: 'inherit' }}>
            <RefreshCw size={13} /> Refresh
          </button>
        </div>
      </div>

      {/* Processing summary */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginBottom: '20px' }}>
        {[
          { label: 'Active Jobs',    value: activeJobs, icon: <Loader size={14} color="#7c3aed" />,     accent: '#7c3aed', bg: 'rgba(124,58,237,0.07)'  },
          { label: 'Ready for Review', value: completed, icon: <CheckCircle size={14} color={K.accent} />, accent: K.accent,  bg: K.accentSubtle           },
          { label: 'Failures',       value: failures,   icon: <AlertCircle size={14} color="#dc2626" />,  accent: '#dc2626', bg: 'rgba(239,68,68,0.07)'   },
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

      {/* Status tabs */}
      <div style={{ display: 'flex', gap: '4px', marginBottom: '14px' }}>
        {TABS.map(tab => {
          const active = activeTab === tab;
          const ss = statusStyle(tab);
          return (
            <button key={tab} onClick={() => setActiveTab(tab)}
              style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 14px', borderRadius: '7px', border: `1px solid ${active ? ss.border : K.border}`, background: active ? ss.bg : '#fff', color: active ? ss.text : K.textMuted, fontSize: '12px', fontWeight: active ? 600 : 400, cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.12s' }}>
              {tab}
              <span style={{ fontSize: '11px', fontWeight: 600, padding: '0 5px', borderRadius: '9px', background: active ? 'rgba(0,0,0,0.08)' : K.progressBg, color: active ? ss.text : K.textFaint }}>
                {tabCounts[tab]}
              </span>
            </button>
          );
        })}
      </div>

      {/* Table */}
      <div style={{ background: '#fff', border: `1px solid ${K.border}`, borderRadius: '10px', overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th style={thStyle}>Country</th>
              <th style={thStyle}>Source</th>
              <th style={thStyle}>Language</th>
              <th style={thStyle}>Document Type</th>
              <th style={thStyle}>Discovered</th>
              <th style={thStyle}>Processing Stage</th>
              <th style={{ ...thStyle, textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {visible.length === 0 && (
              <tr>
                <td colSpan={7} style={{ padding: '40px', textAlign: 'center', color: K.textFaint, fontSize: '13px' }}>
                  No documents in this stage.
                </td>
              </tr>
            )}
            {visible.map((row, i) => (
              <tr key={row.id}
                style={{ background: i % 2 === 0 ? '#fff' : '#fafafa', transition: 'background 0.1s' }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = K.cardBgHover; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = i % 2 === 0 ? '#fff' : '#fafafa'; }}
              >
                <td style={tdStyle}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
                    <span style={{ fontSize: '16px' }}>{row.flag}</span>
                    <span style={{ fontWeight: 500, color: K.textPrimary }}>{row.country}</span>
                  </div>
                </td>
                <td style={{ ...tdStyle, maxWidth: '200px' }}>
                  <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{row.source}</div>
                </td>
                <td style={tdStyle}>
                  <span style={{ padding: '2px 7px', borderRadius: '4px', background: 'rgba(0,0,0,0.04)', color: K.textMuted, fontSize: '11px', fontWeight: 600, fontFamily: 'monospace' }}>{row.language}</span>
                </td>
                <td style={tdStyle}>{row.docType}</td>
                <td style={{ ...tdStyle, color: K.textMuted, whiteSpace: 'nowrap' }}>{row.discovered}</td>
                <td style={tdStyle}><StageChip stage={row.stage} /></td>
                <td style={{ ...tdStyle, textAlign: 'right' }}>
                  <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end', flexWrap: 'nowrap' }}>
                    {row.status === 'New' && (
                      <>
                        <ActionBtn icon={<Play size={11} />} label="Start Processing" accent onClick={() => startProcessing(row.id)} />
                        <ActionBtn icon={<EyeOff size={11} />} label="Mark Irrelevant" onClick={() => markIrrelevant(row.id)} />
                      </>
                    )}
                    {row.status === 'Processing' && (
                      <>
                        <ActionBtn icon={<RotateCcw size={11} />} label="Retry" onClick={() => retry(row.id)} />
                        <ActionBtn icon={<EyeOff size={11} />} label="Mark Irrelevant" onClick={() => markIrrelevant(row.id)} />
                      </>
                    )}
                    {row.status === 'Ready for Review' && (
                      <>
                        <ActionBtn icon={<ArrowRight size={11} />} label="Open Review" accent onClick={() => navigate(`/sources/${row.sourceId}`)} />
                        <ActionBtn icon={<EyeOff size={11} />} label="Mark Irrelevant" onClick={() => markIrrelevant(row.id)} />
                      </>
                    )}
                    {row.status === 'Irrelevant' && (
                      <ActionBtn icon={<RotateCcw size={11} />} label="Restore" onClick={() => restore(row.id)} />
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function ActionBtn({ icon, label, accent, onClick }: { icon: React.ReactNode; label: string; accent?: boolean; onClick: () => void }) {
  return (
    <button onClick={onClick} style={{
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
