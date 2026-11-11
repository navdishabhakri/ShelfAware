import { Empty, Panel } from '../../../components/ui';
import { useStore } from '../../../state/StoreContext';
import { boxById, openCheckouts, outstanding } from '../../../state/selectors';

/** Reusable items still out at events, with a bar of available vs. still out. */
export function EventsPanel() {
  const { state } = useStore();
  const checkouts = openCheckouts(state);

  return (
    <Panel span={3} title="At events" subtitle="Reusable items not back yet.">
      <div className="ev">
        {checkouts.length ? (
          checkouts.map((c) => {
            const b = boxById(state, c.boxId);
            const owned = b ? b.cap : c.qty;
            const available = b ? b.qty : 0;
            const out = outstanding(c);
            return (
              <div key={c.id}>
                <strong>{c.event}</strong>
                <span>
                  {out} of {c.qty} {c.item}, {c.who}, due {c.due}
                </span>
                <div className="ret" data-tip={`Owned ${owned}\nAvailable ${available}\nStill out ${out}`}>
                  <i className="a" style={{ flex: available }} />
                  <i className="o" style={{ flex: out }} />
                </div>
              </div>
            );
          })
        ) : (
          <Empty>Everything is back.</Empty>
        )}
      </div>
    </Panel>
  );
}
