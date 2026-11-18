/** The LUMEN mark: a rounded screen with a "9"-style tail and four lines, one gold. */
export function LogoMark({ width = 40, height = 47 }: { width?: number; height?: number }) {
  return (
    <svg width={width} height={height} viewBox="0 0 48 56" aria-hidden="true" focusable="false">
      <rect x="4" y="4" width="40" height="36" rx="9" fill="none" stroke="#75ADEA" style={{ strokeWidth: 4 }} />
      <path d="M44 28 V45 Q44 52 37 52 H17" fill="none" stroke="#75ADEA" style={{ strokeWidth: 4, strokeLinecap: 'round' }} />
      <path d="M12 14 H31" stroke="#75ADEA" style={{ strokeWidth: 3.5, strokeLinecap: 'round' }} />
      <circle cx="36" cy="14" r="2.6" fill="#F4B601" />
      <path d="M12 21 H22" stroke="#F4B601" style={{ strokeWidth: 3.5, strokeLinecap: 'round' }} />
      <path d="M12 28 H33" stroke="#75ADEA" style={{ strokeWidth: 3.5, strokeLinecap: 'round' }} />
      <path d="M12 34 H17" stroke="#3B6AAE" style={{ strokeWidth: 3.5, strokeLinecap: 'round' }} />
    </svg>
  );
}

export function Wordmark() {
  return (
    <span style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
      <LogoMark />
      <span style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        <span style={{ fontSize: 30, fontWeight: 900, letterSpacing: '0.02em', lineHeight: 1, color: '#75ADEA' }}>LUMEN</span>
        <span className="mono" style={{ fontSize: 11, letterSpacing: '0.22em', color: '#9FB3DA' }}>
          DECIDE BEFORE YOU RIDE
        </span>
      </span>
    </span>
  );
}
