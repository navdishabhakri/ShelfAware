import { Panel } from '../../../components/ui';
import { useStore } from '../../../state/StoreContext';

/** The brief's SS01 measures for the smart shelf trial. */
export function TrialMetrics() {
  const { state } = useStore();
  const T = state.trial;
  const metrics = [
    [T.err.toFixed(1), 'Avg count error, units'],
    [T.falseChanges, 'False changes this week'],
    [`${T.delay}s`, 'Median update delay'],
    [T.reviewed, `Readings reviewed (${T.confirmed} confirmed, ${T.dismissed} dismissed)`],
  ];
  return (
    <Panel title="Trial so far" subtitle="Compared with manual counts. Targets set after the baseline week.">
      <div className="metrics">
        {metrics.map(([value, label]) => (
          <div key={label}>
            <b>{value}</b>
            <span>{label}</span>
          </div>
        ))}
      </div>
    </Panel>
  );
}
