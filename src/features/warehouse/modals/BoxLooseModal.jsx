import { useState } from 'react';
import { FormDialog } from '../../../components/feedback/FormDialog';
import { useToast } from '../../../components/feedback/ToastContext';
import { usePrintLabels } from '../../../components/labels/PrintContext';
import { Field, Hint, Select } from '../../../components/ui';
import { SHELVES } from '../../../lib/constants';
import { boxLooseStock } from '../../../state/actions/warehouse';
import { useSession } from '../../../state/SessionContext';
import { useStore } from '../../../state/StoreContext';
import { useUi } from '../../../state/UiContext';
import { boxById, boxName } from '../../../state/selectors';
import { BoxSummary } from '../components/BoxSummary';

/** Loose stock into a new labelled box, then print its label. */
export function BoxLooseModal({ boxId }) {
  const { state, update } = useStore();
  const { who } = useSession();
  const { setUi } = useUi();
  const toast = useToast();
  const printLabels = usePrintLabels();
  const b = boxById(state, boxId);
  const [shelf, setShelf] = useState(SHELVES.includes(b.shelf) ? b.shelf : SHELVES[0]);

  const submit = () => {
    const id = update((d) => boxLooseStock(d, { boxId, shelf, who }));
    setUi({ box: id });
    printLabels([id]);
    toast(`${boxName(b)} is now ${id}.`);
  };

  return (
    <FormDialog title="Put loose stock in a box" submitLabel="Create box and print label" onSubmit={submit}>
      <BoxSummary box={b} />
      <Field label="Shelf">
        <Select value={shelf} onChange={setShelf} options={SHELVES} />
      </Field>
      <Hint>All {b.qty} units go into one new box with its own QR label.</Hint>
    </FormDialog>
  );
}
