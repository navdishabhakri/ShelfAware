import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import '../../styles/toast.css';

const ToastContext = createContext(null);
const SHOW_MS = 2800;

/** One short confirmation at a time, bottom centre. The message echoes the button's verb. */
export function ToastProvider({ children }) {
  const [msg, setMsg] = useState('');
  const [show, setShow] = useState(false);
  const timer = useRef();

  const toast = useCallback((text) => {
    setMsg(text);
    setShow(true);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setShow(false), SHOW_MS);
  }, []);
  useEffect(() => () => clearTimeout(timer.current), []);

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <div className={`toast${show ? ' show' : ''}`} role="status" aria-live="polite">
        {msg}
      </div>
    </ToastContext.Provider>
  );
}

/** toast('Count saved.') */
export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used inside <ToastProvider>');
  return ctx;
}
