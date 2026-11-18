import { useEffect, useState } from 'react';

/** Current time, refreshed every intervalMs (aligned to the interval so clocks tick on time). */
export function useNow(intervalMs = 1000): number {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    let timer: number | undefined;
    const tick = () => {
      setNow(Date.now());
      timer = window.setTimeout(tick, intervalMs - (Date.now() % intervalMs) + 5);
    };
    timer = window.setTimeout(tick, intervalMs - (Date.now() % intervalMs) + 5);
    return () => window.clearTimeout(timer);
  }, [intervalMs]);
  return now;
}

export function useMediaQuery(query: string): boolean {
  const get = () => (typeof window !== 'undefined' && window.matchMedia ? window.matchMedia(query).matches : false);
  const [matches, setMatches] = useState(get);
  useEffect(() => {
    const mq = window.matchMedia(query);
    const on = () => setMatches(mq.matches);
    on();
    mq.addEventListener('change', on);
    return () => mq.removeEventListener('change', on);
  }, [query]);
  return matches;
}

export function useDocumentTitle(title: string): void {
  useEffect(() => {
    document.title = title;
  }, [title]);
}
