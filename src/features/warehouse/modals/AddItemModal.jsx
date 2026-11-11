import { useState } from 'react';
import { FormDialog } from '../../../components/feedback/FormDialog';
import { useToast } from '../../../components/feedback/ToastContext';
import { Field, NumberInput, Preview, Row, Select, TextInput } from '../../../components/ui';
import { ITEM_KINDS, LETTERS } from '../../../lib/constants';
import { parseWhole, plural } from '../../../lib/format';
import { resizePhoto } from '../../../lib/photo';
import { addItem, setItemPhoto } from '../../../state/actions/warehouse';
import { useStore } from '../../../state/StoreContext';
import { useUi } from '../../../state/UiContext';
import { PhotoField } from '../components/PhotoField';

const splitList = (s) =>
  s
    .split(',')
    .map((x) => x.trim())
    .filter(Boolean);

export function AddItemModal() {
  const { state, update } = useStore();
  const { setUi } = useUi();
  const toast = useToast();
  const [name, setName] = useState('');
  const [kind, setKind] = useState(ITEM_KINDS[0]);
  const [vars, setVars] = useState('');
  const [rp, setRp] = useState('');
  const [file, setFile] = useState(null);
  const variants = splitList(vars);

  const submit = () => {
    const n = name.trim();
    if (!n) return 'Name the item.';
    if (Object.keys(state.catalog).some((i) => i.toLowerCase() === n.toLowerCase())) return `${n} already exists.`;
    const list = variants.length ? variants : ['Standard'];
    if (list.length > LETTERS.length) return 'That is a lot of variants. Keep it under 26.';
    const reorder = parseWhole(rp);
    update((d) => addItem(d, { name: n, kind, variants: list, reorder: isNaN(reorder) ? -1 : reorder }));
    setUi({ openItem: n });
    if (file) resizePhoto(file).then((img) => update((d) => setItemPhoto(d, { item: n, img })));
    toast(`${n} added with ${plural(list.length, 'variant')}. Receive boxes when stock arrives.`);
  };

  const shown = name.trim() || 'Item';
  return (
    <FormDialog title="Add an item type" submitLabel="Add item" onSubmit={submit}>
      <Row>
        <Field label="Name">
          <TextInput value={name} onChange={setName} placeholder="For example, Stickers" />
        </Field>
        <Field label="Type">
          <Select value={kind} onChange={setKind} options={ITEM_KINDS} />
        </Field>
      </Row>
      <Field label="Variants, separated by commas">
        <TextInput value={vars} onChange={setVars} placeholder="For example, Red, Black, Navy with logo" />
      </Field>
      <Field label="Reorder point per variant (giveaways)">
        <NumberInput min="0" value={rp} onChange={setRp} />
      </Field>
      <PhotoField onChange={setFile} />
      {variants.length > 0 && (
        <Preview
          label={variants.map((_, i) => `${shown} ${LETTERS[i]}`).join(', ')}
          value={plural(variants.length, 'variant')}
        />
      )}
    </FormDialog>
  );
}
