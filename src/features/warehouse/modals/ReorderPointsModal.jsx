import { useState } from 'react';
import { FormDialog } from '../../../components/feedback/FormDialog';
import { useToast } from '../../../components/feedback/ToastContext';
import { Field, Hint, NumberInput } from '../../../components/ui';
import { parseWhole } from '../../../lib/format';
import { setReorderPoints } from '../../../state/actions/warehouse';
import { useStore } from '../../../state/StoreContext';
import { variantQty } from '../../../state/selectors';

export function ReorderPointsModal({ item }) {
  const { state, update } = useStore();
  const toast = useToast();
  const variants = Object.entries(state.catalog[item].variants);
  const [values, setValues] = useState(() =>
    Object.fromEntries(variants.map(([v, d]) => [v, d.reorder != null ? String(d.reorder) : ''])),
  );

  const submit = () => {
    const points = {};
    for (const [v, raw] of Object.entries(values)) {
      const n = parseWhole(raw);
      if (isNaN(n) && raw.trim()) return 'Use whole numbers only.';
      points[v] = isNaN(n) ? null : n;
    }
    update((d) => setReorderPoints(d, { item, points }));
    toast(`Reorder points saved for ${item}.`);
  };

  return (
    <FormDialog title={`Reorder points for ${item}`} onSubmit={submit}>
      <Hint>Status turns to Reorder at or below this number, and Low stock up to one and a half times it.</Hint>
      {variants.map(([v, d]) => (
        <Field key={v} label={`${item} ${v}, ${d.name} (${variantQty(state, item, v)} on hand)`}>
          <NumberInput min="0" value={values[v]} onChange={(x) => setValues((s) => ({ ...s, [v]: x }))} />
        </Field>
      ))}
    </FormDialog>
  );
}
