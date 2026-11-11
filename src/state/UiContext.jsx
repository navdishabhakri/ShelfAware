import { createContext, useCallback, useContext, useMemo, useState } from 'react';

const UiContext = createContext(null);

/** View state. Not saved, so a reload starts on the Warehouse with Tote bags open. */
export const INITIAL_UI = {
  loc: 'wh', // 'wh' | 'gr' | 'ss'
  // Warehouse
  box: 'BOX-001', // box shown in the detail panel
  whQuery: '',
  whFilter: 'all', // 'all' | 'reorder' | 'low' | 'ok' | 'reusable'
  openItem: 'Tote bags', // expanded row in the items table
  boxItem: 'Tote bags', // item the box list is filtered to, or null for all
  // Gaming room
  grQuery: '',
  grFilter: 'all', // 'all' | 'todo' | 'issues'
  // Snack stand
  salesRange: 'today', // 'today' | 'week'
};

export function UiProvider({ children }) {
  const [ui, setUiState] = useState(INITIAL_UI);
  /** setUi({ box: 'BOX-002' }) merges a patch; setUi(u => ({...})) also works. */
  const setUi = useCallback(
    (patch) => setUiState((u) => ({ ...u, ...(typeof patch === 'function' ? patch(u) : patch) })),
    [],
  );
  const value = useMemo(() => ({ ui, setUi }), [ui, setUi]);
  return <UiContext.Provider value={value}>{children}</UiContext.Provider>;
}

/** { ui, setUi } */
export function useUi() {
  const ctx = useContext(UiContext);
  if (!ctx) throw new Error('useUi must be used inside <UiProvider>');
  return ctx;
}
