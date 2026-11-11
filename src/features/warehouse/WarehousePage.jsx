import { PageHeader, StatStrip } from '../../components/ui';
import { useSession } from '../../state/SessionContext';
import { useStore } from '../../state/StoreContext';
import { openCheckouts, reorderVariants, unitsOut } from '../../state/selectors';
import { BoxDetail } from './components/BoxDetail';
import { BoxListPanel } from './components/BoxListPanel';
import { EventsPanel } from './components/EventsPanel';
import { ItemsPanel } from './components/ItemsPanel';
import { MovementChart } from './components/MovementChart';
import { RunningLowPanel } from './components/RunningLowPanel';
import { WarehouseFlags } from './components/WarehouseFlags';
import './warehouse.css';

export function WarehousePage() {
  const { state } = useStore();
  const { isManager } = useSession();
  const toReorder = reorderVariants(state).length;

  const stats = [
    { label: 'Item types', value: Object.keys(state.catalog).length },
    { label: 'Boxes', value: state.boxes.filter((b) => !b.loose).length },
    { label: 'Units on hand', value: state.boxes.reduce((a, b) => a + b.qty, 0).toLocaleString() },
    { label: 'Variants to reorder', value: toReorder, tone: toReorder ? 'bad' : undefined },
    { label: 'Out at events', value: unitsOut(openCheckouts(state)) },
  ];

  return (
    <section className="page" aria-label="Warehouse">
      <PageHeader
        tone="g"
        title="Warehouse"
        description="Stock by item and variant. Each box holds one variant and has its own QR label."
      >
        <StatStrip stats={stats} />
      </PageHeader>
      <WarehouseFlags />
      <div className="grid">
        <ItemsPanel />
        {/* Own row, so the sticky detail panel stops at the bottom of the box list
            instead of sliding over the charts below. */}
        <div className="box-split">
          <BoxListPanel />
          <BoxDetail />
        </div>
        {isManager && (
          <>
            <MovementChart />
            <RunningLowPanel />
            <EventsPanel />
          </>
        )}
      </div>
    </section>
  );
}
