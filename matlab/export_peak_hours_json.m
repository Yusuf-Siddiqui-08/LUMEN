function export_peak_hours_json(dataset, jsonPath)
% EXPORT_PEAK_HOURS_JSON Write LUMEN peakHours.json preserving floor order 8..2.
%   export_peak_hours_json(dataset, jsonPath)
%
%   Uses MATLAB jsonencode for every array and nested object while ordering
%   numeric-string keys ("8" down to "2") cleanly without MATLAB struct
%   field-name coercion.

arguments
    dataset struct
    jsonPath (1, :) char
end

outDir = fileparts(jsonPath);
if ~isempty(outDir) && ~isfolder(outDir)
    mkdir(outDir);
end

lines = {};
lines{end + 1} = '{';
lines{end + 1} = sprintf('  "source": %s,', jsonencode(char(dataset.source)));
lines{end + 1} = sprintf('  "description": %s,', jsonencode(char(dataset.description)));
lines{end + 1} = '  "pipeline": {';
lines{end + 1} = sprintf('    "engine": %s,', jsonencode(char(dataset.pipeline.engine)));
lines{end + 1} = sprintf('    "script": %s,', jsonencode(char(dataset.pipeline.script)));
lines{end + 1} = sprintf('    "timezone": %s,', jsonencode(char(dataset.pipeline.timezone)));
lines{end + 1} = sprintf('    "sample_count": %d,', round(dataset.pipeline.sample_count));
lines{end + 1} = sprintf('    "people_method": %s,', jsonencode(char(dataset.pipeline.people_method)));
lines{end + 1} = sprintf('    "noise_method": %s,', jsonencode(char(dataset.pipeline.noise_method)));
lines{end + 1} = sprintf('    "trend_method": %s', jsonencode(char(dataset.pipeline.trend_method)));
lines{end + 1} = '  },';
lines{end + 1} = sprintf('  "hours": %s,', jsonencode(dataset.hours));
lines{end + 1} = '  "floors": {';

nFloors = numel(dataset.floorKeys);
for idx = 1:nFloors
    key = dataset.floorKeys{idx};
    entry = dataset.floorEntries{idx};
    m = entry.matlab;

    if any(~isfinite(entry.people)) || any(~isfinite([ ...
            m.peak_hour, m.peak_people, m.peak_utilization_pct, ...
            m.quietest_hour, m.quietest_db, m.loudest_hour, m.loudest_db, ...
            m.traffic_noise_r2, m.noise_slope_db_per_person]))
        error('LUMEN:NonFiniteJsonValue', ...
            'Floor %s contains non-finite values and cannot be encoded as valid JSON.', key);
    end

    lines{end + 1} = sprintf('    "%s": {', key);
    lines{end + 1} = sprintf('      "people": %s,', jsonencode(entry.people));
    lines{end + 1} = sprintf('      "noise_db": %s,', formatOneDecimalJsonArray(entry.noise_db));
    lines{end + 1} = '      "matlab": {';
    lines{end + 1} = sprintf('        "trend_people": %s,', formatOneDecimalJsonArray(m.trend_people));
    lines{end + 1} = sprintf('        "trend_noise_db": %s,', formatOneDecimalJsonArray(m.trend_noise_db));
    lines{end + 1} = sprintf('        "peak_hour": %d,', round(m.peak_hour));
    lines{end + 1} = sprintf('        "peak_people": %d,', round(m.peak_people));
    lines{end + 1} = sprintf('        "peak_utilization_pct": %.1f,', m.peak_utilization_pct);
    lines{end + 1} = sprintf('        "quietest_hour": %d,', round(m.quietest_hour));
    lines{end + 1} = sprintf('        "quietest_db": %.1f,', m.quietest_db);
    lines{end + 1} = sprintf('        "loudest_hour": %d,', round(m.loudest_hour));
    lines{end + 1} = sprintf('        "loudest_db": %.1f,', m.loudest_db);
    lines{end + 1} = sprintf('        "traffic_noise_r2": %.3f,', m.traffic_noise_r2);
    lines{end + 1} = sprintf('        "noise_slope_db_per_person": %.3f', m.noise_slope_db_per_person);
    lines{end + 1} = '      }';

    if idx < nFloors
        lines{end + 1} = '    },';
    else
        lines{end + 1} = '    }';
    end
end

lines{end + 1} = '  }';
lines{end + 1} = '}';

fid = fopen(jsonPath, 'w', 'n', 'UTF-8');
if fid == -1
    error('LUMEN:JsonWriteFailed', 'Could not open %s for writing.', jsonPath);
end
cleanupFid = onCleanup(@() fclose(fid));
fprintf(fid, '%s\n', strjoin(lines, sprintf('\n')));
end

function txt = formatOneDecimalJsonArray(vec)
if any(~isfinite(vec))
    error('LUMEN:NonFiniteJsonValue', 'Cannot encode non-finite value into peakHours.json.');
end
parts = arrayfun(@(v) sprintf('%.1f', v), vec, 'UniformOutput', false);
txt = ['[', strjoin(parts, ', '), ']'];
end
