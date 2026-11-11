import { BoxId, Button, Chip, Empty, Panel } from '../../../components/ui';
import { useStore } from '../../../state/StoreContext';
import { useUi } from '../../../state/UiContext';
import { boxChip, boxName, variantName, variantState } from '../../../state/selectors';
import { scrollToId } from '../../../lib/scroll';
import { DETAIL_ID } from '../useWarehouseNav';

const shelfText = (shelf) => (shelf === 'Floor' ? 'on the floor' : `shelf ${shelf}`);

function BoxRow({ box, current, onSelect }) {
  const { state } = useStore();
  const chip = boxChip(state, box);
  const pct = Math.min(100, Math.round((box.qty / box.cap) * 100));
  const low = variantState(state, box.item, box.v) === 'reorder';
  return (
    <button type="button" className="brow" aria-current={current} onClick={onSelect}>
      <BoxId box={box} />
      <span className="bitem">
        <strong>{boxName(box)}</strong>
        <small>
          {variantName(state, box)}, {shelfText(box.shelf)}
        </small>
      </span>
      <span className={`bfill${low ? ' low' : ''}`} aria-hidden="true">
        <b style={{ width: `${pct}%` }} />
      </span>
      <span className="bqty num">{box.kind === 'Reusable' ? `${box.qty} of ${box.cap}` : box.qty}</span>
      <span className="bst">{chip && <Chip tone={chip.tone}>{chip.label}</Chip>}</span>
    </button>
  );
}

/** Labelled boxes, then loose stock. Follows the expanded item unless "Show all boxes" is used. */
export function BoxListPanel() {
  const { state } = useStore();
  const { ui, setUi } = useUi();
  const item = ui.boxItem;
  const list = state.boxes.filter((b) => !item || b.item === item);
  const boxes = list.filter((b) => !b.loose).sort((a, b) => a.id.localeCompare(b.id));
  const loose = list.filter((b) => b.loose);

  const select = (id) => {
    setUi({ box: id });
    // On narrow screens the detail panel sits below the list, so bring it into view.
    if (window.innerWidth < 1080) scrollToId(DETAIL_ID, { behavior: 'smooth' });
  };
  const row = (b) => <BoxRow key={b.id} box={b} current={b.id === ui.box} onSelect={() => select(b.id)} />;

  return (
    <Panel
      span={7}
      title="Boxes"
      subtitle={item ? `Boxes of ${item}.` : 'Every labelled box and loose stock.'}
      actions={
        item && (
          <Button variant="small" onClick={() => setUi({ boxItem: null })}>
            Show all boxes
          </Button>
        )
      }
    >
      <div className="blist">
        <div className="bhead">
          <span>Box</span>
          <span>Item</span>
          <span>Fill</span>
          <span>Units</span>
          <span />
        </div>
        {boxes.map(row)}
        {!boxes.length && !loose.length && <Empty>No boxes yet.</Empty>}
        {loose.length > 0 && (
          <>
            <div className="sub">Loose stock, not in a labelled box</div>
            {loose.map(row)}
          </>
        )}
      </div>
    </Panel>
  );
}
