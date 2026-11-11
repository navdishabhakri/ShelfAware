import qrcode from 'qrcode-generator';

/**
 * Builds the QR code for `text` as a single SVG path (one 1×1 square per dark module)
 * with a one-module quiet zone. Returns { size, path } for use in an <svg viewBox>.
 */
export function qrPath(text) {
  const q = qrcode(0, 'M');
  q.addData(text);
  q.make();
  const n = q.getModuleCount();
  let path = '';
  for (let y = 0; y < n; y++) {
    for (let x = 0; x < n; x++) {
      if (q.isDark(y, x)) path += `M${x + 1} ${y + 1}h1v1h-1z`;
    }
  }
  return { size: n + 2, path };
}

/** The text encoded on a box label. Scanning reverses this with findBoxByCode(). */
export const labelCode = (boxId) => `SSF-${boxId}`;
