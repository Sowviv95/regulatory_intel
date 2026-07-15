import { Loader, AlertCircle, Inbox } from 'lucide-react';
import { K } from './kiaa-tokens';

const container: React.CSSProperties = {
  display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
  minHeight: '260px', gap: '12px',
  fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
};

export function LoadingState({ message = 'Loading\u2026' }: { message?: string }) {
  return (
    <div style={container}>
      <Loader size={22} style={{ color: K.accent, animation: 'spin 1s linear infinite' }} />
      <span style={{ fontSize: '13px', color: K.textMuted }}>{message}</span>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

export function EmptyState({ title, message }: { title: string; message?: string }) {
  return (
    <div style={container}>
      <Inbox size={28} style={{ color: K.textFaint, opacity: 0.5 }} />
      <span style={{ fontSize: '14px', fontWeight: 600, color: K.textMuted }}>{title}</span>
      {message && <span style={{ fontSize: '12px', color: K.textFaint, textAlign: 'center', maxWidth: '320px' }}>{message}</span>}
    </div>
  );
}

export function ErrorState({ title = 'Something went wrong', message, onRetry }: { title?: string; message?: string; onRetry?: () => void }) {
  return (
    <div style={container}>
      <AlertCircle size={28} style={{ color: '#dc2626', opacity: 0.7 }} />
      <span style={{ fontSize: '14px', fontWeight: 600, color: K.textPrimary }}>{title}</span>
      {message && <span style={{ fontSize: '12px', color: K.textMuted, textAlign: 'center', maxWidth: '360px' }}>{message}</span>}
      {onRetry && (
        <button onClick={onRetry} style={{
          marginTop: '4px', padding: '7px 18px', background: K.accent, color: '#fff',
          border: 'none', borderRadius: '7px', fontSize: '13px', fontWeight: 600,
          cursor: 'pointer', fontFamily: 'inherit',
        }}>Try Again</button>
      )}
    </div>
  );
}
