import { useModal } from '../../../components/feedback/ModalContext';
import { useToast } from '../../../components/feedback/ToastContext';
import { BoxLabel } from '../../../components/labels/BoxLabel';
import { usePrintLabels } from '../../../components/labels/PrintContext';
import { Button, Empty, Panel } from '../../../components/ui';
import { signed } from '../../../lib/format';
import { useSession } from '../../../state/SessionContext';
import { useStore } from '../../../state/StoreContext';
import { useUi } from '../../../state/UiContext';
import { boxById, boxName, openCheckouts, unitsOut, variantName, variantState } from '../../../state/selectors';
import { BoxLooseModal, CheckOutModal, CountModal, RemoveBoxModal, ReturnModal, TakeOutModal, TransferModal } from '../modals';
import { DETAIL_ID } from '../useWarehouseNav';

function History({ entries }) {
  return (
    <ul className="hist">
      {entries.map((x, i) => (
        <li key={i}>
          <time>{x.t}</time>
          <span>
            <strong>{x.who}</strong> {x.what}
          </span>
          <b className={`num ${x.ch < 0 ? 'neg' : x.ch > 0 ? 'pos' : ''}`}>{x.ch === null ? '' : signed(x.ch)}</b>
        </li>
      ))}
    </ul>
  );
}

/** Right-hand panel: the printable label (or loose-stock note), stock level, actions and history. */
export function BoxDetail() {
  const { state } = useStore();
  const { isManager } = useSession();
  const { ui } = useUi();
  const { open } = useModal();
  const printLabels = usePrintLabels();
  const toast = useToast();
  const b = boxById(state, ui.box) ?? state.boxes[0];

  if (!b) {
    return (
      <Panel span={5} className="detail-panel" id={DETAIL_ID}>
        <Empty>No boxes yet. Use Receive boxes to add some.</Empty>
      </Panel>
    );
  }

  const reusable = b.kind === 'Reusable';
  const checkouts = openCheckouts(state, b.id);
  const out = unitsOut(checkouts);
  const pct = Math.min(100, Math.round((b.qty / b.cap) * 100));
  const props = { boxId: b.id };
  const reprint = () => {
    printLabels([b.id]);
    toast(`Sending ${b.id} label to the printer.`);
  };

  const stockText = reusable
    ? `of ${b.cap} available${out ? `, ${out} at ${checkouts.length > 1 ? 'events' : checkouts[0].event}` : ''}`
    : `of ${b.rec} when received`;

  return (
    <Panel
      span={5}
      className="detail-panel"
      id={DETAIL_ID}
      title={b.loose ? 'Loose stock' : 'Box label'}
      subtitle={b.loose ? 'Not in a labelled box, tracked by item.' : 'This is what gets printed and stuck on the box.'}
    >
      {b.loose ? (
        <>
          <div className="noLabel">
            No QR label for loose stock.
            <Button variant="small" onClick={() => open(BoxLooseModal, props)}>
              Put in a box and print a label
            </Button>
          </div>
          <div className="dtitle">
            <h4>{boxName(b)}</h4>
            <span className="muted">{variantName(state, b)}</span>
            <span className="muted">{b.shelf === 'Floor' ? ', on the floor' : `, shelf ${b.shelf}`}</span>
          </div>
        </>
      ) : (
        <div className="label-sheet">
          <BoxLabel box={b} />
          <div className="label-actions">
            <Button variant="small" onClick={reprint}>
              Reprint label
            </Button>
            <span className="hint">Prints at 4 &times; 2 in</span>
          </div>
        </div>
      )}

      <div className="dstock">
        <b className="num">{b.qty}</b>
        <span>{stockText}</span>
        <span className={`bfill big${variantState(state, b.item, b.v) === 'reorder' ? ' low' : ''}`} aria-hidden="true">
          <b style={{ width: `${pct}%` }} />
        </span>
      </div>

      <div className="dacts">
        {reusable ? (
          <>
            <Button disabled={!b.qty} onClick={() => open(CheckOutModal, props)}>
              Check out
            </Button>
            <Button variant="alt" disabled={!checkouts.length} onClick={() => open(ReturnModal, props)}>
              Return
            </Button>
          </>
        ) : (
          <>
            <Button disabled={!b.qty} onClick={() => open(TakeOutModal, props)}>
              Take out
            </Button>
            <Button variant="alt" disabled={!b.qty} onClick={() => open(TransferModal, props)}>
              Transfer
            </Button>
          </>
        )}
        <Button variant="alt" onClick={() => open(CountModal, props)}>
          Count
        </Button>
        {isManager && (
          <Button variant="alt" danger onClick={() => open(RemoveBoxModal, props)}>
            Remove {b.loose ? 'item' : 'box'}
          </Button>
        )}
      </div>

      <h4 className="dh">History</h4>
      <History entries={b.history} />
    </Panel>
  );
}
