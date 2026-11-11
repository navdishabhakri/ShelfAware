import { useState } from 'react';
import { FormDialog } from '../../../components/feedback/FormDialog';
import { useToast } from '../../../components/feedback/ToastContext';
import { Field, NumberInput, Preview, Select } from '../../../components/ui';
import { COUNT_REASONS } from '../../../lib/constants';
import { parseWhole, signed } from '../../../lib/format';
import { recordCount } from '../../../state/actions/warehouse';
import { useSession } from '../../../state/SessionContext';
import { useStore } from '../../../state/StoreContext';
import { boxById } from '../../../state/selectors';
import { BoxSummary } from '../components/BoxSummary';

const diffColor = (d) => (d < 0 ? 'var(--crit)' : d > 0 ? 'var(--good)' : 'inherit');

export function CountModal({ boxId }) {
  const { state, update } = useStore();
  const { who } = useSession();
  const toast = useToast();
  const b = boxById(state, boxId);
  const [counted, setCounted] = useState('');
  const [reason, setReason] = useState(COUNT_REASONS[0]);
  const c = parseWhole(counted);
  const diff = c - b.qty;

  const submit = () => {
    if (isNaN(c)) return 'Enter the number you counted, or 0 if it was empty.';
    update((d) => recordCount(d, { boxId, counted: c, reason, who }));
    toast(diff === 0 ? 'Count saved. It matches.' : `Count saved. Difference of ${signed(diff)} recorded for follow up.`);
  };

  return (
    <FormDialog title="Record a count" submitLabel="Save count" onSubmit={submit}>
      <BoxSummary box={b} subtitle="Records say" />
      <Field label={`How many did you count${b.kind === 'Reusable' ? ' (available, not at events)' : ''}?`}>
        <NumberInput min="0" placeholder={String(b.qty)} value={counted} onChange={setCounted} />
      </Field>
      <Field label="Reason if it's different">
        <Select value={reason} onChange={setReason} options={COUNT_REASONS} />
      </Field>
      {!isNaN(c) && (
        <Preview label="Difference" value={diff === 0 ? 'Matches' : signed(diff)} valueStyle={{ color: diffColor(diff) }} />
      )}
    </FormDialog>
  );
}
