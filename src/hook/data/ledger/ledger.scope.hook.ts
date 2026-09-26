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
import type { IPartyInput } from "../../../models/data/party/party.request";
import type { IParty } from "../../../models/data/party/party.response";
import {
  payableServices,
  receivableServices,
} from "../../../services/data/ledger.services";
import {
  customerServices,
  supplierServices,
} from "../../../services/data/party.services";
import { todayIso } from "../../../utils/format.utils";
import { nameKey } from "../../../utils/fuzzy.utils";
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
  partyNameField: "customer_name" | "supplier_name";
  partyLabel: string;
  branchOptions: IFieldOption[];
  partyOptions: IFieldOption[];
}

const partyOf = (row: ILedgerRecord): ILedgerPartyKey =>
  "customer_name" in row
    ? { partyId: row.customer_id, partyName: row.customer_name }
    : { partyId: row.supplier_id, partyName: row.supplier_name };

const resolveParty = async (
  records: readonly IParty[],
  typed: string,
  create: (values: IPartyInput, id?: string) => Promise<unknown>
): Promise<Pick<IParty, "id" | "name">> => {
  const name = typed.trim();
  const existing = records.find(
    (record) => nameKey(record.name) === nameKey(name)
  );
  if (existing) return existing;

  const id = crypto.randomUUID();
  await create(
    { name, contact: null, contact_person: null, address: null },
    id
  );
  return { id, name };
};

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
        name: source.partyNameField,
        label: source.partyLabel,
        type: "creatable",
        required: true,
        options: source.partyOptions,
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
      partyNameField: "customer_name",
      partyLabel: "Customer",
      branchOptions,
      partyOptions: customerOptions,
    }),
    defaults: {
      branch,
      customer_name: "",
      due_date: todayIso(),
      reference_number: "",
    },
    partyOf,
    prepare: async (values) => {
      if (!("customer_name" in values)) return values;

      const customer = await resolveParty(
        customers,
        values.customer_name,
        customerServices.create
      );
      return {
        ...values,
        customer_id: customer.id,
        customer_name: customer.name,
      };
    },
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
      partyNameField: "supplier_name",
      partyLabel: "Supplier",
      branchOptions,
      partyOptions: supplierOptions,
    }),
    defaults: {
      branch,
      supplier_name: "",
      due_date: todayIso(),
      reference_number: "",
    },
    partyOf,
    prepare: async (values) => {
      if (!("supplier_name" in values)) return values;

      const supplier = await resolveParty(
        suppliers,
        values.supplier_name,
        supplierServices.create
      );
      return {
        ...values,
        supplier_id: supplier.id,
        supplier_name: supplier.name,
      };
    },
  };

  return useLedgerListHook(
    scope === "receivables" ? receivableConfig : payableConfig
  );
};
