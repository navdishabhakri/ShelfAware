import { useState } from 'react';
import { FormDialog } from '../../../components/feedback/FormDialog';
import { useModal } from '../../../components/feedback/ModalContext';
import { useToast } from '../../../components/feedback/ToastContext';
import { Field, NumberInput, Preview, Row, Select, TextInput } from '../../../components/ui';
import { ITEM_KINDS, SHELVES } from '../../../lib/constants';
import { boxIdFor, parseWhole, plural } from '../../../lib/format';
import { receiveBoxes } from '../../../state/actions/warehouse';
import { useSession } from '../../../state/SessionContext';
import { useStore } from '../../../state/StoreContext';
import { useUi } from '../../../state/UiContext';
import { itemNames, nextVariantLetter } from '../../../state/selectors';
import { LabelsReadyModal } from './LabelsReadyModal';

const NEW = '__new';
const MAX_BOXES = 40;

const variantOptions = (S, item) => [
  ...Object.entries(S.catalog[item].variants).map(([v, d]) => ({ value: v, label: `${v}, ${d.name}` })),
  { value: NEW, label: 'New variant' },
];

/** Receive stock as one or more boxes of the same variant. Can create the item or variant on the way. */
export function ReceiveModal({ item: preItem }) {
  const { state, update } = useStore();
  const { who } = useSession();
  const { setUi } = useUi();
  const { open } = useModal();
  const toast = useToast();
  const items = itemNames(state);

  const [item, setItem] = useState(preItem || items[0]);
  const [variant, setVariant] = useState(() => Object.keys(state.catalog[preItem || items[0]].variants)[0] ?? NEW);
  const [newName, setNewName] = useState('');
  const [kind, setKind] = useState(ITEM_KINDS[0]);
  const [vName, setVName] = useState('');
  const [rp, setRp] = useState('');
  const [count, setCount] = useState('1');
  const [perBox, setPerBox] = useState('20');
  const [shelf, setShelf] = useState(SHELVES[0]);

  const isNewItem = item === NEW;
  const isNewVariant = isNewItem || variant === NEW;
  const n = parseWhole(count);
  const per = parseWhole(perBox);

  const pickItem = (it) => {
    setItem(it);
    if (it !== NEW) setVariant(Object.keys(state.catalog[it].variants)[0] ?? NEW);
  };

  const submit = () => {
    const name = isNewItem ? newName.trim() : item;
    if (!name) return 'Name the new item type.';
    if (isNewItem && items.some((i) => i.toLowerCase() === name.toLowerCase()))
      return `${name} already exists. Pick it from the list.`;
    if (isNewVariant && !vName.trim()) return 'Describe the variant, for example its colour or size.';
    if (!(n >= 1 && n <= MAX_BOXES)) return `Enter between 1 and ${MAX_BOXES} boxes.`;
    if (!(per >= 1)) return 'Enter how many units are in each box.';

    const reorder = parseWhole(rp);
    const result = update((d) =>
      receiveBoxes(d, {
        item: name,
        variant: isNewVariant ? null : variant,
        newItem: isNewItem ? { kind } : null,
        newVariant: isNewVariant ? { name: vName.trim(), reorder: isNaN(reorder) ? -1 : reorder } : null,
        count: n,
        perBox: per,
        shelf,
        who,
      }),
    );
    setUi({ box: result.ids[0], openItem: name, boxItem: name });
    open(LabelsReadyModal, { boxIds: result.ids });
    toast(`Received ${n * per} ${name} ${result.v} in ${plural(n, 'box', 'boxes')}.`);
  };

  let preview = null;
  if (n >= 1 && per >= 1) {
    const label = isNewItem
      ? `${newName.trim() || 'New item'} A`
      : `${item} ${variant === NEW ? nextVariantLetter(state, item) : variant}`;
    const first = state.nextBox;
    preview = (
      <Preview
        label={`${boxIdFor(first)}${n > 1 ? ` to ${boxIdFor(first + n - 1)}` : ''}`}
        value={`+${n * per} ${label}`}
      />
    );
  }

  return (
    <FormDialog title="Receive boxes" submitLabel="Save and print labels" onSubmit={submit}>
      <Row>
        <Field label="Item">
          <Select value={item} onChange={pickItem} options={[...items, { value: NEW, label: 'New item type' }]} />
        </Field>
        <Field label="Variant" hidden={isNewItem}>
          {!isNewItem && <Select value={variant} onChange={setVariant} options={variantOptions(state, item)} />}
        </Field>
      </Row>
      <Row hidden={!isNewItem}>
        <Field label="New item name">
          <TextInput value={newName} onChange={setNewName} placeholder="For example, Stickers" />
        </Field>
        <Field label="Type">
          <Select value={kind} onChange={setKind} options={ITEM_KINDS} />
        </Field>
      </Row>
      <Row hidden={!isNewVariant}>
        <Field label="Variant name">
          <TextInput value={vName} onChange={setVName} placeholder="For example, Blue, SSF logo" />
        </Field>
        <Field label="Reorder point (optional)">
          <NumberInput min="0" value={rp} onChange={setRp} />
        </Field>
      </Row>
      <Row>
        <Field label="Number of boxes">
          <NumberInput min="1" max={MAX_BOXES} value={count} onChange={setCount} />
        </Field>
        <Field label="Units per box">
          <NumberInput min="1" value={perBox} onChange={setPerBox} />
        </Field>
      </Row>
      <Field label="Put away on shelf">
        <Select value={shelf} onChange={setShelf} options={SHELVES} />
      </Field>
      {preview}
    </FormDialog>
  );
}
