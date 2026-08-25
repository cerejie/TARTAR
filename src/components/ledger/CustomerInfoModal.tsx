import { Button, Descriptions, Modal } from "antd";
import { useCustomerRecordHook } from "../../hook/data/party/customer.record.hook";
import type { ICustomerLedgerKey } from "../../models/data/ledger/ledger.response";
import CustomerInfoTag from "./CustomerInfoTag";

type IProps = {
  open: boolean;
  customer: ICustomerLedgerKey | null;
  onClose: () => void;
  onEdit?: () => void;
};

const CustomerInfoModal = ({ open, customer, onClose, onEdit }: IProps) => {
  const { record, loading } = useCustomerRecordHook(customer);
  const value = (input: string | null | undefined) => input || "—";

  return (
    <Modal
      open={open}
      title="Customer information"
      onCancel={onClose}
      footer={[
        <Button key="close" onClick={onClose}>
          Close
        </Button>,
        onEdit ? (
          <Button key="edit" type="primary" onClick={onEdit}>
            {record ? "Edit details" : "Fill in details"}
          </Button>
        ) : null,
      ]}
    >
      <Descriptions
        column={1}
        size="small"
        bordered
        items={[
          {
            key: "name",
            label: "Customer",
            children: record?.name ?? customer?.customerName ?? "—",
          },
          {
            key: "person",
            label: "Contact person",
            children: value(record?.contact_person),
          },
          {
            key: "contact",
            label: "Contact number",
            children: value(record?.contact),
          },
          { key: "address", label: "Address", children: value(record?.address) },
          {
            key: "state",
            label: "Information",
            children: loading ? "—" : <CustomerInfoTag customer={record} />,
          },
        ]}
      />
    </Modal>
  );
};

export default CustomerInfoModal;
