import { Chip, ItemPicture, StockChip } from '../../../components/ui';
import { useStore } from '../../../state/StoreContext';
import {
  itemBoxes,
  itemCap,
  itemQty,
  itemReorder,
  itemState,
  itemUnitsOut,
  variantQty,
  variantState,
} from '../../../state/selectors';
import { VariantDetails } from './VariantDetails';

function ItemStatus({ item }) {
  const { state } = useStore();
  if (state.catalog[item].kind === 'Reusable') {
    const out = itemUnitsOut(state, item);
    return (
      <>
        <StockChip state="ok" />
        {out > 0 && (
          <>
            {' '}
            <Chip tone="info">{out} out</Chip>
          </>
        )}
      </>
    );
  }
  return <StockChip state={itemState(state, item)} />;
}

/** One item row and, when expanded, the variant details row under it. */
export function ItemRows({ item, expanded, onToggle }) {
  const { state } = useStore();
  const c = state.catalog[item];
  const reusable = c.kind === 'Reusable';
  const variants = Object.entries(c.variants);
  const boxes = itemBoxes(state, item);
  const boxed = boxes.filter((b) => !b.loose).length;
  const hasLoose = boxes.some((b) => b.loose);
  const rp = itemReorder(state, item);
  const toReorder = variants.filter(([v]) => variantState(state, item, v) === 'reorder').length;

  const onKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onToggle();
    }
  };

  return (
    <>
      <tr className="irow" aria-expanded={expanded} tabIndex={0} onClick={onToggle} onKeyDown={onKeyDown}>
        <td>
          <ItemPicture item={item} />
        </td>
        <td>
          <strong>{item}</strong>
          <small>
            {c.kind}
            {rp ? `, reorder at ${rp}` : ''}
            {toReorder > 0 && (
              <>
                , <span style={{ color: 'var(--crit)' }}>{toReorder} variant{toReorder > 1 ? 's' : ''} to reorder</span>
              </>
            )}
          </small>
        </td>
        <td>
          <div className="vchips">
            {variants.map(([v, d]) => (
              <span key={v} className={`vchip ${reusable ? '' : variantState(state, item, v)}`} title={d.name}>
                <i style={{ background: d.color }} />
                {v} <b>{variantQty(state, item, v)}</b>
              </span>
            ))}
          </div>
        </td>
        <td className="n">
          <span className="tot num">{itemQty(state, item)}</span>
          {reusable && <small>of {itemCap(state, item)}</small>}
        </td>
        <td className="n num">
          {boxed}
          {hasLoose && <small>+ loose</small>}
        </td>
        <td>
          <ItemStatus item={item} />
        </td>
        <td className="n">
          <span className="chev" aria-hidden="true" />
        </td>
      </tr>
      {expanded && <VariantDetails item={item} />}
    </>
  );
}
