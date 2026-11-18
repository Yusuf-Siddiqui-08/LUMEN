import { type ReactNode, useLayoutEffect, useState } from 'react';

/**
 * Renders a fixed-size kiosk design (for example 540 x 960) scaled to fit the window,
 * centred, with letterbox bars. Text stays crisp because the browser scales vectors.
 */
export function KioskFrame({
  width,
  height,
  letterbox = '#050F26',
  children,
}: {
  width: number;
  height: number;
  letterbox?: string;
  children: ReactNode;
}) {
  const [scale, setScale] = useState(1);
  useLayoutEffect(() => {
    const fit = () => setScale(Math.min(window.innerWidth / width, window.innerHeight / height));
    fit();
    window.addEventListener('resize', fit);
    return () => window.removeEventListener('resize', fit);
  }, [width, height]);
  return (
    <main
      style={{
        position: 'fixed',
        inset: 0,
        background: letterbox,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
      }}
    >
      <div style={{ width: width * scale, height: height * scale, position: 'relative', flex: 'none' }}>
        <div style={{ width, height, transform: `scale(${scale})`, transformOrigin: 'top left', position: 'absolute', left: 0, top: 0 }}>
          {children}
        </div>
      </div>
    </main>
  );
}
