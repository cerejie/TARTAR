import { Button, Flex } from "antd";
import { useCustomerRecordHook } from "../../hook/data/party/customer.record.hook";
import type { IDetailItem } from "../../models/common/detail.model";
import type { ICustomerLedgerKey } from "../../models/data/ledger/ledger.response";
import type { ICustomer } from "../../models/data/party/party.response";
import DetailModal from "../common/modal/DetailModal";
import CustomerInfoTag from "./CustomerInfoTag";

/** A ledger customer may have no party record yet, so the name falls back to the ledger key. */
type ICustomerInfo = {
  name: string;
  party: ICustomer | undefined;
};

type IProps = {
  open: boolean;
  customer: ICustomerLedgerKey | null;
  onClose: () => void;
  onEdit?: () => void;
};

const value = (input: string | null | undefined) => input || "—";

const infoItems: IDetailItem<ICustomerInfo>[] = [
  { key: "name", label: "Customer", render: (info) => info.name },
  {
    key: "person",
    label: "Contact person",
    render: (info) => value(info.party?.contact_person),
  },
  {
    key: "contact",
    label: "Contact number",
    render: (info) => value(info.party?.contact),
  },
  {
    key: "address",
    label: "Address",
    render: (info) => value(info.party?.address),
  },
  {
    key: "state",
    label: "Information",
    render: (info) => <CustomerInfoTag customer={info.party} />,
  },
];

const CustomerInfoModal = ({ open, customer, onClose, onEdit }: IProps) => {
  const { record, loading } = useCustomerRecordHook(customer);

  const info: ICustomerInfo | null = customer
    ? { name: record?.name ?? customer.customerName, party: record }
    : null;

  return (
    <DetailModal<ICustomerInfo>
      open={open}
      title="Customer information"
      subtitle={customer?.customerName}
      record={info}
      items={infoItems}
      loading={loading}
      emptyText="No customer selected"
      onClose={onClose}
      footer={
        <Flex justify="flex-end" gap={8}>
          <Button onClick={onClose}>Close</Button>
          {onEdit ? (
            <Button type="primary" onClick={onEdit}>
              {record ? "Edit details" : "Fill in details"}
            </Button>
          ) : null}
        </Flex>
      }
    />
  );
};

export default CustomerInfoModal;
