import { useMemo } from 'react';
import { qrPath } from '../../lib/qr';

/** Crisp, scalable QR code drawn as one SVG path. */
export function QRCode({ text, className = 'qr-svg' }) {
  const { size, path } = useMemo(() => qrPath(text), [text]);
  return (
    <svg
      className={className}
      viewBox={`0 0 ${size} ${size}`}
      shapeRendering="crispEdges"
      role="img"
      aria-label={`QR code for ${text}`}
    >
      <rect width={size} height={size} fill="#fff" />
      <path d={path} fill="#141414" />
    </svg>
  );
}
