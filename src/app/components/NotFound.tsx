import { useNavigate } from 'react-router';
import { K } from './kiaa-tokens';

export function NotFound() {
  const navigate = useNavigate();
  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      minHeight: 'calc(100vh - 52px)', background: K.pageBg,
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
    }}>
      <div style={{ fontSize: '48px', fontWeight: 800, color: K.textFaint, lineHeight: 1 }}>404</div>
      <div style={{ fontSize: '14px', color: K.textMuted, marginTop: '12px' }}>Page not found</div>
      <button
        onClick={() => navigate('/')}
        style={{
          marginTop: '20px', padding: '8px 20px', background: K.accent, color: '#fff',
          border: 'none', borderRadius: '7px', fontSize: '13px', fontWeight: 600,
          cursor: 'pointer', fontFamily: 'inherit',
        }}
      >
        Back to Dashboard
      </button>
    </div>
  );
}
