import { useModal } from '../../../components/feedback/ModalContext';
import { Actions, Button, Chip, EmptyRow, Panel, Toolbar } from '../../../components/ui';
import { useSession } from '../../../state/SessionContext';
import { useStore } from '../../../state/StoreContext';
import { useUi } from '../../../state/UiContext';
import { auditSummary, filterEquipment, firstUnchecked } from '../../../state/selectors';
import { AddEquipmentModal } from '../modals/AddEquipmentModal';
import { CheckItemModal } from '../modals/CheckItemModal';

const FILTERS = [
  { value: 'all', label: 'All' },
  { value: 'todo', label: 'Not checked' },
  { value: 'issues', label: 'Issues' },
];

const STATUS_CHIP = {
  present: <Chip tone="good">Present</Chip>,
  missing: <Chip tone="crit">Not found</Chip>,
  unchecked: <Chip tone="info">Not checked</Chip>,
};

const condition = (cond) =>
  cond === 'damaged' ? <Chip tone="warn">Damaged</Chip> : cond === 'good' ? 'Good' : <span className="muted">&ndash;</span>;

/** Stacked bar: good, damaged, not found, not checked. */
function AuditProgress({ a }) {
  return (
    <div className="prog">
      <div
        className="bar"
        data-tip={`Present, good ${a.good}\nDamaged ${a.damaged}\nNot found ${a.missing}\nNot checked ${a.todo}`}
      >
        <i style={{ flex: a.good, background: 'var(--ink-2)' }} />
        <i style={{ flex: a.damaged, background: '#B07A00' }} />
        <i style={{ flex: a.missing, background: 'var(--crit)' }} />
        <i style={{ flex: a.todo, background: 'repeating-linear-gradient(135deg,#CFCFD3 0 3px,#E8E8EA 3px 6px)' }} />
      </div>
      <span>{a.percent}% done</span>
    </div>
  );
}

export function AuditPanel() {
  const { state } = useStore();
  const { isManager } = useSession();
  const { ui, setUi } = useUi();
  const { open } = useModal();
  const a = auditSummary(state);
  const rows = filterEquipment(state, ui.grQuery, ui.grFilter);

  const continueAudit = () => {
    const next = firstUnchecked(state);
    if (next) open(CheckItemModal, { equipId: next.id, chain: true });
  };

  return (
    <Panel
      span={8}
      title="Today's audit"
      subtitle={
        a.todo
          ? `Started ${state.auditStarted} by ${state.auditBy}. Not found and not checked are different states.`
          : `Complete. Started ${state.auditStarted} by ${state.auditBy}.`
      }
      actions={
        <Actions>
          <Button variant="red" disabled={!a.todo} onClick={continueAudit}>
            {a.todo ? `Continue audit, ${a.todo} left` : 'Audit complete'}
          </Button>
          {isManager && (
            <Button variant="alt" onClick={() => open(AddEquipmentModal)}>
              Add equipment
            </Button>
          )}
        </Actions>
      }
    >
      <AuditProgress a={a} />
      <Toolbar
        query={ui.grQuery}
        onQuery={(grQuery) => setUi({ grQuery })}
        placeholder="Search equipment"
        searchLabel="Search equipment"
        filters={FILTERS}
        filter={ui.grFilter}
        onFilter={(grFilter) => setUi({ grFilter })}
        filterLabel="Filter equipment"
      />
      <div className="tscroll tall">
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Equipment</th>
              <th>Today</th>
              <th>Condition</th>
              <th>Checked</th>
              <th className="n">
                <span className="sr">Action</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map((e) => (
              <tr key={e.id} className={e.status === 'unchecked' ? 'todo' : undefined}>
                <td>
                  <span className="eid">{e.id}</span>
                </td>
                <td>{e.name}</td>
                <td>{STATUS_CHIP[e.status]}</td>
                <td>{condition(e.cond)}</td>
                <td className="muted num">{e.checked ? e.checked + (e.by ? `, ${e.by}` : '') : 'Yesterday'}</td>
                <td className="n">
                  <Button variant="small" onClick={() => open(CheckItemModal, { equipId: e.id })}>
                    {e.status === 'unchecked' ? 'Check' : 'Recheck'}
                  </Button>
                </td>
              </tr>
            ))}
            {!rows.length && <EmptyRow colSpan={6}>Nothing matches.</EmptyRow>}
          </tbody>
        </table>
      </div>
    </Panel>
  );
}
