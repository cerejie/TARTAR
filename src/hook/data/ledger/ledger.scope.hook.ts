import type { IFieldOption, IFieldSection } from "../../../models/common/field.model";
import type { BranchSlug } from "../../../models/data/branch/branch.response";
import {
  payableSchema,
  receivableSchema,
  type IPayableInput,
  type IReceivableInput,
} from "../../../models/data/ledger/ledger.request";
import type {
  ILedgerPartyKey,
  IPayable,
  IReceivable,
} from "../../../models/data/ledger/ledger.response";
import {
  payableServices,
  receivableServices,
} from "../../../services/data/ledger.services";
import { todayIso } from "../../../utils/format.utils";
import { useBranchListHook } from "../branch/branch.list.hook";
import { useCustomerListHook } from "../party/customer.list.hook";
import { useSupplierListHook } from "../party/supplier.list.hook";
import { useLedgerListHook, type ILedgerListConfig } from "./ledger.list.hook";

export type LedgerScope = "receivables" | "payables";
export type ILedgerRecord = IReceivable | IPayable;
export type ILedgerInput = IReceivableInput | IPayableInput;

interface ISectionSource {
  key: string;
  title: string;
  description: string;
  partyIdField: "customer_id" | "supplier_id";
  partyNameField: "customer_name" | "supplier_name";
  partyLabel: string;
  branchOptions: IFieldOption[];
  partyOptions: IFieldOption[];
}

const pickedPartyId = (values: ILedgerInput): unknown =>
  ("customer_id" in values && values.customer_id) ||
  ("supplier_id" in values && values.supplier_id);

const partyOf = (row: ILedgerRecord): ILedgerPartyKey =>
  "customer_name" in row
    ? { partyId: row.customer_id, partyName: row.customer_name }
    : { partyId: row.supplier_id, partyName: row.supplier_name };

const resolveName = (
  records: readonly { id: string; name: string }[],
  id: unknown,
  typed: unknown
) =>
  (typeof id === "string"
    ? records.find((record) => record.id === id)?.name
    : undefined) ?? (typeof typed === "string" ? typed.trim() : "");

const buildSections = (source: ISectionSource): IFieldSection<ILedgerInput>[] => [
  {
    key: source.key,
    title: source.title,
    description: source.description,
    fields: [
      {
        name: "branch",
        label: "Branch",
        type: "select",
        span: "half",
        required: true,
        options: source.branchOptions,
      },
      {
        name: "due_date",
        label: "Due date",
        type: "date",
        span: "half",
        required: true,
      },
      {
        name: source.partyIdField,
        label: source.partyLabel,
        type: "select",
        allowClear: true,
        options: source.partyOptions,
      },
      {
        name: source.partyNameField,
        label: `${source.partyLabel} name (if not in the list)`,
        type: "text",
        hidden: (values) => !!pickedPartyId(values),
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

export const useLedgerScopeHook = (scope: LedgerScope) => {
  const { branchOptions, defaultBranch } = useBranchListHook();
  const { customers, customerOptions } = useCustomerListHook();
  const { suppliers, supplierOptions } = useSupplierListHook();
  const branch = defaultBranch as BranchSlug;

  const receivableConfig: ILedgerListConfig<ILedgerRecord, ILedgerInput> = {
    scope: "receivables",
    kind: "receivable",
    title: "Receivable",
    partyLabel: "Customer",
    services: receivableServices,
    schema: receivableSchema,
    sections: buildSections({
      key: "receivable",
      title: "Receivable",
      description: "Who owes this amount and when it is due.",
      partyIdField: "customer_id",
      partyNameField: "customer_name",
      partyLabel: "Customer",
      branchOptions,
      partyOptions: customerOptions,
    }),
    defaults: {
      branch,
      customer_id: null,
      customer_name: "",
      due_date: todayIso(),
      reference_number: "",
    },
    partyOf,
    prepare: (values) =>
      "customer_id" in values
        ? {
            ...values,
            customer_name: resolveName(
              customers,
              values.customer_id,
              values.customer_name
            ),
          }
        : values,
  };

  const payableConfig: ILedgerListConfig<ILedgerRecord, ILedgerInput> = {
    scope: "payables",
    kind: "payable",
    title: "Payable",
    partyLabel: "Supplier",
    services: payableServices,
    schema: payableSchema,
    sections: buildSections({
      key: "payable",
      title: "Payable",
      description: "Who we owe this amount to and when it is due.",
      partyIdField: "supplier_id",
      partyNameField: "supplier_name",
      partyLabel: "Supplier",
      branchOptions,
      partyOptions: supplierOptions,
    }),
    defaults: {
      branch,
      supplier_id: null,
      supplier_name: "",
      due_date: todayIso(),
      reference_number: "",
    },
    partyOf,
    prepare: (values) =>
      "supplier_id" in values
        ? {
            ...values,
            supplier_name: resolveName(
              suppliers,
              values.supplier_id,
              values.supplier_name
            ),
          }
        : values,
  };

  return useLedgerListHook(
    scope === "receivables" ? receivableConfig : payableConfig
  );
};
