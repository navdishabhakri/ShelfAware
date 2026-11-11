import { useState } from 'react';
import { FormDialog } from '../../../components/feedback/FormDialog';
import { useToast } from '../../../components/feedback/ToastContext';
import { Checkbox, ItemPicture, SummaryCard } from '../../../components/ui';
import { resizePhoto } from '../../../lib/photo';
import { setItemPhoto } from '../../../state/actions/warehouse';
import { useStore } from '../../../state/StoreContext';
import { PhotoField } from '../components/PhotoField';

export function PhotoModal({ item }) {
  const { state, update } = useStore();
  const toast = useToast();
  const hasPhoto = !!state.catalog[item].img;
  const [file, setFile] = useState(null);
  const [clear, setClear] = useState(false);

  const submit = () => {
    if (clear) {
      update((d) => setItemPhoto(d, { item, img: null }));
      toast('Photo removed.');
      return;
    }
    if (!file) return 'Choose a photo first.';
    // Resizing is async, so the dialog closes now and the photo appears when it is ready.
    resizePhoto(file)
      .then((img) => {
        update((d) => setItemPhoto(d, { item, img }));
        toast(`Photo saved for ${item}.`);
      })
      .catch(() => toast('That file could not be read as an image.'));
  };

  return (
    <FormDialog title={`Photo for ${item}`} submitLabel="Save photo" onSubmit={submit}>
      <SummaryCard
        lead={<ItemPicture item={item} />}
        title={item}
        subtitle="Shown in the items table. On a phone this opens the camera."
      />
      <PhotoField onChange={setFile} />
      {hasPhoto && (
        <Checkbox checked={clear} onChange={setClear}>
          Remove the photo and use the drawing
        </Checkbox>
      )}
    </FormDialog>
  );
}
