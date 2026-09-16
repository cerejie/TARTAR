import type { DefaultValues } from "react-hook-form";
import type { IFieldSection } from "../../../models/common/field.model";
import type { BranchSlug } from "../../../models/data/branch/branch.response";
import type { IReceivableInput } from "../../../models/data/ledger/ledger.request";
import type { IReceivable } from "../../../models/data/ledger/ledger.response";
import { receivableServices } from "../../../services/data/ledger.services";
import { todayIso } from "../../../utils/format.utils";
import { useBranchListHook } from "../branch/branch.list.hook";
import { useCustomerListHook } from "../party/customer.list.hook";
import { useLedgerListHook } from "./ledger.list.hook";

export const useReceivableListHook = () => {
  const { branchOptions, defaultBranch } = useBranchListHook();
  const { customers, customerOptions } = useCustomerListHook();

  const sections: IFieldSection<IReceivableInput>[] = [
    {
      key: "receivable",
      title: "Receivable",
      description: "Who owes this amount and when it is due.",
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

  const defaults: DefaultValues<IReceivableInput> = {
    branch: defaultBranch as BranchSlug,
    customer_name: "",
    customer_id: null,
    due_date: todayIso(),
    reference_number: "",
  };

  const prepare = (values: IReceivableInput): IReceivableInput => {
    const picked = values.customer_id
      ? customers.find((customer) => customer.id === values.customer_id)
      : undefined;

    return {
      ...values,
      customer_name: picked?.name ?? values.customer_name?.trim() ?? "",
    };
  };

  return useLedgerListHook<IReceivable, IReceivableInput>({
    scope: "receivables",
    kind: "receivable",
    title: "Receivable",
    partyLabel: "Customer",
    services: receivableServices,
    sections,
    defaults,
    partyOf: (row) => ({ partyId: row.customer_id, partyName: row.customer_name }),
    prepare,
  });
};
