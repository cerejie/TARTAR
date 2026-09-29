import type { DefaultValues } from "react-hook-form";
import {
  saleDepositModalKey,
  saleEditModalKey,
  saleFormModalKey,
  saleRejectModalKey,
} from "../../../keys/modal.keys";
import { salePaginationKey } from "../../../keys/table.keys";
import type { IFieldSection } from "../../../models/common/field.model";
import type { BranchSlug } from "../../../models/data/branch/branch.response";
import type {
  ISaleDepositInput,
  ISaleInput,
  ISaleRejectInput,
} from "../../../models/data/sale/sale.request";
import type { ISale } from "../../../models/data/sale/sale.response";
import saleServices from "../../../services/data/sale.services";
import {
  selectUserId,
  useAccountStore,
} from "../../../store/data/account/account.store";
import { todayIso } from "../../../utils/format.utils";
import { derivePaymentValues } from "../../../utils/payment.utils";
import { useModal } from "../../common/modal.hook";
import { useMutation } from "../../common/mutation.hook";
import { usePagination } from "../../common/pagination.hook";
import { useBankAccountListHook } from "../bank/bank.account.list.hook";
import { useBranchListHook } from "../branch/branch.list.hook";
import { useFarmSectionListHook } from "../farm-section/farm.section.list.hook";
import { useIncomeSourceListHook } from "../income-source/income.source.list.hook";
import { useCustomerListHook } from "../party/customer.list.hook";
import { saleInvalidateKeys } from "./sale.list.hook";

const depositSections: IFieldSection<ISaleDepositInput>[] = [
  {
    key: "deposit",
    title: "Deposit",
    fields: [
      { name: "deposit_date", label: "Deposit date", type: "date", required: true },
    ],
  },
];

const rejectSections: IFieldSection<ISaleRejectInput>[] = [
  {
    key: "reject",
    title: "Rejection",
    fields: [
      { name: "reason", label: "Reason", type: "textarea", required: true },
    ],
  },
];

export const useSaleFormHook = () => {
  const formModal = useModal(saleFormModalKey);
  const editModal = useModal<ISale>(saleEditModalKey);
  const depositModal = useModal<ISale>(saleDepositModalKey);
  const rejectModal = useModal<ISale>(saleRejectModalKey);
  const { setPagination } = usePagination(salePaginationKey);
  const createdBy = useAccountStore(selectUserId);

  const { branchOptions, defaultBranch } = useBranchListHook();
  const { farmSectionOptions } = useFarmSectionListHook();
  const { customerOptions } = useCustomerListHook();
  const { optionsFor: incomeSourceOptionsFor } = useIncomeSourceListHook();
  const { paymentFields, paymentDefaultsOf } = useBankAccountListHook();
  const defaultIncomeSource = incomeSourceOptionsFor()[0]?.value ?? "";

  const editRow = editModal.modal.data;
  const depositRow = depositModal.modal.data;
  const rejectRow = rejectModal.modal.data;

  const createMutation = useMutation(
    (values: ISaleInput) => saleServices.create(values, createdBy),
    {
      successMessage: "Sale recorded",
      invalidate: saleInvalidateKeys,
      onSuccess: () => {
        formModal.closeModal();
        setPagination({ pageNumber: 1 });
      },
    }
  );

  const updateMutation = useMutation(
    (payload: { id: string; values: ISaleInput }) =>
      saleServices.update(payload.id, payload.values),
    {
      successMessage: "Sale updated",
      invalidate: saleInvalidateKeys,
      onSuccess: editModal.closeModal,
    }
  );

  const depositMutation = useMutation(
    (payload: { id: string; values: ISaleDepositInput }) =>
      saleServices.markDeposited(payload.id, payload.values.deposit_date),
    {
      successMessage: "Sale marked deposited — awaiting verification",
      invalidate: saleInvalidateKeys,
      onSuccess: depositModal.closeModal,
    }
  );

  const rejectMutation = useMutation(
    (payload: { id: string; values: ISaleRejectInput }) =>
      saleServices.reject(payload.id, payload.values.reason),
    {
      successMessage: "Sale rejected — returned to the employee",
      invalidate: saleInvalidateKeys,
      onSuccess: rejectModal.closeModal,
    }
  );

  const sections: IFieldSection<ISaleInput>[] = [
    {
      key: "sale",
      title: "Sale",
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
          name: "txn_date",
          label: "Date",
          type: "date",
          span: "half",
          required: true,
        },
        {
          name: "farm_section",
          label: "Farm section",
          type: "select",
          allowClear: true,
          options: farmSectionOptions,
          hidden: (values) => values.branch !== "farm",
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
          name: "income_source",
          label: "Income source",
          type: "select",
          span: "half",
          required: true,
          options: incomeSourceOptionsFor(editRow?.income_source),
        },
      ],
    },
    {
      key: "accounting",
      title: "Accounting",
      fields: [
        {
          name: "customer_id",
          label: "Customer",
          type: "select",
          span: "half",
          allowClear: true,
          options: customerOptions,
        },
        ...paymentFields<ISaleInput>("Cash account"),
      ],
    },
  ];

  const defaults: DefaultValues<ISaleInput> = {
    branch: defaultBranch as BranchSlug,
    farm_section: null,
    txn_date: todayIso(),
    income_source: defaultIncomeSource,
    customer_id: null,
    cash_account: null,
    bank_id: null,
    bank_account_id: null,
    reference_number: "",
    description: "",
  };

  const editDefaults: DefaultValues<ISaleInput> | null = editRow
    ? {
        branch: editRow.branch as BranchSlug,
        farm_section: editRow.farm_section as ISaleInput["farm_section"],
        txn_date: editRow.txn_date,
        amount: editRow.amount,
        income_source: editRow.income_source ?? defaultIncomeSource,
        customer_id: editRow.customer_id,
        ...paymentDefaultsOf(editRow),
        reference_number: editRow.reference_number ?? "",
        description: editRow.description ?? "",
      }
    : null;

  return {
    formModal,
    editModal,
    depositModal,
    rejectModal,
    editRow,
    depositRow,
    rejectRow,
    sections,
    defaults,
    editDefaults,
    depositSections,
    depositDefaults: { deposit_date: todayIso() },
    rejectSections,
    rejectDefaults: { reason: "" },
    createMutation,
    updateMutation,
    depositMutation,
    rejectMutation,
    deriveFormValues: derivePaymentValues,
  };
};
