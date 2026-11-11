import { useState } from 'react';
import { FormDialog } from '../../../components/feedback/FormDialog';
import { useToast } from '../../../components/feedback/ToastContext';
import { Field, Select, SummaryCard } from '../../../components/ui';
import { followUpFinding, OUTCOME_LABELS } from '../../../state/actions/gaming';
import { useSession } from '../../../state/SessionContext';
import { useStore } from '../../../state/StoreContext';
import { equipmentById } from '../../../state/selectors';

/** Add a note to a finding, or close it as found, repaired, replaced or written off. */
export function FollowUpModal({ findingId }) {
  const { state, update } = useStore();
  const { who } = useSession();
  const toast = useToast();
  const f = state.findings.find((x) => x.id === findingId);
  const e = equipmentById(state, f.equip);
  const [note, setNote] = useState('');
  const [outcome, setOutcome] = useState('open');

  const outcomes = [
    { value: 'open', label: 'Keep open' },
    f.kind === 'missing' ? { value: 'found', label: 'Found it' } : { value: 'repaired', label: 'Repaired' },
    { value: 'replaced', label: 'Replaced with a new one' },
    { value: 'writeoff', label: 'Written off, remove from list' },
  ];

  const submit = () => {
    const text = note.trim();
    if (!text && outcome === 'open') return 'Add a note or choose an outcome.';
    update((d) => followUpFinding(d, { findingId, note: text, outcome, who }));
    toast(
      outcome === 'open'
        ? 'Note added. Finding stays open.'
        : `${f.equip} closed as ${OUTCOME_LABELS[outcome].toLowerCase()}.`,
    );
  };

  return (
    <FormDialog title={`Follow up ${f.equip}`} onSubmit={submit}>
      <SummaryCard
        lead={<span className="eid">{f.equip}</span>}
        title={e ? e.name : 'Removed item'}
        subtitle={`${f.kind === 'missing' ? 'Not found' : 'Damaged'}, opened ${f.opened.toLowerCase()} by ${f.who}`}
      />
      <ul className="notes">
        {f.notes.map((n, i) => (
          <li key={i}>
            <time>
              {n.t}, {n.who}
            </time>
            {n.text}
          </li>
        ))}
      </ul>
      <Field label="Add a note">
        <textarea value={note} onChange={(ev) => setNote(ev.target.value)} placeholder="What did you find out?" />
      </Field>
      <Field label="Outcome">
        <Select value={outcome} onChange={setOutcome} options={outcomes} />
      </Field>
    </FormDialog>
  );
}
