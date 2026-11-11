import { useState } from 'react';
import { FormDialog } from '../../../components/feedback/FormDialog';
import { useToast } from '../../../components/feedback/ToastContext';
import { Field, Preview, TextInput } from '../../../components/ui';
import { takeOut } from '../../../state/actions/warehouse';
import { useSession } from '../../../state/SessionContext';
import { useStore } from '../../../state/StoreContext';
import { boxById, boxName } from '../../../state/selectors';
import { BoxSummary } from '../components/BoxSummary';
import { UnitsFields } from '../components/UnitsFields';
import { useUnits } from '../components/useUnits';

export function TakeOutModal({ boxId }) {
  const { state, update } = useStore();
  const { who } = useSession();
  const toast = useToast();
  const b = boxById(state, boxId);
  const units = useUnits(b);
  const [purpose, setPurpose] = useState('');
  const n = units.units;
  const ok = n >= 1 && n <= b.qty;

  const submit = () => {
    const p = purpose.trim();
    if (!(n >= 1)) return 'Enter how many units are going out.';
    if (n > b.qty) return `Only ${b.qty} in ${b.loose ? 'stock' : 'this box'}. Count it first if that's wrong.`;
    if (!p) return 'Add a purpose so the movement can be traced later.';
    update((d) => takeOut(d, { boxId, qty: n, purpose: p, who }));
    toast(`Gave out ${n} ${boxName(b)}. ${b.loose ? '' : `${b.id} `}has ${b.qty - n} left.`);
  };

  return (
    <FormDialog title="Take out" submitLabel="Give out" onSubmit={submit}>
      <BoxSummary box={b} />
      <UnitsFields box={b} state={units} />
      <Field label="Purpose">
        <TextInput value={purpose} onChange={setPurpose} placeholder="For example, residence welcome table" />
      </Field>
      {ok && <Preview label={b.loose ? 'Left after this' : `${b.id} will have`} value={`${b.qty - n} left`} />}
    </FormDialog>
  );
}
