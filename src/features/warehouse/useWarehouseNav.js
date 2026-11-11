import { useCallback } from 'react';
import { useStore } from '../../state/StoreContext';
import { useUi } from '../../state/UiContext';
import { boxById, boxName } from '../../state/selectors';
import { scrollToId } from '../../lib/scroll';
import { useToast } from '../../components/feedback/ToastContext';

export const DETAIL_ID = 'box-detail';

/** Moving around the warehouse page: showing a box in the detail panel, or opening one from a scan. */
export function useWarehouseNav() {
  const { state } = useStore();
  const { setUi } = useUi();
  const toast = useToast();

  /** filterToItem also narrows the box list to that box's item. */
  const showBox = useCallback(
    (id, { filterToItem = false, scroll = true } = {}) => {
      const b = boxById(state, id);
      setUi(filterToItem && b ? { box: id, boxItem: b.item } : { box: id });
      if (scroll) scrollToId(DETAIL_ID);
    },
    [state, setUi],
  );

  /** From a scanned or typed label: go to the warehouse with filters cleared. */
  const openScannedBox = useCallback(
    (b) => {
      setUi({ loc: 'wh', box: b.id, whQuery: '', whFilter: 'all' });
      scrollToId(DETAIL_ID);
      toast(`Opened ${b.id}, ${boxName(b)}.`);
    },
    [setUi, toast],
  );

  return { showBox, openScannedBox };
}
