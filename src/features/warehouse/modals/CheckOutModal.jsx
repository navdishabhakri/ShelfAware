import { useState } from 'react';
import { FormDialog } from '../../../components/feedback/FormDialog';
import { useToast } from '../../../components/feedback/ToastContext';
import { Field, NumberInput, Preview, Row, TextInput } from '../../../components/ui';
import { parseWhole, shortDate } from '../../../lib/format';
import { checkOut } from '../../../state/actions/warehouse';
import { useSession } from '../../../state/SessionContext';
import { useStore } from '../../../state/StoreContext';
import { boxById, boxName } from '../../../state/selectors';
import { BoxSummary } from '../components/BoxSummary';

/** Reusable items out to an event. (WH04 describes scanning several boxes into one list; not built yet.) */
export function CheckOutModal({ boxId }) {
  const { state, update } = useStore();
  const { who } = useSession();
  const toast = useToast();
  const b = boxById(state, boxId);
  const [event, setEvent] = useState('');
  const [qty, setQty] = useState(String(b.qty));
  const [due, setDue] = useState('');
  const [responsible, setResponsible] = useState(who);
  const n = parseWhole(qty);

  const submit = () => {
    const ev = event.trim();
    const r = responsible.trim();
    if (!ev) return 'Name the event so items can be followed up.';
    if (!(n >= 1) || n > b.qty) return `Choose between 1 and ${b.qty} units.`;
    if (!r) return 'Add who is responsible for bringing them back.';
    update((d) =>
      checkOut(d, { boxId, qty: n, event: ev, due: due ? shortDate(due) : 'not set', responsible: r, who }),
    );
    toast(`${n} ${boxName(b)} checked out to ${ev}.`);
  };

  return (
    <FormDialog title="Check out to an event" submitLabel="Check out" onSubmit={submit}>
      <BoxSummary box={b} />
      <Field label="Event">
        <TextInput value={event} onChange={setEvent} placeholder="For example, Clubs Day" />
      </Field>
      <Row>
        <Field label="Units">
          <NumberInput min="1" max={b.qty} value={qty} onChange={setQty} />
        </Field>
        <Field label="Due back">
          <input type="date" value={due} onChange={(e) => setDue(e.target.value)} />
        </Field>
      </Row>
      <Field label="Responsible staff">
        <TextInput value={responsible} onChange={setResponsible} />
      </Field>
      {n >= 1 && n <= b.qty && <Preview label="Available after" value={`${b.qty - n} of ${b.cap}`} />}
    </FormDialog>
  );
}
