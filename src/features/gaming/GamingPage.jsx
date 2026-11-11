import { PageHeader, Stack, StatStrip } from '../../components/ui';
import { useSession } from '../../state/SessionContext';
import { useStore } from '../../state/StoreContext';
import { auditSummary, openFindings } from '../../state/selectors';
import { AuditHistory } from './components/AuditHistory';
import { AuditPanel } from './components/AuditPanel';
import { FindingsPanel } from './components/FindingsPanel';
import './gaming.css';

export function GamingPage() {
  const { state } = useStore();
  const { isManager } = useSession();
  const a = auditSummary(state);
  const open = openFindings(state).length;

  return (
    <section className="page" aria-label="Gaming room">
      <PageHeader tone="k" title="Gaming room" description="Daily check of what's here and what shape it's in.">
        <StatStrip
          stats={[
            { label: 'Checked today', value: `${a.checked}/${a.total}` },
            { label: 'Open findings', value: open, tone: open ? 'bad' : undefined },
            { label: 'Equipment', value: a.total },
          ]}
        />
      </PageHeader>
      <div className="grid">
        <AuditPanel />
        <Stack span={4}>
          <FindingsPanel />
          {isManager && <AuditHistory />}
        </Stack>
      </div>
    </section>
  );
}
