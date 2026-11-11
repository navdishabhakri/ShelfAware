import { andList } from '../../../lib/format';
import { useStore } from '../../../state/StoreContext';
import { useUi } from '../../../state/UiContext';
import { outstanding, warehouseFlags } from '../../../state/selectors';
import { useWarehouseNav } from '../useWarehouseNav';

function FlagText({ flag }) {
  if (flag.kind === 'count') {
    const f = flag.countFlag;
    return (
      <>
        <span className="boxid">{flag.box}</span>
        <span>
          <b>
            Counted {f.counted}, expected {f.expected}.
          </b>{' '}
          {f.who}, {f.t.replace('Today ', '')}
        </span>
      </>
    );
  }
  if (flag.kind === 'reorder') {
    return (
      <span>
        <b>{andList(flag.names)}</b> {flag.names.length > 1 ? 'need' : 'needs'} reordering.
      </span>
    );
  }
  const c = flag.checkout;
  return (
    <span>
      <b>
        {outstanding(c)} {c.item}
      </b>{' '}
      still out from {c.event}.
    </span>
  );
}

/** One row of clickable alerts: count differences, variants to reorder, event items not back. */
export function WarehouseFlags() {
  const { state } = useStore();
  const { setUi } = useUi();
  const { showBox } = useWarehouseNav();
  const flags = warehouseFlags(state);
  if (!flags.length) return null;

  const onClick = (f) => {
    if (f.box) showBox(f.box);
    if (f.filter) setUi({ whFilter: f.filter });
  };

  return (
    <div className="flags">
      {flags.map((f, i) => (
        <button key={i} type="button" className={`flag${f.crit ? ' crit' : ''}`} onClick={() => onClick(f)}>
          <FlagText flag={f} />
        </button>
      ))}
    </div>
  );
}
