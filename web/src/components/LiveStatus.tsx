import type { ConnStatus } from '../lib/floors';

/** LIVE dot plus word. Colour is never the only signal: the word changes too. */
export function LiveStatus({ status, fontSize = 12, dot = 8 }: { status: ConnStatus; fontSize?: number; dot?: number }) {
  const map: Record<ConnStatus, { word: string; color: string }> = {
    live: { word: 'LIVE', color: '#3DDB96' },
    polling: { word: 'LIVE', color: '#3DDB96' },
    connecting: { word: 'CONNECTING', color: '#F4B601' },
    offline: { word: 'OFFLINE', color: '#FF7A72' },
  };
  const s = map[status];
  return (
    <span
      className="mono"
      role="status"
      style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize, fontWeight: 700, color: s.color }}
    >
      <span aria-hidden="true" style={{ width: dot, height: dot, borderRadius: '50%', background: s.color }} />
      {s.word}
    </span>
  );
}
