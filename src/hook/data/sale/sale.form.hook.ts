import type { DefaultValues } from "react-hook-form";
import {
  saleDepositModalKey,
  saleEditModalKey,
  saleFormModalKey,
  saleRejectModalKey,
  saleResubmitModalKey,
} from "../../../keys/modal.keys";
import { salePaginationKey } from "../../../keys/table.keys";
import type { IFieldSection } from "../../../models/common/field.model";
import type { BranchSlug } from "../../../models/data/branch/branch.response";
import type {
  ISaleDepositInput,
  ISaleInput,
  ISaleRejectInput,
  ISaleResubmitInput,
} from "../../../models/data/sale/sale.request";
import type { ISale } from "../../../models/data/sale/sale.response";
import { customerListKey } from "../../../keys/query.keys";
import { customerServices } from "../../../services/data/party.services";
import saleServices from "../../../services/data/sale.services";
import {
  selectUserId,
  useAccountStore,
} from "../../../store/data/account/account.store";
import { todayIso } from "../../../utils/format.utils";
import { resolveOptionalParty } from "../../../utils/party.utils";
import { derivePaymentValues } from "../../../utils/payment.utils";
import { useModal } from "../../common/modal.hook";
import { useMutation } from "../../common/mutation.hook";
import { usePagination } from "../../common/pagination.hook";
import { usePushOffer } from "../../common/push.hook";
import { useBankAccountListHook } from "../bank/bank.account.list.hook";
import { useBranchListHook } from "../branch/branch.list.hook";
import { useFarmSectionListHook } from "../farm-section/farm.section.list.hook";
import { useIncomeSourceListHook } from "../income-source/income.source.list.hook";
import { useCustomerListHook } from "../party/customer.list.hook";
import { useUserListHook } from "../user/user.list.hook";
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

const resubmitDepositSection: IFieldSection<ISaleResubmitInput> = {
  key: "deposit",
  title: "Deposit",
  fields: [
    { name: "deposit_date", label: "Deposit date", type: "date", required: true },
  ],
};

const saleWithCustomerKeys = [...saleInvalidateKeys, customerListKey];

export const useSaleFormHook = () => {
  const formModal = useModal(saleFormModalKey);
  const editModal = useModal<ISale>(saleEditModalKey);
  const depositModal = useModal<ISale>(saleDepositModalKey);
  const rejectModal = useModal<ISale>(saleRejectModalKey);
  const resubmitModal = useModal<ISale>(saleResubmitModalKey);
  const { setPagination } = usePagination(salePaginationKey);
  const createdBy = useAccountStore(selectUserId);
  const offerPush = usePushOffer();

  const { branchOptions, defaultBranch } = useBranchListHook();
  const { farmSectionOptions } = useFarmSectionListHook();
  const { customers, customerOptions } = useCustomerListHook();
  const { optionsFor: incomeSourceOptionsFor } = useIncomeSourceListHook();
  const { paymentFields, paymentDefaultsOf } = useBankAccountListHook();
  const { userNameOf } = useUserListHook();
  const defaultIncomeSource = incomeSourceOptionsFor()[0]?.value ?? "";

  const editRow = editModal.modal.data;
  const depositRow = depositModal.modal.data;
  const rejectRow = rejectModal.modal.data;
  const resubmitRow = resubmitModal.modal.data;

  const withCustomer = async <TInput extends ISaleInput>({
    customer_name,
    ...values
  }: TInput): Promise<Omit<TInput, "customer_name">> => {
    const customer = await resolveOptionalParty(
      customers,
      customer_name,
      customerServices.create
    );
    return { ...values, customer_id: customer?.id ?? null };
  };

  const customerNameOf = (customerId: string | null | undefined) =>
    customers.find((customer) => customer.id === customerId)?.name ?? "";

  const createMutation = useMutation(
    async (values: ISaleInput) =>
      saleServices.create(await withCustomer(values), createdBy),
    {
      successMessage: "Sale recorded",
      invalidate: saleWithCustomerKeys,
      onSuccess: () => {
        formModal.closeModal();
        setPagination({ pageNumber: 1 });
        offerPush();
      },
    }
  );

  const updateMutation = useMutation(
    async (payload: { id: string; values: ISaleInput }) =>
      saleServices.update(
        payload.id,
        editRow?.version ?? 0,
        await withCustomer(payload.values)
      ),
    {
      successMessage: "Sale updated",
      invalidate: saleWithCustomerKeys,
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

  const resubmitMutation = useMutation(
    async (payload: { id: string; values: ISaleResubmitInput }) =>
      saleServices.resubmit(
        payload.id,
        resubmitRow?.version ?? 0,
        await withCustomer(payload.values)
      ),
    {
      successMessage: "Sale resubmitted — awaiting verification",
      invalidate: saleWithCustomerKeys,
      onSuccess: resubmitModal.closeModal,
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
          options: incomeSourceOptionsFor(
            editRow?.income_source ?? resubmitRow?.income_source
          ),
        },
      ],
    },
    {
      key: "accounting",
      title: "Accounting",
      fields: [
        {
          name: "customer_name",
          label: "Customer",
          type: "creatable",
          span: "half",
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
    customer_name: "",
    cash_account: null,
    bank_id: null,
    bank_account_id: null,
    reference_number: "",
    description: "",
  };

  const rowDefaults = (row: ISale): DefaultValues<ISaleInput> => ({
    branch: row.branch as BranchSlug,
    farm_section: row.farm_section as ISaleInput["farm_section"],
    txn_date: row.txn_date,
    amount: row.amount,
    income_source: row.income_source ?? defaultIncomeSource,
    customer_id: row.customer_id,
    customer_name: customerNameOf(row.customer_id),
    ...paymentDefaultsOf(row),
    reference_number: row.reference_number ?? "",
    description: row.description ?? "",
  });

  const editDefaults = editRow ? rowDefaults(editRow) : null;

  const resubmitSections: IFieldSection<ISaleResubmitInput>[] = [
    ...(sections as unknown as IFieldSection<ISaleResubmitInput>[]),
    resubmitDepositSection,
  ];

  const resubmitDefaults: DefaultValues<ISaleResubmitInput> | null = resubmitRow
    ? {
        ...rowDefaults(resubmitRow),
        deposit_date: resubmitRow.deposit_date ?? todayIso(),
      }
    : null;

  return {
    formModal,
    editModal,
    depositModal,
    rejectModal,
    resubmitModal,
    editRow,
    depositRow,
    rejectRow,
    resubmitRow,
    sections,
    defaults,
    editDefaults,
    depositSections,
    depositDefaults: { deposit_date: todayIso() },
    rejectSections,
    rejectDefaults: { reason: "" },
    resubmitSections,
    resubmitDefaults,
    createMutation,
    updateMutation,
    depositMutation,
    rejectMutation,
    resubmitMutation,
    deriveFormValues: derivePaymentValues,
    rejectedByName: userNameOf(resubmitRow?.verified_by ?? null),
  };
};
