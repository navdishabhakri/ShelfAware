import { useEffect, useRef, useState } from 'react';
import { FormDialog } from '../../../components/feedback/FormDialog';
import { useModalInstance } from '../../../components/feedback/ModalContext';
import { Field, TextInput } from '../../../components/ui';
import { useStore } from '../../../state/StoreContext';
import { findBoxByCode } from '../../../state/selectors';
import { useWarehouseNav } from '../useWarehouseNav';

const SCAN_EVERY_MS = 300;

/**
 * Reads a box label with the camera. QR decoding needs BarcodeDetector (Chrome on Android,
 * some desktop Chrome) and a secure context (https or localhost). Typing the number always works.
 */
export function ScanModal() {
  const { state } = useStore();
  const { close } = useModalInstance();
  const { openScannedBox } = useWarehouseNav();
  const videoRef = useRef(null);
  const [camOff, setCamOff] = useState(false);
  const [msg, setMsg] = useState('Starting the camera…');
  const [code, setCode] = useState('');

  // Keep the latest state and callbacks for the detection loop without restarting the camera.
  const latest = useRef(null);
  useEffect(() => {
    latest.current = { state, close, openScannedBox };
  });

  useEffect(() => {
    let stream;
    let timer;
    let cancelled = false;

    async function start() {
      if (!navigator.mediaDevices?.getUserMedia) {
        setCamOff(true);
        setMsg('No camera on this device. Type the box number instead.');
        return;
      }
      try {
        stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
        if (cancelled) return;
        const v = videoRef.current;
        v.srcObject = stream;
        await v.play();
        if (!('BarcodeDetector' in window)) {
          setMsg("Camera is on, but this browser can't read QR codes. Chrome on Android can. Type the box number below.");
          return;
        }
        const detector = new window.BarcodeDetector({ formats: ['qr_code'] });
        setMsg('Point the camera at the label.');
        timer = setInterval(async () => {
          try {
            const [hit] = await detector.detect(v);
            if (!hit || cancelled) return;
            const { state: S, close: done, openScannedBox: go } = latest.current;
            const b = findBoxByCode(S, hit.rawValue);
            if (b) {
              done();
              go(b);
            } else setMsg(`Read "${hit.rawValue}", but that box isn't in the system.`);
          } catch {
            /* frame not ready, try again on the next tick */
          }
        }, SCAN_EVERY_MS);
      } catch {
        if (cancelled) return;
        setCamOff(true);
        setMsg('Camera not available or permission denied. Type the box number instead.');
      }
    }

    start();
    return () => {
      cancelled = true;
      clearInterval(timer);
      stream?.getTracks().forEach((t) => t.stop());
    };
  }, []);

  const submit = () => {
    const c = code.trim();
    if (!c) return 'Type a box number, or scan the label.';
    const b = findBoxByCode(state, c);
    if (!b) return `No box matches "${c}".`;
    openScannedBox(b);
  };

  return (
    <FormDialog title="Scan a box" submitLabel="Open box" onSubmit={submit}>
      <div className="cam" hidden={camOff}>
        <video ref={videoRef} playsInline muted />
      </div>
      <p className="cam-msg">{msg}</p>
      <Field label="Or type the box number">
        <TextInput value={code} onChange={setCode} placeholder="BOX-001 or just 1" autoComplete="off" />
      </Field>
    </FormDialog>
  );
}
