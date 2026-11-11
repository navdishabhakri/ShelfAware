import { Checkbox, Field, NumberInput, Row } from '../../../components/ui';

/** Units field plus an "Entire box" checkbox. Pair with useUnits(). */
export function UnitsFields({ box, state }) {
  return (
    <Row>
      <Field label="Units">
        <NumberInput min="1" max={box.qty} value={state.qty} onChange={state.setQty} disabled={state.all} />
      </Field>
      {!box.loose && (
        <div className="field">
          <span>&nbsp;</span>
          <Checkbox checked={state.all} onChange={state.setAll} style={{ height: 38 }}>
            Entire box ({box.qty})
          </Checkbox>
        </div>
      )}
    </Row>
  );
}
