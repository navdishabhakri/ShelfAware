import { useState } from 'react';
import { FormDialog } from '../../../components/feedback/FormDialog';
import { useToast } from '../../../components/feedback/ToastContext';
import { Field, Hint, Preview, Select } from '../../../components/ui';
import { SHELVES } from '../../../lib/constants';
import { transfer } from '../../../state/actions/warehouse';
import { useSession } from '../../../state/SessionContext';
import { useStore } from '../../../state/StoreContext';
import { boxById, boxName } from '../../../state/selectors';
import { BoxSummary } from '../components/BoxSummary';
import { UnitsFields } from '../components/UnitsFields';
import { useUnits } from '../components/useUnits';

export function TransferModal({ boxId }) {
  const { state, update } = useStore();
  const { who } = useSession();
  const toast = useToast();
  const b = boxById(state, boxId);
  const dests = ['Snack stand', 'Gaming room', ...SHELVES.filter((s) => s !== b.shelf).map((s) => `Warehouse shelf ${s}`)];
  const units = useUnits(b);
  const [dest, setDest] = useState(dests[0]);
  const n = units.units;
  const toShelf = dest.startsWith('Warehouse');

  const submit = () => {
    if (!(n >= 1)) return 'Enter how many units are moving.';
    if (n > b.qty) return `Only ${b.qty} available to move.`;
    if (toShelf && n !== b.qty) return 'To move to another shelf, move the entire box.';
    update((d) => transfer(d, { boxId, qty: n, dest, who }));
    toast(
      toShelf
        ? `${b.id} moved to shelf ${dest.split(' ').pop()}. Reprint the label if the shelf is shown on it.`
        : `Transferred ${n} ${boxName(b)} to ${dest}.`,
    );
  };

  return (
    <FormDialog title="Transfer" submitLabel="Transfer" onSubmit={submit}>
      <BoxSummary box={b} />
      <UnitsFields box={b} state={units} />
      <Field label="Move to">
        <Select value={dest} onChange={setDest} options={dests} />
      </Field>
      <Hint>Moving a whole box to another shelf keeps its label. Transfers don&apos;t change SSF&apos;s total stock.</Hint>
      {n >= 1 && n <= b.qty && <Preview label="Stays here" value={toShelf && n === b.qty ? b.qty : b.qty - n} />}
    </FormDialog>
  );
}
