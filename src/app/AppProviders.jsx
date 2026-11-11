import { ModalProvider } from '../components/feedback/ModalContext';
import { ToastProvider } from '../components/feedback/ToastContext';
import { PrintProvider } from '../components/labels/PrintContext';
import { SessionProvider } from '../state/SessionContext';
import { StoreProvider } from '../state/StoreContext';
import { UiProvider } from '../state/UiContext';

/**
 * Order matters: modals render inside every other provider so they can use them all,
 * and the print area needs the store to look up boxes.
 */
export function AppProviders({ children }) {
  return (
    <ToastProvider>
      <SessionProvider>
        <StoreProvider>
          <UiProvider>
            <PrintProvider>
              <ModalProvider>{children}</ModalProvider>
            </PrintProvider>
          </UiProvider>
        </StoreProvider>
      </SessionProvider>
    </ToastProvider>
  );
}
