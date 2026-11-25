# LUMEN MATLAB Peak Hours Pipeline

This directory contains the actual **MATLAB** data-processing and visualization pipeline that computes LUMEN's typical-weekday hourly datasets (`people` and `noise_db`) and generates **both peak-hour graphs**:

1. **Foot Traffic by Hour** — occupancy bar chart color-coded by seat availability (`10+ free`, `Under 10 free`, `Full`), dashed floor capacity line, peak callout, and 3-hour moving-average trend (`movmean`).
2. **Noise by Hour** — acoustic $L_{\text{eq}}$ curve across shaded `Quiet` (`<45 dB`), `Low chatter` (`45–60 dB`), and `Social` (`>60 dB`) bands, quietest-hour callout, 3-hour moving-average trend, and occupancy-vs-noise correlation ($R^2$, slope in dB/person via `corrcoef` & `polyfit`).

## Files

| File | Purpose |
| --- | --- |
| `run_lumen_peak_hours.m` | Main pipeline entrypoint: loads logs, computes metrics, writes `web/src/data/peakHours.json`, and saves all MATLAB figures |
| `load_lumen_snapshots.m` | Reads snapshots from `server/data/lumen.db` (Database Toolbox `sqlite()` or `sqlite3` CLI), `matlab/snapshots.csv`, or `matlab/sample_snapshots.csv` |
| `compute_peak_hours.m` | Converts UTC timestamps to `America/Toronto`, filters out weekends & `stale == 1`, computes hourly mean occupancy, energetic $L_{\text{eq}}$, `movmean(..., 3)`, `corrcoef`, and `polyfit` |
| `export_peak_hours_json.m` | Exports `web/src/data/peakHours.json` matching the web schema while preserving floor order (`8` to `2`) |
| `plot_peak_hours_graphs.m` | Renders both MATLAB graphs side-by-side for each floor (`floor_2_peak_hours` .. `floor_8_peak_hours`) plus `slc_all_floors_peak_hours` in `matlab/output/` |
| `sample_snapshots.csv` | 5-weekday sample snapshot log (`minute,floor,on_floor,seats_free,capacity,noise_db,stale`) matching `server/src/persistence.ts` |

## Running in MATLAB or MATLAB Online

Open the repository root (or `matlab/`) in MATLAB and run:

```matlab
run('matlab/run_lumen_peak_hours.m')
```

Or pass an explicit SQLite/CSV path and display interactive figure windows:

```matlab
dataset = run_lumen_peak_hours('matlab/sample_snapshots.csv', true);
```

From a terminal with MATLAB on `PATH`:

```bash
matlab -batch "run('matlab/run_lumen_peak_hours.m')"
```

## Exporting live SQLite snapshots without Database Toolbox

If your MATLAB install (e.g., MATLAB Online) does not include Database Toolbox, export the server's SQLite `snapshots` table to `matlab/snapshots.csv` with Node:

```bash
npm run export:snapshots
```

`run_lumen_peak_hours.m` automatically picks up `server/data/lumen.db` or `matlab/snapshots.csv` when present, and falls back to `matlab/sample_snapshots.csv` otherwise.
