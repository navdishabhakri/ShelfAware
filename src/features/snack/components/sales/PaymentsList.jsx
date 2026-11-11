import { PanelHeader } from '../../../../components/ui';
import { money } from '../../../../lib/format';
import { paymentTotal } from '../../../../state/sales';

const SHOW = 6;

export function PaymentsList({ payments }) {
  return (
    <div>
      <PanelHeader title="Latest payments" subtitle="From the Square Terminal." />
      <ul className="log pay">
        {payments.slice(0, SHOW).map((p, i) => (
          <li key={i}>
            <time>{p.t}</time>
            <span>
              {p.items.map(([n, q]) => `${q} × ${n}`).join(', ')}
              <small>{p.method}</small>
            </span>
            <b>{money(paymentTotal(p))}</b>
          </li>
        ))}
      </ul>
    </div>
  );
}
