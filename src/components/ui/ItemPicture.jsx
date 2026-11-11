import { useStore } from '../../state/StoreContext';
import { ITEM_ICONS } from './itemIcons';

/**
 * Item thumbnail. Uses the item's photo when there is one (item level only),
 * otherwise the drawing for its type in the variant's colour.
 */
export function ItemPicture({ item, variant, small = false }) {
  const { state } = useStore();
  const c = state.catalog[item];
  const cls = `pic${small ? ' sm' : ''}`;

  if (c?.img && !variant) {
    return (
      <span className={cls}>
        <img src={c.img} alt="" />
      </span>
    );
  }
  const color = variant ? c?.variants[variant]?.color : Object.values(c?.variants || {})[0]?.color;
  const draw = ITEM_ICONS[c?.icon] || ITEM_ICONS.box;
  return (
    <span className={cls} aria-hidden="true">
      <svg viewBox="0 0 48 48">{draw(color || '#ccc')}</svg>
    </span>
  );
}
