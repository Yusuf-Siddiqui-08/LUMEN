import QRCode from 'qrcode';
import { useMemo } from 'react';

/** A real, scannable QR code drawn as one SVG path (quiet zone of 1 module, like the prototype). */
export function QrCode({ text, size, color = '#0A2150' }: { text: string; size: number; color?: string }) {
  const { path, n } = useMemo(() => {
    const qr = QRCode.create(text, { errorCorrectionLevel: 'M' });
    const count = qr.modules.size;
    let d = '';
    for (let r = 0; r < count; r++) {
      let c = 0;
      while (c < count) {
        if (qr.modules.get(r, c)) {
          let run = 1;
          while (c + run < count && qr.modules.get(r, c + run)) run++;
          d += `M${c} ${r}h${run}v1h-${run}z`;
          c += run;
        } else {
          c++;
        }
      }
    }
    return { path: d, n: count };
  }, [text]);
  return (
    <svg width={size} height={size} viewBox={`-1 -1 ${n + 2} ${n + 2}`} aria-hidden="true" style={{ display: 'block', shapeRendering: 'crispEdges' }}>
      <path fill={color} d={path} />
    </svg>
  );
}
