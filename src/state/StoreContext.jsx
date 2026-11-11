import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { produce } from 'immer';
import { seed, seedSales } from '../data/seed';
import { STORAGE_KEY } from '../lib/constants';
import { readJSON, writeJSON } from '../lib/storage';

const StoreContext = createContext(null);

function loadState() {
  const saved = readJSON(STORAGE_KEY);
  if (!saved?.boxes) return seed();
  return saved.sales ? saved : { ...saved, sales: seedSales() };
}

/**
 * Holds the whole app state `S` (the stand-in for a backend) and saves it to localStorage.
 *
 * update(fn) runs fn on an Immer draft, so actions can be written as plain mutations.
 * It applies synchronously and returns whatever fn returns, which lets a modal use
 * a new id straight away (for example, the boxes that Receive just created).
 */
export function StoreProvider({ children }) {
  const [state, setState] = useState(loadState);
  const latest = useRef(state);

  const update = useCallback((fn) => {
    let result;
    const next = produce(latest.current, (draft) => {
      result = fn(draft);
    });
    latest.current = next;
    setState(next);
    return result;
  }, []);

  const reset = useCallback(() => {
    latest.current = seed();
    setState(latest.current);
  }, []);

  useEffect(() => writeJSON(STORAGE_KEY, state), [state]);

  const value = useMemo(() => ({ state, update, reset }), [state, update, reset]);
  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

/** { state, update, reset } */
export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error('useStore must be used inside <StoreProvider>');
  return ctx;
}
