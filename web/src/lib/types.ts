/** Shapes served by the LUMEN server (see server/src/store.ts). */

export type Vibe = 'Quiet' | 'Collab' | 'Social' | 'Group rooms';

export interface ZoneView {
  name: string;
  pct: number;
  estimated: true;
}

export interface FloorView {
  floor: number;
  vibe: Vibe;
  capacity: number;
  on_floor: number;
  seats_free: number;
  noise_db: number | null;
  updated: string | null;
  updated_at: string | null;
  age_s: number | null;
  stale: boolean;
  stale_reason: 'no_data' | 'silent' | 'hub_offline' | null;
  zones: ZoneView[];
  elevator_wait_min: number;
  faults: string[];
}

export interface FloorsPayload {
  site: string;
  simulated: boolean;
  public_url: string | null;
  server_time: string;
  stale_after_s: number;
  elevator_wait_min: number;
  elevator_wait_estimated: boolean;
  floors: FloorView[];
}
