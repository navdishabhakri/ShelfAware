import { useState } from 'react';
import { FormDialog } from '../../../components/feedback/FormDialog';
import { useToast } from '../../../components/feedback/ToastContext';
import { Checkbox, Field, NumberInput, Preview, Select } from '../../../components/ui';
import { parseWhole } from '../../../lib/format';
import { returnFromEvent } from '../../../state/actions/warehouse';
import { useSession } from '../../../state/SessionContext';
import { useStore } from '../../../state/StoreContext';
import { boxById, boxName, openCheckouts, outstanding } from '../../../state/selectors';
import { BoxSummary } from '../components/BoxSummary';

export function ReturnModal({ boxId }) {
  const { state, update } = useStore();
  const { who } = useSession();
  const toast = useToast();
  const b = boxById(state, boxId);
  const open = openCheckouts(state, boxId);
  const [coId, setCoId] = useState(open[0]?.id);
  const co = open.find((c) => c.id === coId);
  const [qty, setQty] = useState(String(co ? outstanding(co) : 0));
  const [writeOff, setWriteOff] = useState(false);
  const n = parseWhole(qty);

  const pickEvent = (id) => {
    setCoId(id);
    setQty(String(outstanding(open.find((c) => c.id === id))));
  };

  const submit = () => {
    if (!co) return 'Nothing is out from this box.';
    if (isNaN(n)) return 'Enter how many came back, or 0.';
    if (n > outstanding(co)) return `Only ${outstanding(co)} are out for ${co.event}.`;
    const rest = outstanding(co) - n;
    if (n === 0 && !(writeOff && rest > 0)) return 'Nothing to save. Enter a number or record the rest as lost.';
    const r = update((d) => returnFromEvent(d, { boxId, checkoutId: co.id, qty: n, writeOffRest: writeOff, who }));
    toast(
      r.writtenOff
        ? `Return saved. ${r.rest} written off, SSF now owns ${r.cap}.`
        : r.rest
          ? `Return saved. ${r.rest} still out.`
          : `All ${boxName(b)} are back from ${co.event}.`,
    );
  };

  let preview = null;
  if (co && !isNaN(n) && n <= outstanding(co)) {
    const rest = outstanding(co) - n;
    preview = (
      <Preview
        label={rest ? (writeOff ? `${rest} written off` : `${rest} still outstanding`) : 'All back'}
        value={`${b.qty + n} of ${b.cap - (writeOff ? rest : 0)}`}
      />
    );
  }

  return (
    <FormDialog title="Return from an event" submitLabel="Save return" onSubmit={submit}>
      <BoxSummary box={b} />
      <Field label="Event">
        <Select
          value={coId}
          onChange={pickEvent}
          options={open.map((c) => ({ value: c.id, label: `${c.event}, ${outstanding(c)} out (${c.who})` }))}
        />
      </Field>
      <Field label="Units coming back">
        <NumberInput min="0" value={qty} onChange={setQty} />
      </Field>
      <Checkbox checked={writeOff} onChange={setWriteOff}>
        Record the rest as lost or damaged
      </Checkbox>
      {preview}
    </FormDialog>
  );
}
