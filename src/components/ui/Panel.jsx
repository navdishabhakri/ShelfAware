/** Heading row for a panel: title, optional subtitle, optional actions on the right. */
export function PanelHeader({ title, subtitle, actions }) {
  return (
    <div className="ph">
      <div>
        <h3>{title}</h3>
        {subtitle && <p>{subtitle}</p>}
      </div>
      {actions}
    </div>
  );
}

/**
 * White card on the 12-column page grid.
 * span: 3 | 4 | 5 | 6 | 7 | 8 | 12 (stacks to full width below 1080px). Leave it out inside a Stack.
 */
export function Panel({ span, title, subtitle, actions, className = '', id, children }) {
  const cls = ['panel', span && `s${span}`, className].filter(Boolean).join(' ');
  return (
    <div className={cls} id={id}>
      {title && <PanelHeader title={title} subtitle={subtitle} actions={actions} />}
      {children}
    </div>
  );
}

/** Vertical stack of panels that takes one grid slot. */
export function Stack({ span, children }) {
  return <div className={`stack s${span}`}>{children}</div>;
}

/** Group of buttons for a panel header. */
export function Actions({ children }) {
  return <div className="acts">{children}</div>;
}
