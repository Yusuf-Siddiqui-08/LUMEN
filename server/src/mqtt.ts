import mqtt, { type MqttClient } from 'mqtt';
import { type Ingest, topicFilter } from './ingest.js';

export interface MqttStatus {
  configured: boolean;
  connected: boolean;
  url: string | null;
  messages: number;
  last_error: string | null;
}

export interface MqttLink {
  client: MqttClient;
  status: MqttStatus;
  publish: (topic: string, payload: string) => void;
  close: () => Promise<void>;
}

function redact(url: string): string {
  try {
    const u = new URL(url);
    if (u.password) u.password = '***';
    return u.toString();
  } catch {
    return url;
  }
}

/**
 * Subscribe to every LUMEN topic for the site and feed messages into ingest.
 * The server announces itself on lumen/{site}/server/status with an "offline" last will,
 * the same pattern the floor hubs use on lumen/{site}/f{n}/hub/status.
 */
export function startMqtt(url: string, siteCode: string, ingest: Ingest, env: NodeJS.ProcessEnv = process.env): MqttLink {
  const status: MqttStatus = { configured: true, connected: false, url: redact(url), messages: 0, last_error: null };
  const statusTopic = `lumen/${siteCode}/server/status`;
  let closing = false;
  const client = mqtt.connect(url, {
    clientId: env.MQTT_CLIENT_ID || `lumen-server-${Math.random().toString(16).slice(2, 8)}`,
    username: env.MQTT_USERNAME || undefined,
    password: env.MQTT_PASSWORD || undefined,
    reconnectPeriod: 3000,
    connectTimeout: 10_000,
    clean: true,
    will: { topic: statusTopic, payload: Buffer.from('offline'), qos: 1, retain: true },
  });

  client.on('connect', () => {
    status.connected = true;
    status.last_error = null;
    console.log(`[mqtt] connected to ${status.url}`);
    client.subscribe(topicFilter(siteCode), { qos: 1 }, (err) => {
      if (err) console.error(`[mqtt] subscribe failed: ${err.message}`);
      else console.log(`[mqtt] subscribed to ${topicFilter(siteCode)}`);
    });
    client.publish(statusTopic, 'online', { qos: 1, retain: true });
  });
  client.on('reconnect', () => console.log('[mqtt] reconnecting...'));
  client.on('close', () => {
    status.connected = false;
  });
  client.on('error', (err) => {
    if (closing) return;
    status.last_error = err.message;
    console.error(`[mqtt] ${err.message}`);
  });
  client.on('message', (topic, payload) => {
    status.messages++;
    if (topic === statusTopic) return;
    ingest(topic, payload);
  });

  return {
    client,
    status,
    publish: (topic, payload) => {
      if (!closing) client.publish(topic, payload, { qos: 0 });
    },
    close: () =>
      new Promise<void>((resolve) => {
        closing = true;
        if (!client.connected) {
          client.end(true, {}, () => resolve());
          return;
        }
        client.publish(statusTopic, 'offline', { qos: 1, retain: true }, () => client.end(false, {}, () => resolve()));
      }),
  };
}
