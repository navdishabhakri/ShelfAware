import { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react';

const ModalContext = createContext(null);
const InstanceContext = createContext(null);

/**
 * Shows one modal at a time. open(Component, props) replaces whatever is showing,
 * which is how modals chain (Receive, then Labels ready; Audit, then the next item).
 *
 * Each opened modal gets its own close() through useModalInstance(). It only closes
 * that instance, so a modal that opened the next one can't close it by accident.
 */
export function ModalProvider({ children }) {
  const [current, setCurrent] = useState(null);
  const seq = useRef(0);

  const open = useCallback((Component, props = {}) => {
    seq.current += 1;
    setCurrent({ id: seq.current, Component, props });
  }, []);
  const closeAll = useCallback(() => setCurrent(null), []);
  const api = useMemo(() => ({ open, close: closeAll }), [open, closeAll]);

  const instance = useMemo(
    () => current && { close: () => setCurrent((c) => (c?.id === current.id ? null : c)) },
    [current],
  );

  return (
    <ModalContext.Provider value={api}>
      {children}
      {current && (
        <InstanceContext.Provider value={instance}>
          <current.Component key={current.id} {...current.props} />
        </InstanceContext.Provider>
      )}
    </ModalContext.Provider>
  );
}

/** { open(Component, props), close() } */
export function useModal() {
  const ctx = useContext(ModalContext);
  if (!ctx) throw new Error('useModal must be used inside <ModalProvider>');
  return ctx;
}

/** { close() } for the modal this component is rendered in. */
export function useModalInstance() {
  return useContext(InstanceContext);
}
