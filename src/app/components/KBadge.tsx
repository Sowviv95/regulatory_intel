export function Badge({ label, style }: { label: string; style: { bg: string; text: string; border: string } }) {
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', fontSize: '11px', fontWeight: 600,
      padding: '2px 7px', borderRadius: '4px', background: style.bg, color: style.text,
      border: `1px solid ${style.border}`, whiteSpace: 'nowrap',
    }}>{label}</span>
  );
}
