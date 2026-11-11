import { useStore } from '../../../state/StoreContext';

/** Picture of the shelf as the camera sees it. Decorative; the table below has the same data. */
export function ShelfView() {
  const { state } = useStore();
  return (
    <div className="shelf" aria-hidden="true">
      {state.shelf.map((s) => (
        <div key={s.name} className={`slot${s.status === 'match' ? '' : ` ${s.status}`}`}>
          <b>{s.obs === null ? '?' : s.obs}</b>
          <small>{s.name}</small>
        </div>
      ))}
    </div>
  );
}
