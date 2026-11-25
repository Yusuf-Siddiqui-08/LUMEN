#!/usr/bin/env node
import { existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptDir = dirname(fileURLToPath(import.meta.url));
const serverRoot = resolve(scriptDir, '..');
const repoRoot = resolve(serverRoot, '..');

function parseArgs(argv) {
  let dbPath = process.env.DB_PATH ? resolve(process.env.DB_PATH) : resolve(serverRoot, 'data/lumen.db');
  let outPath = resolve(repoRoot, 'matlab/snapshots.csv');
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === '--sim') {
      dbPath = resolve(serverRoot, 'data/lumen-sim.db');
    } else if (arg === '--db' && argv[i + 1]) {
      dbPath = resolve(argv[++i]);
    } else if (arg === '--out' && argv[i + 1]) {
      outPath = resolve(argv[++i]);
    }
  }
  return { dbPath, outPath };
}

function openSqliteReadOnly(dbPath) {
  const require = createRequire(resolve(serverRoot, 'package.json'));
  try {
    const BetterSqlite = require('better-sqlite3');
    return { db: new BetterSqlite(dbPath, { readonly: true }), engine: 'better-sqlite3' };
  } catch {
    // Fall back to Node's built-in node:sqlite when better-sqlite3 is unavailable.
  }
  const { DatabaseSync } = require('node:sqlite');
  return { db: new DatabaseSync(dbPath, { readOnly: true }), engine: 'node:sqlite' };
}

function csvCell(value) {
  if (value === null || value === undefined) return '';
  const str = String(value);
  return /[",\n\r]/.test(str) ? `"${str.replace(/"/g, '""')}"` : str;
}

const { dbPath, outPath } = parseArgs(process.argv.slice(2));
if (!existsSync(dbPath)) {
  console.error(`[export-snapshots] SQLite database not found: ${dbPath}`);
  process.exit(1);
}

const { db, engine } = openSqliteReadOnly(dbPath);
try {
  const rows = db
    .prepare(
      'SELECT minute, floor, on_floor, seats_free, capacity, noise_db, stale FROM snapshots ORDER BY minute ASC, floor DESC',
    )
    .all();

  const header = 'minute,floor,on_floor,seats_free,capacity,noise_db,stale';
  const lines = [
    header,
    ...rows.map((r) =>
      [r.minute, r.floor, r.on_floor, r.seats_free, r.capacity, r.noise_db, r.stale].map(csvCell).join(','),
    ),
  ];

  mkdirSync(dirname(outPath), { recursive: true });
  writeFileSync(outPath, `${lines.join('\n')}\n`, 'utf8');
  console.log(`[export-snapshots] Exported ${rows.length} rows from ${dbPath} (${engine}) -> ${outPath}`);
} finally {
  db.close();
}
