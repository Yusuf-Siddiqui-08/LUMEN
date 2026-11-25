import type { CSSProperties, ReactNode } from 'react';
import { ALL_FLOOR_THEME_NUMBERS, FLOOR_THEMES } from '../lib/floorThemes';

const LAYER_BASE: CSSProperties = {
  position: 'absolute',
  inset: 0,
  pointerEvents: 'none',
  overflow: 'hidden',
  borderRadius: 'inherit',
};

const SCENE_SVG: CSSProperties = {
  position: 'absolute',
  inset: 0,
  width: '100%',
  height: '100%',
  display: 'block',
};

/** Symmetric rotating sunbeam wheel centered strictly on (cx, cy) so rotation never wobbles. */
function SunRays({
  cx,
  cy,
  innerR,
  outerR,
  count = 16,
  fill,
  opacity = 0.22,
  className = 'floor-sun-spin',
}: {
  cx: number;
  cy: number;
  innerR: number;
  outerR: number;
  count?: number;
  fill: string;
  opacity?: number;
  className?: string;
}) {
  const rays: ReactNode[] = [];
  for (let i = 0; i < count; i++) {
    const a = (i / count) * Math.PI * 2;
    const spread = (Math.PI / count) * (i % 2 === 0 ? 0.36 : 0.2);
    const len = i % 2 === 0 ? outerR : outerR * 0.72;
    const x1 = cx + Math.cos(a - spread * 0.45) * innerR;
    const y1 = cy + Math.sin(a - spread * 0.45) * innerR;
    const x2 = cx + Math.cos(a - spread) * len;
    const y2 = cy + Math.sin(a - spread) * len;
    const x3 = cx + Math.cos(a + spread) * len;
    const y3 = cy + Math.sin(a + spread) * len;
    const x4 = cx + Math.cos(a + spread * 0.45) * innerR;
    const y4 = cy + Math.sin(a + spread * 0.45) * innerR;
    rays.push(
      <polygon
        key={i}
        points={`${x1.toFixed(1)},${y1.toFixed(1)} ${x2.toFixed(1)},${y2.toFixed(1)} ${x3.toFixed(1)},${y3.toFixed(1)} ${x4.toFixed(1)},${y4.toFixed(1)}`}
        fill={fill}
        opacity={i % 2 === 0 ? opacity : opacity * 0.65}
      />,
    );
  }
  return (
    <g className={className}>
      <circle cx={cx} cy={cy} r={outerR} fill="none" stroke="none" />
      {rays}
    </g>
  );
}

/** Articulated flapping bird silhouette for flocking sky/coastal animations. */
function Bird({
  x,
  y,
  scale = 1,
  color = '#FFFBEB',
  opacity = 0.85,
  alt = false,
}: {
  x: number;
  y: number;
  scale?: number;
  color?: string;
  opacity?: number;
  alt?: boolean;
}) {
  return (
    <g transform={`translate(${x} ${y}) scale(${scale})`}>
      <path
        className={alt ? 'floor-wing-alt' : 'floor-wing'}
        d="M-14,3 Q-7,-6 0,0 Q7,-6 14,3 Q7,-1 0,2.5 Q-7,-1 -14,3 Z"
        fill={color}
        opacity={opacity}
      />
    </g>
  );
}

/** Multi-tiered evergreen conifer with trunk & sunlit bough highlight, swaying gently from its base. */
function PineTree({
  x,
  baseY,
  height,
  width,
  fill,
  highlight,
  opacity = 1,
  sway,
}: {
  x: number;
  baseY: number;
  height: number;
  width: number;
  fill: string;
  highlight?: string;
  opacity?: number;
  sway?: 'a' | 'b';
}) {
  const topY = baseY - height;
  const hw = width / 2;
  const trunkW = Math.max(4, width * 0.08);
  const d = [
    `M ${x} ${topY}`,
    `L ${x + hw * 0.34} ${topY + height * 0.17}`,
    `L ${x + hw * 0.18} ${topY + height * 0.16}`,
    `L ${x + hw * 0.56} ${topY + height * 0.36}`,
    `L ${x + hw * 0.32} ${topY + height * 0.34}`,
    `L ${x + hw * 0.74} ${topY + height * 0.56}`,
    `L ${x + hw * 0.48} ${topY + height * 0.54}`,
    `L ${x + hw * 0.90} ${topY + height * 0.76}`,
    `L ${x + hw * 0.64} ${topY + height * 0.74}`,
    `L ${x + hw} ${baseY - height * 0.04}`,
    `L ${x - hw} ${baseY - height * 0.04}`,
    `L ${x - hw * 0.64} ${topY + height * 0.74}`,
    `L ${x - hw * 0.90} ${topY + height * 0.76}`,
    `L ${x - hw * 0.48} ${topY + height * 0.54}`,
    `L ${x - hw * 0.74} ${topY + height * 0.56}`,
    `L ${x - hw * 0.32} ${topY + height * 0.34}`,
    `L ${x - hw * 0.56} ${topY + height * 0.36}`,
    `L ${x - hw * 0.18} ${topY + height * 0.16}`,
    `L ${x - hw * 0.34} ${topY + height * 0.17}`,
    'Z',
  ].join(' ');
  const hiD = [
    `M ${x} ${topY}`,
    `L ${x - hw * 0.34} ${topY + height * 0.17}`,
    `L ${x - hw * 0.14} ${topY + height * 0.18}`,
    `L ${x - hw * 0.56} ${topY + height * 0.36}`,
    `L ${x - hw * 0.24} ${topY + height * 0.37}`,
    `L ${x - hw * 0.74} ${topY + height * 0.56}`,
    `L ${x - hw * 0.36} ${topY + height * 0.58}`,
    `L ${x - hw * 0.88} ${topY + height * 0.76}`,
    `L ${x - hw * 0.12} ${topY + height * 0.72}`,
    'Z',
  ].join(' ');
  const cls = sway === 'a' ? 'floor-tree-sway' : sway === 'b' ? 'floor-tree-sway-alt' : undefined;
  return (
    <g className={cls} opacity={opacity}>
      <rect x={x - trunkW / 2} y={baseY - height * 0.16} width={trunkW} height={height * 0.18} fill="#081C14" />
      <path d={d} fill={fill} />
      {highlight && <path d={hiD} fill={highlight} opacity="0.22" />}
    </g>
  );
}

/** Detailed feathery tropical palm frond with curved spine and tapered leaflets for Floor 6 (The Beach). */
function PalmFrond({
  x,
  y,
  angle,
  scale = 1,
  flip = false,
  fill = '#0B4647',
  highlight = '#1B7B6F',
  className,
}: {
  x: number;
  y: number;
  angle: number;
  scale?: number;
  flip?: boolean;
  fill?: string;
  highlight?: string;
  className?: string;
}) {
  const leaflets = [
    [22, -2, 34, -26],
    [42, -5, 58, -32],
    [64, -7, 84, -36],
    [88, -8, 112, -36],
    [112, -7, 138, -32],
    [134, -4, 160, -24],
    [154, 1, 178, -14],
    [26, 2, 36, 28],
    [48, 0, 62, 34],
    [72, -1, 90, 36],
    [96, -1, 116, 35],
    [120, 0, 142, 30],
    [142, 3, 164, 24],
    [162, 8, 182, 18],
  ];
  return (
    <g transform={`translate(${x} ${y}) scale(${flip ? -scale : scale} ${scale}) rotate(${angle})`}>
      <g className={className}>
        <path d="M0,0 Q95,-20 198,18" fill="none" stroke={fill} strokeWidth="4.2" strokeLinecap="round" />
        <path d="M0,0 Q95,-20 198,18" fill="none" stroke={highlight} strokeWidth="1.6" strokeOpacity="0.45" strokeLinecap="round" />
        {leaflets.map(([bx, by, tx, ty], idx) => (
          <path
            key={idx}
            d={`M ${bx} ${by} Q ${(bx + tx) / 2 + 4} ${(by + ty) / 2 - 4} ${tx} ${ty} Q ${(bx + tx) / 2 - 3} ${(by + ty) / 2 + 4} ${bx + 7} ${by + 1} Z`}
            fill={idx % 2 === 0 ? fill : highlight}
            opacity={idx % 2 === 0 ? 0.92 : 0.72}
          />
        ))}
      </g>
    </g>
  );
}

/** Multi-layered botanical rose/blossom with outer & inner petals and golden center. */
function Blossom({
  x,
  y,
  scale = 1,
  petal = '#F9A8D4',
  petalAlt = '#F472B6',
  inner = '#FDF2F8',
  center = '#FDE047',
}: {
  x: number;
  y: number;
  scale?: number;
  petal?: string;
  petalAlt?: string;
  inner?: string;
  center?: string;
}) {
  return (
    <g transform={`translate(${x} ${y}) scale(${scale})`}>
      <circle cx="0" cy="-11" r="9.2" fill={petalAlt} />
      <circle cx="10.5" cy="-3.4" r="9.2" fill={petal} />
      <circle cx="6.6" cy="9.2" r="9.2" fill={petalAlt} />
      <circle cx="-6.6" cy="9.2" r="9.2" fill={petal} />
      <circle cx="-10.5" cy="-3.4" r="9.2" fill={petalAlt} />
      <circle cx="0" cy="-5.5" r="5.2" fill={inner} opacity="0.72" />
      <circle cx="5.2" cy="-1.6" r="5.2" fill={inner} opacity="0.72" />
      <circle cx="3.2" cy="4.6" r="5.2" fill={inner} opacity="0.72" />
      <circle cx="-3.2" cy="4.6" r="5.2" fill={inner} opacity="0.72" />
      <circle cx="-5.2" cy="-1.6" r="5.2" fill={inner} opacity="0.72" />
      <circle cx="0" cy="0" r="4.8" fill={center} />
      <circle cx="-1.2" cy="-1.2" r="1.6" fill="#FFFFFF" opacity="0.7" />
    </g>
  );
}

/** Detailed multi-pinnae botanical fern frond for Floor 4 (The Garden) & Floor 7 (The Forest). */
function FernFrond({
  x,
  y,
  angle = 0,
  scale = 1,
  fill = '#2F7A58',
  className,
}: {
  x: number;
  y: number;
  angle?: number;
  scale?: number;
  fill?: string;
  className?: string;
}) {
  const pairs = [18, 36, 54, 72, 90, 108, 124];
  return (
    <g transform={`translate(${x} ${y}) rotate(${angle}) scale(${scale})`}>
      <g className={className}>
        <path d="M0,0 Q6,-72 2,-142" fill="none" stroke={fill} strokeWidth="2.4" strokeLinecap="round" />
        {pairs.map((h, i) => {
          const w = Math.max(8, 28 - i * 3);
          const cx = h * 0.04;
          return (
            <g key={h} fill={fill} opacity={0.86 - i * 0.05}>
              <ellipse cx={cx - w * 0.6} cy={-h} rx={w * 0.65} ry={4.6 - i * 0.3} transform={`rotate(24 ${cx - w * 0.6} ${-h})`} />
              <ellipse cx={cx + w * 0.6} cy={-h - 2} rx={w * 0.65} ry={4.6 - i * 0.3} transform={`rotate(-24 ${cx + w * 0.6} ${-h - 2})`} />
            </g>
          );
        })}
      </g>
    </g>
  );
}

/** Floor 8 — The Sky: Unified panoramic azure sky, drifting shaded cumulus clouds, flocking birds & CN Tower skyline. */
function SkyScene() {
  return (
    <svg viewBox="0 0 1200 960" preserveAspectRatio="xMidYMid slice" style={SCENE_SVG} aria-hidden="true">
      <defs>
        <linearGradient id="f8-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#07214C" />
          <stop offset="32%" stopColor="#1456A2" />
          <stop offset="68%" stopColor="#3895DC" />
          <stop offset="100%" stopColor="#0C3166" />
        </linearGradient>
        <radialGradient id="f8-sun-halo" cx="50%" cy="8%" r="40%">
          <stop offset="0%" stopColor="#FFFDF4" stopOpacity="0.90" />
          <stop offset="22%" stopColor="#BAE6FD" stopOpacity="0.48" />
          <stop offset="62%" stopColor="#38BDF8" stopOpacity="0.16" />
          <stop offset="100%" stopColor="#38BDF8" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="f8-cloud-lit" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.96" />
          <stop offset="56%" stopColor="#E0F2FE" stopOpacity="0.78" />
          <stop offset="100%" stopColor="#60A5FA" stopOpacity="0.24" />
        </linearGradient>
        <linearGradient id="f8-cloud-shade" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#DBEAFE" stopOpacity="0.62" />
          <stop offset="100%" stopColor="#3B82F6" stopOpacity="0.14" />
        </linearGradient>
        <linearGradient id="f8-bot-clouds" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#E0F2FE" stopOpacity="0.54" />
          <stop offset="52%" stopColor="#38BDF8" stopOpacity="0.26" />
          <stop offset="100%" stopColor="#072149" stopOpacity="0.88" />
        </linearGradient>
      </defs>

      <rect width="1200" height="960" fill="url(#f8-sky)" />
      <rect width="1200" height="580" fill="url(#f8-sun-halo)" />

      {/* Slow rotating sunlit glare rays */}
      <SunRays cx={600} cy={72} innerR={26} outerR={380} count={14} fill="#E0F2FE" opacity={0.15} className="floor-sun-spin-slow" />

      {/* Wind-stream cirrus ribbons */}
      <g fill="none" stroke="#E0F2FE" strokeLinecap="round">
        <path className="floor-wind" d="M20,74 Q260,48 520,72 T980,58" strokeWidth="2.2" strokeOpacity="0.34" />
        <path className="floor-wind-2" d="M140,382 Q420,358 700,384 T1140,368" strokeWidth="1.8" strokeOpacity="0.28" />
      </g>

      {/* Painterly shaded cumulus cloud banks drifting in parallax */}
      <g className="floor-ambient-drift" opacity="0.78">
        <g fill="url(#f8-cloud-shade)" transform="translate(8 10)">
          <circle cx="110" cy="158" r="56" />
          <circle cx="176" cy="132" r="76" />
          <circle cx="256" cy="140" r="64" />
          <rect x="64" y="156" width="248" height="52" rx="26" />
        </g>
        <g fill="url(#f8-cloud-lit)">
          <circle cx="110" cy="154" r="54" />
          <circle cx="176" cy="126" r="74" />
          <circle cx="254" cy="136" r="62" />
          <rect x="66" y="154" width="242" height="48" rx="24" />
        </g>
      </g>

      <g className="floor-ambient-drift-slow" opacity="0.74">
        <g fill="url(#f8-cloud-shade)" transform="translate(-8 10)">
          <circle cx="910" cy="192" r="54" />
          <circle cx="980" cy="158" r="82" />
          <circle cx="1070" cy="170" r="68" />
          <rect x="864" y="192" width="270" height="56" rx="28" />
        </g>
        <g fill="url(#f8-cloud-lit)">
          <circle cx="910" cy="188" r="52" />
          <circle cx="980" cy="152" r="80" />
          <circle cx="1068" cy="166" r="66" />
          <rect x="866" y="188" width="264" height="52" rx="26" />
        </g>

        {/* Mid-height fluffy cloud floating cleanly in the middle gap */}
        <g fill="url(#f8-cloud-lit)" opacity="0.72">
          <circle cx="674" cy="390" r="36" />
          <circle cx="722" cy="370" r="52" />
          <circle cx="776" cy="384" r="40" />
          <rect x="646" y="388" width="160" height="32" rx="16" />
        </g>
      </g>

      {/* Flocking birds gliding through open upper & middle sky */}
      <g className="floor-bird-flock">
        <Bird x={0} y={54} scale={0.96} color="#F0F9FF" opacity={0.90} />
        <Bird x={-26} y={66} scale={0.78} color="#E0F2FE" opacity={0.80} alt />
        <Bird x={-50} y={48} scale={0.72} color="#E0F2FE" opacity={0.72} />
        <Bird x={-74} y={72} scale={0.64} color="#BAE6FD" opacity={0.64} alt />
        <Bird x={-96} y={58} scale={0.58} color="#BAE6FD" opacity={0.56} />
      </g>
      <g className="floor-bird-flock-rev">
        <Bird x={0} y={372} scale={0.68} color="#F0F9FF" opacity={0.70} alt />
        <Bird x={24} y={384} scale={0.56} color="#BAE6FD" opacity={0.58} />
        <Bird x={46} y={366} scale={0.50} color="#BAE6FD" opacity={0.50} alt />
      </g>

      {/* Single Unified Panoramic Toronto Downtown Skyline + CN Tower emerging above the lower cloud bank */}
      <path
        d="M0,900 L0,810 L54,810 L54,756 L104,756 L104,798 L160,798 L160,730 L212,730 L212,782 L274,782 L274,748 L336,748 L336,804 L412,804 L412,734 L478,734 L478,790 L548,790 L548,754 L608,754 L608,796 L666,796 L666,722 L722,722 L722,768 L774,768 L774,696 L830,696 L830,758 L874,758 L884,680 L890,680 L892,582 L882,576 L882,556 L893,548 L894,520 L890,516 L895,490 L900,516 L896,520 L897,548 L908,556 L908,576 L898,582 L900,680 L906,680 L916,758 L956,758 Q988,722 1020,758 L1052,758 L1052,684 L1106,684 L1106,734 L1154,734 L1154,704 L1200,704 L1200,900 Z"
        fill="#0A2E63"
        opacity="0.86"
      />
      {/* CN Tower observation pod lights + pulsing red aviation beacon + twinkling skyscraper windows */}
      <rect x="885" y="562" width="20" height="5.5" rx="2.75" fill="#BAE6FD" opacity="0.92" />
      <circle className="floor-beacon" cx="895" cy="490" r="5" fill="#FF7A72" />
      <g className="floor-ambient-twinkle" fill="#E0F2FE" opacity="0.62">
        <rect x="788" y="712" width="4" height="14" rx="1" />
        <rect x="802" y="720" width="4" height="10" rx="1" />
        <rect x="814" y="708" width="3.5" height="16" rx="1" />
        <rect x="682" y="740" width="4" height="12" rx="1" />
        <rect x="696" y="748" width="4" height="10" rx="1" />
        <rect x="1066" y="702" width="4" height="16" rx="1" />
        <rect x="1082" y="710" width="4" height="12" rx="1" />
        <rect x="1094" y="698" width="3.5" height="18" rx="1" />
      </g>

      {/* Billowing lower sunlit cloud deck */}
      <path
        className="floor-ambient-drift"
        d="M-40,960 L-40,812 Q140,736 320,798 T660,776 T980,802 T1240,762 L1240,960 Z"
        fill="url(#f8-bot-clouds)"
      />
      <path
        d="M0,960 L0,872 Q240,822 480,866 T940,852 T1200,868 L1200,960 Z"
        fill="#072149"
        opacity="0.82"
      />
    </svg>
  );
}

/** Floor 7 — The Forest: Unified panoramic misty evergreen woodland, breathing sunbeams, swaying pines, ferns & fireflies. */
function ForestScene() {
  return (
    <svg viewBox="0 0 1200 960" preserveAspectRatio="xMidYMid slice" style={SCENE_SVG} aria-hidden="true">
      <defs>
        <linearGradient id="f7-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#051913" />
          <stop offset="36%" stopColor="#0E3E2E" />
          <stop offset="72%" stopColor="#1B5F46" />
          <stop offset="100%" stopColor="#061B14" />
        </linearGradient>
        <radialGradient id="f7-canopy-glow" cx="26%" cy="10%" r="48%">
          <stop offset="0%" stopColor="#A7F3D0" stopOpacity="0.38" />
          <stop offset="48%" stopColor="#34D399" stopOpacity="0.14" />
          <stop offset="100%" stopColor="#10B981" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="f7-beam" x1="0" y1="0" x2="0.4" y2="1">
          <stop offset="0%" stopColor="#D1FAE5" stopOpacity="0.26" />
          <stop offset="68%" stopColor="#6EE7B7" stopOpacity="0.06" />
          <stop offset="100%" stopColor="#6EE7B7" stopOpacity="0" />
        </linearGradient>
        <linearGradient id="f7-mist" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#A7F3D0" stopOpacity="0" />
          <stop offset="50%" stopColor="#A7F3D0" stopOpacity="0.28" />
          <stop offset="100%" stopColor="#0B2E22" stopOpacity="0" />
        </linearGradient>
      </defs>

      <rect width="1200" height="960" fill="url(#f7-sky)" />
      <rect width="1200" height="620" fill="url(#f7-canopy-glow)" />

      {/* Woodland breeze streams & canopy birds */}
      <g fill="none" stroke="#A7F3D0" strokeLinecap="round">
        <path className="floor-wind" d="M120,66 Q360,44 620,68 T1020,54" strokeWidth="1.6" strokeOpacity="0.24" />
        <path className="floor-wind-2" d="M220,382 Q500,360 760,384 T1120,368" strokeWidth="1.4" strokeOpacity="0.22" />
      </g>
      <g className="floor-bird-flock">
        <Bird x={0} y={58} scale={0.74} color="#D1FAE5" opacity={0.68} />
        <Bird x={-26} y={70} scale={0.60} color="#A7F3D0" opacity={0.58} alt />
        <Bird x={-48} y={54} scale={0.54} color="#A7F3D0" opacity={0.50} />
      </g>

      {/* Breathing diagonal canopy light shafts pouring through the whole woodland */}
      <g className="floor-beam-breath">
        <polygon points="80,0 250,0 560,960 330,960" fill="url(#f7-beam)" />
        <polygon points="340,0 470,0 820,960 640,960" fill="url(#f7-beam)" opacity="0.82" />
        <polygon points="660,0 760,0 1100,900 960,900" fill="url(#f7-beam)" opacity="0.58" />
      </g>

      {/* Distant misty alpine ridge */}
      <path d="M0,560 Q220,478 460,530 T940,498 T1200,546 L1200,960 L0,960 Z" fill="#134C38" opacity="0.58" />

      {/* Distant misty treeline swaying gently */}
      <g opacity="0.58">
        <PineTree x={110} baseY={690} height={240} width={114} fill="#1E6A50" sway="a" />
        <PineTree x={260} baseY={686} height={268} width={124} fill="#1E6A50" sway="b" />
        <PineTree x={440} baseY={698} height={224} width={106} fill="#1E6A50" sway="a" />
        <PineTree x={640} baseY={692} height={252} width={118} fill="#1E6A50" sway="b" />
        <PineTree x={786} baseY={684} height={290} width={132} fill="#1E6A50" sway="a" />
        <PineTree x={946} baseY={688} height={276} width={128} fill="#1E6A50" sway="b" />
        <PineTree x={1096} baseY={682} height={296} width={136} fill="#1E6A50" sway="a" />
      </g>

      {/* Slowly drifting forest mist ribbon */}
      <rect className="floor-ambient-drift" x="-40" y="560" width="1280" height="210" fill="url(#f7-mist)" />

      {/* Midground & foreground multi-tiered wind-swaying conifers rising prominently across bottom-right & edges */}
      <g opacity="0.90">
        <PineTree x={36} baseY={928} height={540} width={210} fill="#072219" highlight="#10B981" sway="a" />
        <PineTree x={170} baseY={936} height={360} width={156} fill="#0B3325" highlight="#34D399" sway="b" />
        <PineTree x={640} baseY={936} height={330} width={152} fill="#114634" highlight="#6EE7B7" sway="b" />
        <PineTree x={764} baseY={936} height={410} width={178} fill="#0E3B2B" highlight="#34D399" sway="a" />
        <PineTree x={896} baseY={932} height={456} width={196} fill="#0A3023" highlight="#34D399" sway="b" />
        <PineTree x={1026} baseY={934} height={396} width={174} fill="#0B3325" highlight="#34D399" sway="a" />
        <PineTree x={1156} baseY={928} height={560} width={220} fill="#062017" highlight="#10B981" sway="b" />
      </g>

      {/* Mossy forest floor + swaying woodland ferns */}
      <path d="M0,960 L0,864 Q280,806 600,858 T1200,842 L1200,960 Z" fill="#051811" opacity="0.94" />
      <FernFrond x={696} y={930} angle={-18} scale={0.92} fill="#1E6B4F" className="floor-flower-sway" />
      <FernFrond x={838} y={934} angle={16} scale={0.86} fill="#1A5C44" className="floor-flower-sway-alt" />
      <FernFrond x={1054} y={932} angle={-14} scale={0.96} fill="#1E6B4F" className="floor-flower-sway" />

      {/* Organically floating bioluminescent fireflies */}
      <g>
        <circle className="floor-firefly" cx="602" cy="78" r="3.4" fill="#FDE68A" />
        <circle className="floor-firefly-2" cx="584" cy="382" r="3.0" fill="#A7F3D0" />
        <circle className="floor-firefly" cx="722" cy="708" r="3.4" fill="#FDE68A" />
        <circle className="floor-firefly-2" cx="848" cy="656" r="3.0" fill="#A7F3D0" />
        <circle className="floor-firefly" cx="964" cy="756" r="3.2" fill="#FDE68A" />
        <circle className="floor-firefly-2" cx="1076" cy="684" r="2.8" fill="#D1FAE5" />
      </g>
    </svg>
  );
}

/** Floor 6 — The Beach: Single continuous coastal vista — rotating sun, flocking gulls, turquoise waves & seafoam meeting detailed golden sand dunes, shells, starfish & swaying palm fronds. */
function BeachScene() {
  return (
    <svg viewBox="0 0 1200 960" preserveAspectRatio="xMidYMid slice" style={SCENE_SVG} aria-hidden="true">
      <defs>
        <linearGradient id="f6-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#0A456E" />
          <stop offset="48%" stopColor="#1A86A6" />
          <stop offset="84%" stopColor="#65C6BF" />
          <stop offset="100%" stopColor="#F6CC82" />
        </linearGradient>
        <radialGradient id="f6-sun-glow" cx="50%" cy="8%" r="38%">
          <stop offset="0%" stopColor="#FFFDF2" stopOpacity="1" />
          <stop offset="18%" stopColor="#FFD166" stopOpacity="0.94" />
          <stop offset="48%" stopColor="#FF9F43" stopOpacity="0.40" />
          <stop offset="100%" stopColor="#FF9F43" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="f6-ocean" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#0A6485" />
          <stop offset="44%" stopColor="#1391A6" />
          <stop offset="84%" stopColor="#2CC9BE" />
          <stop offset="100%" stopColor="#72E5D8" />
        </linearGradient>
        <linearGradient id="f6-sand" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#F2CA83" />
          <stop offset="36%" stopColor="#E1AD5E" />
          <stop offset="76%" stopColor="#C88D40" />
          <stop offset="100%" stopColor="#A86E2B" />
        </linearGradient>
        <linearGradient id="f6-sand-dune-shade" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#B87A32" stopOpacity="0.48" />
          <stop offset="100%" stopColor="#8F5A1E" stopOpacity="0.18" />
        </linearGradient>
        <linearGradient id="f6-top-scrim" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#062A42" stopOpacity="0.44" />
          <stop offset="100%" stopColor="#062A42" stopOpacity="0" />
        </linearGradient>
      </defs>

      {/* Continuous Coastal Golden-Hour Sky */}
      <rect x="0" y="0" width="1200" height="410" fill="url(#f6-sky)" />
      <rect x="0" y="0" width="1200" height="96" fill="url(#f6-top-scrim)" />

      {/* Radiant Beach Sun + Continuously Rotating 16-Ray Sunburst centered cleanly at top */}
      <rect x="0" y="0" width="1200" height="480" fill="url(#f6-sun-glow)" />
      <SunRays cx={600} cy={78} innerR={38} outerR={380} count={16} fill="#FFE8A3" opacity={0.22} className="floor-sun-spin" />
      <g className="floor-sun-pulse">
        <circle cx="600" cy="78" r="66" fill="#FFD166" opacity="0.34" />
        <circle cx="600" cy="78" r="48" fill="#FFE699" opacity="0.58" />
      </g>
      <circle cx="600" cy="78" r="40" fill="#FFE699" opacity="0.96" />
      <circle cx="600" cy="78" r="28" fill="#FFFDF4" />

      {/* Drifting warm sea-breeze clouds */}
      <g className="floor-ambient-drift" fill="#FFF5DF" opacity="0.54">
        <ellipse cx="220" cy="110" rx="96" ry="20" />
        <ellipse cx="270" cy="100" rx="66" ry="22" />
        <ellipse cx="164" cy="116" rx="54" ry="14" opacity="0.72" />
      </g>
      <g className="floor-ambient-drift-slow" fill="#FFF5DF" opacity="0.48">
        <ellipse cx="970" cy="126" rx="92" ry="19" />
        <ellipse cx="1032" cy="116" rx="60" ry="20" />
      </g>

      {/* Gliding sea-breeze wind ribbons across sky & horizon */}
      <g fill="none" stroke="#FFFBEB" strokeLinecap="round">
        <path className="floor-wind" d="M60,84 Q300,60 560,84 T980,70" strokeWidth="1.8" strokeOpacity="0.32" />
        <path className="floor-wind-2" d="M160,378 Q440,358 720,380 T1120,368" strokeWidth="1.6" strokeOpacity="0.28" />
      </g>

      {/* Two animated V-flocks of wing-flapping seagulls gliding across the sky */}
      <g className="floor-bird-flock">
        <Bird x={0} y={56} scale={1.0} color="#FFFBEB" opacity={0.94} />
        <Bird x={-28} y={44} scale={0.82} color="#FFFBEB" opacity={0.84} alt />
        <Bird x={-52} y={64} scale={0.76} color="#FEF3C7" opacity={0.78} />
        <Bird x={-78} y={50} scale={0.66} color="#FEF3C7" opacity={0.70} alt />
        <Bird x={-102} y={68} scale={0.58} color="#FFE8A3" opacity={0.62} />
      </g>
      <g className="floor-bird-flock-2">
        <Bird x={0} y={376} scale={0.74} color="#FFFBEB" opacity={0.80} alt />
        <Bird x={-26} y={388} scale={0.60} color="#FEF3C7" opacity={0.70} />
        <Bird x={-48} y={370} scale={0.52} color="#FEF3C7" opacity={0.60} alt />
      </g>

      {/* Single Continuous Shimmering Turquoise Ocean */}
      <rect x="0" y="398" width="1200" height="310" fill="url(#f6-ocean)" />

      {/* Animated Golden Sun Reflections shimmering vertically down the water */}
      <g fill="#FFE8A3">
        <rect className="floor-water-glint" x="546" y="410" width="108" height="4" rx="2" />
        <rect className="floor-water-glint-2" x="560" y="428" width="84" height="4" rx="2" />
        <rect className="floor-water-glint" x="536" y="448" width="128" height="5" rx="2.5" />
        <rect className="floor-water-glint-2" x="566" y="470" width="68" height="4" rx="2" />
        <rect className="floor-water-glint" x="530" y="494" width="140" height="5" rx="2.5" />
        <rect className="floor-water-glint-2" x="562" y="520" width="76" height="4" rx="2" />
        <rect className="floor-water-glint" x="544" y="548" width="112" height="4" rx="2" />
        <rect className="floor-water-glint-2" x="860" y="444" width="54" height="2.8" rx="1.4" opacity="0.52" />
        <rect className="floor-water-glint" x="260" y="458" width="46" height="2.6" rx="1.3" opacity="0.48" />
      </g>

      {/* Layered Animated Rolling Ocean Waves & Frothy Seafoam */}
      <g className="floor-wave-1">
        <path d="M-40,548 Q190,514 400,544 T820,530 T1240,548 L1240,700 L-40,700 Z" fill="#159FAF" opacity="0.74" />
        <path d="M-40,548 Q190,514 400,544 T820,530 T1240,548" fill="none" stroke="#CCFBF1" strokeWidth="3.5" strokeOpacity="0.72" />
      </g>
      <g className="floor-wave-2">
        <path d="M-40,624 Q220,588 460,622 T920,602 T1240,628 L1240,740 L-40,740 Z" fill="#2DD4BF" opacity="0.72" />
        <path d="M-40,624 Q220,588 460,622 T920,602 T1240,628" fill="none" stroke="#F0FDFA" strokeWidth="5" strokeOpacity="0.82" />
        <path d="M20,636 Q240,608 480,638 T940,620" fill="none" stroke="#CCFBF1" strokeWidth="2.2" strokeOpacity="0.48" strokeDasharray="18 14" />
      </g>

      {/* Wet-Sand Shoreline Band + Rhythmic Washing White Seafoam Swash */}
      <path d="M0,694 Q250,652 540,688 T1060,664 L1200,682 L1200,960 L0,960 Z" fill="#BC8540" opacity="0.94" />
      <g className="floor-foam-wash">
        <path d="M-20,692 Q250,650 540,686 T1060,662 L1220,680" fill="none" stroke="#FFFFFF" strokeWidth="7.5" strokeOpacity="0.86" />
        <path d="M-20,704 Q250,664 540,698 T1060,676 L1220,692" fill="none" stroke="#E6FFFA" strokeWidth="3" strokeOpacity="0.60" strokeDasharray="24 12" />
      </g>

      {/* Single Continuous Richly Detailed Golden Sand Beach (Fills Lower Canvas & Bottom-Right Showcase) */}
      <path d="M0,726 Q290,680 600,722 T1200,704 L1200,960 L0,960 Z" fill="url(#f6-sand)" />
      <path d="M0,822 Q260,774 540,820 T1020,802 T1200,824 L1200,960 L0,960 Z" fill="url(#f6-sand-dune-shade)" />
      <path d="M0,896 Q340,860 680,900 T1200,878 L1200,960 L0,960 Z" fill="#9E6829" opacity="0.38" />

      {/* Fine wind-carved sand ripples */}
      <g fill="none" stroke="#FFF4D1" strokeLinecap="round">
        <path d="M560,762 Q780,738 1000,766 T1195,754" strokeWidth="2.2" strokeOpacity="0.38" />
        <path d="M610,814 Q840,792 1060,820" strokeWidth="1.8" strokeOpacity="0.32" />
        <path d="M660,868 Q890,846 1140,872" strokeWidth="1.8" strokeOpacity="0.30" />
        <path d="M720,916 Q940,900 1160,920" strokeWidth="1.5" strokeOpacity="0.26" />
      </g>

      {/* Warm sand grain speckles & pebbles across the golden dunes */}
      <g opacity="0.50">
        <circle cx="642" cy="774" r="2.2" fill="#FFF7D6" />
        <circle cx="716" cy="804" r="2.4" fill="#8C5820" />
        <circle cx="788" cy="780" r="2.0" fill="#FFF7D6" />
        <circle cx="852" cy="836" r="2.6" fill="#9E6728" />
        <circle cx="928" cy="798" r="2.0" fill="#FFF7D6" />
        <circle cx="988" cy="862" r="2.4" fill="#8C5820" />
        <circle cx="1054" cy="818" r="2.2" fill="#FFF7D6" />
        <circle cx="892" cy="904" r="2.4" fill="#8C5820" />
        <circle cx="744" cy="884" r="2.0" fill="#FFF7D6" />
      </g>

      {/* Coral Starfish, Spiral Conch & Scallop Shell resting naturally on the open beach */}
      <g transform="translate(792 848) rotate(-18) scale(1.3)" opacity="0.76">
        <path
          d="M0,-11 L3,-3 L11,-3 L5,2 L7,10 L0,5 L-7,10 L-5,2 L-11,-3 L-3,-3 Z"
          fill="#F59E6C"
          stroke="#9E4F28"
          strokeWidth="0.9"
        />
      </g>
      <g transform="translate(948 824) rotate(22) scale(1.3)" opacity="0.78">
        <path d="M0,0 L-10,-12 A14,14 0 0,1 10,-12 Z" fill="#FFF0D4" stroke="#B57B3A" strokeWidth="1" />
        <line x1="0" y1="0" x2="-5" y2="-13" stroke="#C88E4A" strokeWidth="0.9" />
        <line x1="0" y1="0" x2="0" y2="-14" stroke="#C88E4A" strokeWidth="0.9" />
        <line x1="0" y1="0" x2="5" y2="-13" stroke="#C88E4A" strokeWidth="0.9" />
      </g>
      <g transform="translate(1062 886) rotate(-10) scale(1.1)" opacity="0.72">
        <ellipse cx="0" cy="0" rx="11" ry="6.5" fill="#FDE6C4" stroke="#A86E2B" strokeWidth="1" />
        <path d="M-4,-5 Q1,0 -4,5 M2,-5 Q6,0 2,5" fill="none" stroke="#B57B3A" strokeWidth="0.9" />
      </g>

      {/* Swaying Coastal Dune Grass / Sea-Oats */}
      <g stroke="#1E5F54" strokeWidth="2.4" fill="none" strokeLinecap="round" opacity="0.70">
        <path className="floor-flower-sway" d="M676,948 Q664,876 694,812" />
        <path className="floor-flower-sway-alt" d="M690,952 Q704,884 734,836" />
        <path className="floor-flower-sway" d="M662,954 Q648,898 632,852" />
      </g>

      {/* Detailed Swaying Tropical Palm Fronds framing top-left & bottom-right corners */}
      <PalmFrond x={-26} y={34} angle={12} scale={1.06} className="floor-palm-left" />
      <PalmFrond x={-30} y={80} angle={32} scale={0.94} className="floor-palm-left" />
      <PalmFrond x={1226} y={718} angle={-16} scale={1.22} flip className="floor-palm-right" />
      <PalmFrond x={1228} y={782} angle={8} scale={1.10} flip className="floor-palm-right" />
    </svg>
  );
}

/** Floor 5 — The Sun: Single continuous solar vista — rotating 18-ray sunburst, counter-rotating solstice rings, soaring birds, rising embers & sunlit mesas. */
function SunScene() {
  return (
    <svg viewBox="0 0 1200 960" preserveAspectRatio="xMidYMid slice" style={SCENE_SVG} aria-hidden="true">
      <defs>
        <linearGradient id="f5-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#261005" />
          <stop offset="34%" stopColor="#72330B" />
          <stop offset="70%" stopColor="#BE580D" />
          <stop offset="100%" stopColor="#2C1306" />
        </linearGradient>
        <radialGradient id="f5-solar-core" cx="50%" cy="10%" r="52%">
          <stop offset="0%" stopColor="#FFFDF2" stopOpacity="0.98" />
          <stop offset="16%" stopColor="#FDE047" stopOpacity="0.86" />
          <stop offset="46%" stopColor="#F59E0B" stopOpacity="0.36" />
          <stop offset="100%" stopColor="#EA580C" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="f5-horizon-glow" cx="76%" cy="82%" r="48%">
          <stop offset="0%" stopColor="#FDE047" stopOpacity="0.44" />
          <stop offset="48%" stopColor="#F59E0B" stopOpacity="0.22" />
          <stop offset="100%" stopColor="#261005" stopOpacity="0" />
        </radialGradient>
      </defs>

      <rect width="1200" height="960" fill="url(#f5-sky)" />
      <rect width="1200" height="720" fill="url(#f5-solar-core)" />
      <rect width="1200" height="960" fill="url(#f5-horizon-glow)" />

      {/* Single Monumental Continuously Rotating 18-Ray Sunburst Wheel */}
      <SunRays cx={600} cy={88} innerR={48} outerR={640} count={18} fill="#FEF08A" opacity={0.22} className="floor-sun-spin" />

      {/* Counter-rotating solstice orbital rings */}
      <g className="floor-sun-spin-slow" fill="none" stroke="#FDE68A">
        <circle cx="600" cy="88" r="340" strokeWidth="1.1" strokeOpacity="0.24" strokeDasharray="12 14" />
        <circle cx="600" cy="88" r="210" strokeWidth="1.4" strokeOpacity="0.32" strokeDasharray="8 10" />
        <circle cx="600" cy="88" r="112" strokeWidth="1.6" strokeOpacity="0.38" />
      </g>

      {/* Breathing Solar Orb */}
      <g className="floor-sun-pulse">
        <circle cx="600" cy="88" r="76" fill="#FBBF24" opacity="0.36" />
        <circle cx="600" cy="88" r="58" fill="#FDE047" opacity="0.54" />
      </g>
      <circle cx="600" cy="88" r="46" fill="#FDE047" opacity="0.94" />
      <circle cx="600" cy="88" r="32" fill="#FFFDF4" />

      {/* Warm desert wind currents & soaring thermal birds */}
      <g fill="none" stroke="#FEF08A" strokeLinecap="round">
        <path className="floor-wind" d="M40,378 Q320,356 620,382 T1080,366" strokeWidth="1.6" strokeOpacity="0.26" />
        <path className="floor-wind-2" d="M120,668 Q440,646 760,672 T1140,654" strokeWidth="1.4" strokeOpacity="0.22" />
      </g>
      <g className="floor-bird-flock-rev">
        <Bird x={0} y={372} scale={0.82} color="#451A03" opacity={0.58} />
        <Bird x={28} y={386} scale={0.68} color="#451A03" opacity={0.48} alt />
        <Bird x={52} y={368} scale={0.58} color="#451A03" opacity={0.42} />
      </g>

      {/* Sculpted Multi-Layered Sunlit Terracotta & Ochre Mesas */}
      <path d="M0,740 L124,704 L268,722 L414,678 L568,732 L728,672 L878,708 L1042,648 L1200,688 L1200,960 L0,960 Z" fill="#923D0C" opacity="0.72" />
      <path d="M0,740 L124,704 L268,722 L414,678 L568,732 L728,672 L878,708 L1042,648 L1200,688" fill="none" stroke="#FDE68A" strokeWidth="2" strokeOpacity="0.42" />
      <path d="M0,816 Q280,762 620,814 T1200,786 L1200,960 L0,960 Z" fill="#5A250A" opacity="0.82" />
      <path d="M0,884 Q360,842 740,888 T1200,866 L1200,960 L0,960 Z" fill="#2A1206" opacity="0.94" />

      {/* Rising shimmering golden solar embers */}
      <g fill="#FEF08A">
        <circle className="floor-ember" cx="614" cy="480" r="3.2" />
        <circle className="floor-ember-2" cx="742" cy="840" r="3" />
        <circle className="floor-ember" cx="876" cy="790" r="3.2" />
        <circle className="floor-ember-2" cx="984" cy="860" r="2.8" />
        <circle className="floor-ember" cx="1096" cy="770" r="2.8" />
      </g>
    </svg>
  );
}

/** Floor 4 — The Garden: Unified twilight botanical conservatory — arches, swaying hanging vines, lush bottom-right flower bed, ferns, drifting petals & fireflies. */
function GardenScene() {
  return (
    <svg viewBox="0 0 1200 960" preserveAspectRatio="xMidYMid slice" style={SCENE_SVG} aria-hidden="true">
      <defs>
        <linearGradient id="f4-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#12211B" />
          <stop offset="38%" stopColor="#214636" />
          <stop offset="72%" stopColor="#3F2E4B" />
          <stop offset="100%" stopColor="#0F231B" />
        </linearGradient>
        <radialGradient id="f4-bloom-glow" cx="50%" cy="28%" r="54%">
          <stop offset="0%" stopColor="#F2B5D4" stopOpacity="0.28" />
          <stop offset="55%" stopColor="#86EFAC" stopOpacity="0.12" />
          <stop offset="100%" stopColor="#86EFAC" stopOpacity="0" />
        </radialGradient>
      </defs>

      <rect width="1200" height="960" fill="url(#f4-sky)" />
      <rect width="1200" height="740" fill="url(#f4-bloom-glow)" />

      {/* Single Full-Height Victorian Conservatory Glasshouse Arches */}
      <g fill="none" stroke="#C7F9CC" strokeOpacity="0.20" strokeWidth="1.6">
        <path d="M56,940 L56,220 Q56,36 240,36 L960,36 Q1144,36 1144,220 L1144,940" />
        <path d="M210,940 L210,240 Q210,94 356,94 L844,94 Q990,94 990,240 L990,940" />
        <path d="M600,36 L600,340" strokeDasharray="6 8" />
        <path d="M360,36 L420,94 M840,36 L780,94" strokeOpacity="0.14" />
      </g>

      {/* Swaying Hanging Botanical Vines & Blossoms framing top corners & center */}
      <g className="floor-vine-sway">
        <path d="M36,0 Q52,72 32,158" fill="none" stroke="#86EFAC" strokeWidth="2.2" opacity="0.62" />
        <g fill="#4ADE80" opacity="0.60">
          <ellipse cx="48" cy="48" rx="15" ry="7" transform="rotate(-24 48 48)" />
          <ellipse cx="26" cy="92" rx="16" ry="7.5" transform="rotate(22 26 92)" />
          <ellipse cx="46" cy="134" rx="14" ry="6.5" transform="rotate(-20 46 134)" />
        </g>
      </g>
      <g className="floor-vine-sway">
        <path d="M600,0 Q612,42 596,94" fill="none" stroke="#86EFAC" strokeWidth="2.2" opacity="0.58" />
        <g fill="#4ADE80" opacity="0.58">
          <ellipse cx="612" cy="30" rx="13" ry="6" transform="rotate(-24 612 30)" />
          <ellipse cx="588" cy="60" rx="13" ry="6" transform="rotate(24 588 60)" />
        </g>
        <Blossom x={598} y={88} scale={0.94} petal="#F9A8D4" petalAlt="#F472B6" />
      </g>
      <g className="floor-vine-sway">
        <path d="M1152,0 Q1134,84 1158,176" fill="none" stroke="#86EFAC" strokeWidth="2.2" opacity="0.62" />
        <g fill="#4ADE80" opacity="0.60">
          <ellipse cx="1138" cy="54" rx="16" ry="7.5" transform="rotate(24 1138 54)" />
          <ellipse cx="1160" cy="100" rx="15" ry="7" transform="rotate(-22 1160 100)" />
          <ellipse cx="1142" cy="146" rx="14" ry="6.5" transform="rotate(18 1142 146)" />
        </g>
      </g>

      {/* Gentle breeze & drifting pastel petals */}
      <path className="floor-wind" d="M80,378 Q360,354 640,380 T1080,362" fill="none" stroke="#F9A8D4" strokeWidth="1.5" strokeOpacity="0.24" strokeLinecap="round" />
      <g>
        <ellipse className="floor-petal-fall" cx="560" cy="148" rx="6.5" ry="3.5" fill="#F9A8D4" />
        <ellipse className="floor-petal-fall-2" cx="654" cy="340" rx="6.2" ry="3.2" fill="#D8B4FE" />
        <ellipse className="floor-petal-fall" cx="848" cy="540" rx="6.5" ry="3.4" fill="#FDE68A" />
        <ellipse className="floor-petal-fall-2" cx="1032" cy="510" rx="6.5" ry="3.4" fill="#FBCFE8" />
      </g>

      {/* Rolling Botanical Hillside & Single Unified Lush Garden Bed */}
      <path d="M0,788 Q280,722 600,776 T1200,746 L1200,960 L0,960 Z" fill="#1E4636" opacity="0.84" />
      <path d="M0,858 Q340,812 680,858 T1200,830 L1200,960 L0,960 Z" fill="#0F231B" opacity="0.94" />

      {/* Swaying Feathered Fern Fronds & Unmistakable Multi-Layer Wildflowers in bottom-right showcase */}
      <FernFrond x={662} y={946} angle={-16} scale={1.32} fill="#2B7254" className="floor-flower-sway" />
      <FernFrond x={844} y={950} angle={18} scale={1.24} fill="#256348" className="floor-flower-sway-alt" />
      <FernFrond x={1048} y={948} angle={-18} scale={1.38} fill="#2B7254" className="floor-flower-sway" />

      <g className="floor-flower-sway">
        <path d="M712,944 Q704,820 726,718" stroke="#86EFAC" strokeWidth="2.8" fill="none" strokeLinecap="round" />
        <ellipse cx="692" cy="822" rx="22" ry="9" fill="#4ADE80" opacity="0.65" transform="rotate(-32 692 822)" />
        <ellipse cx="736" cy="792" rx="22" ry="9" fill="#4ADE80" opacity="0.65" transform="rotate(28 736 792)" />
        <Blossom x={726} y={712} scale={1.52} petal="#F9A8D4" petalAlt="#F472B6" center="#FDE68A" />
      </g>
      <g className="floor-flower-sway-alt">
        <path d="M808,944 Q818,828 798,742" stroke="#86EFAC" strokeWidth="2.6" fill="none" strokeLinecap="round" />
        <g fill="#D8B4FE">
          <ellipse cx="798" cy="718" rx="7.5" ry="13" />
          <ellipse cx="790" cy="738" rx="8" ry="13" />
          <ellipse cx="806" cy="756" rx="7.5" ry="13" />
          <ellipse cx="796" cy="776" rx="7" ry="12" />
        </g>
      </g>
      <g className="floor-flower-sway">
        <path d="M908,944 Q900,812 920,694" stroke="#86EFAC" strokeWidth="3" fill="none" strokeLinecap="round" />
        <ellipse cx="888" cy="802" rx="24" ry="9.5" fill="#4ADE80" opacity="0.65" transform="rotate(-26 888 802)" />
        <ellipse cx="940" cy="772" rx="24" ry="9.5" fill="#4ADE80" opacity="0.65" transform="rotate(30 940 772)" />
        <Blossom x={920} y={688} scale={1.72} petal="#FBCFE8" petalAlt="#F472B6" center="#FDE047" />
      </g>
      <g className="floor-flower-sway-alt">
        <path d="M1014,944 Q1026,834 1004,744" stroke="#86EFAC" strokeWidth="2.6" fill="none" strokeLinecap="round" />
        <Blossom x={1004} y={740} scale={1.32} petal="#FEF08A" petalAlt="#FDE047" inner="#FFFBEB" center="#F59E0B" />
      </g>
      <g className="floor-flower-sway">
        <path d="M1112,944 Q1100,816 1120,710" stroke="#86EFAC" strokeWidth="2.8" fill="none" strokeLinecap="round" />
        <ellipse cx="1090" cy="808" rx="24" ry="9.5" fill="#4ADE80" opacity="0.65" transform="rotate(-30 1090 808)" />
        <Blossom x={1120} y={704} scale={1.52} petal="#E9D5FF" petalAlt="#C084FC" inner="#FAF5FF" center="#FDE68A" />
      </g>

      {/* Garden twilight fireflies */}
      <circle className="floor-firefly" cx="868" cy="716" r="3.2" fill="#FDE68A" />
      <circle className="floor-firefly-2" cx="1054" cy="684" r="3.0" fill="#F9A8D4" />
      <circle className="floor-firefly" cx="628" cy="768" r="2.8" fill="#D8B4FE" />
    </svg>
  );
}

/** Floor 3 — The Bluffs: Unified Scarborough Bluffs vista — sunset sky, gulls, 3D contour lines, monumental terraced limestone cliffs with rim pines & shimmering Lake Ontario. */
function BluffsScene() {
  return (
    <svg viewBox="0 0 1200 960" preserveAspectRatio="xMidYMid slice" style={SCENE_SVG} aria-hidden="true">
      <defs>
        <linearGradient id="f3-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#1B151E" />
          <stop offset="38%" stopColor="#563026" />
          <stop offset="72%" stopColor="#9A5539" />
          <stop offset="100%" stopColor="#16293B" />
        </linearGradient>
        <radialGradient id="f3-sunset" cx="50%" cy="14%" r="48%">
          <stop offset="0%" stopColor="#FED7AA" stopOpacity="0.62" />
          <stop offset="46%" stopColor="#EA580C" stopOpacity="0.22" />
          <stop offset="100%" stopColor="#EA580C" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="f3-cliff-lit" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#EBB58D" />
          <stop offset="48%" stopColor="#AC5E40" />
          <stop offset="100%" stopColor="#522B22" />
        </linearGradient>
        <linearGradient id="f3-cliff-dark" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#9A5339" />
          <stop offset="55%" stopColor="#633226" />
          <stop offset="100%" stopColor="#321B1A" />
        </linearGradient>
        <linearGradient id="f3-lake" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#274B6A" />
          <stop offset="55%" stopColor="#183147" />
          <stop offset="100%" stopColor="#112130" />
        </linearGradient>
      </defs>

      <rect width="1200" height="960" fill="url(#f3-sky)" />
      <rect width="1200" height="620" fill="url(#f3-sunset)" />

      {/* Drifting dusk clouds & lake breeze */}
      <g className="floor-ambient-drift" fill="#FED7AA" opacity="0.22">
        <ellipse cx="260" cy="108" rx="112" ry="18" />
        <ellipse cx="324" cy="100" rx="74" ry="18" />
        <ellipse cx="890" cy="132" rx="96" ry="16" />
      </g>
      <g fill="none" stroke="#FED7AA" strokeLinecap="round">
        <path className="floor-wind" d="M20,76 Q280,48 560,76 T1060,62" strokeWidth="1.5" strokeOpacity="0.28" />
        <path className="floor-wind-2" d="M80,378 Q360,348 660,378 T1140,358" strokeWidth="1.4" strokeOpacity="0.24" />
      </g>

      {/* Lakeside gull flock gliding across the open sunset sky */}
      <g className="floor-bird-flock">
        <Bird x={0} y={64} scale={0.88} color="#FED7AA" opacity={0.86} />
        <Bird x={-26} y={52} scale={0.72} color="#FDBA8C" opacity={0.76} alt />
        <Bird x={-50} y={72} scale={0.64} color="#FDBA8C" opacity={0.68} />
        <Bird x={-72} y={60} scale={0.56} color="#F59E6C" opacity={0.58} alt />
      </g>

      {/* Topographic 3D-contour lines (nod to 3rd-floor DME 3D printing + bluffs geology) */}
      <g fill="none" stroke="#FED7AA" strokeOpacity="0.20" strokeWidth="1.2">
        <path d="M0,368 Q310,322 640,368 T1200,344" />
        <path d="M0,406 Q340,362 660,404 T1200,382" />
      </g>

      {/* Swaying Cliff-Top Evergreen Pines perched along the Scarborough Bluffs crest */}
      <PineTree x={718} baseY={694} height={58} width={30} fill="#2A3E32" sway="a" />
      <PineTree x={852} baseY={628} height={66} width={32} fill="#25382D" sway="b" />
      <PineTree x={884} baseY={638} height={50} width={26} fill="#2A3E32" sway="a" />
      <PineTree x={1004} baseY={586} height={72} width={34} fill="#23342A" sway="b" />
      <PineTree x={1156} baseY={562} height={76} width={36} fill="#203027" sway="a" />

      {/* Single Monumental Stratified Scarborough Bluffs Formation */}
      <path
        d="M490,848 L576,766 L648,782 L718,690 L786,708 L854,624 L928,644 L1004,582 L1088,602 L1158,558 L1200,576 L1200,852 L490,852 Z"
        fill="url(#f3-cliff-lit)"
        opacity="0.90"
      />
      {/* Sunlit limestone cap rim highlight */}
      <path
        d="M490,848 L576,766 L648,782 L718,690 L786,708 L854,624 L928,644 L1004,582 L1088,602 L1158,558 L1200,576"
        fill="none"
        stroke="#FFE3C6"
        strokeWidth="2.5"
        strokeOpacity="0.58"
      />
      <path
        d="M554,852 L628,788 L698,802 L768,722 L840,740 L918,672 L996,692 L1076,640 L1156,660 L1200,632 L1200,852 Z"
        fill="url(#f3-cliff-dark)"
        opacity="0.92"
      />
      {/* Vertical limestone erosion gullies */}
      <g stroke="#FED7AA" strokeOpacity="0.40" strokeWidth="1.8">
        <line x1="718" y1="690" x2="710" y2="834" />
        <line x1="786" y1="708" x2="780" y2="836" strokeOpacity="0.26" />
        <line x1="854" y1="624" x2="844" y2="838" />
        <line x1="928" y1="644" x2="922" y2="840" strokeOpacity="0.26" />
        <line x1="1004" y1="582" x2="994" y2="842" />
        <line x1="1158" y1="558" x2="1146" y2="844" />
      </g>
      {/* Horizontal geological sedimentary strata accents */}
      <g stroke="#FDBA8C" strokeOpacity="0.34" strokeWidth="1.5" strokeDasharray="10 6" fill="none">
        <path d="M628,784 L1200,692" />
        <path d="M704,740 L1200,640" />
        <path d="M786,696 L1200,606" strokeOpacity="0.24" />
      </g>

      {/* Left cliff flank */}
      <path d="M0,764 L164,718 L312,786 L460,842 L0,852 Z" fill="#542E25" opacity="0.82" />

      {/* Animated Shimmering Lake Ontario Water along the base */}
      <rect x="0" y="836" width="1200" height="124" fill="url(#f3-lake)" />
      <g className="floor-wave-2">
        <path d="M-40,836 Q260,829 580,838 T1240,834" fill="none" stroke="#F59E6C" strokeWidth="2.4" strokeOpacity="0.56" />
      </g>
      <g fill="#FED7AA">
        <rect className="floor-water-glint" x="628" y="862" width="172" height="3.5" rx="1.75" />
        <rect className="floor-water-glint-2" x="712" y="882" width="124" height="3" rx="1.5" />
        <rect className="floor-water-glint" x="880" y="868" width="188" height="3.5" rx="1.75" />
        <rect className="floor-water-glint-2" x="940" y="892" width="136" height="3" rx="1.5" />
        <rect className="floor-water-glint" x="772" y="914" width="144" height="3" rx="1.5" />
      </g>
    </svg>
  );
}

/** Floor 2 — The Bridge: Unified dusk skybridge vista — sweeping parabolic steel arch, suspension cables, glass reflections, illuminated truss deck & gliding street traffic lights. */
function BridgeScene() {
  return (
    <svg viewBox="0 0 1200 960" preserveAspectRatio="xMidYMid slice" style={SCENE_SVG} aria-hidden="true">
      <defs>
        <linearGradient id="f2-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#0B1626" />
          <stop offset="40%" stopColor="#1B3457" />
          <stop offset="76%" stopColor="#2A4D76" />
          <stop offset="100%" stopColor="#0D192B" />
        </linearGradient>
        <radialGradient id="f2-lamp" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#FEF08A" stopOpacity="0.95" />
          <stop offset="38%" stopColor="#F59E0B" stopOpacity="0.45" />
          <stop offset="100%" stopColor="#F59E0B" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="f2-lamp-cone" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#FEF08A" stopOpacity="0.30" />
          <stop offset="100%" stopColor="#F59E0B" stopOpacity="0" />
        </linearGradient>
        <linearGradient id="f2-glass" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#BAE6FD" stopOpacity="0.18" />
          <stop offset="50%" stopColor="#60A5FA" stopOpacity="0.04" />
          <stop offset="100%" stopColor="#BAE6FD" stopOpacity="0.16" />
        </linearGradient>
      </defs>

      <rect width="1200" height="960" fill="url(#f2-sky)" />

      {/* Subtle drifting twilight clouds & city breeze */}
      <g className="floor-ambient-drift" fill="#93C5FD" opacity="0.14">
        <ellipse cx="320" cy="104" rx="126" ry="20" />
        <ellipse cx="880" cy="128" rx="110" ry="18" />
      </g>
      <path className="floor-wind" d="M40,378 Q340,356 640,380 T1120,366" fill="none" stroke="#BAE6FD" strokeWidth="1.5" strokeOpacity="0.22" strokeLinecap="round" />

      {/* Architectural glass-curtain diagonal sheen */}
      <polygon points="0,0 440,0 240,960 0,960" fill="url(#f2-glass)" />
      <polygon points="780,0 1200,0 1200,960 580,960" fill="url(#f2-glass)" opacity="0.72" />

      {/* Single Sweeping Pedestrian Bridge Parabolic Steel Arch */}
      <path d="M-40,718 Q600,148 1240,718" fill="none" stroke="#BFDBFE" strokeWidth="6" strokeOpacity="0.50" />
      <path d="M-40,738 Q600,178 1240,738" fill="none" stroke="#60A5FA" strokeWidth="2.4" strokeOpacity="0.36" />

      {/* Left & Right Cross-Braced Architectural Steel Pylons */}
      <g stroke="#93C5FD" strokeOpacity="0.44" strokeWidth="3.2">
        <line x1="210" y1="120" x2="210" y2="780" />
        <line x1="228" y1="120" x2="228" y2="780" strokeWidth="1.6" />
        <line x1="990" y1="120" x2="990" y2="780" />
        <line x1="972" y1="120" x2="972" y2="780" strokeWidth="1.6" />
        <line x1="210" y1="180" x2="228" y2="180" strokeWidth="2" />
        <line x1="210" y1="280" x2="228" y2="280" strokeWidth="2" />
        <line x1="972" y1="180" x2="990" y2="180" strokeWidth="2" />
        <line x1="972" y1="280" x2="990" y2="280" strokeWidth="2" />
        <line x1="972" y1="640" x2="990" y2="640" strokeWidth="2" />
      </g>

      {/* Converging Cable-Stay Suspension Lines */}
      <g stroke="#BAE6FD" strokeOpacity="0.30" strokeWidth="1.4">
        <line x1="210" y1="164" x2="20" y2="710" />
        <line x1="210" y1="164" x2="100" y2="710" />
        <line x1="210" y1="164" x2="320" y2="710" />
        <line x1="210" y1="164" x2="430" y2="710" />
        <line x1="210" y1="164" x2="540" y2="710" />

        <line x1="990" y1="164" x2="660" y2="710" />
        <line x1="990" y1="164" x2="770" y2="710" />
        <line x1="990" y1="164" x2="880" y2="710" />
        <line x1="990" y1="164" x2="1100" y2="710" />
        <line x1="990" y1="164" x2="1180" y2="710" />
      </g>

      {/* Single Illuminated Skybridge Pedestrian Deck + Steel Truss Lattice */}
      <rect x="0" y="698" width="1200" height="14" fill="#93C5FD" opacity="0.16" />
      <rect x="0" y="712" width="1200" height="58" fill="#132744" opacity="0.92" />
      <line x1="0" y1="698" x2="1200" y2="698" stroke="#BAE6FD" strokeWidth="1.5" strokeOpacity="0.48" />
      <line x1="0" y1="712" x2="1200" y2="712" stroke="#93C5FD" strokeWidth="2.6" strokeOpacity="0.65" />
      <line x1="0" y1="770" x2="1200" y2="770" stroke="#60A5FA" strokeWidth="2.2" strokeOpacity="0.48" />
      <path
        d="M0,770 L60,712 L120,770 L180,712 L240,770 L300,712 L360,770 L420,712 L480,770 L540,712 L600,770 L660,712 L720,770 L780,712 L840,770 L900,712 L960,770 L1020,712 L1080,770 L1140,712 L1200,770"
        fill="none"
        stroke="#93C5FD"
        strokeWidth="1.6"
        strokeOpacity="0.42"
      />

      {/* Warm Breathing Illuminated Bridge Walkway Lamps + Light Cones */}
      {[120, 280, 440, 600, 740, 880, 1020, 1140].map((lx) => (
        <g key={lx}>
          <polygon points={`${lx},704 ${lx - 30},770 ${lx + 30},770`} fill="url(#f2-lamp-cone)" />
          <circle className="floor-lamp-glow" cx={lx} cy={704} r="32" fill="url(#f2-lamp)" />
          <circle cx={lx} cy={704} r="4.5" fill="#FEF08A" />
        </g>
      ))}

      {/* Gliding Urban Dusk Street Light Streaks & Bokeh Below the Bridge */}
      <g className="floor-traffic">
        <rect x="0" y="846" width="84" height="4.5" rx="2.25" fill="#FDE68A" opacity="0.78" />
        <circle cx="84" cy="848" r="11" fill="#FBBF24" opacity="0.38" />
      </g>
      <g className="floor-traffic-2">
        <rect x="0" y="886" width="72" height="4" rx="2" fill="#93C5FD" opacity="0.68" />
        <circle cx="72" cy="888" r="10" fill="#60A5FA" opacity="0.34" />
      </g>
      <g className="floor-ambient-twinkle" opacity="0.40">
        <circle cx="640" cy="858" r="15" fill="#F59E0B" />
        <circle cx="812" cy="892" r="12" fill="#93C5FD" />
        <circle cx="964" cy="846" r="14" fill="#FBBF24" />
        <circle cx="1096" cy="884" r="12" fill="#93C5FD" />
      </g>
    </svg>
  );
}

/** Floor 1 — The Valley: Unified rolling emerald hills, swaying trees, sparkling brook & warm café lantern glow. */
function ValleyScene() {
  return (
    <svg viewBox="0 0 1200 960" preserveAspectRatio="xMidYMid slice" style={SCENE_SVG} aria-hidden="true">
      <defs>
        <linearGradient id="f1-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#0E2016" />
          <stop offset="44%" stopColor="#1F4A31" />
          <stop offset="78%" stopColor="#3B693A" />
          <stop offset="100%" stopColor="#12281B" />
        </linearGradient>
        <radialGradient id="f1-pass-glow" cx="50%" cy="28%" r="46%">
          <stop offset="0%" stopColor="#D9F99D" stopOpacity="0.46" />
          <stop offset="52%" stopColor="#84CC16" stopOpacity="0.16" />
          <stop offset="100%" stopColor="#84CC16" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="f1-stream" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#BEF264" stopOpacity="0.62" />
          <stop offset="100%" stopColor="#38BDF8" stopOpacity="0.30" />
        </linearGradient>
      </defs>

      <rect width="1200" height="960" fill="url(#f1-sky)" />
      <rect width="1200" height="680" fill="url(#f1-pass-glow)" />

      <path className="floor-wind" d="M80,96 Q340,72 620,98 T1080,80" fill="none" stroke="#D9F99D" strokeWidth="1.5" strokeOpacity="0.24" strokeLinecap="round" />
      <g className="floor-bird-flock">
        <Bird x={0} y={66} scale={0.76} color="#D9F99D" opacity={0.74} />
        <Bird x={-26} y={78} scale={0.62} color="#BEF264" opacity={0.62} alt />
      </g>

      <path d="M0,450 Q270,502 560,648 L0,760 Z" fill="#234F33" opacity="0.76" />
      <path d="M1200,440 Q920,496 640,648 L1200,760 Z" fill="#234F33" opacity="0.76" />

      <PineTree x={920} baseY={840} height={190} width={88} fill="#163824" highlight="#A3E635" sway="a" />
      <PineTree x={1072} baseY={810} height={230} width={104} fill="#112E1D" highlight="#84CC16" sway="b" />

      <path d="M0,632 Q290,688 552,842 L0,960 Z" fill="#183A26" opacity="0.90" />
      <path d="M1200,624 Q910,682 648,842 L1200,960 Z" fill="#183A26" opacity="0.90" />

      {/* Winding Luminous Valley Brook with Animated Water Glints */}
      <path
        d="M600,616 Q568,690 618,762 T580,960 L662,960 Q636,836 604,756 T614,616 Z"
        fill="url(#f1-stream)"
      />
      <g fill="#ECFCCB">
        <rect className="floor-water-glint" x="576" y="742" width="42" height="3" rx="1.5" />
        <rect className="floor-water-glint-2" x="574" y="814" width="52" height="3.5" rx="1.75" />
        <rect className="floor-water-glint" x="582" y="892" width="60" height="3.5" rx="1.75" />
      </g>

      <circle className="floor-lamp-glow" cx="790" cy="842" r="22" fill="#FDE047" opacity="0.36" />
      <circle cx="790" cy="842" r="4.5" fill="#FEF08A" />
      <circle className="floor-firefly" cx="728" cy="744" r="3.2" fill="#D9F99D" />
      <circle className="floor-firefly-2" cx="984" cy="730" r="2.8" fill="#FDE68A" />
    </svg>
  );
}

const SCENES: Record<number, () => ReactNode> = {
  1: ValleyScene,
  2: BridgeScene,
  3: BluffsScene,
  4: GardenScene,
  5: SunScene,
  6: BeachScene,
  7: ForestScene,
  8: SkyScene,
};

/**
 * Full-bleed cross-fading animated artistic landscape backdrop for the themed
 * floor insights & floor-plan card below the live floor list.
 */
export function FloorBackdrop({ activeFloor }: { activeFloor: number }) {
  const current = FLOOR_THEMES[activeFloor] ? activeFloor : 7;
  return (
    <div className="floor-backdrop" aria-hidden="true" style={LAYER_BASE}>
      {ALL_FLOOR_THEME_NUMBERS.map((n) => {
        const Scene = SCENES[n];
        const on = n === current;
        return (
          <div
            key={n}
            className="floor-backdrop-layer"
            data-active={on ? 'true' : 'false'}
            style={{
              ...LAYER_BASE,
              background: FLOOR_THEMES[n].sectionBg,
              opacity: on ? 1 : 0,
              transition: 'opacity 0.55s cubic-bezier(0.22, 1, 0.36, 1)',
            }}
          >
            <Scene />
          </div>
        );
      })}
    </div>
  );
}
