function figs = plot_peak_hours_graphs(dataset, outputDir, showFigures)
% PLOT_PEAK_HOURS_GRAPHS Generate both MATLAB peak-hour graphs per floor
%   (Foot Traffic by Hour + Noise by Hour) plus a building-wide summary.
%
%   figs = plot_peak_hours_graphs(dataset, outputDir, showFigures)
%
%   Outputs in outputDir:
%     - floor_<n>_peak_hours.png and .svg (Floors 2..8, two-graph layout)
%     - slc_all_floors_peak_hours.png and .svg (7-floor comparison)

arguments
    dataset struct
    outputDir (1, :) char
    showFigures (1, 1) logical = false
end

if ~isfolder(outputDir)
    mkdir(outputDir);
end

% LUMEN colour palette (0..1 RGB)
bgNavy   = [0.043, 0.106, 0.227]; % #0B1B3A
cardNavy = [0.075, 0.161, 0.322]; % #132952
blueRgb  = [0.459, 0.678, 0.918]; % #75ADEA
greenRgb = [0.239, 0.859, 0.588]; % #3DDB96
goldRgb  = [0.957, 0.714, 0.004]; % #F4B601
redRgb   = [0.949, 0.369, 0.369]; % #F25E5E
redTxt   = [1.000, 0.561, 0.541]; % #FF8F8A
mutedRgb = [0.788, 0.839, 0.933]; % #C9D6EE
whiteRgb = [1.000, 1.000, 1.000];

hours = dataset.hours;
xTickLabels = arrayfun(@shortHourLabel, hours, 'UniformOutput', false);
visMode = ternary(showFigures, 'on', 'off');
sourceTag = ternary(strcmp(dataset.source, 'measured'), ...
    'Typical weekday | measured (MATLAB)', ...
    'Typical weekday | sample (MATLAB)');

nFloors = numel(dataset.floorKeys);
figs = gobjects(1, nFloors + 1);

for idx = 1:nFloors
    key = dataset.floorKeys{idx};
    floorNum = str2double(key);
    cap = dataset.capacities(idx);
    entry = dataset.floorEntries{idx};
    people = entry.people;
    noiseDb = entry.noise_db;
    m = entry.matlab;

    fig = figure( ...
        'Name', sprintf('LUMEN Floor %d - Peak Hours (MATLAB)', floorNum), ...
        'Color', bgNavy, ...
        'InvertHardcopy', 'off', ...
        'Position', [60, 80, 1280, 500], ...
        'Visible', visMode ...
    );
    figs(idx) = fig;

    tl = tiledlayout(fig, 1, 2, 'TileSpacing', 'compact', 'Padding', 'compact');
    title(tl, sprintf('SLC Floor %d - Typical Weekday Peak Hours (%s)', floorNum, sourceTag), ...
        'Color', whiteRgb, 'FontWeight', 'bold', 'FontSize', 14);

    %% ---- Graph 1: Foot Traffic by Hour ----
    ax1 = nexttile(tl, 1);
    hold(ax1, 'on');
    set(ax1, 'Color', cardNavy, 'XColor', mutedRgb, 'YColor', mutedRgb, ...
        'Box', 'off', 'TickDir', 'out', 'LineWidth', 1.0, 'FontSize', 10);

    b = bar(ax1, hours, people, 0.68, 'FaceColor', 'flat', 'EdgeColor', 'none');
    barColors = zeros(numel(hours), 3);
    for hIdx = 1:numel(hours)
        freeSeats = max(0, cap - people(hIdx));
        if freeSeats >= 10
            barColors(hIdx, :) = greenRgb;
        elseif freeSeats > 0
            barColors(hIdx, :) = goldRgb;
        else
            barColors(hIdx, :) = redRgb;
        end
    end
    b.CData = barColors;

    % Highlight peak bar outline and draw capacity reference + 3-hr MATLAB trend.
    [~, peakIdx] = max(people);
    peakPeople = people(peakIdx);
    peakHour = hours(peakIdx);

    bar(ax1, peakHour, peakPeople, 0.68, 'FaceColor', 'none', ...
        'EdgeColor', whiteRgb, 'LineWidth', 1.8);

    yMax1 = max([cap, people, 1]);
    yline(ax1, cap, '--', sprintf('Capacity (%d)', cap), ...
        'Color', blueRgb, 'LineWidth', 1.2, ...
        'LabelHorizontalAlignment', 'left', 'LabelVerticalAlignment', 'bottom', ...
        'FontSize', 9);

    plot(ax1, hours, m.trend_people, '--', 'Color', whiteRgb, 'LineWidth', 1.7);

    text(ax1, peakHour, min(yMax1 * 1.08, peakPeople + max(1.8, yMax1 * 0.045)), ...
        sprintf('Peak, %d', peakPeople), ...
        'Color', whiteRgb, 'FontWeight', 'bold', 'FontSize', 10, ...
        'HorizontalAlignment', 'center');

    xlim(ax1, [hours(1) - 0.7, hours(end) + 0.7]);
    ylim(ax1, [0, ceil(yMax1 * 1.14)]);
    xticks(ax1, hours);
    xticklabels(ax1, xTickLabels);
    ylabel(ax1, 'People on floor', 'Color', mutedRgb, 'FontWeight', 'bold');
    title(ax1, sprintf('FOOT TRAFFIC BY HOUR - Busiest ~%s (%d of %d seats)', ...
        longHourLabel(peakHour), peakPeople, cap), ...
        'Color', whiteRgb, 'FontSize', 11, 'FontWeight', 'bold');
    grid(ax1, 'on');
    ax1.GridColor = blueRgb;
    ax1.GridAlpha = 0.16;

    hG = patch(ax1, NaN, NaN, greenRgb, 'EdgeColor', 'none');
    hY = patch(ax1, NaN, NaN, goldRgb, 'EdgeColor', 'none');
    hR = patch(ax1, NaN, NaN, redRgb, 'EdgeColor', 'none');
    hT1 = plot(ax1, NaN, NaN, '--', 'Color', whiteRgb, 'LineWidth', 1.7);
    leg1 = legend(ax1, [hG, hY, hR, hT1], ...
        {'10+ free', 'Under 10 free', sprintf('Full (%d)', cap), '3-hr trend (movmean)'}, ...
        'Location', 'northeast', 'TextColor', mutedRgb, 'Color', bgNavy, 'EdgeColor', blueRgb);
    leg1.FontSize = 8.5;

    %% ---- Graph 2: Noise by Hour ----
    ax2 = nexttile(tl, 2);
    hold(ax2, 'on');
    set(ax2, 'Color', cardNavy, 'XColor', mutedRgb, 'YColor', mutedRgb, ...
        'Box', 'off', 'TickDir', 'out', 'LineWidth', 1.0, 'FontSize', 10);

    yMin2 = max(25, min(40, floor((min(noiseDb) - 6) / 5) * 5));
    yMax2 = max(65, ceil((max(noiseDb) + 4) / 5) * 5);
    xLo = hours(1) - 0.6;
    xHi = hours(end) + 0.6;

    % Shaded acoustic bands (<45 Quiet, 45-60 Low chatter, >60 Social)
    patch(ax2, [xLo xHi xHi xLo], [yMin2 yMin2 45 45], greenRgb, ...
        'FaceAlpha', 0.10, 'EdgeColor', 'none');
    patch(ax2, [xLo xHi xHi xLo], [45 45 60 60], goldRgb, ...
        'FaceAlpha', 0.09, 'EdgeColor', 'none');
    patch(ax2, [xLo xHi xHi xLo], [60 60 yMax2 yMax2], redRgb, ...
        'FaceAlpha', 0.10, 'EdgeColor', 'none');

    yline(ax2, 45, '--', '45 dB Quiet', 'Color', greenRgb, 'LineWidth', 1.2, ...
        'LabelHorizontalAlignment', 'left', 'LabelVerticalAlignment', 'bottom', 'FontSize', 8.5);
    yline(ax2, 60, '--', '60 dB Social', 'Color', redTxt, 'LineWidth', 1.2, ...
        'LabelHorizontalAlignment', 'left', 'LabelVerticalAlignment', 'bottom', 'FontSize', 8.5);

    hT2 = plot(ax2, hours, m.trend_noise_db, ':', 'Color', whiteRgb, 'LineWidth', 1.7);
    hCurve = plot(ax2, hours, noiseDb, '-', 'Color', blueRgb, 'LineWidth', 2.4);

    ptColors = zeros(numel(hours), 3);
    for hIdx = 1:numel(hours)
        if noiseDb(hIdx) < 45
            ptColors(hIdx, :) = greenRgb;
        elseif noiseDb(hIdx) <= 60
            ptColors(hIdx, :) = goldRgb;
        else
            ptColors(hIdx, :) = redTxt;
        end
    end
    scatter(ax2, hours, noiseDb, 40, ptColors, 'filled', ...
        'MarkerEdgeColor', cardNavy, 'LineWidth', 1.0);

    [~, quietIdx] = min(noiseDb);
    quietDb = noiseDb(quietIdx);
    quietHour = hours(quietIdx);

    scatter(ax2, quietHour, quietDb, 95, ptColors(quietIdx, :), 'filled', ...
        'MarkerEdgeColor', whiteRgb, 'LineWidth', 1.8);

    labelY = quietDb + 2.2;
    if labelY > yMax2 - 2
        labelY = quietDb - 2.6;
    end
    text(ax2, quietHour, labelY, sprintf('Quietest, %.1f dB', quietDb), ...
        'Color', whiteRgb, 'FontWeight', 'bold', 'FontSize', 10, ...
        'HorizontalAlignment', 'center');

    xlim(ax2, [xLo, xHi]);
    ylim(ax2, [yMin2, yMax2]);
    xticks(ax2, hours);
    xticklabels(ax2, xTickLabels);
    ylabel(ax2, 'Noise level (dB Leq)', 'Color', mutedRgb, 'FontWeight', 'bold');
    title(ax2, sprintf('NOISE BY HOUR - Quietest ~%s (%.1f dB) | R^2 = %.2f', ...
        longHourLabel(quietHour), quietDb, m.traffic_noise_r2), ...
        'Color', whiteRgb, 'FontSize', 11, 'FontWeight', 'bold');
    grid(ax2, 'on');
    ax2.GridColor = blueRgb;
    ax2.GridAlpha = 0.14;

    leg2 = legend(ax2, [hCurve, hT2], ...
        {'Hourly Leq (dB)', sprintf('3-hr trend (+%.2f dB/person)', m.noise_slope_db_per_person)}, ...
        'Location', 'northeast', 'TextColor', mutedRgb, 'Color', bgNavy, 'EdgeColor', blueRgb);
    leg2.FontSize = 8.5;

    pngPath = fullfile(outputDir, sprintf('floor_%d_peak_hours.png', floorNum));
    svgPath = fullfile(outputDir, sprintf('floor_%d_peak_hours.svg', floorNum));
    exportFigure(fig, pngPath, svgPath, bgNavy);

    if ~showFigures
        close(fig);
    end
end

%% ---- Summary Figure: All SLC Floors Comparison (Both Metrics) ----
sumFig = figure( ...
    'Name', 'LUMEN SLC Floors 2-8 - Typical Weekday Overview (MATLAB)', ...
    'Color', bgNavy, ...
    'InvertHardcopy', 'off', ...
    'Position', [80, 80, 1280, 680], ...
    'Visible', visMode ...
);
figs(end) = sumFig;

tlAll = tiledlayout(sumFig, 2, 1, 'TileSpacing', 'compact', 'Padding', 'compact');
title(tlAll, sprintf('TMU SLC Floors 2-8 - Typical Weekday Comparison (%s)', sourceTag), ...
    'Color', whiteRgb, 'FontWeight', 'bold', 'FontSize', 14);

palette = lines(nFloors);

% Top summary: Occupancy utilization (%) across floors
axS1 = nexttile(tlAll, 1);
hold(axS1, 'on');
set(axS1, 'Color', cardNavy, 'XColor', mutedRgb, 'YColor', mutedRgb, 'Box', 'off', 'FontSize', 10);
legendNames = cell(1, nFloors);
for idx = 1:nFloors
    floorNum = str2double(dataset.floorKeys{idx});
    cap = max(dataset.capacities(idx), 1);
    utilPct = 100 .* dataset.floorEntries{idx}.people ./ cap;
    plot(axS1, hours, utilPct, '-o', 'LineWidth', 1.9, 'MarkerSize', 4, 'Color', palette(idx, :));
    legendNames{idx} = sprintf('Floor %d (%d seats)', floorNum, cap);
end
yline(axS1, 100, '--', '100% Full', 'Color', redRgb, 'LineWidth', 1.1, ...
    'LabelHorizontalAlignment', 'left', 'FontSize', 9);
xlim(axS1, [hours(1) - 0.5, hours(end) + 0.5]);
ylim(axS1, [0, 108]);
xticks(axS1, hours);
xticklabels(axS1, xTickLabels);
ylabel(axS1, 'Occupancy (%)', 'Color', mutedRgb, 'FontWeight', 'bold');
title(axS1, 'FOOT TRAFFIC UTILIZATION BY FLOOR (% OF SEATS TAKEN)', 'Color', whiteRgb, 'FontSize', 11);
grid(axS1, 'on');
axS1.GridColor = blueRgb;
axS1.GridAlpha = 0.16;
legend(axS1, legendNames, 'Location', 'eastoutside', 'TextColor', mutedRgb, 'Color', bgNavy, 'EdgeColor', blueRgb);

% Bottom summary: Acoustic Leq (dB) across floors
axS2 = nexttile(tlAll, 2);
hold(axS2, 'on');
set(axS2, 'Color', cardNavy, 'XColor', mutedRgb, 'YColor', mutedRgb, 'Box', 'off', 'FontSize', 10);
for idx = 1:nFloors
    plot(axS2, hours, dataset.floorEntries{idx}.noise_db, '-o', 'LineWidth', 1.9, 'MarkerSize', 4, 'Color', palette(idx, :));
end
yline(axS2, 45, '--', '45 dB Quiet', 'Color', greenRgb, 'LineWidth', 1.1, 'LabelHorizontalAlignment', 'left', 'FontSize', 9);
yline(axS2, 60, '--', '60 dB Social', 'Color', redTxt, 'LineWidth', 1.1, 'LabelHorizontalAlignment', 'left', 'FontSize', 9);
xlim(axS2, [hours(1) - 0.5, hours(end) + 0.5]);
ylim(axS2, [30, 70]);
xticks(axS2, hours);
xticklabels(axS2, xTickLabels);
ylabel(axS2, 'Noise (dB Leq)', 'Color', mutedRgb, 'FontWeight', 'bold');
title(axS2, 'ACOUSTIC LEVEL BY FLOOR (dB Leq)', 'Color', whiteRgb, 'FontSize', 11);
grid(axS2, 'on');
axS2.GridColor = blueRgb;
axS2.GridAlpha = 0.16;
legend(axS2, legendNames, 'Location', 'eastoutside', 'TextColor', mutedRgb, 'Color', bgNavy, 'EdgeColor', blueRgb);

exportFigure(sumFig, ...
    fullfile(outputDir, 'slc_all_floors_peak_hours.png'), ...
    fullfile(outputDir, 'slc_all_floors_peak_hours.svg'), ...
    bgNavy);

if ~showFigures
    close(sumFig);
end
end

function exportFigure(fig, pngPath, svgPath, bgColor)
if ~isempty(which('exportgraphics'))
    exportgraphics(fig, pngPath, 'Resolution', 200, 'BackgroundColor', bgColor);
else
    print(fig, pngPath, '-dpng', '-r200');
end
try
    print(fig, svgPath, '-dsvg');
catch
    % Some minimal headless environments may skip vector SVG export.
end
end

function lbl = shortHourLabel(h)
h24 = mod(round(h), 24);
if h24 >= 12
    suffix = 'p';
else
    suffix = 'a';
end
h12 = mod(h24, 12);
if h12 == 0
    h12 = 12;
end
lbl = sprintf('%d%s', h12, suffix);
end

function lbl = longHourLabel(h)
h24 = mod(round(h), 24);
if h24 >= 12
    suffix = 'PM';
else
    suffix = 'AM';
end
h12 = mod(h24, 12);
if h12 == 0
    h12 = 12;
end
lbl = sprintf('%d %s', h12, suffix);
end

function out = ternary(cond, a, b)
if cond
    out = a;
else
    out = b;
end
end
