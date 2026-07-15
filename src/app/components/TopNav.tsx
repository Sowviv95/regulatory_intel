import { LayoutDashboard, Inbox, FileText, Library, Settings, Leaf } from 'lucide-react';
import { K, type Screen } from './kiaa-tokens';

const navItems = [
  { id: 'dashboard' as Screen,    label: 'Dashboard',          icon: LayoutDashboard },
  { id: 'source-queue' as Screen, label: 'Source Queue',        icon: Inbox           },
  { id: 'review-table' as Screen, label: 'Review',              icon: FileText        },
  { id: 'search-export' as Screen,label: 'Intelligence Library',icon: Library         },
];

export function TopNav({ current, onNavigate }: { current: Screen; onNavigate: (s: Screen) => void }) {
  return (
    <div style={{
      height: '52px',
      minHeight: '52px',
      background: '#ffffff',
      borderBottom: `1px solid ${K.border}`,
      display: 'flex',
      alignItems: 'center',
      padding: '0 20px',
      gap: '0',
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
      position: 'sticky',
      top: 0,
      zIndex: 50,
    }}>
      {/* Logo */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '9px', marginRight: '28px', flexShrink: 0 }}>
        <div style={{
          width: '28px', height: '28px', background: K.accent, borderRadius: '7px',
          display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
        }}>
          <Leaf size={14} color="#fff" />
        </div>
        <div>
          <div style={{ fontSize: '13px', fontWeight: 700, color: K.textPrimary, lineHeight: 1.1 }}>KIAA</div>
          <div style={{ fontSize: '9px', color: K.textFaint, lineHeight: 1.1, whiteSpace: 'nowrap' }}>Regulatory Intel</div>
        </div>
      </div>

      {/* Divider */}
      <div style={{ width: '1px', height: '20px', background: K.border, marginRight: '20px', flexShrink: 0 }} />

      {/* Nav items */}
      <nav style={{ display: 'flex', alignItems: 'center', gap: '2px', flex: 1 }}>
        {navItems.map(({ id, label, icon: Icon }) => {
          const active = current === id;
          return (
            <button
              key={id}
              onClick={() => onNavigate(id)}
              style={{
                display: 'flex', alignItems: 'center', gap: '6px',
                padding: '6px 12px',
                borderRadius: '7px',
                border: 'none',
                cursor: 'pointer',
                background: active ? K.sidebarActiveBg : 'transparent',
                color: active ? K.sidebarActiveText : K.textMuted,
                fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
                fontSize: '13px',
                fontWeight: active ? 600 : 400,
                transition: 'all 0.12s',
                position: 'relative',
                whiteSpace: 'nowrap',
              }}
              onMouseEnter={e => {
                if (!active) (e.currentTarget as HTMLButtonElement).style.background = 'rgba(0,0,0,0.04)';
              }}
              onMouseLeave={e => {
                if (!active) (e.currentTarget as HTMLButtonElement).style.background = 'transparent';
              }}
            >
              <Icon size={14} />
              {label}
              {active && (
                <span style={{
                  position: 'absolute', bottom: '-7px', left: '12px', right: '12px',
                  height: '2px', background: K.accent, borderRadius: '1px',
                }} />
              )}
            </button>
          );
        })}
      </nav>

      {/* Right side */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexShrink: 0 }}>
        <button
          style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '5px 8px', borderRadius: '6px', border: 'none', background: 'transparent', cursor: 'pointer', color: K.textMuted, fontFamily: 'inherit', fontSize: '13px' }}
          onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(0,0,0,0.04)'; }}
          onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = 'transparent'; }}
        >
          <Settings size={14} />
        </button>

        <div style={{ width: '1px', height: '20px', background: K.border }} />

        {/* User avatar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
          <div style={{
            width: '28px', height: '28px', borderRadius: '50%', background: K.accentSubtle,
            border: `1px solid ${K.accentBorder}`, display: 'flex', alignItems: 'center',
            justifyContent: 'center', fontSize: '11px', fontWeight: 600, color: K.accentText,
            flexShrink: 0,
          }}>JL</div>
          <div style={{ lineHeight: 1.2 }}>
            <div style={{ fontSize: '12px', fontWeight: 600, color: K.textPrimary }}>Jane Lee</div>
            <div style={{ fontSize: '10px', color: K.textFaint }}>Regulatory Analyst</div>
          </div>
        </div>
      </div>
    </div>
  );
}
