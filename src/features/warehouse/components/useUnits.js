import { useState } from 'react';
import { parseWhole } from '../../../lib/format';

/** State for "how many units" with an "Entire box" shortcut. `units` is NaN when invalid. */
export function useUnits(box) {
  const [qty, setQty] = useState('1');
  const [all, setAll] = useState(false);
  return { qty, setQty, all, setAll, units: all ? box.qty : parseWhole(qty) };
}
