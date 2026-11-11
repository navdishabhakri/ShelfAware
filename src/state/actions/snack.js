// Snack stand state changes (Immer drafts). See warehouse.js for the conventions.
import { hhmm, money, round2 } from '../../lib/format';
import { paymentTotal, todaySales } from '../sales';

const logReading = (d, text) => d.ssLog.unshift({ t: hhmm(), text });
const slot = (d, name) => d.shelf.find((s) => s.name === name);

// Count error is a running average, weighted towards recent readings.
const nudgeError = (d, err) => {
  d.trial.err = Math.round((d.trial.err * 0.9 + err * 0.1) * 10) / 10;
};

/** Staff agree with the shelf: records take the shelf count. */
export function confirmReading(d, { name, who }) {
  const s = slot(d, name);
  const was = s.rec;
  s.rec = s.obs;
  s.status = 'match';
  d.trial.reviewed++;
  d.trial.confirmed++;
  nudgeError(d, Math.abs(was - s.obs));
  logReading(d, `${s.name} corrected from ${was} to ${s.obs}. Confirmed by ${who}.`);
}

/** Staff say the shelf was wrong: counts as a false change. */
export function dismissReading(d, { name, who }) {
  const s = slot(d, name);
  s.obs = s.rec;
  s.status = 'match';
  d.trial.reviewed++;
  d.trial.dismissed++;
  d.trial.falseChanges++;
  logReading(d, `${s.name} reading dismissed by ${who}. Records stay at ${s.rec}.`);
}

export function handCount(d, { name, counted, who }) {
  const s = slot(d, name);
  const shelfErr = s.obs === null ? null : Math.abs(s.obs - counted);
  s.rec = counted;
  s.obs = counted;
  s.status = 'match';
  if (shelfErr !== null) nudgeError(d, shelfErr);
  logReading(d, `${s.name} counted by hand: ${counted}. Saved by ${who}.`);
}

/* ---------- Demo simulations ---------- */

const shuffle = (a) => [...a].sort(() => Math.random() - 0.5);

/**
 * A random Square payment. The sale lowers the recorded stock and, because the
 * shelf sees the same items leave, the shelf keeps matching.
 * Returns the sale total, or null when nothing is left to sell.
 */
export function simulateSale(d) {
  const inStock = d.shelf.filter((s) => s.rec > 0);
  if (!inStock.length) return null;
  const pick = shuffle(inStock).slice(0, Math.random() < 0.35 ? 2 : 1);
  const items = pick.map((s) => [s.name, Math.min(s.rec, Math.random() < 0.3 ? 2 : 1)]);
  const X = d.sales;
  const p = { t: hhmm(), items, method: ['Tap', 'Tap', 'Card', 'Cash'][Math.floor(Math.random() * 4)] };
  const total = paymentTotal(p);
  const units = items.reduce((a, [, q]) => a + q, 0);

  X.pays.unshift(p);
  X.lastSync = hhmm();
  const T = todaySales(X);
  T[1] = round2(T[1] + total);
  T[2]++;
  T[3] += units;
  const H = X.hours.find((h) => h[0] === X.nowHour);
  H[1]++;
  H[2] = round2(H[2] + total);

  items.forEach(([n, q]) => {
    X.sold[n] = (X.sold[n] || 0) + q;
    X.weekSold[n] = (X.weekSold[n] || 0) + q;
    const s = slot(d, n);
    s.rec -= q;
    if (s.status === 'match') s.obs = s.rec;
  });
  logReading(
    d,
    `Square sale, ${items.map(([n, q]) => `${q} ${n}`).join(' and ')} (${money(total)}). Records updated, shelf matches.`,
  );
  return total;
}

/**
 * A shelf reading with no matching sale (a drop to review), or a blocked view.
 * Returns the product name, or null when every slot already needs attention.
 */
export function simulateReading(d) {
  const ok = d.shelf.filter((s) => s.status === 'match' && s.rec > 0);
  if (!ok.length) return null;
  const s = ok[Math.floor(Math.random() * ok.length)];
  if (Math.random() < 0.25) {
    s.obs = null;
    s.status = 'blocked';
    logReading(d, `${s.name} view blocked by a hand or packaging.`);
  } else {
    const drop = Math.min(s.rec, 1 + Math.floor(Math.random() * 3));
    s.obs = s.rec - drop;
    s.status = 'review';
    logReading(d, `${s.name} dropped from ${s.rec} to ${s.obs} with no matching Square sale. Waiting for review.`);
  }
  return s.name;
}
