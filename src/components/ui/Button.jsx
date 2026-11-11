const VARIANTS = { primary: '', red: 'red', alt: 'alt', small: 'small' };

/**
 * variant: 'primary' (black) | 'red' (the page's main call to action) | 'alt' (secondary) | 'small'
 * danger: red text, for destructive actions.
 */
export function Button({ variant = 'primary', danger = false, className = '', type = 'button', ...props }) {
  const cls = ['btn', VARIANTS[variant], danger && 'danger', className].filter(Boolean).join(' ');
  return <button type={type} className={cls} {...props} />;
}
