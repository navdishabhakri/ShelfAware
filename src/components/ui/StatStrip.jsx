/**
 * Compact row of numbers for a page header.
 * stats: [{ label, value, tone?: 'bad' | 'ok', hidden?: boolean }]
 */
export function StatStrip({ stats }) {
  return (
    <div className="stats">
      {stats
        .filter((s) => !s.hidden)
        .map((s) => (
          <div className="stat" key={s.label}>
            <b className={s.tone || undefined}>{s.value}</b>
            <span>{s.label}</span>
          </div>
        ))}
    </div>
  );
}
