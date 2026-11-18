import { resolve } from 'node:path';
import { createApi } from './api.js';
import { loadConfig, SERVER_ROOT } from './config.js';
import { createIngest } from './ingest.js';
import { type MqttLink, startMqtt } from './mqtt.js';
import { loadState, saveState, startSnapshots } from './persistence.js';
import { startSimulator } from './simulator.js';
import { LumenStore } from './store.js';
import { resetDue } from './time.js';

const env = process.env;
const truthy = (v: string | undefined) => v !== undefined && /^(1|true|yes|on)$/i.test(v);

const config = loadConfig(env);
const simulate = truthy(env.SIMULATE);
const mqttUrl = env.MQTT_URL || '';
const port = Number(env.PORT || 8080);
const host = env.HOST || '0.0.0.0';

const store = new LumenStore(config, { simulated: simulate });
const ingest = createIngest(store);

/* ---------- Saved gate baselines (not used for simulated data unless asked) ---------- */
const statePath = env.STATE_PATH
  ? resolve(env.STATE_PATH)
  : simulate
    ? null
    : resolve(SERVER_ROOT, 'data/state.json');
if (statePath) {
  const saved = loadState(statePath);
  if (saved) {
    store.importState(saved);
    console.log(`[lumen] restored gate baselines from ${statePath}`);
  }
}
const persist = () => {
  if (!statePath) return;
  try {
    saveState(statePath, store.exportState());
  } catch (e) {
    console.error(`[lumen] could not save state: ${(e as Error).message}`);
  }
};
store.on('reset', persist);
store.on('change', (c: { reboot?: boolean }) => {
  if (c?.reboot) persist();
});
const persistTimer = setInterval(persist, 60_000);

/* ---------- Nightly reset ---------- */
const checkReset = () => {
  const date = resetDue(Date.now(), config.timezone, config.nightly_reset_hour, store.lastResetDate);
  if (date) {
    store.nightlyReset(date);
  }
};
const resetTimer = setInterval(checkReset, 30_000);
checkReset();

/* ---------- Data in: MQTT and/or the simulator ---------- */
let mqtt: MqttLink | null = null;
if (mqttUrl) {
  mqtt = startMqtt(mqttUrl, config.site.code, ingest, env);
}
let sim: ReturnType<typeof startSimulator> | null = null;
if (simulate) {
  const silentFloors = (env.SIM_SILENT_FLOORS || '')
    .split(',')
    .map((s) => Number(s.trim()))
    .filter((n) => Number.isInteger(n) && n > 0);
  // With a broker configured, the fake nodes publish to it (an end-to-end test of
  // the broker). Without one, they go straight into the same ingest function.
  const publish = mqtt ? mqtt.publish : (topic: string, payload: string) => void ingest(topic, payload);
  const silentAfterS = Number(env.SIM_SILENT_AFTER_S || 30);
  sim = startSimulator(config, publish, {
    silentFloors,
    silentAfterMs: (Number.isFinite(silentAfterS) ? silentAfterS : 30) * 1000,
    setElevatorWait: (m) => store.setElevatorWait(m),
  });
  console.log(
    `[sim] SIMULATE=1: fake gate, noise and hub nodes for floors ${config.floors.map((f) => f.floor).join(', ')}` +
      (mqtt ? ' (publishing through the MQTT broker)' : ' (in-process)') +
      (silentFloors.length ? `. Floors ${silentFloors.join(', ')} will go silent after ${silentAfterS} s.` : ''),
  );
}
if (!mqttUrl && !simulate) {
  console.warn('[lumen] No MQTT_URL and SIMULATE is off: no data will arrive. Every floor will show as stale.');
}

/* ---------- History ---------- */
const dbPath = truthy(env.NO_DB)
  ? null
  : env.DB_PATH
    ? resolve(env.DB_PATH)
    : resolve(SERVER_ROOT, simulate ? 'data/lumen-sim.db' : 'data/lumen.db');
const snapshots = startSnapshots(store, dbPath);

/* ---------- HTTP ---------- */
const webDist = env.WEB_DIST ? resolve(env.WEB_DIST) : resolve(SERVER_ROOT, '../web/dist');
const api = createApi(store, {
  webDist,
  health: () => ({
    mqtt: mqtt ? mqtt.status : { configured: false, connected: false },
    history: { engine: snapshots.engine, path: snapshots.path },
    state_path: statePath,
    elevator_wait_estimated: true,
  }),
});

const server = api.app.listen(port, host, () => {
  console.log(`[lumen] listening on http://${host === '0.0.0.0' ? 'localhost' : host}:${port}`);
  console.log(`[lumen] floors ${config.floors.map((f) => f.floor).join(', ')}, nightly reset at ${config.nightly_reset_hour}:00 ${config.timezone}`);
});
server.on('error', (err) => {
  console.error(`[lumen] HTTP server error: ${err.message}`);
  process.exit(1);
});

let stopping = false;
async function shutdown(signal: string) {
  if (stopping) return;
  stopping = true;
  console.log(`[lumen] ${signal}: shutting down`);
  sim?.stop();
  clearInterval(resetTimer);
  clearInterval(persistTimer);
  persist();
  api.stop();
  snapshots.stop();
  if (mqtt) await mqtt.close();
  server.close(() => process.exit(0));
  setTimeout(() => process.exit(0), 3000).unref();
}
process.on('SIGINT', () => void shutdown('SIGINT'));
process.on('SIGTERM', () => void shutdown('SIGTERM'));
