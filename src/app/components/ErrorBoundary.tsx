import { Component } from 'react';
import type { ReactNode, ErrorInfo } from 'react';
import { K } from './kiaa-tokens';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('[ErrorBoundary]', error, info.componentStack);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: K.pageBg, fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif", padding: '40px' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>&#x26A0;&#xFE0F;</div>
          <h1 style={{ fontSize: '18px', fontWeight: 700, color: K.textPrimary, margin: 0 }}>Something went wrong</h1>
          <p style={{ fontSize: '13px', color: K.textMuted, marginTop: '8px', textAlign: 'center', maxWidth: '400px' }}>
            An unexpected error occurred. Try refreshing the page.
          </p>
          {this.state.error && (
            <pre style={{ fontSize: '11px', color: '#dc2626', background: 'rgba(239,68,68,0.06)', padding: '12px 16px', borderRadius: '8px', marginTop: '16px', maxWidth: '600px', overflow: 'auto', whiteSpace: 'pre-wrap' }}>
              {this.state.error.message}
            </pre>
          )}
          <button
            onClick={() => { this.setState({ hasError: false, error: null }); window.location.href = '/'; }}
            style={{ marginTop: '20px', padding: '8px 20px', background: K.accent, color: '#fff', border: 'none', borderRadius: '6px', fontSize: '13px', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}
          >
            Return to Dashboard
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
