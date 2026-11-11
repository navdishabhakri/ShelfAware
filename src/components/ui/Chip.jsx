/**
 * Status chip: always an icon plus a word, never colour alone.
 * tone: 'crit' (▲ red) | 'warn' (● amber) | 'good' (✓ green) | 'info' (◆ blue)
 */
export function Chip({ tone, children }) {
  return <span className={`chip ${tone}`}>{children}</span>;
}

const STOCK = {
  reorder: { tone: 'crit', label: 'Reorder' },
  low: { tone: 'warn', label: 'Low stock' },
  ok: { tone: 'good', label: 'In stock' },
};

/** Chip for a stock level from stockLevel(): 'reorder' | 'low' | 'ok'. Renders nothing for ''. */
export function StockChip({ state }) {
  const s = STOCK[state];
  return s ? <Chip tone={s.tone}>{s.label}</Chip> : null;
}
