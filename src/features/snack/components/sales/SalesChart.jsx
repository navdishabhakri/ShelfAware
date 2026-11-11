import { PanelHeader } from '../../../../components/ui';
import { money } from '../../../../lib/format';

function byDay(sales) {
  const max = Math.max(...sales.week.map((d) => d[1]));
  return sales.week.map(([day, dollars, payments]) => ({
    key: day,
    className: day === 'Today' ? 'now' : undefined,
    height: (dollars / max) * 100,
    tip: `${day}\n${money(dollars)}, ${payments} payments`,
    x: day === 'Today' ? 'Today' : day.split(' ')[0],
  }));
}

function byHour(sales) {
  const max = Math.max(30, ...sales.hours.map((h) => h[2]));
  return sales.hours.map(([hour, payments, dollars]) =>
    hour > sales.nowHour
      ? { key: hour, className: 'future', tip: `${hour}:00\nNot yet`, x: hour }
      : {
          key: hour,
          className: hour === sales.nowHour ? 'now' : undefined,
          height: (dollars / max) * 100,
          tip: `${hour}:00 to ${hour + 1}:00\n${money(dollars)}, ${payments} payments`,
          x: hour,
        },
  );
}

/** Sales by hour (today) or by day (last 7 open days). The current hour or day is red. */
export function SalesChart({ sales, range }) {
  const week = range === 'week';
  const bars = week ? byDay(sales) : byHour(sales);
  return (
    <div>
      <PanelHeader
        title={week ? 'Sales by day' : 'Sales by hour'}
        subtitle={week ? 'Weekends closed.' : 'Stand hours 8:00 to 16:00. Red is the current hour.'}
      />
      <div className="sbars">
        {bars.map((b) => (
          <i
            key={b.key}
            className={b.className}
            style={b.height != null ? { height: `${b.height}%` } : undefined}
            tabIndex={0}
            data-tip={b.tip}
          />
        ))}
      </div>
      <div className="sbars-x" aria-hidden="true">
        {bars.map((b) => (
          <span key={b.key}>{b.x}</span>
        ))}
      </div>
    </div>
  );
}
