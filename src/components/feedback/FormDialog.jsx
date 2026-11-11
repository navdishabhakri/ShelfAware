import { useEffect, useRef, useState } from 'react';
import { useModalInstance } from './ModalContext';
import '../../styles/dialog.css';

const FIRST_FIELD =
  '.dlg-body input:not([type=hidden]):not([type=radio]):not([type=checkbox]), .dlg-body select, .dlg-body textarea';

/**
 * The shell every modal uses: a native <dialog> with a title, body, error line and actions.
 *
 * onSubmit() runs on submit. Return an error string to keep the dialog open and show it
 * (say what to do next, don't apologize). Return nothing to close. If onSubmit opened
 * another modal, that one stays open.
 */
export function FormDialog({
  title,
  submitLabel = 'Save',
  cancelLabel = 'Cancel',
  danger = false,
  wide = false,
  hideSubmit = false,
  onSubmit,
  children,
}) {
  const dialogRef = useRef(null);
  const { close } = useModalInstance();
  const [error, setError] = useState('');

  useEffect(() => {
    const dlg = dialogRef.current;
    if (!dlg.open) dlg.showModal();
    (dlg.querySelector(FIRST_FIELD) || dlg.querySelector('[type=submit]'))?.focus();
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    const err = onSubmit?.();
    if (err) setError(err);
    else close();
  };

  return (
    // onClose covers Escape. Unmounting an open dialog needs no close() call.
    <dialog ref={dialogRef} className={wide ? 'wide' : undefined} onClose={close}>
      <form className="dlg-form" noValidate onSubmit={handleSubmit} onChange={() => setError('')}>
        <div className="dlg-head">
          <h3>{title}</h3>
          <button className="x" type="button" aria-label="Close" onClick={close}>
            &times;
          </button>
        </div>
        <div className="dlg-body">{children}</div>
        <p className="dlg-err" role="alert">
          {error}
        </p>
        <div className="dlg-actions">
          <button className="btn alt" type="button" onClick={close}>
            {cancelLabel}
          </button>
          {!hideSubmit && (
            <button className={`btn${danger ? ' red' : ''}`} type="submit">
              {submitLabel}
            </button>
          )}
        </div>
      </form>
    </dialog>
  );
}
