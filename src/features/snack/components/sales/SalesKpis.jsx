import { MINUS, money } from '../../../../lib/format';

function Pace({ pct }) {
  const up = pct >= 0;
  return (
    <>
      <em className={up ? 'up' : 'down'}>
        {up ? '+' : MINUS}
        {Math.abs(pct)}%
      </em>{' '}
      on pace vs. a usual day
    </>
  );
}

function Kpi({ value, children }) {
  return (
    <div>
      <b>{value}</b>
      <span>{children}</span>
    </div>
  );
}

/** Five headline numbers for the selected period, from salesSummary(). */
export function SalesKpis({ summary: s }) {
  return (
    <div className="sales-kpis">
      <Kpi value={money(s.revenue)}>{s.week ? 'Sales, last 7 open days' : <Pace pct={s.paceVsUsual} />}</Kpi>
      <Kpi value={s.payments}>Payments</Kpi>
      <Kpi value={money(s.average)}>Average sale</Kpi>
      <Kpi value={s.units}>Items sold</Kpi>
      <Kpi value={money(s.week ? s.perDay : s.usualDay)}>{s.week ? 'Per open day' : 'Usual full day'}</Kpi>
    </div>
  );
}
