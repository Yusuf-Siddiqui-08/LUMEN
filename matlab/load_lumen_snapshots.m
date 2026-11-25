function [tbl, meta] = load_lumen_snapshots(repoRoot, inputPath)
% LOAD_LUMEN_SNAPSHOTS Load logged floor snapshots from SQLite or CSV.
%   [tbl, meta] = load_lumen_snapshots(repoRoot)
%   [tbl, meta] = load_lumen_snapshots(repoRoot, inputPath)
%
%   Input discovery order when inputPath is omitted or empty:
%     1. server/data/lumen.db         (production SQLite sensor log)
%     2. matlab/snapshots.csv         (exported SQLite CSV log)
%     3. matlab/sample_snapshots.csv  (included 5-weekday sample sensor log)

arguments
    repoRoot (1, :) char
    inputPath (1, :) char = ''
end

if isempty(inputPath)
    prodDb = fullfile(repoRoot, 'server', 'data', 'lumen.db');
    userCsv = fullfile(repoRoot, 'matlab', 'snapshots.csv');
    sampleCsv = fullfile(repoRoot, 'matlab', 'sample_snapshots.csv');

    if isfile(prodDb)
        inputPath = prodDb;
        sourceKind = 'measured';
    elseif isfile(userCsv)
        inputPath = userCsv;
        sourceKind = 'measured';
    elseif isfile(sampleCsv)
        inputPath = sampleCsv;
        sourceKind = 'sample';
    else
        error('LUMEN:NoSnapshotSource', ...
            'No snapshot source found. Expected server/data/lumen.db, matlab/snapshots.csv, or matlab/sample_snapshots.csv.');
    end
else
    if ~isfile(inputPath)
        error('LUMEN:MissingInputFile', 'Snapshot file not found: %s', inputPath);
    end
    [~, baseName, ~] = fileparts(inputPath);
    if contains(lower(baseName), 'sample') || contains(lower(baseName), 'sim')
        sourceKind = 'sample';
    else
        sourceKind = 'measured';
    end
end

[~, ~, ext] = fileparts(inputPath);
ext = lower(ext);

if ismember(ext, {'.db', '.sqlite', '.sqlite3'})
    tbl = readSqliteSnapshots(inputPath);
elseif strcmp(ext, '.csv')
    tbl = readCsvSnapshots(inputPath);
else
    error('LUMEN:UnsupportedFormat', ...
        'Unsupported snapshot file extension "%s". Use .db/.sqlite or .csv.', ext);
end

requiredCols = {'minute', 'floor', 'on_floor', 'seats_free', 'capacity', 'noise_db', 'stale'};
missing = setdiff(requiredCols, tbl.Properties.VariableNames);
if ~isempty(missing)
    error('LUMEN:InvalidSchema', ...
        'Snapshot table missing required column(s): %s', strjoin(missing, ', '));
end

% Normalize types so downstream computation is identical for SQLite and CSV inputs.
if ~isdatetime(tbl.minute)
    tbl.minute = string(tbl.minute);
end
tbl.floor = double(tbl.floor);
tbl.on_floor = double(tbl.on_floor);
tbl.seats_free = double(tbl.seats_free);
tbl.capacity = double(tbl.capacity);
tbl.noise_db = double(tbl.noise_db);
tbl.stale = double(tbl.stale);

meta = struct( ...
    'sourceKind', sourceKind, ...
    'sourceFile', inputPath, ...
    'rowCount', height(tbl) ...
);
end

function tbl = readCsvSnapshots(csvPath)
opts = detectImportOptions(csvPath, 'TextType', 'string');
if any(strcmp(opts.VariableNames, 'minute'))
    opts = setvartype(opts, 'minute', 'string');
end
tbl = readtable(csvPath, opts);
end

function tbl = readSqliteSnapshots(dbPath)
sqlQuery = ['SELECT minute, floor, on_floor, seats_free, capacity, noise_db, stale ', ...
            'FROM snapshots ORDER BY minute ASC, floor DESC'];

% Prefer MATLAB Database Toolbox sqlite() when installed.
if ~isempty(which('sqlite'))
    try
        conn = sqlite(dbPath, 'readonly');
        cleanupConn = onCleanup(@() close(conn));
        raw = fetch(conn, sqlQuery);
        if iscell(raw)
            tbl = cell2table(raw, 'VariableNames', ...
                {'minute', 'floor', 'on_floor', 'seats_free', 'capacity', 'noise_db', 'stale'});
        else
            tbl = raw;
        end
        return;
    catch ME
        warning('LUMEN:DatabaseToolboxFallback', ...
            'MATLAB sqlite() read failed (%s). Falling back to sqlite3 CLI.', ME.message);
    end
end

% Fallback for MATLAB / MATLAB Online without Database Toolbox: sqlite3 CLI -> temp CSV.
tmpCsv = [tempname, '.csv'];
cleanupFile = onCleanup(@() deleteIfExists(tmpCsv));
cmd = sprintf('sqlite3 -header -csv "%s" "%s;" > "%s"', dbPath, sqlQuery, tmpCsv);
[status, cmdOut] = system(cmd);
if status ~= 0 || ~isfile(tmpCsv)
    error('LUMEN:SqliteReadFailed', ...
        ['Failed to read %s (Database Toolbox sqlite() unavailable and sqlite3 CLI exited with %d: %s). ', ...
         'Export CSV first with "npm run export:snapshots".'], ...
        dbPath, status, strtrim(cmdOut));
end
tbl = readCsvSnapshots(tmpCsv);
end

function deleteIfExists(filePath)
if isfile(filePath)
    delete(filePath);
end
end
