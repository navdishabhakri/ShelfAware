/** Scrolls an element into view after React has committed the current update. */
export function scrollToId(id, options = { behavior: 'smooth', block: 'nearest' }) {
  setTimeout(() => document.getElementById(id)?.scrollIntoView(options), 0);
}
