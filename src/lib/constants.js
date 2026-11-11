/** localStorage key for the demo state. Bump it (or write a migration) when the state shape changes. */
export const STORAGE_KEY = 'ssf-shelfaware-v4';
export const ROLE_KEY = `${STORAGE_KEY}-role`;

export const SHELVES = ['A1', 'A2', 'A3', 'B1', 'B2', 'B3', 'C1', 'C2', 'D1', 'D2'];

export const LOCATIONS = [
  { id: 'wh', label: 'Warehouse', tone: 'g' },
  { id: 'gr', label: 'Gaming room', tone: 'k' },
  { id: 'ss', label: 'Snack stand', tone: 'r' },
];

/** Variant letters, in the order new variants get them. */
export const LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

/** Picture colours handed out to new variants, in order. */
export const VARIANT_COLORS = ['#818287', '#EF4536', '#2563B8', '#23704A', '#C9781A', '#26272B'];

export const ITEM_KINDS = ['Giveaway', 'Reusable'];

export const COUNT_REASONS = [
  'Unknown',
  'Damaged, thrown out',
  'Given out, not recorded',
  'Returned, not recorded',
  'Miscounted before',
];

export const EQUIPMENT_TYPES = ['Console', 'Controller', 'Headset', 'Cable', 'Display', 'Accessory'];

/** Snack stand prices (sample data, would come from the Square catalog). */
export const PRICES = { 'Chips A': 2.0, 'Granola B': 1.75, 'Cookies C': 2.25, 'Juice D': 2.5, 'Candy E': 1.5 };

export const PEOPLE = {
  mgr: { name: 'Morgan', title: 'SSF manager' },
  staff: { name: 'Sam', title: 'warehouse staff' },
};
