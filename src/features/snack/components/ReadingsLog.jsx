import { Panel } from '../../../components/ui';
import { useStore } from '../../../state/StoreContext';

const SHOW = 30;

export function ReadingsLog() {
  const { state } = useStore();
  return (
    <Panel title="Recent readings">
      <ul className="log">
        {state.ssLog.slice(0, SHOW).map((l, i) => (
          <li key={i}>
            <time>{l.t}</time>
            <span>{l.text}</span>
          </li>
        ))}
      </ul>
    </Panel>
  );
}
