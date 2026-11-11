import { FilterChips, Panel } from '../../../../components/ui';
import { useStore } from '../../../../state/StoreContext';
import { useUi } from '../../../../state/UiContext';
import { salesSummary } from '../../../../state/sales';
import { BestSellers } from './BestSellers';
import { PaymentsList } from './PaymentsList';
import { SalesChart } from './SalesChart';
import { SalesKpis } from './SalesKpis';

const RANGES = [
  { value: 'today', label: 'Today' },
  { value: 'week', label: 'Last 7 days' },
];

/**
 * Square Terminal sales (sample data). Goes beyond the brief, which put POS integration
 * out of scope; still to be confirmed with SSF.
 */
export function SalesSection() {
  const { state } = useStore();
  const { ui, setUi } = useUi();
  const sales = state.sales;
  const range = ui.salesRange;
  const summary = salesSummary(sales, range);

  return (
    <>
      <div className="section-break">
        <h3>Sales</h3>
        <span className="sq">Square Terminal connected, last sync {sales.lastSync}</span>
        <FilterChips
          options={RANGES}
          value={range}
          onChange={(salesRange) => setUi({ salesRange })}
          label="Sales period"
        />
      </div>
      <Panel span={12} className="sales">
        <SalesKpis summary={summary} />
        <div className="sales-grid">
          <SalesChart sales={sales} range={range} />
          <BestSellers sales={sales} range={range} />
          <PaymentsList payments={sales.pays} />
        </div>
      </Panel>
    </>
  );
}
