import { mkdirSync, readFileSync, renameSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { dirname } from 'node:path';
import type { LumenStore, PersistedState } from './store.js';

/* ---------- Gate baselines: a small JSON file, so restarts keep the count ---------- */

export function loadState(path: string): PersistedState | null {
  try {
    return JSON.parse(readFileSync(path, 'utf8')) as PersistedState;
  } catch {
    return null;
  }
}

export function saveState(path: string, state: PersistedState): void {
  mkdirSync(dirname(path), { recursive: true });
  const tmp = `${path}.tmp`;
  writeFileSync(tmp, JSON.stringify(state, null, 2));
  renameSync(tmp, path);
}

/* ---------- Optional history: one snapshot per floor per minute in SQLite ---------- */

interface Stmt {
  run: (...args: unknown[]) => unknown;
}
interface Db {
  exec: (sql: string) => unknown;
  prepare: (sql: string) => Stmt;
  close: () => unknown;
}

export type SnapshotEngine = 'better-sqlite3' | 'node:sqlite' | 'off';

const require = createRequire(import.meta.url);

function openDb(path: string): { db: Db; engine: SnapshotEngine } | null {
  mkdirSync(dirname(path), { recursive: true });
  try {
    const BetterSqlite = require('better-sqlite3') as new (p: string) => Db;
    return { db: new BetterSqlite(path), engine: 'better-sqlite3' };
  } catch {
    // Native module missing or failed to build. Try Node's built-in SQLite next.
  }
  try {
    const { DatabaseSync } = require('node:sqlite') as { DatabaseSync: new (p: string) => Db };
    return { db: new DatabaseSync(path), engine: 'node:sqlite' };
  } catch {
    return null;
  }
}

export interface SnapshotWriter {
  engine: SnapshotEngine;
  path: string | null;
  writeNow: () => void;
  stop: () => void;
}

export function startSnapshots(store: LumenStore, path: string | null, log = console.log): SnapshotWriter {
  const off: SnapshotWriter = { engine: 'off', path: null, writeNow: () => {}, stop: () => {} };
  if (!path) return off;
  let opened: ReturnType<typeof openDb>;
  try {
    opened = openDb(path);
  } catch (e) {
    log(`[db] could not open ${path}: ${(e as Error).message}. Running without history.`);
    return off;
  }
  if (!opened) {
    log('[db] no SQLite driver available (better-sqlite3 did not build). Running without history.');
    return off;
  }
  const { db, engine } = opened;
  db.exec(`CREATE TABLE IF NOT EXISTS snapshots (
    minute     TEXT    NOT NULL,
    floor      INTEGER NOT NULL,
    on_floor   INTEGER NOT NULL,
    seats_free INTEGER NOT NULL,
    capacity   INTEGER NOT NULL,
    noise_db   REAL,
    stale      INTEGER NOT NULL,
    PRIMARY KEY (minute, floor)
  )`);
  const insert = db.prepare(
    'INSERT OR REPLACE INTO snapshots (minute, floor, on_floor, seats_free, capacity, noise_db, stale) VALUES (?, ?, ?, ?, ?, ?, ?)',
  );
  const writeNow = () => {
    const minute = new Date().toISOString().slice(0, 16) + 'Z';
    try {
      for (const f of store.floorViews()) {
        insert.run(minute, f.floor, f.on_floor, f.seats_free, f.capacity, f.noise_db, f.stale ? 1 : 0);
      }
    } catch (e) {
      log(`[db] snapshot failed: ${(e as Error).message}`);
    }
  };
  // Align to the start of each minute.
  let interval: NodeJS.Timeout | null = null;
  const first = setTimeout(() => {
    writeNow();
    interval = setInterval(writeNow, 60_000);
  }, 60_000 - (Date.now() % 60_000));
  log(`[db] saving one snapshot per floor per minute to ${path} (${engine})`);
  return {
    engine,
    path,
    writeNow,
    stop: () => {
      clearTimeout(first);
      if (interval) clearInterval(interval);
      try {
        db.close();
      } catch {
        /* already closed */
      }
    },
  };
}
