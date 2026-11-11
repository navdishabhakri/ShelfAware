// Form building blocks for modals. All inputs are controlled by the modal's own state.
import { cloneElement, isValidElement, useId } from 'react';

/**
 * Label above a control. Pass the control as the only child.
 * The label text is also linked with aria-labelledby, because a wrapping <label> alone
 * makes a <select>'s accessible name include all of its options in some browsers.
 */
export function Field({ label, children, hidden }) {
  const id = useId();
  const control = isValidElement(children) ? cloneElement(children, { 'aria-labelledby': id }) : children;
  return (
    <label className="field" hidden={hidden}>
      <span id={id}>{label}</span>
      {control}
    </label>
  );
}

/** Two fields side by side (stacks on phones). */
export function Row({ children, hidden }) {
  return (
    <div className="two" hidden={hidden}>
      {children}
    </div>
  );
}

export function TextInput({ value, onChange, ...props }) {
  return <input value={value} onChange={(e) => onChange(e.target.value)} {...props} />;
}

/** Number input for whole units. The value stays a string so the field can be blank. */
export function NumberInput({ value, onChange, ...props }) {
  return (
    <input type="number" inputMode="numeric" value={value} onChange={(e) => onChange(e.target.value)} {...props} />
  );
}

/** options: ['A', 'B'] or [{ value, label }] */
export function Select({ value, onChange, options, ...props }) {
  return (
    <select value={value} onChange={(e) => onChange(e.target.value)} {...props}>
      {options.map((o) => {
        const opt = typeof o === 'string' ? { value: o, label: o } : o;
        return (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        );
      })}
    </select>
  );
}

export function Checkbox({ checked, onChange, children, style }) {
  return (
    <label className="check" style={style}>
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} /> {children}
    </label>
  );
}

/**
 * Segmented choice (styled radio buttons).
 * options: [{ value, label }]
 */
export function Segmented({ label, name, value, onChange, options, disabled = false }) {
  return (
    <div className="field">
      <span>{label}</span>
      <div className="seg">
        {options.map((o) => (
          <label key={o.value}>
            <input
              type="radio"
              name={name}
              value={o.value}
              checked={value === o.value}
              disabled={disabled}
              onChange={() => onChange(o.value)}
            />
            {o.label}
          </label>
        ))}
      </div>
    </div>
  );
}

/**
 * Live "what happens" line under a form. Renders nothing until there is something to say.
 * label on the left, value in bold on the right.
 */
export function Preview({ label, value, valueStyle }) {
  if (label == null && value == null) return null;
  return (
    <div className="preview">
      <span>{label}</span>
      <b className="num" style={valueStyle}>
        {value}
      </b>
    </div>
  );
}

export function Hint({ children }) {
  return <p className="hint">{children}</p>;
}

/**
 * Grey summary card at the top of a modal: a tag on the left, title and subtitle,
 * and a big number on the right.
 */
export function SummaryCard({ lead, title, subtitle, value }) {
  return (
    <div className="mbox">
      {lead}
      <div>
        <strong>{title}</strong>
        <span>{subtitle}</span>
      </div>
      {value != null && <span className="big num">{value}</span>}
    </div>
  );
}
