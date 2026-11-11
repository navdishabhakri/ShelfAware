import { Panel } from '../../../components/ui';
import { useStore } from '../../../state/StoreContext';
import { runningLow } from '../../../state/selectors';

/** Five variants closest to their reorder point. The track's tick marks the reorder point. */
export function RunningLowPanel() {
  const { state } = useStore();
  return (
    <Panel span={3} title="Running low" subtitle="By variant. Line marks the reorder point.">
      <div className="mini-list">
        {runningLow(state).map((x) => (
          <div className="ml" key={x.name}>
            <strong>{x.name}</strong>
            <span className="q">{x.qty}</span>
            <span className="track">
              <b
                className={x.state === 'low' ? 'near' : undefined}
                style={{
                  width: `${Math.min(100, (x.qty / (x.reorder * 1.5)) * 100)}%`,
                  ...(x.state === 'ok' ? { background: 'var(--ink-2)' } : {}),
                }}
              />
            </span>
            <small>Reorder at {x.reorder}</small>
          </div>
        ))}
      </div>
    </Panel>
  );
}
