// Gaming room state changes (Immer drafts). See warehouse.js for the conventions.
import { hhmm, stamp } from '../../lib/format';
import { firstUnchecked, openFindingFor } from '../selectors';

const equipment = (d, id) => d.equipment.find((e) => e.id === id);

/**
 * Saves one audit check. Opens a finding for a new "not found" or "damaged",
 * and closes an open "not found" when the item turns up.
 * Returns the id of the next unchecked item, or null when the audit is done.
 */
export function recordCheck(d, { equipId, status, cond, note, who }) {
  const e = equipment(d, equipId);
  const openFinding = (kind) => openFindingFor(d, equipId, kind);
  const newFinding = (kind, suffix = '') =>
    d.findings.push({
      id: `f${Date.now()}${suffix}`,
      equip: equipId,
      kind,
      opened: 'Today',
      who,
      notes: [{ t: stamp(), who, text: note }],
      closed: null,
    });

  e.status = status;
  e.cond = cond;
  e.checked = hhmm();
  e.by = who;

  if (status === 'missing' && !openFinding('missing')) newFinding('missing');
  if (cond === 'damaged' && !openFinding('damaged')) newFinding('damaged', 'd');

  const missing = status === 'present' && openFinding('missing');
  if (missing) {
    missing.notes.push({ t: stamp(), who, text: `Found during audit.${note ? ` ${note}` : ''}` });
    missing.closed = `found ${stamp().toLowerCase()} by ${who}`;
  }
  return firstUnchecked(d)?.id ?? null;
}

export const OUTCOME_LABELS = { found: 'Found', repaired: 'Repaired', replaced: 'Replaced', writeoff: 'Written off' };

/** outcome: 'open' | 'found' | 'repaired' | 'replaced' | 'writeoff' */
export function followUpFinding(d, { findingId, note, outcome, who }) {
  const f = d.findings.find((x) => x.id === findingId);
  const e = equipment(d, f.equip);
  const label = OUTCOME_LABELS[outcome];
  f.notes.push({ t: stamp(), who, text: (label ? `${label}. ` : '') + (note || '') });
  if (outcome === 'open') return;

  f.closed = `${label.toLowerCase()} ${stamp().toLowerCase()} by ${who}`;
  if (e && (outcome === 'found' || outcome === 'replaced' || outcome === 'repaired')) {
    if (outcome !== 'repaired') e.status = 'present';
    e.cond = 'good';
    e.checked = hhmm();
    e.by = who;
  }
  if (e && outcome === 'writeoff') d.equipment = d.equipment.filter((x) => x.id !== e.id);
}

export function addEquipment(d, { id, name, type }) {
  d.equipment.push({ id, name, type, status: 'unchecked', cond: '', checked: '', by: '' });
}
