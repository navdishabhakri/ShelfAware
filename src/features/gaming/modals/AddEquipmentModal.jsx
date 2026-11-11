import { useState } from 'react';
import { FormDialog } from '../../../components/feedback/FormDialog';
import { useToast } from '../../../components/feedback/ToastContext';
import { Field, Row, Select, TextInput } from '../../../components/ui';
import { EQUIPMENT_TYPES } from '../../../lib/constants';
import { addEquipment } from '../../../state/actions/gaming';
import { useStore } from '../../../state/StoreContext';
import { equipmentById } from '../../../state/selectors';

export function AddEquipmentModal() {
  const { state, update } = useStore();
  const toast = useToast();
  const [id, setId] = useState('');
  const [type, setType] = useState(EQUIPMENT_TYPES[0]);
  const [name, setName] = useState('');

  const submit = () => {
    const eid = id.trim().toUpperCase();
    const n = name.trim();
    if (!eid || !n) return 'Give it an ID and a name.';
    if (equipmentById(state, eid)) return `${eid} is already on the list.`;
    update((d) => addEquipment(d, { id: eid, name: n, type }));
    toast(`${eid} added. It shows as not checked until today's audit covers it.`);
  };

  return (
    <FormDialog title="Add equipment" submitLabel="Add" onSubmit={submit}>
      <Row>
        <Field label="ID">
          <TextInput value={id} onChange={setId} placeholder="CTRL-07" />
        </Field>
        <Field label="Type">
          <Select value={type} onChange={setType} options={EQUIPMENT_TYPES} />
        </Field>
      </Row>
      <Field label="Name">
        <TextInput value={name} onChange={setName} placeholder="Xbox controller" />
      </Field>
    </FormDialog>
  );
}
