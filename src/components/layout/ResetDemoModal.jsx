import { useStore } from '../../state/StoreContext';
import { INITIAL_UI, useUi } from '../../state/UiContext';
import { FormDialog } from '../feedback/FormDialog';
import { useToast } from '../feedback/ToastContext';

export function ResetDemoModal() {
  const { reset } = useStore();
  const { setUi } = useUi();
  const toast = useToast();

  const submit = () => {
    reset();
    setUi({ box: INITIAL_UI.box, openItem: INITIAL_UI.openItem, boxItem: INITIAL_UI.boxItem });
    toast('Demo data reset.');
  };

  return (
    <FormDialog title="Reset demo data?" submitLabel="Reset" danger onSubmit={submit}>
      <p>All boxes, audits and shelf readings go back to the sample data from the brief.</p>
    </FormDialog>
  );
}
