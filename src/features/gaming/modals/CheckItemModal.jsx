import { useState } from 'react';
import { FormDialog } from '../../../components/feedback/FormDialog';
import { useModal } from '../../../components/feedback/ModalContext';
import { useToast } from '../../../components/feedback/ToastContext';
import { Field, Hint, Segmented, SummaryCard, TextInput } from '../../../components/ui';
import { recordCheck } from '../../../state/actions/gaming';
import { useSession } from '../../../state/SessionContext';
import { useStore } from '../../../state/StoreContext';
import { auditSummary, equipmentById, openFindingFor } from '../../../state/selectors';

const STATUS = [
  { value: 'present', label: 'Present' },
  { value: 'missing', label: 'Not found' },
];
const CONDITION = [
  { value: 'good', label: 'Good' },
  { value: 'damaged', label: 'Damaged' },
];

/**
 * Check one piece of equipment. With `chain`, saving moves on to the next unchecked item,
 * and cancelling leaves the audit incomplete (as the brief requires).
 */
export function CheckItemModal({ equipId, chain = false }) {
  const { state, update } = useStore();
  const { who } = useSession();
  const { open } = useModal();
  const toast = useToast();
  const e = equipmentById(state, equipId);
  const left = auditSummary(state).todo;
  const [status, setStatus] = useState(e.status === 'missing' ? 'missing' : 'present');
  const [cond, setCond] = useState(e.cond === 'damaged' ? 'damaged' : 'good');
  const [note, setNote] = useState('');
  const missing = status === 'missing';

  const submit = () => {
    const c = missing ? '' : cond;
    const opensFinding =
      (missing && !openFindingFor(state, equipId, 'missing')) ||
      (c === 'damaged' && !openFindingFor(state, equipId, 'damaged'));
    if (opensFinding && !note.trim()) return 'Add a short note so whoever follows up knows what happened.';

    const next = update((d) => recordCheck(d, { equipId, status, cond: c, note: note.trim(), who }));
    if (chain && next) open(CheckItemModal, { equipId: next, chain: true });
    toast(next ? `${e.id} saved.` : 'Audit complete. All equipment checked.');
  };

  return (
    <FormDialog
      title={chain ? `Audit, ${left} left` : `Check ${e.id}`}
      submitLabel={chain && left > 1 ? 'Save and next' : 'Save'}
      onSubmit={submit}
    >
      <SummaryCard lead={<span className="eid">{e.id}</span>} title={e.name} subtitle={e.type} />
      <Segmented label="Is it here?" name="st" value={status} onChange={setStatus} options={STATUS} />
      <Segmented label="Condition" name="cond" value={cond} onChange={setCond} options={CONDITION} disabled={missing} />
      <Field label="Note (needed for a finding)">
        <TextInput value={note} onChange={setNote} placeholder="For example, cracked casing" />
      </Field>
      {chain && <Hint>Cancel any time. The audit stays incomplete and you can continue later.</Hint>}
    </FormDialog>
  );
}
