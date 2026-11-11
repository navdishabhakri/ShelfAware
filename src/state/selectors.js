// Derived values. Every function takes the app state `S` first and never changes it.
import { LETTERS } from '../lib/constants';

/* ---------- Catalog and boxes ---------- */

const NO_VARIANT = { name: '', color: '#ccc' };

export const catalogItem = (S, item) => S.catalog[item];
export const variantOf = (S, item, v) => S.catalog[item]?.variants[v] || NO_VARIANT;
export const itemNames = (S) => Object.keys(S.catalog).sort();

/** "Tote bags A" */
export const boxName = (b) => `${b.item} ${b.v}`;
/** "Natural canvas" */
export const variantName = (S, b) => variantOf(S, b.item, b.v).name;

export const boxById = (S, id) => S.boxes.find((b) => b.id === id);
export const itemBoxes = (S, item) => S.boxes.filter((b) => b.item === item);
export const variantBoxes = (S, item, v) => S.boxes.filter((b) => b.item === item && b.v === v);

const sumQty = (boxes) => boxes.reduce((a, b) => a + b.qty, 0);
const sumCap = (boxes) => boxes.reduce((a, b) => a + b.cap, 0);
export const variantQty = (S, item, v) => sumQty(variantBoxes(S, item, v));
export const variantCap = (S, item, v) => sumCap(variantBoxes(S, item, v));
export const itemQty = (S, item) => sumQty(itemBoxes(S, item));
export const itemCap = (S, item) => sumCap(itemBoxes(S, item));
export const itemReorder = (S, item) =>
  Object.values(S.catalog[item]?.variants || {}).reduce((a, v) => a + (v.reorder || 0), 0);

/** Next free variant letter for an item. */
export const nextVariantLetter = (S, item) => {
  const used = Object.keys(S.catalog[item]?.variants || {});
  return LETTERS.find((l) => !used.includes(l));
};

/* ---------- Stock status ---------- */

/** 'reorder' at or below the reorder point, 'low' up to 1.5×, otherwise 'ok'. No point means no status. */
export const stockLevel = (qty, reorderPoint) =>
  !reorderPoint ? '' : qty <= reorderPoint ? 'reorder' : qty <= reorderPoint * 1.5 ? 'low' : 'ok';

export const variantState = (S, item, v) => stockLevel(variantQty(S, item, v), variantOf(S, item, v).reorder);

/** The worst variant decides, so one empty variant is never hidden by a full one. */
export const itemState = (S, item) => {
  const states = Object.keys(S.catalog[item]?.variants || {})
    .map((v) => variantState(S, item, v))
    .filter(Boolean);
  if (states.includes('reorder')) return 'reorder';
  if (states.includes('low')) return 'low';
  if (states.length) return 'ok';
  return stockLevel(itemQty(S, item), itemReorder(S, item));
};

/** ["Tote bags C", "Pens B", ...] for every variant at or below its reorder point. */
export const reorderVariants = (S) =>
  Object.entries(S.catalog).flatMap(([item, c]) =>
    Object.keys(c.variants)
      .filter((v) => variantState(S, item, v) === 'reorder')
      .map((v) => `${item} ${v}`),
  );

/** Variants with a reorder point, closest to running out first. */
export const runningLow = (S, limit = 5) =>
  Object.entries(S.catalog)
    .flatMap(([item, c]) =>
      Object.entries(c.variants)
        .filter(([, d]) => d.reorder)
        .map(([v, d]) => ({
          name: `${item} ${v}`,
          qty: variantQty(S, item, v),
          reorder: d.reorder,
          state: variantState(S, item, v),
        })),
    )
    .sort((a, b) => a.qty / a.reorder - b.qty / b.reorder)
    .slice(0, limit);

/** Text the warehouse search matches against: item, variant names and box ids. */
export const itemSearchText = (S, item) =>
  [
    item,
    ...Object.entries(S.catalog[item].variants).map(([k, v]) => `${item} ${k} ${v.name}`),
    ...itemBoxes(S, item).map((b) => b.id),
  ]
    .join(' ')
    .toLowerCase();

export function filterItems(S, query, filter) {
  const q = query.trim().toLowerCase();
  return itemNames(S).filter((item) => {
    const c = S.catalog[item];
    if (q && !itemSearchText(S, item).includes(q)) return false;
    if (filter === 'reusable') return c.kind === 'Reusable';
    if (filter === 'reorder') return itemState(S, item) === 'reorder';
    if (filter === 'low') return itemState(S, item) === 'low';
    if (filter === 'ok') return c.kind === 'Reusable' || itemState(S, item) === 'ok';
    return true;
  });
}

/* ---------- Event checkouts ---------- */

export const outstanding = (c) => c.qty - c.returned - c.lost;
export const openCheckouts = (S, boxId) =>
  S.checkouts.filter((c) => (!boxId || c.boxId === boxId) && outstanding(c) > 0);
export const unitsOut = (checkouts) => checkouts.reduce((a, c) => a + outstanding(c), 0);
export const itemUnitsOut = (S, item) =>
  unitsOut(openCheckouts(S).filter((c) => boxById(S, c.boxId)?.item === item));

/* ---------- Warehouse alerts ---------- */

/**
 * The alerts row. Each flag either opens a box (`box`) or applies a filter (`filter`).
 * kind: 'count' | 'reorder' | 'event'
 */
export function warehouseFlags(S) {
  const flags = [];
  S.boxes
    .filter((b) => b.countFlag)
    .forEach((b) => flags.push({ kind: 'count', crit: true, box: b.id, countFlag: b.countFlag }));
  const ro = reorderVariants(S);
  if (ro.length) flags.push({ kind: 'reorder', crit: true, filter: 'reorder', names: ro });
  S.checkouts
    .filter((c) => outstanding(c) > 0 && (c.returned > 0 || c.lost > 0))
    .forEach((c) => flags.push({ kind: 'event', box: c.boxId, checkout: c }));
  return flags;
}

/** Status of one row in the box list. Returns a chip { tone, label } or null. */
export function boxChip(S, b) {
  const st = variantState(S, b.item, b.v);
  const out = unitsOut(openCheckouts(S, b.id));
  if (b.countFlag) return { tone: 'crit', label: 'Count off' };
  if (st === 'reorder') return { tone: 'crit', label: 'Reorder' };
  if (out) return { tone: 'info', label: `${out} out` };
  if (st === 'low') return { tone: 'warn', label: 'Low' };
  if (b.qty === 0) return { tone: 'warn', label: 'Empty' };
  return null;
}

/** Box from a scanned or typed code: "SSF-BOX-007", "BOX-007", "box-7" or just "7". */
export function findBoxByCode(S, text) {
  const t = text.trim().toUpperCase().replace(/^SSF-/, '');
  const m = t.match(/(\d{1,3})$/);
  return S.boxes.find((b) => !b.loose && (b.id === t || (m && b.id === `BOX-${m[1].padStart(3, '0')}`)));
}

/* ---------- Gaming room ---------- */

export const equipmentById = (S, id) => S.equipment.find((e) => e.id === id);
export const openFindings = (S) => S.findings.filter((f) => !f.closed);
export const closedFindings = (S) => S.findings.filter((f) => f.closed);
export const firstUnchecked = (S) => S.equipment.find((e) => e.status === 'unchecked');
export const openFindingFor = (S, equipId, kind) =>
  S.findings.find((f) => !f.closed && f.equip === equipId && f.kind === kind);

export function auditSummary(S) {
  const E = S.equipment;
  const count = (test) => E.filter(test).length;
  const checked = count((e) => e.status !== 'unchecked');
  return {
    total: E.length,
    checked,
    todo: E.length - checked,
    good: count((e) => e.status === 'present' && e.cond === 'good'),
    damaged: count((e) => e.status === 'present' && e.cond === 'damaged'),
    missing: count((e) => e.status === 'missing'),
    percent: E.length ? Math.round((checked / E.length) * 100) : 100,
  };
}

export function filterEquipment(S, query, filter) {
  const q = query.trim().toLowerCase();
  return S.equipment.filter(
    (e) =>
      (!q || `${e.id} ${e.name} ${e.type}`.toLowerCase().includes(q)) &&
      (filter === 'all' ||
        (filter === 'todo' && e.status === 'unchecked') ||
        (filter === 'issues' && (e.status === 'missing' || e.cond === 'damaged'))),
  );
}

/* ---------- Snack stand ---------- */

export const shelfNeedingAttention = (S) => S.shelf.filter((s) => s.status !== 'match');

/* ---------- Sidebar badges ---------- */

export const locationBadges = (S) => ({
  wh: warehouseFlags(S).length,
  gr: openFindings(S).length,
  ss: shelfNeedingAttention(S).length,
});
