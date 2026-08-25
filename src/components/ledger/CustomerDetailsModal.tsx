import { useCustomerDetailsHook } from "../../hook/data/party/customer.record.hook";
import type { IFieldConfig } from "../../models/common/field.model";
import type { ICustomerLedgerKey } from "../../models/data/ledger/ledger.response";
import {
  partySchema,
  type IPartyInput,
} from "../../models/data/party/party.request";
import EntityFormModal from "../common/form/EntityFormModal";

const fields: IFieldConfig<IPartyInput>[] = [
  { name: "name", label: "Customer name", type: "text" },
  {
    name: "contact_person",
    label: "Contact person",
    type: "text",
    placeholder: "Who to ask for",
  },
  {
    name: "contact",
    label: "Contact number",
    type: "text",
    placeholder: "e.g. 0917 123 4567",
  },
  { name: "address", label: "Address", type: "textarea" },
];

type IProps = {
  open: boolean;
  customer: ICustomerLedgerKey | null;
  onClose: () => void;
};

const CustomerDetailsModal = ({ open, customer, onClose }: IProps) => {
  const { ready, defaults, saveMutation } = useCustomerDetailsHook(
    customer,
    onClose
  );

  return (
    <EntityFormModal<IPartyInput>
      open={open && ready}
      title={`Customer details — ${customer?.customerName ?? ""}`}
      fields={fields}
      schema={partySchema}
      defaultValues={defaults}
      submitting={saveMutation.loading}
      submitText="Save details"
      onSubmit={(values) => {
        if (customer) void saveMutation.mutate({ ledger: customer, values });
      }}
      onClose={onClose}
    />
  );
};

export default CustomerDetailsModal;
