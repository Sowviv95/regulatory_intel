export const K = {
  pageBg: '#f0f4f8',
  panelBg: '#ffffff',
  cardBg: '#ffffff',
  cardBgHover: '#f0fdf4',
  inputBg: '#f8fafc',
  progressBg: '#e5e7eb',
  accent: '#16a34a',
  accentHover: '#15803d',
  accentGlow: 'rgba(22,163,74,0.35)',
  accentSubtle: 'rgba(22,163,74,0.08)',
  accentBorder: 'rgba(22,163,74,0.22)',
  accentText: '#16a34a',
  textPrimary: '#0f172a',
  textSecondary: '#374151',
  textMuted: '#6b7280',
  textFaint: '#9ca3af',
  border: 'rgba(0,0,0,0.08)',
  borderSubtle: 'rgba(0,0,0,0.06)',
  inputBorder: 'rgba(0,0,0,0.10)',
  sidebarBg: '#ffffff',
  sidebarText: '#1e293b',
  sidebarTextMuted: '#6b7280',
  sidebarActiveBg: 'rgba(22,163,74,0.09)',
  sidebarActiveBorder: 'rgba(22,163,74,0.22)',
  sidebarActiveText: '#16a34a',
} as const;

export type Screen = 'dashboard' | 'source-queue' | 'regulation-review' | 'review-table' | 'search-export';

export const impactStyle = (impact: string) => {
  if (impact === 'High') return { bg: 'rgba(239,68,68,0.08)', text: '#dc2626', border: 'rgba(239,68,68,0.18)' };
  if (impact === 'Medium') return { bg: 'rgba(245,158,11,0.08)', text: '#d97706', border: 'rgba(245,158,11,0.18)' };
  return { bg: 'rgba(107,114,128,0.08)', text: '#6b7280', border: 'rgba(107,114,128,0.18)' };
};

export const statusStyle = (status: string) => {
  if (status === 'New') return { bg: 'rgba(59,130,246,0.08)', text: '#2563eb', border: 'rgba(59,130,246,0.18)' };
  if (status === 'Processing') return { bg: 'rgba(245,158,11,0.08)', text: '#d97706', border: 'rgba(245,158,11,0.18)' };
  if (status === 'Ready for Review') return { bg: 'rgba(22,163,74,0.08)', text: '#16a34a', border: 'rgba(22,163,74,0.18)' };
  if (status === 'Approved') return { bg: 'rgba(22,163,74,0.10)', text: '#15803d', border: 'rgba(22,163,74,0.22)' };
  if (status === 'Published') return { bg: 'rgba(99,102,241,0.08)', text: '#4f46e5', border: 'rgba(99,102,241,0.18)' };
  return { bg: 'rgba(107,114,128,0.08)', text: '#6b7280', border: 'rgba(107,114,128,0.18)' };
};

