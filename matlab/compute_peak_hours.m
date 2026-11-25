function dataset = compute_peak_hours(tbl, floorsCfg, targetHours, sourceKind, sourceDesc)
% COMPUTE_PEAK_HOURS Compute typical-weekday hourly occupancy, acoustic Leq,
%   moving-average trends, and occupancy-vs-noise correlation from snapshots.
%
%   dataset = compute_peak_hours(tbl, floorsCfg, targetHours, sourceKind, sourceDesc)

arguments
    tbl table
    floorsCfg struct
    targetHours (1, :) double = 7:23
    sourceKind (1, :) char = 'sample'
    sourceDesc (1, :) char = ''
end

tz = 'America/Toronto';
if isfield(floorsCfg, 'timezone') && ~isempty(floorsCfg.timezone)
    tz = char(floorsCfg.timezone);
end

if isempty(sourceDesc)
    if strcmp(sourceKind, 'measured')
        sourceDesc = 'Typical weekday, measured sensor averages computed via MATLAB';
    else
        sourceDesc = 'Typical weekday, sample sensor snapshot averages computed via MATLAB';
    end
end

dtUtc = parseUtcTimestamps(tbl.minute);
dtLocal = dtUtc;
dtLocal.TimeZone = tz;
localHour = hour(dtLocal);

% Filter out weekends, stale sensor outages, and out-of-window hours.
isValidRow = ~isnat(dtLocal) ...
    & ~isweekend(dtLocal) ...
    & (tbl.stale == 0) ...
    & ismember(localHour, targetHours) ...
    & isfinite(tbl.floor) ...
    & isfinite(tbl.on_floor);

filteredTbl = tbl(isValidRow, :);
filteredHours = localHour(isValidRow);

if isempty(filteredTbl)
    error('LUMEN:NoValidWeekdayRows', ...
        'No non-stale weekday rows found in hours [%d..%d] (%s).', ...
        targetHours(1), targetHours(end), tz);
end

nHours = numel(targetHours);
floorsList = floorsCfg.floors;
nFloors = numel(floorsList);

floorKeys = cell(1, nFloors);
floorEntries = cell(1, nFloors);
summaryRows = struct( ...
    'floor', zeros(nFloors, 1), ...
    'capacity', zeros(nFloors, 1), ...
    'peak_hour', zeros(nFloors, 1), ...
    'peak_people', zeros(nFloors, 1), ...
    'peak_utilization_pct', zeros(nFloors, 1), ...
    'quietest_hour', zeros(nFloors, 1), ...
    'quietest_db', zeros(nFloors, 1), ...
    'loudest_hour', zeros(nFloors, 1), ...
    'loudest_db', zeros(nFloors, 1), ...
    'traffic_noise_r2', zeros(nFloors, 1), ...
    'noise_slope_db_per_person', zeros(nFloors, 1) ...
);

for fIdx = 1:nFloors
    if iscell(floorsList)
        fCfg = floorsList{fIdx};
    else
        fCfg = floorsList(fIdx);
    end
    fNum = double(fCfg.floor);
    cap = double(fCfg.capacity);

    people = nan(1, nHours);
    noiseDb = nan(1, nHours);

    for hIdx = 1:nHours
        hr = targetHours(hIdx);
        mask = (filteredTbl.floor == fNum) & (filteredHours == hr);
        if any(mask)
            % Clamp per-minute occupancy to [0, capacity] so standing overflow
            % never reports more seated people than floor capacity.
            seated = min(cap, max(0, filteredTbl.on_floor(mask)));
            people(hIdx) = round(mean(seated));

            dbSlice = filteredTbl.noise_db(mask);
            dbSlice = dbSlice(isfinite(dbSlice) & dbSlice >= 20 & dbSlice <= 110);
            if ~isempty(dbSlice)
                % Energetic equivalent continuous sound level (Leq):
                % L_eq = 10 * log10( mean( 10^(L_i / 10) ) )
                leq = 10 * log10(mean(10 .^ (dbSlice ./ 10)));
                noiseDb(hIdx) = round(leq, 1);
            end
        end
    end

    % Fill any sparse missing hour cleanly if working with partial real logs.
    if any(isnan(people))
        warning('LUMEN:MissingHourPeople', ...
            'Floor %d is missing %d hour bucket(s) for occupancy; interpolating.', ...
            fNum, sum(isnan(people)));
        people = round(min(cap, max(0, fillmissing(people, 'linear', 'EndValues', 'nearest'))));
    end
    if any(isnan(noiseDb))
        warning('LUMEN:MissingHourNoise', ...
            'Floor %d is missing %d hour bucket(s) for noise_db; interpolating.', ...
            fNum, sum(isnan(noiseDb)));
        noiseDb = round(fillmissing(noiseDb, 'linear', 'EndValues', 'nearest'), 1);
    end

    % 3-hour centered moving-average trends (MATLAB default 'shrink' at endpoints).
    trendPeople = round(movmean(people, 3), 1);
    trendNoiseDb = round(movmean(noiseDb, 3), 1);

    [peakPeople, peakIdx] = max(people);
    peakHour = targetHours(peakIdx);
    peakUtilPct = round(100 * peakPeople / max(cap, 1), 1);

    [quietDb, quietIdx] = min(noiseDb);
    quietHour = targetHours(quietIdx);

    [loudDb, loudIdx] = max(noiseDb);
    loudHour = targetHours(loudIdx);

    % Linear regression and R^2 relating hourly occupancy (people) to noise (dB).
    if numel(unique(people)) > 1 && numel(unique(noiseDb)) > 1
        R = corrcoef(people, noiseDb);
        r2 = round(R(1, 2)^2, 3);
        poly = polyfit(people, noiseDb, 1);
        slope = round(poly(1), 3);
    else
        r2 = 0;
        slope = 0;
    end

    matlabStats = struct( ...
        'trend_people', trendPeople, ...
        'trend_noise_db', trendNoiseDb, ...
        'peak_hour', peakHour, ...
        'peak_people', peakPeople, ...
        'peak_utilization_pct', peakUtilPct, ...
        'quietest_hour', quietHour, ...
        'quietest_db', quietDb, ...
        'loudest_hour', loudHour, ...
        'loudest_db', loudDb, ...
        'traffic_noise_r2', r2, ...
        'noise_slope_db_per_person', slope ...
    );

    floorKeys{fIdx} = sprintf('%d', fNum);
    floorEntries{fIdx} = struct( ...
        'people', people, ...
        'noise_db', noiseDb, ...
        'matlab', matlabStats ...
    );

    summaryRows.floor(fIdx) = fNum;
    summaryRows.capacity(fIdx) = cap;
    summaryRows.peak_hour(fIdx) = peakHour;
    summaryRows.peak_people(fIdx) = peakPeople;
    summaryRows.peak_utilization_pct(fIdx) = peakUtilPct;
    summaryRows.quietest_hour(fIdx) = quietHour;
    summaryRows.quietest_db(fIdx) = quietDb;
    summaryRows.loudest_hour(fIdx) = loudHour;
    summaryRows.loudest_db(fIdx) = loudDb;
    summaryRows.traffic_noise_r2(fIdx) = r2;
    summaryRows.noise_slope_db_per_person(fIdx) = slope;
end

dataset = struct( ...
    'source', sourceKind, ...
    'description', sourceDesc, ...
    'pipeline', struct( ...
        'engine', 'MATLAB', ...
        'script', 'matlab/run_lumen_peak_hours.m', ...
        'timezone', tz, ...
        'sample_count', height(filteredTbl), ...
        'people_method', 'hourly weekday mean occupancy clamped to [0, capacity]', ...
        'noise_method', 'energetic Leq mean 10*log10(mean(10^(dB/10)))', ...
        'trend_method', '3-hour centered moving mean via MATLAB movmean(x, 3)' ...
    ), ...
    'hours', targetHours, ...
    'floorKeys', {floorKeys}, ...
    'floorEntries', {floorEntries}, ...
    'capacities', summaryRows.capacity, ...
    'summaryTable', struct2table(summaryRows) ...
);
end

function dtUtc = parseUtcTimestamps(rawMinute)
if isdatetime(rawMinute)
    dtUtc = rawMinute;
    if isempty(dtUtc.TimeZone)
        dtUtc.TimeZone = 'UTC';
    end
    return;
end

minStr = string(rawMinute);
formats = { ...
    'uuuu-MM-dd''T''HH:mmX', ...
    'uuuu-MM-dd''T''HH:mm:ssX', ...
    'uuuu-MM-dd''T''HH:mm''Z''', ...
    'uuuu-MM-dd''T''HH:mm:ss''Z''' ...
};
for k = 1:numel(formats)
    try
        dtUtc = datetime(minStr, 'InputFormat', formats{k}, 'TimeZone', 'UTC');
        if ~all(isnat(dtUtc))
            return;
        end
    catch
        % Try next ISO-8601 format variant.
    end
end
dtUtc = datetime(minStr, 'TimeZone', 'UTC');
end
