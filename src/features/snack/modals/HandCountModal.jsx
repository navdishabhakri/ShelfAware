import { useState } from 'react';
import { FormDialog } from '../../../components/feedback/FormDialog';
import { useToast } from '../../../components/feedback/ToastContext';
import { Field, Hint, NumberInput, SummaryCard } from '../../../components/ui';
import { parseWhole } from '../../../lib/format';
import { handCount } from '../../../state/actions/snack';
import { useSession } from '../../../state/SessionContext';
import { useStore } from '../../../state/StoreContext';

export function HandCountModal({ name }) {
  const { state, update } = useStore();
  const { who } = useSession();
  const toast = useToast();
  const s = state.shelf.find((x) => x.name === name);
  const [value, setValue] = useState('');

  const submit = () => {
    const n = parseWhole(value);
    if (isNaN(n)) return 'Enter the number on the shelf.';
    update((d) => handCount(d, { name, counted: n, who }));
    toast(`${name} set to ${n}.`);
  };

  return (
    <FormDialog title={`Count ${name} by hand`} submitLabel="Save count" onSubmit={submit}>
      <SummaryCard title={name} subtitle="Records say" value={s.rec} />
      <Field label="How many are on the shelf?">
        <NumberInput min="0" value={value} onChange={setValue} />
      </Field>
      <Hint>Manual counts are the baseline the shelf is measured against.</Hint>
    </FormDialog>
  );
}
