import { useState } from 'react';
import { FormDialog } from '../../../components/feedback/FormDialog';
import { useToast } from '../../../components/feedback/ToastContext';
import { Field, Hint, ItemPicture, NumberInput, Row, SummaryCard, TextInput } from '../../../components/ui';
import { parseWhole } from '../../../lib/format';
import { addVariant } from '../../../state/actions/warehouse';
import { useStore } from '../../../state/StoreContext';
import { nextVariantLetter } from '../../../state/selectors';

export function AddVariantModal({ item }) {
  const { state, update } = useStore();
  const toast = useToast();
  const reusable = state.catalog[item].kind === 'Reusable';
  const letter = nextVariantLetter(state, item);
  const [name, setName] = useState('');
  const [color, setColor] = useState('#818287');
  const [rp, setRp] = useState('');

  const submit = () => {
    if (!name.trim()) return 'Describe the variant.';
    const reorder = parseWhole(rp);
    const v = update((d) =>
      addVariant(d, { item, name: name.trim(), color, reorder: reusable || isNaN(reorder) ? -1 : reorder }),
    );
    toast(`${item} ${v} added.`);
  };

  return (
    <FormDialog title={`Add a variant to ${item}`} submitLabel="Add variant" onSubmit={submit}>
      <SummaryCard lead={<ItemPicture item={item} />} title={`${item} ${letter}`} subtitle="New variants get the next letter." />
      <Field label="What makes it different?">
        <TextInput value={name} onChange={setName} placeholder="Colour, size or design" />
      </Field>
      <Row>
        <Field label="Colour for the picture">
          <input type="color" value={color} onChange={(e) => setColor(e.target.value)} style={{ height: 38, padding: 3 }} />
        </Field>
        {!reusable && (
          <Field label="Reorder point">
            <NumberInput min="0" value={rp} onChange={setRp} />
          </Field>
        )}
      </Row>
      <Hint>It starts at 0 units. Use Receive boxes when stock arrives.</Hint>
    </FormDialog>
  );
}
