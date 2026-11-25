function dataset = run_lumen_peak_hours(inputPath, showFigures)
% RUN_LUMEN_PEAK_HOURS End-to-end MATLAB analytics & plotting pipeline for LUMEN.
%   dataset = run_lumen_peak_hours()
%   dataset = run_lumen_peak_hours(inputPath, showFigures)
%
%   1. Reads floor capacities & timezone from server/config/floors.json.
%   2. Loads snapshot logs from SQLite (lumen.db) or CSV (snapshots.csv /
%      sample_snapshots.csv) via load_lumen_snapshots.m.
%   3. Computes typical-weekday (7 AM - 11 PM) hourly occupancy, energetic
%      sound levels (Leq), 3-hour moving-average trends (movmean), and
%      traffic-vs-noise linear regression (corrcoef / polyfit).
%   4. Exports web/src/data/peakHours.json for the React web & phone UI.
%   5. Generates both MATLAB graphs (Foot Traffic + Noise) for Floors 2..8
%      plus a 7-floor overview in matlab/output/.

if nargin < 1
    inputPath = '';
end
if nargin < 2
    showFigures = false;
end

scriptDir = fileparts(mfilename('fullpath'));
repoRoot = fileparts(scriptDir);
addpath(scriptDir);

configPath = fullfile(repoRoot, 'server', 'config', 'floors.json');
if ~isfile(configPath)
    error('LUMEN:MissingConfig', 'Cannot find floors config at %s', configPath);
end
floorsCfg = jsondecode(fileread(configPath));

[tbl, meta] = load_lumen_snapshots(repoRoot, char(inputPath));
fprintf('[LUMEN MATLAB] Loaded %d snapshot rows from %s (%s)\n', ...
    meta.rowCount, meta.sourceFile, meta.sourceKind);

targetHours = 7:23;
dataset = compute_peak_hours(tbl, floorsCfg, targetHours, meta.sourceKind);

fprintf('\n=== LUMEN Typical-Weekday Summary (%s) ===\n', dataset.pipeline.timezone);
disp(dataset.summaryTable);

jsonOut = fullfile(repoRoot, 'web', 'src', 'data', 'peakHours.json');
export_peak_hours_json(dataset, jsonOut);
fprintf('[LUMEN MATLAB] Wrote %s\n', jsonOut);

figDir = fullfile(scriptDir, 'output');
plot_peak_hours_graphs(dataset, figDir, logical(showFigures));
fprintf('[LUMEN MATLAB] Generated both peak-hour graphs (PNG + SVG) in %s\n', figDir);
end
