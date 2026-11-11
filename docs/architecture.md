# Architecture

How the front end is put together and the conventions to keep when adding to it.

## Layers

```
features/*  (pages, panels, modals)      what the user sees and does
   │  reads with selectors, changes state with actions
state/      (store, selectors, actions)  the rules: stock status, audits, sales
   │
lib/, data/                              plain helpers and sample data
```

- **Selectors** (`state/selectors.js`, `state/sales.js`) are pure functions that take the state `S` first and never change it, for example `variantState(S, 'Tote bags', 'C')`. Components call them on every render. The data is small, so nothing is memoized.
- **Actions** (`state/actions/*.js`) are the only code that changes state. Each takes an Immer draft and mutates it, for example `takeOut(d, { boxId, qty, purpose, who })`. They assume input is already valid. If an action returns something, it must be a plain value (an id, a number), never a draft object.
- **Components** never change state directly. A modal validates its form, then calls `update((d) => someAction(d, {...}))`.

Keeping the rules out of components means they can be unit tested (`tests/unit`) and later moved to the backend without touching the UI.

## State

| Context | Holds | Saved |
|---|---|---|
| `StoreContext` | The whole app state `S` (catalog, boxes, checkouts, equipment, findings, shelf, sales) | `localStorage` key `ssf-shelfaware-v4` |
| `SessionContext` | Role (manager or staff), and the name written into history | `ssf-shelfaware-v4-role` |
| `UiContext` | Current page, selected box, expanded item, searches, filters, sales period | No |

`update(fn)` applies the change straight away and returns `fn`'s result, so a modal can use a new id in the same handler (Receive uses the new box ids to open Labels ready).

**If you change the shape of `S`, bump `STORAGE_KEY` in `lib/constants.js`** (or write a migration in `loadState`), or old saved data will break the app. The shape is the one in `data/seed.js`.

When the backend arrives, `StoreContext` is the piece that changes: `update` becomes API calls and the actions move server side.

## Modals

There is one modal manager (`components/feedback/ModalContext.jsx`):

```jsx
const { open } = useModal();
open(TakeOutModal, { boxId: b.id });
```

Each modal is its own component built on `FormDialog`, with its form held in local state:

```jsx
export function ExampleModal({ boxId }) {
  const { state, update } = useStore();
  const toast = useToast();
  const [qty, setQty] = useState('');

  const submit = () => {
    const n = parseWhole(qty);
    if (isNaN(n)) return 'Enter how many units.';     // shown in the dialog, which stays open
    update((d) => someAction(d, { boxId, qty: n }));
    toast(`Saved ${n}.`);                             // returning nothing closes the dialog
  };

  return (
    <FormDialog title="Example" submitLabel="Save" onSubmit={submit}>
      <Field label="Units"><NumberInput value={qty} onChange={setQty} /></Field>
      {/* <Preview> shows the live "what happens" line */}
    </FormDialog>
  );
}
```

- To chain into another modal, call `open(NextModal, props)` inside `submit`. The new modal replaces the current one and is not closed by it.
- Pass ids as props, not objects, and look the object up from `state`, so the modal always shows current data.

## Roles

Manager-only UI is left out of the render (`{isManager && ...}`), rather than hidden with CSS. Use `useSession()` for `isManager` and `who`. Real permissions (APP01) will need checks on the backend as well.

## Styling

Plain CSS with the prototype's class names. Global styles are in `src/styles/` (tokens, base, layout, shared components); each feature and a few shared components import their own CSS file. Brand colours and status colours are tokens in `tokens.css`.

Design rules from the handover still apply:

- Status chips are always an icon plus a word (`<Chip tone="crit">`), never colour alone. Status colours aren't used for chart series.
- Red button for the page's main call to action, black for the normal primary button, `alt` for secondary.
- Plain, sentence-case writing. No em dashes. Buttons say exactly what happens, and the toast repeats the same verb. Errors say what to do next.
- Keyboard focus is visible, tooltips (`data-tip`) work on focus as well as hover, and pages must not scroll sideways at 390px (the e2e test checks this).
- Anything with `position:absolute` needs a positioned parent, and grid children that hold tables need `min-width:0`, or phones get sideways scrolling.

## Adding a feature

1. Add or change the state shape in `data/seed.js` (bump the storage key).
2. Put the rule in a selector or an action, and add a unit test.
3. Build the UI from `components/ui`. Add a new shared component there only when a second feature needs it.
4. Add the flow to `tests/e2e/smoke.spec.js`.
5. Run `npm run check`.
