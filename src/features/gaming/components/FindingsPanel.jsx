import { useModal } from '../../../components/feedback/ModalContext';
import { Button, Chip, Empty, Panel } from '../../../components/ui';
import { useStore } from '../../../state/StoreContext';
import { closedFindings, equipmentById, openFindings } from '../../../state/selectors';
import { FollowUpModal } from '../modals/FollowUpModal';

const withStop = (s) => s.replace(/([^.!?])$/, '$1.');

/** Missing or damaged equipment. Findings stay open until someone follows up. */
export function FindingsPanel() {
  const { state } = useStore();
  const { open } = useModal();
  const list = openFindings(state);
  const closed = closedFindings(state);

  return (
    <Panel title="Open findings" subtitle="Stay here until someone follows up.">
      <div className="findings">
        {list.length ? (
          list.map((f) => {
            const e = equipmentById(state, f.equip);
            const last = f.notes[f.notes.length - 1].text;
            return (
              <div className="finding" key={f.id}>
                <span>
                  <span className="eid">{f.equip}</span> {e ? e.name : 'Removed item'}
                </span>
                <span className="fa">
                  <Chip tone={f.kind === 'missing' ? 'crit' : 'warn'}>{f.kind === 'missing' ? 'Not found' : 'Damaged'}</Chip>
                  <Button variant="small" onClick={() => open(FollowUpModal, { findingId: f.id })}>
                    Follow up
                  </Button>
                </span>
                <small>
                  {withStop(last)} {f.opened === 'Today' ? 'Opened today' : `Open since ${f.opened}`}.
                </small>
              </div>
            );
          })
        ) : (
          <Empty>No open findings.</Empty>
        )}
      </div>
      {closed.length > 0 && (
        <details className="closed">
          <summary>Closed ({closed.length})</summary>
          <ul>
            {closed.map((f) => (
              <li key={f.id}>
                <b>{f.equip}</b> {f.closed}
              </li>
            ))}
          </ul>
        </details>
      )}
    </Panel>
  );
}
