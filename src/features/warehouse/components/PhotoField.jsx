import { Field } from '../../../components/ui';

/** Image picker. On a phone, capture="environment" opens the back camera. */
export function PhotoField({ onChange }) {
  return (
    <Field label="Photo (optional)">
      <input type="file" accept="image/*" capture="environment" onChange={(e) => onChange(e.target.files?.[0] ?? null)} />
    </Field>
  );
}
