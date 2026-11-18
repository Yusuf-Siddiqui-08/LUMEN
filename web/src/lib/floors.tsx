import { createContext, type ReactNode, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { type Floor, toFloors } from './logic';
import type { FloorsPayload } from './types';
import { useNow } from './hooks';

/** live: Server-Sent Events flowing. polling: SSE down, REST polling works. offline: nothing works. */
export type ConnStatus = 'connecting' | 'live' | 'polling' | 'offline';

interface FloorsState {
  payload: FloorsPayload | null;
  status: ConnStatus;
  /** Server clock minus local clock, in ms. */
  clockOffsetMs: number;
}

const FloorsContext = createContext<FloorsState | null>(null);

const API = import.meta.env.VITE_API_BASE ?? '';
const POLL_MS = 5000;
/** The server resends the full list at least every 30 s; silence longer than this means a dead stream. */
const WATCHDOG_MS = 65_000;

/**
 * One shared live connection for the whole app: SSE with auto-reconnect,
 * and REST polling as a fallback while the stream is down.
 */
export function FloorsProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<FloorsState>({ payload: null, status: 'connecting', clockOffsetMs: 0 });
  const statusRef = useRef<ConnStatus>('connecting');

  useEffect(() => {
    let closed = false;
    let es: EventSource | null = null;
    let pollTimer: number | undefined;
    let retryTimer: number | undefined;
    let watchdog: number | undefined;
    let retries = 0;

    const setStatus = (status: ConnStatus) => {
      statusRef.current = status;
      setState((s) => (s.status === status ? s : { ...s, status }));
    };

    const accept = (p: FloorsPayload, via: ConnStatus) => {
      if (closed) return;
      const offset = Date.parse(p.server_time) - Date.now();
      statusRef.current = via;
      setState({ payload: p, status: via, clockOffsetMs: Number.isFinite(offset) ? offset : 0 });
    };

    const poll = async () => {
      try {
        const r = await fetch(`${API}/api/floors`, { cache: 'no-store' });
        if (!r.ok) throw new Error(String(r.status));
        const p = (await r.json()) as FloorsPayload;
        // The stream may have come back while this request was in flight.
        if (statusRef.current !== 'live') accept(p, 'polling');
      } catch {
        if (statusRef.current !== 'live') setStatus('offline');
      }
    };
    const startPolling = () => {
      if (pollTimer !== undefined) return;
      void poll();
      pollTimer = window.setInterval(poll, POLL_MS);
    };
    const stopPolling = () => {
      if (pollTimer !== undefined) window.clearInterval(pollTimer);
      pollTimer = undefined;
    };

    const armWatchdog = () => {
      if (watchdog !== undefined) window.clearTimeout(watchdog);
      watchdog = window.setTimeout(() => {
        // No data for too long: assume the stream is dead even if the socket looks open.
        es?.close();
        es = null;
        startPolling();
        scheduleReconnect();
      }, WATCHDOG_MS);
    };

    const scheduleReconnect = () => {
      if (closed || retryTimer !== undefined) return;
      const delay = Math.min(15_000, 1000 * 2 ** retries);
      retries++;
      retryTimer = window.setTimeout(() => {
        retryTimer = undefined;
        connect();
      }, delay);
    };

    const connect = () => {
      if (closed) return;
      if (typeof EventSource === 'undefined') {
        startPolling();
        return;
      }
      es = new EventSource(`${API}/api/stream`);
      armWatchdog();
      es.addEventListener('floors', (e) => {
        try {
          accept(JSON.parse((e as MessageEvent<string>).data) as FloorsPayload, 'live');
          retries = 0;
          stopPolling();
          armWatchdog();
        } catch {
          /* ignore a malformed frame; the next one will do */
        }
      });
      es.onerror = () => {
        if (closed) return;
        startPolling();
        // CONNECTING means the browser is already retrying; CLOSED means we must.
        if (es && es.readyState === EventSource.CLOSED) {
          es = null;
          scheduleReconnect();
        }
      };
    };

    void poll(); // quick first paint, even if a proxy blocks streaming
    connect();

    return () => {
      closed = true;
      es?.close();
      stopPolling();
      if (retryTimer !== undefined) window.clearTimeout(retryTimer);
      if (watchdog !== undefined) window.clearTimeout(watchdog);
    };
  }, []);

  return <FloorsContext.Provider value={state}>{children}</FloorsContext.Provider>;
}

export interface LiveFloors {
  floors: Floor[];
  payload: FloorsPayload | null;
  status: ConnStatus;
  now: number;
  simulated: boolean;
  elevatorWait: number | null;
  loaded: boolean;
}

/** Live floors with staleness re-checked every few seconds against the local clock. */
export function useFloors(tickMs = 5000): LiveFloors {
  const ctx = useContext(FloorsContext);
  if (!ctx) throw new Error('useFloors must be used inside <FloorsProvider>');
  const now = useNow(tickMs);
  const { payload, status, clockOffsetMs } = ctx;
  const floors = useMemo(() => (payload ? toFloors(payload, now, clockOffsetMs) : []), [payload, now, clockOffsetMs]);
  return {
    floors,
    payload,
    status,
    now,
    simulated: payload?.simulated ?? false,
    elevatorWait: payload ? payload.elevator_wait_min : null,
    loaded: payload !== null,
  };
}
