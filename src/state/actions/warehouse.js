// Warehouse state changes. Each function receives an Immer draft `d` and mutates it.
// They assume the form has already validated the input (see the modals).
// Return values must be plain values (ids, numbers), never draft objects.
import { VARIANT_COLORS, LETTERS } from '../../lib/constants';
import { boxIdFor, dateLabel, stamp } from '../../lib/format';
import { boxName, nextVariantLetter } from '../selectors';

const box = (d, id) => d.boxes.find((b) => b.id === id);
const todayMovement = (d) => d.move[d.move.length - 1]; // [label, received, out]
const log = (b, who, what, ch) => b.history.unshift({ t: stamp(), who, what, ch });

export function takeOut(d, { boxId, qty, purpose, who }) {
  const b = box(d, boxId);
  b.qty -= qty;
  log(b, who, `Gave out for ${purpose}`, -qty);
  todayMovement(d)[2] += qty;
}

/** To another location (lowers this box) or, for a whole box, to another warehouse shelf. */
export function transfer(d, { boxId, qty, dest, who }) {
  const b = box(d, boxId);
  if (dest.startsWith('Warehouse')) {
    const old = b.shelf;
    b.shelf = dest.split(' ').pop();
    log(b, who, `Moved from shelf ${old} to ${b.shelf}`, null);
  } else {
    b.qty -= qty;
    log(b, who, `Transferred to ${dest}`, -qty);
  }
}

export function recordCount(d, { boxId, counted, reason, who }) {
  const b = box(d, boxId);
  const expected = b.qty;
  const diff = counted - expected;
  log(
    b,
    who,
    diff === 0
      ? `Counted ${counted}, matches records`
      : `Counted ${counted}, expected ${expected}. Reason: ${reason.toLowerCase()}`,
    diff,
  );
  b.qty = counted;
  b.countFlag = diff === 0 ? null : { counted, expected, who, t: stamp() };
  if (counted > b.cap) b.cap = counted;
  return diff;
}

export function checkOut(d, { boxId, qty, event, due, responsible, who }) {
  const b = box(d, boxId);
  d.checkouts.push({
    id: `co${Date.now()}`,
    event,
    boxId,
    item: boxName(b),
    qty,
    returned: 0,
    lost: 0,
    who: responsible,
    date: 'Today',
    due,
  });
  b.qty -= qty;
  log(b, who, `Checked out ${qty} to ${event} (${responsible})`, -qty);
  todayMovement(d)[2] += qty;
}

/** Returns { rest, writtenOff, cap } so the caller can word the confirmation. */
export function returnFromEvent(d, { boxId, checkoutId, qty, writeOffRest, who }) {
  const b = box(d, boxId);
  const c = d.checkouts.find((x) => x.id === checkoutId);
  const rest = c.qty - c.returned - c.lost - qty;
  const writtenOff = writeOffRest && rest > 0;
  c.returned += qty;
  b.qty += qty;
  let what = `Returned ${qty} from ${c.event}`;
  if (writtenOff) {
    c.lost += rest;
    b.cap -= rest;
    what += `, ${rest} recorded lost or damaged`;
  } else if (rest) {
    what += `, ${rest} still out`;
  }
  log(b, who, what, qty);
  return { rest, writtenOff, cap: b.cap };
}

/** Deletes a box record. Returns the id of the box to show next. */
export function removeBox(d, { boxId }) {
  d.boxes = d.boxes.filter((b) => b.id !== boxId);
  return d.boxes[0]?.id ?? null;
}

/** Puts loose stock into a new labelled box. Returns the new box id. */
export function boxLooseStock(d, { boxId, shelf, who }) {
  const b = box(d, boxId);
  const id = boxIdFor(d.nextBox++);
  d.checkouts.forEach((c) => {
    if (c.boxId === boxId) c.boxId = id;
  });
  Object.assign(b, { id, loose: false, shelf, rec: b.qty, received: dateLabel() });
  if (b.kind !== 'Reusable') b.cap = b.qty || b.cap;
  log(b, who, 'Boxed from loose stock, label printed', null);
  return id;
}

/**
 * Receives `count` boxes of `perBox` units. Creates the item and/or variant first when asked.
 * newItem: { kind } | null. newVariant: { name, reorder } | null. Returns { ids, item, v }.
 */
export function receiveBoxes(d, { item, variant, newItem, newVariant, count, perBox, shelf, who }) {
  if (newItem) d.catalog[item] = { kind: newItem.kind, icon: 'box', variants: {} };
  const c = d.catalog[item];
  let v = variant;
  if (newVariant) {
    v = nextVariantLetter(d, item);
    c.variants[v] = {
      name: newVariant.name,
      color: VARIANT_COLORS[Object.keys(c.variants).length % VARIANT_COLORS.length],
      ...(newVariant.reorder >= 0 && c.kind !== 'Reusable' ? { reorder: newVariant.reorder } : {}),
    };
  }
  const ids = [];
  for (let i = 0; i < count; i++) {
    const id = boxIdFor(d.nextBox++);
    const b = { id, item, v, kind: c.kind, qty: perBox, cap: perBox, rec: perBox, shelf, received: dateLabel(), history: [] };
    log(b, who, 'Received, label printed', perBox);
    d.boxes.push(b);
    ids.push(id);
  }
  todayMovement(d)[1] += count * perBox;
  return { ids, item, v };
}

/** Adds an empty variant. Returns its letter. */
export function addVariant(d, { item, name, color, reorder }) {
  const v = nextVariantLetter(d, item);
  d.catalog[item].variants[v] = { name, color, ...(reorder >= 0 ? { reorder } : {}) };
  return v;
}

/** points: { A: 20, B: null } where null clears the reorder point. */
export function setReorderPoints(d, { item, points }) {
  const variants = d.catalog[item].variants;
  for (const [v, n] of Object.entries(points)) {
    if (n === null) delete variants[v].reorder;
    else variants[v].reorder = n;
  }
}

/** img is a data URL, or null to go back to the drawing. */
export function setItemPhoto(d, { item, img }) {
  if (!d.catalog[item]) return;
  if (img) d.catalog[item].img = img;
  else delete d.catalog[item].img;
}

export function addItem(d, { name, kind, variants, reorder }) {
  d.catalog[name] = {
    kind,
    icon: 'box',
    variants: Object.fromEntries(
      variants.map((vName, i) => [
        LETTERS[i],
        {
          name: vName,
          color: VARIANT_COLORS[i % VARIANT_COLORS.length],
          ...(kind === 'Giveaway' && reorder >= 0 ? { reorder } : {}),
        },
      ]),
    ),
  };
}
