import { existsSync } from 'node:fs';
import { resolve } from 'node:path';
import express, { type Request, type Response } from 'express';
import type { LumenStore } from './store.js';

export interface ApiOptions {
  /** Built web app (web/dist). Served with an SPA fallback when it exists. */
  webDist?: string | null;
  /** Extra fields for /api/health (MQTT status, persistence engine...). */
  health?: () => Record<string, unknown>;
  /** Push throttle: at most one SSE update per this many ms. */
  pushThrottleMs?: number;
  heartbeatMs?: number;
  /** Resend the full list at least this often, so clients can tell a dead stream from a quiet one. */
  keepaliveMs?: number;
}

export interface Api {
  app: express.Express;
  /** Number of open SSE connections. */
  clients: () => number;
  stop: () => void;
}

export function createApi(store: LumenStore, opts: ApiOptions = {}): Api {
  const app = express();
  app.disable('x-powered-by');
  // Behind Railway's edge proxy: trust one hop of X-Forwarded-* (req.ip, req.protocol).
  app.set('trust proxy', 1);
  const started = Date.now();
  const throttleMs = opts.pushThrottleMs ?? 500;
  const heartbeatMs = opts.heartbeatMs ?? 15_000;
  const keepaliveMs = opts.keepaliveMs ?? 30_000;

  // Read-only public data: allow other origins (for example a kiosk served elsewhere).
  app.use('/api', (_req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Cache-Control', 'no-store');
    next();
  });

  app.get('/api/health', (_req, res) => {
    const views = store.floorViews();
    res.json({
      ok: true,
      uptime_s: Math.round((Date.now() - started) / 1000),
      simulated: store.simulated,
      server_time: new Date().toISOString(),
      floors: views.length,
      stale_floors: views.filter((f) => f.stale).map((f) => f.floor),
      sse_clients: clients.size,
      messages: store.stats,
      last_reset_date: store.lastResetDate,
      ...(opts.health ? opts.health() : {}),
    });
  });

  app.get('/api/floors', (_req, res) => {
    res.json(store.payload());
  });

  app.get('/api/floors/:n', (req: Request, res: Response) => {
    const raw = String(req.params.n);
    const n = /^\d+$/.test(raw) ? Number(raw) : NaN;
    const view = Number.isFinite(n) ? store.floorView(n) : null;
    if (!view) {
      res.status(404).json({ error: `No floor ${raw}. Floors: ${store.floorNumbers().join(', ')}` });
      return;
    }
    if (req.query.nodes !== undefined) {
      res.json({ ...view, nodes: store.nodeDetail(n) });
      return;
    }
    res.json(view);
  });

  /* ---------- Server-Sent Events: the full floor list on every change ---------- */

  const clients = new Set<Response>();
  let eventId = 0;
  let lastSent = 0;
  let pending: NodeJS.Timeout | null = null;
  let lastStaleKey = '';

  const staleKey = () =>
    store
      .floorViews()
      .map((f) => `${f.floor}:${f.stale ? 1 : 0}`)
      .join(',');

  const frame = () => `event: floors\nid: ${++eventId}\ndata: ${JSON.stringify(store.payload())}\n\n`;

  const send = (res: Response, chunk: string) => {
    if (res.writableEnded || res.destroyed) {
      clients.delete(res);
      return;
    }
    try {
      res.write(chunk);
    } catch {
      clients.delete(res);
    }
  };

  const broadcast = () => {
    pending = null;
    lastSent = Date.now();
    lastStaleKey = staleKey();
    if (clients.size === 0) return;
    const data = frame();
    for (const res of [...clients]) send(res, data);
  };

  const schedule = () => {
    if (pending) return;
    const wait = Math.max(0, throttleMs - (Date.now() - lastSent));
    pending = setTimeout(broadcast, wait);
  };

  store.on('change', schedule);

  // Staleness changes with time, not with messages: check it every few seconds.
  const staleTimer = setInterval(() => {
    if (staleKey() !== lastStaleKey || Date.now() - lastSent >= keepaliveMs) schedule();
  }, 5000);
  const heartbeat = setInterval(() => {
    if (clients.size === 0) return;
    const beat = `: heartbeat ${new Date().toISOString()}\n\n`;
    for (const res of [...clients]) send(res, beat);
  }, heartbeatMs);

  app.get('/api/stream', (req, res) => {
    res.writeHead(200, {
      'Content-Type': 'text/event-stream; charset=utf-8',
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive',
      'X-Accel-Buffering': 'no',
      'Access-Control-Allow-Origin': '*',
    });
    const cleanup = () => {
      clients.delete(res);
    };
    req.on('close', cleanup);
    res.on('error', cleanup);
    clients.add(res);
    send(res, `retry: 3000\n\n${frame()}`);
  });

  app.use('/api', (_req, res) => {
    res.status(404).json({ error: 'Not found. Try /api/floors, /api/floors/7, /api/stream or /api/health.' });
  });

  /* ---------- Built web app ---------- */

  const dist = opts.webDist ? resolve(opts.webDist) : null;
  if (dist && existsSync(resolve(dist, 'index.html'))) {
    app.use(
      express.static(dist, {
        index: false,
        setHeaders: (res, path) => {
          // Vite's hashed bundles never change; everything else is revalidated.
          if (/[\\/]assets[\\/].+-[A-Za-z0-9_-]{8,}\.(js|css|woff2?)$/.test(path)) {
            res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
          } else {
            res.setHeader('Cache-Control', 'no-cache');
          }
        },
      }),
    );
    // Single-page app: every other GET returns index.html and React Router takes over.
    app.get(/.*/, (_req, res) => {
      res.setHeader('Cache-Control', 'no-cache');
      res.sendFile(resolve(dist, 'index.html'));
    });
  } else {
    app.get('/', (_req, res) => {
      res
        .type('text/plain')
        .send('LUMEN API is running. The web app is not built yet: run "npm run build", or use "npm run dev" and open the Vite URL.');
    });
  }

  return {
    app,
    clients: () => clients.size,
    stop: () => {
      clearInterval(staleTimer);
      clearInterval(heartbeat);
      if (pending) clearTimeout(pending);
      store.off('change', schedule);
      for (const res of [...clients]) {
        if (!res.writableEnded && !res.destroyed) res.end();
      }
      clients.clear();
    },
  };
}
