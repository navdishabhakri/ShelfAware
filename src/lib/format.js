// Small formatting helpers shared across the app. All output is plain text;
// React escapes it when rendering, so there is no need for an esc() helper.

export const MINUS = '−';

/** "+3", "−2" or "0". Uses a real minus sign so numbers line up. */
export const signed = (n) => (n > 0 ? `+${n}` : n < 0 ? MINUS + Math.abs(n) : '0');

/** Current time as "09:05". */
export const hhmm = () => new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });

/** History timestamp for something that happened just now, "Today 09:05". */
export const stamp = () => `Today ${hhmm()}`;

/** Today's date as "11 Nov 2026" (printed on box labels). */
export const dateLabel = () =>
  new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });

/** "2026-11-13" from a date input, as "13 Nov". */
export const shortDate = (iso) =>
  new Date(`${iso}T12:00`).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });

export const plural = (n, word, many = `${word}s`) => `${n} ${n === 1 ? word : many}`;

/** ["a", "b", "c"] as "a, b and c". */
export const andList = (a) => (a.length > 1 ? `${a.slice(0, -1).join(', ')} and ${a[a.length - 1]}` : a[0]);

export const money = (n) => `$${n.toFixed(2)}`;

export const round2 = (n) => Math.round(n * 100) / 100;

/** 7 as "BOX-007". */
export const boxIdFor = (n) => `BOX-${String(n).padStart(3, '0')}`;

/** Whole number from a form field, or NaN when it is blank or not a whole number. */
export const parseWhole = (s) => {
  const v = String(s ?? '').trim();
  return /^\d+$/.test(v) ? parseInt(v, 10) : NaN;
};
