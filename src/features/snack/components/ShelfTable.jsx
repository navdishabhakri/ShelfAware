import { useModal } from '../../../components/feedback/ModalContext';
import { useToast } from '../../../components/feedback/ToastContext';
import { Button, Chip } from '../../../components/ui';
import { confirmReading, dismissReading } from '../../../state/actions/snack';
import { useSession } from '../../../state/SessionContext';
import { useStore } from '../../../state/StoreContext';
import { HandCountModal } from '../modals/HandCountModal';

const STATUS_CHIP = {
  match: <Chip tone="good">Matches</Chip>,
  review: <Chip tone="warn">Needs review</Chip>,
  blocked: <Chip tone="crit">View blocked</Chip>,
};

/** What the records say vs. what the shelf sees, with the review actions. */
export function ShelfTable() {
  const { state, update } = useStore();
  const { who } = useSession();
  const { open } = useModal();
  const toast = useToast();

  const confirm = (s) => {
    update((d) => confirmReading(d, { name: s.name, who }));
    toast(`${s.name} stock set to ${s.obs}.`);
  };
  const dismiss = (s) => {
    update((d) => dismissReading(d, { name: s.name, who }));
    toast('Reading dismissed. Counted as a false change.');
  };

  return (
    <div className="tscroll">
      <table>
        <thead>
          <tr>
            <th>Product</th>
            <th className="n">Records</th>
            <th className="n">Shelf sees</th>
            <th className="n">Sold today</th>
            <th>Status</th>
            <th className="n">
              <span className="sr">Action</span>
            </th>
          </tr>
        </thead>
        <tbody>
          {state.shelf.map((s) => (
            <tr key={s.name}>
              <td>
                <strong>{s.name}</strong>
              </td>
              <td className="n num">{s.rec}</td>
              <td className="n num">{s.obs === null ? '–' : s.obs}</td>
              <td className="n num">{state.sales.sold[s.name] || 0}</td>
              <td>{STATUS_CHIP[s.status]}</td>
              <td className="n">
                {s.status === 'review' ? (
                  <>
                    <Button variant="small" onClick={() => confirm(s)}>
                      Confirm {s.obs}
                    </Button>{' '}
                    <Button variant="small" onClick={() => dismiss(s)}>
                      Dismiss
                    </Button>
                  </>
                ) : (
                  <Button variant="small" onClick={() => open(HandCountModal, { name: s.name })}>
                    {s.status === 'blocked' ? 'Count by hand' : 'Count'}
                  </Button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
