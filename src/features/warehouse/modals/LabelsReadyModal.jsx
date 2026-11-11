import { FormDialog } from '../../../components/feedback/FormDialog';
import { BoxLabel } from '../../../components/labels/BoxLabel';
import { usePrintLabels } from '../../../components/labels/PrintContext';
import { Hint } from '../../../components/ui';
import { plural } from '../../../lib/format';
import { useStore } from '../../../state/StoreContext';
import { boxById } from '../../../state/selectors';

export function LabelsReadyModal({ boxIds }) {
  const { state } = useStore();
  const printLabels = usePrintLabels();
  const boxes = boxIds.map((id) => boxById(state, id)).filter(Boolean);

  return (
    <FormDialog
      title={`${plural(boxes.length, 'label')} ready`}
      wide
      submitLabel="Print labels"
      cancelLabel="Done"
      onSubmit={() => printLabels(boxIds)}
    >
      <Hint>One label per box. Stick it on the side that faces out.</Hint>
      <div className="labels-grid">
        {boxes.map((b) => (
          <BoxLabel key={b.id} box={b} />
        ))}
      </div>
    </FormDialog>
  );
}
