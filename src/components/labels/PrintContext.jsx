import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { useStore } from '../../state/StoreContext';
import { boxById } from '../../state/selectors';
import { BoxLabel } from './BoxLabel';

const PrintContext = createContext(null);

/**
 * printLabels(boxIds) fills a hidden print area with one label per page and opens
 * the browser print dialog. Print CSS (labels.css) hides everything else.
 */
export function PrintProvider({ children }) {
  const { state } = useStore();
  const [job, setJob] = useState(null); // { ids, n }

  const printLabels = useCallback((ids) => setJob((j) => ({ ids, n: (j?.n ?? 0) + 1 })), []);

  useEffect(() => {
    if (!job) return;
    const t = setTimeout(() => window.print(), 50); // let the labels render first
    return () => clearTimeout(t);
  }, [job]);

  const boxes = (job?.ids ?? []).map((id) => boxById(state, id)).filter(Boolean);

  return (
    <PrintContext.Provider value={printLabels}>
      {children}
      {createPortal(
        <div id="print-area">
          {boxes.map((b) => (
            <BoxLabel key={b.id} box={b} />
          ))}
        </div>,
        document.body,
      )}
    </PrintContext.Provider>
  );
}

/** printLabels(['BOX-062', 'BOX-063']) */
export function usePrintLabels() {
  const ctx = useContext(PrintContext);
  if (!ctx) throw new Error('usePrintLabels must be used inside <PrintProvider>');
  return ctx;
}
