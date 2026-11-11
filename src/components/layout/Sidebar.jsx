import logo from '../../assets/ssf-logo.png';
import { LOCATIONS } from '../../lib/constants';
import { useStore } from '../../state/StoreContext';
import { useSession } from '../../state/SessionContext';
import { useUi } from '../../state/UiContext';
import { locationBadges } from '../../state/selectors';
import { useModal } from '../feedback/ModalContext';
import { useToast } from '../feedback/ToastContext';
import { Diamond } from '../ui';
import { ResetDemoModal } from './ResetDemoModal';

/** Location menu, role switch and demo reset. Becomes a top bar on phones. */
export function Sidebar() {
  const { state } = useStore();
  const { role, setRole, who, title } = useSession();
  const { ui, setUi } = useUi();
  const { open } = useModal();
  const toast = useToast();
  const badges = locationBadges(state);

  const go = (loc) => {
    setUi({ loc });
    window.scrollTo({ top: 0 });
  };
  const switchRole = (r) => {
    setRole(r);
    toast(r === 'staff' ? 'Viewing as staff (Sam).' : 'Viewing as manager (Morgan).');
  };

  return (
    <aside className="side">
      <div className="brand">
        <img src={logo} alt="SSF" />
        <small>Inventory, ShelfAware prototype</small>
      </div>
      <nav aria-label="Locations">
        <div className="side-h">Locations</div>
        <div className="nav">
          {LOCATIONS.map((l) => (
            <button key={l.id} type="button" aria-current={ui.loc === l.id ? 'page' : 'false'} onClick={() => go(l.id)}>
              <Diamond tone={l.tone} />
              {l.label}
              <span className="badge">{badges[l.id] || ''}</span>
            </button>
          ))}
        </div>
      </nav>
      <div className="role">
        <div className="side-h">Viewing as</div>
        <div className="role-sw" role="group" aria-label="Role">
          {[
            ['mgr', 'Manager'],
            ['staff', 'Staff'],
          ].map(([r, label]) => (
            <button key={r} type="button" aria-pressed={role === r} onClick={() => switchRole(r)}>
              {label}
            </button>
          ))}
        </div>
        <div className="who">
          Signed in as {who}, {title}
        </div>
        <div className="side-foot">
          <span>Saved in this browser</span>
          <button type="button" onClick={() => open(ResetDemoModal)}>
            Reset demo
          </button>
        </div>
      </div>
    </aside>
  );
}
