/** Wall-clock parts of an instant in a given IANA time zone (handles daylight saving). */
export interface LocalParts {
  date: string; // YYYY-MM-DD
  hour: number;
  minute: number;
  second: number;
}

const formatters = new Map<string, Intl.DateTimeFormat>();

function formatter(tz: string): Intl.DateTimeFormat {
  let f = formatters.get(tz);
  if (!f) {
    f = new Intl.DateTimeFormat('en-CA', {
      timeZone: tz,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hourCycle: 'h23',
    });
    formatters.set(tz, f);
  }
  return f;
}

export function localParts(ms: number, tz: string): LocalParts {
  const parts: Record<string, string> = {};
  for (const p of formatter(tz).formatToParts(new Date(ms))) parts[p.type] = p.value;
  return {
    date: `${parts.year}-${parts.month}-${parts.day}`,
    hour: Number(parts.hour) % 24,
    minute: Number(parts.minute),
    second: Number(parts.second),
  };
}

/** "11:42:07" in the site's time zone, the format shown in the API example. */
export function clockString(ms: number, tz: string): string {
  const p = localParts(ms, tz);
  const two = (n: number) => String(n).padStart(2, '0');
  return `${two(p.hour)}:${two(p.minute)}:${two(p.second)}`;
}

/**
 * The nightly reset runs once per local day, during the configured hour.
 * Returns the local date to record when a reset is due, or null.
 * If the server was down for the whole reset hour, that night's reset is skipped
 * rather than zeroing the counts in the middle of the day.
 */
export function resetDue(ms: number, tz: string, hour: number, lastResetDate: string | null): string | null {
  const p = localParts(ms, tz);
  if (p.hour !== hour) return null;
  if (lastResetDate === p.date) return null;
  return p.date;
}
