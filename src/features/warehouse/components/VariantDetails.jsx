import { useModal } from '../../../components/feedback/ModalContext';
import { BoxId, Button, ItemPicture, StockChip } from '../../../components/ui';
import { useSession } from '../../../state/SessionContext';
import { useStore } from '../../../state/StoreContext';
import { variantBoxes, variantCap, variantQty, variantState } from '../../../state/selectors';
import { AddVariantModal, PhotoModal, ReceiveModal, ReorderPointsModal } from '../modals';
import { useWarehouseNav } from '../useWarehouseNav';

/** Expanded part of an item row: each variant with its boxes, plus the item's actions. */
export function VariantDetails({ item }) {
  const { state } = useStore();
  const { isManager } = useSession();
  const { open } = useModal();
  const { showBox } = useWarehouseNav();
  const c = state.catalog[item];
  const reusable = c.kind === 'Reusable';

  return (
    <tr className="vwrap">
      <td colSpan={7}>
        <div className="vgrid">
          <div className="vr h">
            <span />
            <span>Variant</span>
            <span style={{ textAlign: 'right' }}>Units</span>
            <span>Boxes</span>
            <span>Status</span>
          </div>
          {Object.entries(c.variants).map(([v, d]) => {
            const boxes = variantBoxes(state, item, v);
            return (
              <div className="vr" key={v}>
                <ItemPicture item={item} variant={v} small />
                <span>
                  <strong>
                    {item} {v}
                  </strong>
                  <small>
                    {d.name}
                    {d.reorder ? `, reorder at ${d.reorder}` : ''}
                  </small>
                </span>
                <span className="q">
                  {variantQty(state, item, v)}
                  {reusable && <small>of {variantCap(state, item, v)}</small>}
                </span>
                <span className="vboxes">
                  {boxes.length ? (
                    boxes.map((b) => (
                      <button
                        key={b.id}
                        type="button"
                        title={`${b.qty} units`}
                        onClick={() => showBox(b.id, { filterToItem: true })}
                      >
                        <BoxId box={b} looseLabel="Loose" />
                      </button>
                    ))
                  ) : (
                    <span className="muted">None in stock</span>
                  )}
                </span>
                <span>{!reusable && <StockChip state={variantState(state, item, v)} />}</span>
              </div>
            );
          })}
          <div className="vacts">
            <Button variant="small" onClick={() => open(ReceiveModal, { item })}>
              Receive {item.toLowerCase()}
            </Button>
            {isManager && (
              <>
                <Button variant="small" onClick={() => open(AddVariantModal, { item })}>
                  Add variant
                </Button>
                {!reusable && (
                  <Button variant="small" onClick={() => open(ReorderPointsModal, { item })}>
                    Edit reorder points
                  </Button>
                )}
                <Button variant="small" onClick={() => open(PhotoModal, { item })}>
                  {c.img ? 'Change photo' : 'Add photo'}
                </Button>
              </>
            )}
          </div>
        </div>
      </td>
    </tr>
  );
}
