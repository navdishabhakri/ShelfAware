/**
 * Pill toggle group, one option pressed at a time.
 * options: [{ value, label }]
 */
export function FilterChips({ options, value, onChange, label }) {
  return (
    <div className="fchips" role="group" aria-label={label}>
      {options.map((o) => (
        <button key={o.value} type="button" aria-pressed={o.value === value} onClick={() => onChange(o.value)}>
          {o.label}
        </button>
      ))}
    </div>
  );
}
