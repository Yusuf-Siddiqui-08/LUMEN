import { createServer, type Server } from 'node:net';
import type { AddressInfo } from 'node:net';
import { Aedes } from 'aedes';
import mqtt from 'mqtt';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { validateConfig } from '../src/config.js';
import { createIngest } from '../src/ingest.js';
import { type MqttLink, startMqtt } from '../src/mqtt.js';
import { LumenStore } from '../src/store.js';

/** End to end over a real MQTT broker (Aedes, in-process): hub publishes, server counts. */

const config = validateConfig({
  site: { code: 'slc', name: 'Student Learning Centre' },
  floors: [
    {
      floor: 7,
      vibe: 'Quiet',
      capacity: 60,
      gates: [{ name: 'elevator', node: 'f7-gate-elevator' }],
      mics: [{ name: 'quiet-side', node: 'f7-mic-quiet' }],
      zones: [],
      zones_at_occupancy_pct: 63.3,
    },
  ],
});

let broker: Aedes;
let server: Server;
let url: string;

beforeAll(async () => {
  broker = await Aedes.createBroker();
  server = createServer(broker.handle);
  await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', resolve));
  url = `mqtt://127.0.0.1:${(server.address() as AddressInfo).port}`;
});

afterAll(async () => {
  await new Promise<void>((resolve) => broker.close(() => resolve()));
  await new Promise<void>((resolve) => server.close(() => resolve()));
});

const waitFor = async (check: () => boolean, ms = 3000) => {
  const start = Date.now();
  while (!check()) {
    if (Date.now() - start > ms) throw new Error('timed out');
    await new Promise((r) => setTimeout(r, 20));
  }
};

describe('MQTT ingest', () => {
  it('counts a hub message, then marks the floor stale when the hub last will fires', async () => {
    const store = new LumenStore(config, { log: () => {} });
    const link: MqttLink = startMqtt(url, 'slc', createIngest(store, () => {}), {});
    await waitFor(() => link.status.connected);
    // give the subscription a moment
    await new Promise((r) => setTimeout(r, 100));

    const hub = mqtt.connect(url, {
      clientId: 'f7-hub',
      will: { topic: 'lumen/slc/f7/hub/status', payload: Buffer.from('offline'), qos: 1, retain: false },
    });
    await new Promise<void>((resolve) => hub.on('connect', () => resolve()));
    hub.publish(
      'lumen/slc/f7/gate/elevator',
      JSON.stringify({ node: 'f7-gate-elevator', seq: 18342, in_total: 1240, out_total: 1202, flags: [], rssi: -61 }),
    );
    hub.publish('lumen/slc/f7/noise/quiet-side', JSON.stringify({ node: 'f7-mic-quiet', seq: 5521, leq_db: 42.3, peak_db: 55.1, window_s: 60 }));
    await waitFor(() => store.floorView(7)!.noise_db !== null && store.floorView(7)!.on_floor === 38);
    expect(store.floorView(7)).toMatchObject({ on_floor: 38, seats_free: 22, noise_db: 42, stale: false });

    // The hub drops off the network without saying goodbye: the broker sends its last will.
    hub.stream.destroy();
    await waitFor(() => store.floorView(7)!.stale);
    expect(store.floorView(7)!.stale_reason).toBe('hub_offline');

    hub.end(true);
    await link.close();
  });
});
