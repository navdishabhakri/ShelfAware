import { useToast } from '../../components/feedback/ToastContext';
import { Actions, Button, PageHeader, Panel, Stack, StatStrip } from '../../components/ui';
import { money } from '../../lib/format';
import { simulateReading, simulateSale } from '../../state/actions/snack';
import { todaySales } from '../../state/sales';
import { useSession } from '../../state/SessionContext';
import { useStore } from '../../state/StoreContext';
import { shelfNeedingAttention } from '../../state/selectors';
import { ReadingsLog } from './components/ReadingsLog';
import { SalesSection } from './components/sales/SalesSection';
import { ShelfTable } from './components/ShelfTable';
import { ShelfView } from './components/ShelfView';
import { TrialMetrics } from './components/TrialMetrics';
import './snack.css';

export function SnackPage() {
  const { state, update } = useStore();
  const { isManager } = useSession();
  const toast = useToast();
  const need = shelfNeedingAttention(state).length;

  const sale = () => {
    const total = update(simulateSale);
    toast(total === null ? 'Nothing left to sell. Count the shelf or restock first.' : `Sale of ${money(total)} received from Square.`);
  };
  const reading = () => {
    const name = update(simulateReading);
    toast(name === null ? 'Every slot already needs attention. Review those first.' : `New reading for ${name}.`);
  };

  return (
    <section className="page" aria-label="Snack stand">
      <PageHeader
        tone="r"
        title="Snack stand"
        description="Smart shelf trial and Square sales. Shelf changes with no matching sale need review."
      >
        <StatStrip
          stats={[
            { label: 'Camera', value: 'Online', tone: 'ok' },
            { label: 'Last reading', value: state.ssLog[0]?.t || '–' },
            { label: 'Need attention', value: need, tone: need ? 'bad' : undefined },
            { label: 'Sales today', value: money(todaySales(state.sales)[1]), hidden: !isManager },
          ]}
        />
      </PageHeader>
      <div className="grid">
        <Panel
          span={7}
          title="Shelf right now"
          subtitle="Yellow outline means the shelf and the records disagree."
          actions={
            isManager && (
              <Actions>
                <Button variant="alt" onClick={sale}>
                  Simulate a sale
                </Button>
                <Button variant="alt" onClick={reading}>
                  Simulate a reading
                </Button>
              </Actions>
            )
          }
        >
          <ShelfView />
          <ShelfTable />
        </Panel>
        <Stack span={5}>
          {isManager && <TrialMetrics />}
          <ReadingsLog />
        </Stack>
        {isManager && <SalesSection />}
      </div>
    </section>
  );
}
