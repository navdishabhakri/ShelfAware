import { FormDialog } from '../../../components/feedback/FormDialog';
import { useToast } from '../../../components/feedback/ToastContext';
import { Hint } from '../../../components/ui';
import { removeBox } from '../../../state/actions/warehouse';
import { useStore } from '../../../state/StoreContext';
import { useUi } from '../../../state/UiContext';
import { boxById, boxName, openCheckouts, unitsOut } from '../../../state/selectors';

export function RemoveBoxModal({ boxId }) {
  const { state, update } = useStore();
  const { setUi } = useUi();
  const toast = useToast();
  const b = boxById(state, boxId);
  const label = b.loose ? boxName(b) : b.id;

  const submit = () => {
    const out = unitsOut(openCheckouts(state, boxId));
    if (out) return `Can't remove while ${out} items are still out at events.`;
    const next = update((d) => removeBox(d, { boxId }));
    setUi({ box: next });
    toast(`${label} removed.`);
  };

  return (
    <FormDialog title={`Remove ${label}?`} submitLabel="Remove" danger onSubmit={submit}>
      <p>
        This deletes the record for <b>{boxName(b)}</b> ({b.qty} units). Use it for {b.loose ? 'items' : 'boxes'} added
        by mistake.
      </p>
      <Hint>To record stock leaving, use Take out or Count instead so the history is kept.</Hint>
    </FormDialog>
  );
}
