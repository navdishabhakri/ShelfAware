import { Panel } from '../../../components/ui';
import { useStore } from '../../../state/StoreContext';

const Legend = () => (
  <div className="legend">
    <span>
      <i style={{ background: 'var(--received)' }} />
      Received
    </span>
    <span>
      <i style={{ background: 'var(--issued)' }} />
      Out
    </span>
  </div>
);

/** Received above the line, out below, for the last 14 days. Weekends (closed) are hatched. */
export function MovementChart() {
  const { state } = useStore();
  const days = state.move; // [label, received | null, out | null]
  const max = Math.max(60, ...days.flatMap(([, r, o]) => [r || 0, o || 0]));
  const top = Math.ceil(max / 20) * 20;
  const h = (n) => `${(n / top) * 50}%`;

  return (
    <Panel
      span={6}
      title="In and out, 14 days"
      subtitle="Transfers aren't shown since they don't change total stock."
      actions={<Legend />}
    >
      <div className="move">
        <div className="move-axis num" aria-hidden="true">
          <span>{top}</span>
          <span>0</span>
          <span>{top}</span>
        </div>
        <div className="move-plot">
          <div className="move-cols">
            {days.map(([d, r, o]) =>
              r === null ? (
                <div key={d} className="mc wkend" tabIndex={0} data-tip={`${d}\nClosed`} />
              ) : (
                <div key={d} className="mc" tabIndex={0} data-tip={`${d}\nReceived ${r}\nOut ${o}`}>
                  <i className="up" style={{ height: h(r) }} />
                  <i className="dn" style={{ height: h(o) }} />
                </div>
              ),
            )}
          </div>
          <div className="move-x" aria-hidden="true">
            {days.map(([d]) => (
              <span key={d}>{d === 'Today' ? 'Today' : d.split(' ')[1]}</span>
            ))}
          </div>
        </div>
      </div>
    </Panel>
  );
}
