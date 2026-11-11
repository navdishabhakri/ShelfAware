/** Placeholder text for an empty list. Say what to do next. */
export function Empty({ children }) {
  return <div className="empty">{children}</div>;
}

/** Empty state as a full-width table row. */
export function EmptyRow({ colSpan, children }) {
  return (
    <tr>
      <td colSpan={colSpan}>
        <Empty>{children}</Empty>
      </td>
    </tr>
  );
}
