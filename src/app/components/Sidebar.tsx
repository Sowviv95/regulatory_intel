import { LayoutDashboard, Inbox, FileText, Search, Settings, ChevronRight, Leaf } from 'lucide-react';
import { K, type Screen } from './kiaa-tokens';

const navItems = [
  { id: 'dashboard' as Screen, label: 'Dashboard', icon: LayoutDashboard },
  { id: 'source-queue' as Screen, label: 'Source Queue', icon: Inbox },
  { id: 'regulation-review' as Screen, label: 'Reg. Review', icon: FileText },
  { id: 'search-export' as Screen, label: 'Search & Export', icon: Search },
];

export function Sidebar({ current, onNavigate }: { current: Screen; onNavigate: (s: Screen) => void }) {
  return (
    <div style={{
      width: '220px', minWidth: '220px', height: '100vh', background: K.sidebarBg,
      borderRight: `1px solid ${K.border}`, display: 'flex', flexDirection: 'column',
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
    }}>
      {/* Logo area */}
      <div style={{ padding: '18px 20px 14px', borderBottom: `1px solid ${K.borderSubtle}` }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '9px' }}>
          <div style={{
            width: '32px', height: '32px', background: K.accent, borderRadius: '8px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Leaf size={17} color="#fff" />
          </div>
          <div>
            <div style={{ fontSize: '13px', fontWeight: 700, color: K.textPrimary, lineHeight: 1.2 }}>KIAA</div>
            <div style={{ fontSize: '10px', color: K.sidebarTextMuted, lineHeight: 1.2 }}>Regulatory Intel</div>
          </div>
        </div>
      </div>

      {/* Section label */}
      <div style={{ padding: '16px 20px 6px' }}>
        <span style={{ fontSize: '10px', fontWeight: 600, color: K.textFaint, textTransform: 'uppercase', letterSpacing: '0.07em' }}>Navigation</span>
      </div>

      {/* Nav items */}
      <nav style={{ flex: 1, padding: '0 10px', display: 'flex', flexDirection: 'column', gap: '2px' }}>
        {navItems.map(({ id, label, icon: Icon }) => {
          const active = current === id;
          return (
            <button
              key={id}
              onClick={() => onNavigate(id)}
              style={{
                display: 'flex', alignItems: 'center', gap: '10px', width: '100%',
                padding: '8px 10px', borderRadius: '7px', border: 'none', cursor: 'pointer',
                background: active ? K.sidebarActiveBg : 'transparent',
                borderLeft: active ? `2px solid ${K.sidebarActiveBorder}` : '2px solid transparent',
                color: active ? K.sidebarActiveText : K.sidebarText,
                fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
                fontSize: '13px', fontWeight: active ? 600 : 400,
                transition: 'all 0.15s',
                textAlign: 'left',
              }}
              onMouseEnter={e => {
                if (!active) {
                  (e.currentTarget as HTMLButtonElement).style.background = 'rgba(0,0,0,0.03)';
                }
              }}
              onMouseLeave={e => {
                if (!active) {
                  (e.currentTarget as HTMLButtonElement).style.background = 'transparent';
                }
              }}
            >
              <Icon size={15} />
              <span style={{ flex: 1 }}>{label}</span>
              {active && <ChevronRight size={12} style={{ color: K.sidebarActiveText, opacity: 0.6 }} />}
            </button>
          );
        })}

        {/* Divider */}
        <div style={{ height: '1px', background: K.borderSubtle, margin: '10px 0' }} />

        <button
          style={{
            display: 'flex', alignItems: 'center', gap: '10px', width: '100%',
            padding: '8px 10px', borderRadius: '7px', border: 'none', cursor: 'pointer',
            background: 'transparent', color: K.sidebarTextMuted,
            fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
            fontSize: '13px', fontWeight: 400, textAlign: 'left',
          }}
          onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(0,0,0,0.03)'; }}
          onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = 'transparent'; }}
        >
          <Settings size={15} />
          Settings
        </button>
      </nav>

      {/* Bottom user area */}
      <div style={{ padding: '14px 20px', borderTop: `1px solid ${K.borderSubtle}` }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: '30px', height: '30px', borderRadius: '50%', background: K.accentSubtle,
            border: `1px solid ${K.accentBorder}`, display: 'flex', alignItems: 'center',
            justifyContent: 'center', fontSize: '12px', fontWeight: 600, color: K.accentText,
          }}>JL</div>
          <div>
            <div style={{ fontSize: '12px', fontWeight: 600, color: K.textPrimary }}>Jane Lee</div>
            <div style={{ fontSize: '11px', color: K.textFaint }}>Regulatory Analyst</div>
          </div>
        </div>
      </div>
    </div>
  );
}
