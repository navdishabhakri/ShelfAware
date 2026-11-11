import { produce } from 'immer';
import { describe, expect, it } from 'vitest';
import { seed } from '../../src/data/seed';
import * as gaming from '../../src/state/actions/gaming';
import * as snack from '../../src/state/actions/snack';
import * as wh from '../../src/state/actions/warehouse';
import { salesSummary } from '../../src/state/sales';
import {
  auditSummary,
  boxById,
  filterItems,
  findBoxByCode,
  itemState,
  openFindings,
  reorderVariants,
  stockLevel,
  variantQty,
  warehouseFlags,
} from '../../src/state/selectors';

/** Applies an action to fresh seed data and returns [nextState, actionResult]. */
const apply = (fn, S = seed()) => {
  let out;
  const next = produce(S, (d) => {
    out = fn(d);
  });
  return [next, out];
};

describe('stock status', () => {
  it('uses reorder, low (up to 1.5×) and ok bands', () => {
    expect(stockLevel(20, 20)).toBe('reorder');
    expect(stockLevel(30, 20)).toBe('low');
    expect(stockLevel(31, 20)).toBe('ok');
    expect(stockLevel(5, undefined)).toBe('');
  });

  it('lets the worst variant decide the item status', () => {
    const S = seed();
    // Tote bags C has 6 against a reorder point of 15, while A and B are healthy.
    expect(variantQty(S, 'Tote bags', 'C')).toBe(6);
    expect(itemState(S, 'Tote bags')).toBe('reorder');
    expect(reorderVariants(S)).toContain('Tote bags C');
  });

  it('filters items by search text, variant name and box id', () => {
    const S = seed();
    expect(filterItems(S, 'BOX-022', 'all')).toEqual(['Water bottles']);
    expect(filterItems(S, 'navy', 'all')).toEqual(['Tote bags']);
    expect(filterItems(S, '', 'reusable')).toEqual(['Decorations', 'Folding tables']);
  });
});

describe('scanning', () => {
  it('accepts the QR text, the box id or just the number', () => {
    const S = seed();
    expect(findBoxByCode(S, 'SSF-BOX-014').id).toBe('BOX-014');
    expect(findBoxByCode(S, 'box-14').id).toBe('BOX-014');
    expect(findBoxByCode(S, '1').id).toBe('BOX-001');
    expect(findBoxByCode(S, '999')).toBeUndefined();
  });
});

describe('warehouse actions', () => {
  it('take out lowers the box, logs it and counts it as out today', () => {
    const [S] = apply((d) => wh.takeOut(d, { boxId: 'BOX-002', qty: 5, purpose: 'Clubs Day', who: 'Sam' }));
    const b = boxById(S, 'BOX-002');
    expect(b.qty).toBe(15);
    expect(b.history[0]).toMatchObject({ who: 'Sam', what: 'Gave out for Clubs Day', ch: -5 });
    expect(S.move.at(-1)[2]).toBe(23 + 5);
  });

  it('a count that differs raises a flag, and a matching count clears it', () => {
    const [S1, diff] = apply((d) => wh.recordCount(d, { boxId: 'BOX-002', counted: 18, reason: 'Unknown', who: 'Sam' }));
    expect(diff).toBe(-2);
    expect(warehouseFlags(S1).some((f) => f.kind === 'count' && f.box === 'BOX-002')).toBe(true);
    const [S2] = apply((d) => wh.recordCount(d, { boxId: 'BOX-002', counted: 18, reason: 'Unknown', who: 'Sam' }), S1);
    expect(boxById(S2, 'BOX-002').countFlag).toBeNull();
  });

  it('receive creates numbered boxes and a new variant when asked', () => {
    const [S, r] = apply((d) =>
      wh.receiveBoxes(d, {
        item: 'Pens',
        variant: null,
        newItem: null,
        newVariant: { name: 'Red ink', reorder: 50 },
        count: 2,
        perBox: 100,
        shelf: 'A1',
        who: 'Morgan',
      }),
    );
    expect(r).toEqual({ ids: ['BOX-062', 'BOX-063'], item: 'Pens', v: 'C' });
    expect(S.catalog.Pens.variants.C).toMatchObject({ name: 'Red ink', reorder: 50 });
    expect(variantQty(S, 'Pens', 'C')).toBe(200);
    expect(S.nextBox).toBe(64);
  });

  it('check out and a partial return with write-off reduce what SSF owns', () => {
    const [S1] = apply((d) =>
      wh.checkOut(d, { boxId: 'BOX-041', qty: 4, event: 'Gala', due: '20 Nov', responsible: 'Priya', who: 'Morgan' }),
    );
    const co = S1.checkouts.at(-1);
    expect(boxById(S1, 'BOX-041').qty).toBe(6);
    const [S2, r] = apply(
      (d) => wh.returnFromEvent(d, { boxId: 'BOX-041', checkoutId: co.id, qty: 3, writeOffRest: true, who: 'Morgan' }),
      S1,
    );
    expect(r).toEqual({ rest: 1, writtenOff: true, cap: 9 });
    expect(boxById(S2, 'BOX-041').qty).toBe(9);
  });

  it('boxing loose stock moves its open checkouts to the new box id', () => {
    const [S, id] = apply((d) => wh.boxLooseStock(d, { boxId: 'LOOSE-2', shelf: 'D2', who: 'Morgan' }));
    expect(id).toBe('BOX-062');
    expect(S.checkouts.find((c) => c.id === 'co2').boxId).toBe('BOX-062');
    expect(boxById(S, 'BOX-062')).toMatchObject({ loose: false, shelf: 'D2' });
  });
});

describe('gaming room actions', () => {
  it('not found opens a finding, and finding it later closes it', () => {
    const [S1, next] = apply((d) =>
      gaming.recordCheck(d, { equipId: 'NSW-01', status: 'missing', cond: '', note: 'Not in cabinet', who: 'Sam' }),
    );
    expect(next).toBe('NSW-02');
    expect(openFindings(S1).some((f) => f.equip === 'NSW-01' && f.kind === 'missing')).toBe(true);
    const [S2] = apply(
      (d) => gaming.recordCheck(d, { equipId: 'NSW-01', status: 'present', cond: 'good', note: '', who: 'Sam' }),
      S1,
    );
    expect(openFindings(S2).some((f) => f.equip === 'NSW-01')).toBe(false);
  });

  it('writing off a finding removes the equipment', () => {
    const [S] = apply((d) => gaming.followUpFinding(d, { findingId: 'f2', note: '', outcome: 'writeoff', who: 'Morgan' }));
    expect(S.equipment.some((e) => e.id === 'HSET-02')).toBe(false);
    expect(auditSummary(S).total).toBe(23);
  });
});

describe('snack stand actions', () => {
  it('confirming a reading sets the records to the shelf count', () => {
    const [S] = apply((d) => snack.confirmReading(d, { name: 'Chips A', who: 'Sam' }));
    expect(S.shelf[0]).toMatchObject({ rec: 10, obs: 10, status: 'match' });
    expect(S.trial.confirmed).toBe(13);
  });

  it('a simulated sale keeps the shelf matching the records', () => {
    const [S, total] = apply((d) => snack.simulateSale(d));
    expect(total).toBeGreaterThan(0);
    S.shelf.filter((s) => s.status === 'match').forEach((s) => expect(s.obs).toBe(s.rec));
    expect(salesSummary(S.sales, 'today').revenue).toBeCloseTo(61.25 + total, 2);
  });
});
