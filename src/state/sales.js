// Square sales figures for the snack stand. Pure functions over S.sales.
import { PRICES } from '../lib/constants';

export const todaySales = (sales) => sales.week[sales.week.length - 1];
export const paymentTotal = (p) => p.items.reduce((a, [name, q]) => a + PRICES[name] * q, 0);

/**
 * Key numbers for the sales section.
 * range: 'today' | 'week'. Day rows are [label, dollars, payments, units].
 */
export function salesSummary(sales, range) {
  const week = range === 'week';
  const days = week ? sales.week : [todaySales(sales)];
  const sum = (k) => days.reduce((a, d) => a + d[k], 0);
  const revenue = sum(1);
  const payments = sum(2);
  const units = sum(3);

  const past = sales.week.slice(0, -1);
  const usualDay = past.reduce((a, d) => a + d[1], 0) / past.length;

  // Compare today with the same point in a usual day, using the share of open hours done so far.
  const openHours = sales.hours.length;
  const hoursDone = Math.max(1, sales.nowHour - sales.hours[0][0] + 1);
  const pace = revenue / (hoursDone / openHours);
  const paceVsUsual = Math.round((pace / usualDay - 1) * 100);

  return {
    week,
    revenue,
    payments,
    units,
    average: payments ? revenue / payments : 0,
    perDay: revenue / days.length,
    usualDay,
    paceVsUsual,
  };
}

/** Best sellers, most units first: [[name, units], ...]. */
export const bestSellers = (sales, range) =>
  Object.entries(range === 'week' ? sales.weekSold : sales.sold).sort((a, b) => b[1] - a[1]);
