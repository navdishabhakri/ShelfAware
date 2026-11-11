import { Diamond } from './Diamond';

/** Page title with the location's diamond, a one-line description and (as children) a stat strip. */
export function PageHeader({ tone, title, description, children }) {
  return (
    <div className="head">
      <div>
        <h2>
          <Diamond tone={tone} />
          {title}
        </h2>
        <p>{description}</p>
      </div>
      {children}
    </div>
  );
}
