import { useStore } from '../../state/StoreContext';
import { boxName, variantName } from '../../state/selectors';
import { labelCode } from '../../lib/qr';
import { QRCode } from './QRCode';
import './labels.css';

/** The 4 × 2 in box label: brand stripe, QR code, box number, variant, quantity and shelf. */
export function BoxLabel({ box }) {
  const { state } = useStore();
  return (
    <div className="qlabel">
      <div className="qstripe">
        <i />
        <i />
        <i />
      </div>
      <QRCode text={labelCode(box.id)} />
      <div className="qtext">
        <span className="qid">{box.id}</span>
        <span className="qitem">{boxName(box)}</span>
        <span className="qvar">{variantName(state, box)}</span>
        <span className="qmeta">
          {box.rec} units, received {box.received}
        </span>
        <span className="qorg">SSF Warehouse, shelf {box.shelf}</span>
      </div>
    </div>
  );
}
