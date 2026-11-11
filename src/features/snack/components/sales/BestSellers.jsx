import { PanelHeader } from '../../../../components/ui';
import { PRICES } from '../../../../lib/constants';
import { money } from '../../../../lib/format';
import { bestSellers } from '../../../../state/sales';

export function BestSellers({ sales, range }) {
  const top = bestSellers(sales, range);
  const max = top[0]?.[1] || 1;
  return (
    <div>
      <PanelHeader
        title="Best sellers"
        subtitle={range === 'week' ? 'Units sold, last 7 open days.' : 'Units sold today.'}
      />
      <div className="top">
        {top.map(([name, q]) => (
          <div className="top-r" key={name}>
            <strong>{name}</strong>
            <span>
              <b>{q}</b> sold, {money(q * PRICES[name])}
            </span>
            <span className="track">
              <i style={{ width: `${(q / max) * 100}%` }} />
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
