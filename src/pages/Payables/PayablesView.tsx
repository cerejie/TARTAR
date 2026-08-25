import type { DefaultValues } from "react-hook-form";
import LedgerManager from "../../components/ledger/LedgerManager";
import { useBranchListHook } from "../../hook/data/branch/branch.list.hook";
import { useSupplierListHook } from "../../hook/data/party/supplier.list.hook";
import type { IFieldConfig } from "../../models/common/field.model";
import type { BranchSlug } from "../../models/data/branch/branch.response";
import {
  payableSchema,
  type IPayableInput,
} from "../../models/data/ledger/ledger.request";
import type { IPayable } from "../../models/data/ledger/ledger.response";
import { payableServices } from "../../services/data/ledger.services";
import paymentServices from "../../services/data/payment.services";
import { todayIso } from "../../utils/format.utils";

const PayablesView = () => {
  const { branchOptions, defaultBranch } = useBranchListHook();
  const { suppliers, supplierOptions } = useSupplierListHook();

  const fields: IFieldConfig<IPayableInput>[] = [
    { name: "branch", label: "Branch", type: "select", options: branchOptions },
    {
      name: "supplier_id",
      label: "Supplier",
      type: "select",
      allowClear: true,
      options: supplierOptions,
    },
    {
      name: "supplier_name",
      label: "Supplier name (if not in master data)",
      type: "text",
      hidden: (values) => !!values.supplier_id,
    },
    { name: "amount", label: "Amount", type: "number", prefix: "₱" },
    { name: "due_date", label: "Due date", type: "date" },
    { name: "reference_number", label: "Reference no.", type: "text" },
  ];

  const defaults: DefaultValues<IPayableInput> = {
    branch: defaultBranch as BranchSlug,
    supplier_name: "",
    supplier_id: null,
    due_date: todayIso(),
    reference_number: "",
  };

  const resolveSupplierName = (values: IPayableInput): string => {
    const picked = values.supplier_id
      ? suppliers.find((supplier) => supplier.id === values.supplier_id)
      : undefined;
    const name = picked?.name ?? values.supplier_name?.trim() ?? "";
    if (!name) throw new Error("Select a supplier or enter a name");
    return name;
  };

  return (
    <LedgerManager<IPayable, IPayableInput>
      scope="payables"
      title="Payables"
      subtitle="Amounts the business owes suppliers"
      partyLabel="Supplier"
      nameOf={(row) => row.supplier_name}
      getList={payableServices.getList}
      create={(values, createdBy) =>
        payableServices.create(
          { ...values, supplier_name: resolveSupplierName(values) },
          createdBy
        )
      }
      settle={(row, amount, createdBy) =>
        paymentServices.record(
          "payable",
          {
            partyId: row.supplier_id,
            partyName: row.supplier_name,
            paidAt: todayIso(),
            referenceNumber: null,
            allocations: [{ ledgerId: row.id, amount }],
          },
          createdBy
        )
      }
      remove={payableServices.remove}
      schema={payableSchema}
      fields={fields}
      defaults={defaults}
    />
  );
};

export default PayablesView;
