import { useModal } from '../../../components/feedback/ModalContext';
import { Actions, Button, EmptyRow, Panel, Toolbar } from '../../../components/ui';
import { useSession } from '../../../state/SessionContext';
import { useStore } from '../../../state/StoreContext';
import { useUi } from '../../../state/UiContext';
import { filterItems } from '../../../state/selectors';
import { AddItemModal, ReceiveModal, ScanModal } from '../modals';
import { ItemRows } from './ItemRows';

const FILTERS = [
  { value: 'all', label: 'All' },
  { value: 'reorder', label: 'Reorder' },
  { value: 'low', label: 'Low stock' },
  { value: 'ok', label: 'In stock' },
  { value: 'reusable', label: 'Reusable' },
];

/** The main warehouse view: every item type, expandable to its variants and boxes. */
export function ItemsPanel() {
  const { state } = useStore();
  const { isManager } = useSession();
  const { ui, setUi } = useUi();
  const { open } = useModal();
  const items = filterItems(state, ui.whQuery, ui.whFilter);

  const toggle = (item) => {
    const next = ui.openItem === item ? null : item;
    setUi({ openItem: next, boxItem: next });
  };

  return (
    <Panel
      span={12}
      title="Items"
      subtitle="Every item type with its variations. Click a row to see variants and the boxes they're in."
      actions={
        <Actions>
          <Button variant="red" onClick={() => open(ScanModal)}>
            Scan a box
          </Button>
          {isManager && (
            <Button variant="alt" onClick={() => open(AddItemModal)}>
              Add item
            </Button>
          )}
          <Button onClick={() => open(ReceiveModal)}>Receive boxes</Button>
        </Actions>
      }
    >
      <Toolbar
        query={ui.whQuery}
        onQuery={(whQuery) => setUi({ whQuery })}
        placeholder="Search items, variants or box numbers"
        searchLabel="Search items"
        filters={FILTERS}
        filter={ui.whFilter}
        onFilter={(whFilter) => setUi({ whFilter })}
        filterLabel="Filter items"
      />
      <div className="tscroll">
        <table className="items">
          <thead>
            <tr>
              <th className="pcol">
                <span className="sr">Picture</span>
              </th>
              <th>Item</th>
              <th>Variants</th>
              <th className="n">Total</th>
              <th className="n">Boxes</th>
              <th>Status</th>
              <th className="n">
                <span className="sr">Expand</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <ItemRows key={item} item={item} expanded={ui.openItem === item} onToggle={() => toggle(item)} />
            ))}
            {!items.length && <EmptyRow colSpan={7}>No items match. Clear the search or pick another filter.</EmptyRow>}
          </tbody>
        </table>
      </div>
    </Panel>
  );
}
