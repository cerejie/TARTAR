import { BookOutlined } from "@ant-design/icons";
import { Button } from "antd";
import type { DefaultValues } from "react-hook-form";
import CustomerLedgerModal from "../../components/ledger/CustomerLedgerModal";
import LedgerManager from "../../components/ledger/LedgerManager";
import { useModal } from "../../hook/common/modal.hook";
import { useBranchListHook } from "../../hook/data/branch/branch.list.hook";
import { useCustomerListHook } from "../../hook/data/party/customer.list.hook";
import { customerLedgerModalKey } from "../../keys/modal.keys";
import type { IFieldConfig } from "../../models/common/field.model";
import type { BranchSlug } from "../../models/data/branch/branch.response";
import {
  receivableSchema,
  type IReceivableInput,
} from "../../models/data/ledger/ledger.request";
import type { IReceivable } from "../../models/data/ledger/ledger.response";
import { receivableServices } from "../../services/data/ledger.services";
import paymentServices from "../../services/data/payment.services";
import { todayIso } from "../../utils/format.utils";

const ReceivablesView = () => {
  const { branchOptions, defaultBranch } = useBranchListHook();
  const { customers, customerOptions } = useCustomerListHook();
  const ledgerModal = useModal(customerLedgerModalKey);

  const fields: IFieldConfig<IReceivableInput>[] = [
    { name: "branch", label: "Branch", type: "select", options: branchOptions },
    {
      name: "customer_id",
      label: "Customer",
      type: "select",
      allowClear: true,
      options: customerOptions,
    },
    {
      name: "customer_name",
      label: "Customer name (if not in the list)",
      type: "text",
      hidden: (values) => !!values.customer_id,
    },
    { name: "amount", label: "Amount", type: "number", prefix: "₱" },
    { name: "due_date", label: "Due date", type: "date" },
    { name: "reference_number", label: "Reference no.", type: "text" },
  ];

  const defaults: DefaultValues<IReceivableInput> = {
    branch: defaultBranch as BranchSlug,
    customer_name: "",
    customer_id: null,
    due_date: todayIso(),
    reference_number: "",
  };

  const resolveCustomerName = (values: IReceivableInput): string => {
    const picked = values.customer_id
      ? customers.find((customer) => customer.id === values.customer_id)
      : undefined;
    const name = picked?.name ?? values.customer_name?.trim() ?? "";
    if (!name) throw new Error("Select a customer or enter a name");
    return name;
  };

  return (
    <>
      <LedgerManager<IReceivable, IReceivableInput>
        scope="receivables"
        title="Receivables"
        subtitle="Amounts customers owe the business"
        partyLabel="Customer"
        nameOf={(row) => row.customer_name}
        getList={receivableServices.getList}
        create={(values, createdBy) =>
          receivableServices.create(
            { ...values, customer_name: resolveCustomerName(values) },
            createdBy
          )
        }
        settle={(row, amount, createdBy) =>
          paymentServices.record(
            "receivable",
            {
              partyId: row.customer_id,
              partyName: row.customer_name,
              paidAt: todayIso(),
              referenceNumber: null,
              allocations: [{ ledgerId: row.id, amount }],
            },
            createdBy
          )
        }
        remove={receivableServices.remove}
        schema={receivableSchema}
        fields={fields}
        defaults={defaults}
        headerActions={
          <Button
            icon={<BookOutlined />}
            onClick={() => ledgerModal.openModal()}
          >
            Customer Ledger
          </Button>
        }
      />
      <CustomerLedgerModal />
    </>
  );
};

export default ReceivablesView;
