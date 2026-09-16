import type { DefaultValues } from "react-hook-form";
import type { IFieldSection } from "../../../models/common/field.model";
import type { BranchSlug } from "../../../models/data/branch/branch.response";
import type { IPayableInput } from "../../../models/data/ledger/ledger.request";
import type { IPayable } from "../../../models/data/ledger/ledger.response";
import { payableServices } from "../../../services/data/ledger.services";
import { todayIso } from "../../../utils/format.utils";
import { useBranchListHook } from "../branch/branch.list.hook";
import { useSupplierListHook } from "../party/supplier.list.hook";
import { useLedgerListHook } from "./ledger.list.hook";

export const usePayableListHook = () => {
  const { branchOptions, defaultBranch } = useBranchListHook();
  const { suppliers, supplierOptions } = useSupplierListHook();

  const sections: IFieldSection<IPayableInput>[] = [
    {
      key: "payable",
      title: "Payable",
      description: "Who we owe this amount to and when it is due.",
      fields: [
        {
          name: "branch",
          label: "Branch",
          type: "select",
          span: "half",
          required: true,
          options: branchOptions,
        },
        {
          name: "due_date",
          label: "Due date",
          type: "date",
          span: "half",
          required: true,
        },
        {
          name: "supplier_id",
          label: "Supplier",
          type: "select",
          allowClear: true,
          options: supplierOptions,
        },
        {
          name: "supplier_name",
          label: "Supplier name (if not in the list)",
          type: "text",
          hidden: (values) => !!values.supplier_id,
        },
        {
          name: "amount",
          label: "Amount",
          type: "amount",
          span: "half",
          required: true,
          prefix: "₱",
        },
        {
          name: "reference_number",
          label: "Reference no.",
          type: "text",
          span: "half",
        },
      ],
    },
  ];

  const defaults: DefaultValues<IPayableInput> = {
    branch: defaultBranch as BranchSlug,
    supplier_name: "",
    supplier_id: null,
    due_date: todayIso(),
    reference_number: "",
  };

  const prepare = (values: IPayableInput): IPayableInput => {
    const picked = values.supplier_id
      ? suppliers.find((supplier) => supplier.id === values.supplier_id)
      : undefined;

    return {
      ...values,
      supplier_name: picked?.name ?? values.supplier_name?.trim() ?? "",
    };
  };

  return useLedgerListHook<IPayable, IPayableInput>({
    scope: "payables",
    kind: "payable",
    title: "Payable",
    partyLabel: "Supplier",
    services: payableServices,
    sections,
    defaults,
    partyOf: (row) => ({ partyId: row.supplier_id, partyName: row.supplier_name }),
    prepare,
  });
};
