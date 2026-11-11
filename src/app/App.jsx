import { Sidebar } from '../components/layout/Sidebar';
import { GamingPage } from '../features/gaming/GamingPage';
import { SnackPage } from '../features/snack/SnackPage';
import { WarehousePage } from '../features/warehouse/WarehousePage';
import { useUi } from '../state/UiContext';

const PAGES = { wh: WarehousePage, gr: GamingPage, ss: SnackPage };

export function App() {
  const { ui } = useUi();
  const Page = PAGES[ui.loc];
  return (
    <div className="app">
      <Sidebar />
      <main className="main">
        <Page />
        <p className="note">
          Prototype with sample data based on the SSF stakeholder brief (v0.2). Changes are saved in this browser only.
          Use Reset demo in the sidebar to start over.
        </p>
      </main>
    </div>
  );
}
