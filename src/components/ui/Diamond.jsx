/** The rotated-square marker from the SSF logo. tone: 'g' grey | 'k' black | 'r' red. */
export function Diamond({ tone }) {
  return <span className={`dia ${tone}`} aria-hidden="true" />;
}
