import { Panel } from '../../../components/ui';
import { useStore } from '../../../state/StoreContext';
import { auditSummary } from '../../../state/selectors';

/** Audit completion for the last 10 open days. Today is computed live; days under 90% are amber. */
export function AuditHistory() {
  const { state } = useStore();
  const a = auditSummary(state);
  const days = [...state.audit, [a.percent, 'Today', `${a.checked} of ${a.total}${a.todo ? ', in progress' : ''}`]];

  return (
    <Panel title="Audit completion" subtitle="Last 10 open days.">
      <div className="cols">
        {days.map(([pct, day, tip]) => (
          <i
            key={day}
            className={day === 'Today' ? 'today' : pct < 90 ? 'short' : undefined}
            style={{ height: `${pct}%` }}
            tabIndex={0}
            data-tip={`${day}\n${tip}`}
          />
        ))}
      </div>
      <div className="cols-x" aria-hidden="true">
        {days.map(([, day]) => (
          <span key={day}>{day === 'Today' ? 'Today' : day.split(' ')[0]}</span>
        ))}
      </div>
    </Panel>
  );
}
