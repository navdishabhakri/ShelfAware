import { BoxId, SummaryCard } from '../../../components/ui';
import { useStore } from '../../../state/StoreContext';
import { boxName, variantName } from '../../../state/selectors';

/** Summary card at the top of box modals. subtitle defaults to what "qty" means for this box. */
export function BoxSummary({ box, subtitle, value = box.qty }) {
  const { state } = useStore();
  const where = box.kind === 'Reusable' ? 'Available now' : `In this ${box.loose ? 'location' : 'box'}`;
  return (
    <SummaryCard
      lead={<BoxId box={box} />}
      title={boxName(box)}
      subtitle={subtitle ?? `${variantName(state, box)}. ${where}`}
      value={value}
    />
  );
}
