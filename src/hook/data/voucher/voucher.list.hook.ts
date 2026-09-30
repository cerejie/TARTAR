import type { DefaultValues, Path } from "react-hook-form";
import {
  voucherKindLabels,
  voucherKindValues,
  voucherSortOptions,
  voucherTypeLabels,
  voucherTypeValues,
} from "../../../enums/voucher.enum";
import {
  voucherFormModalKey,
  voucherRejectModalKey,
} from "../../../keys/modal.keys";
import {
  payableListKey,
  scopedKey,
  voucherListKey,
} from "../../../keys/query.keys";
import {
  voucherPaginationKey,
  voucherSortKey,
} from "../../../keys/table.keys";
import type {
  IFieldConfig,
  IFieldSection,
} from "../../../models/common/field.model";
import type { IPaginationResponse } from "../../../models/common/pagination.model";
import type { BranchSlug } from "../../../models/data/branch/branch.response";
import type {
  IVoucherInput,
  IVoucherRejectInput,
} from "../../../models/data/voucher/voucher.request";
import type { IVoucher } from "../../../models/data/voucher/voucher.response";
import voucherServices from "../../../services/data/voucher.services";
import {
  selectUserId,
  useAccountStore,
} from "../../../store/data/account/account.store";
import { scopedFilters } from "../../../utils/filter.utils";
import { formatMoney, todayIso } from "../../../utils/format.utils";
import { toOptions } from "../../../utils/option.utils";
import { derivePaymentValues } from "../../../utils/payment.utils";
import { printVoucher } from "../../../utils/print.utils";
import {
  deriveVoucherValues,
  voucherBreakdownDefaults,
  voucherBreakdownFields,
  voucherSummaryLines,
} from "../../../utils/voucher.utils";
import { usePermissions } from "../../account/account.permission.hook";
import { useConfirm } from "../../common/confirmation.hook";
import { useLedgerFilters } from "../../common/filter.hook";
import { useModal } from "../../common/modal.hook";
import { useMutation } from "../../common/mutation.hook";
import { usePagination } from "../../common/pagination.hook";
import { useWithPendingRows } from "../../common/pending.hook";
import { useQuery } from "../../common/query.hook";
import { useSortOption } from "../../common/sort.hook";
import { useBankAccountListHook } from "../bank/bank.account.list.hook";
import { useBranchListHook } from "../branch/branch.list.hook";
import { useBranchScopeHook } from "../branch/branch.scope.hook";
import { useSupplierListHook } from "../party/supplier.list.hook";

const deriveManualVoucherValues = (
  changed: Path<IVoucherInput>,
  values: IVoucherInput
): Partial<IVoucherInput> => ({
  ...deriveVoucherValues(changed, values),
  ...derivePaymentValues(changed, values),
});

const rejectSections: IFieldSection<IVoucherRejectInput>[] = [
  {
    key: "reject",
    title: "Rejection",
    fields: [
      { name: "reason", label: "Reason", type: "textarea", required: true },
    ],
  },
];

export const useVoucherListHook = () => {
  const formModal = useModal(voucherFormModalKey);
  const rejectModal = useModal<IVoucher>(voucherRejectModalKey);
  const createdBy = useAccountStore(selectUserId);
  const permissions = usePermissions();
  const openConfirm = useConfirm();

  const { pagination, setPagination, goToPage } =
    usePagination(voucherPaginationKey);
  const { sortOption, sortKey, sortOptions, changeSort } = useSortOption(
    voucherSortKey,
    voucherSortOptions,
    () => setPagination({ pageNumber: 1 })
  );

  const { filters } = useLedgerFilters("vouchers");
  const { branches, branchOptions, branchName, defaultBranch } =
    useBranchListHook();
  const { supplierOptions } = useSupplierListHook();
  const { accountLabelOf, bankAccountFields } = useBankAccountListHook();
  const { branch: scopeBranch } = useBranchScopeHook();

  const effectiveFilters = scopedFilters(filters, scopeBranch);
  const pageRequest = { ...pagination, sort: sortOption };

  const listQuery = useQuery<IPaginationResponse<IVoucher>>(
    scopedKey(
      voucherListKey,
      JSON.stringify(effectiveFilters),
      pagination.pageNumber,
      pagination.pageSize,
      sortKey
    ),
    () => voucherServices.getList(effectiveFilters, pageRequest)
  );

  const vouchers = useWithPendingRows(
    listQuery.data?.data ?? [],
    voucherServices.pendingOf,
    {
      enabled:
        pagination.pageNumber === 1 &&
        (!effectiveFilters.voucherStatus ||
          effectiveFilters.voucherStatus === "pending"),
      branch: scopeBranch,
    }
  );

  const createMutation = useMutation(
    (values: IVoucherInput) =>
      voucherServices.create(
        { ...values, check_bank: accountLabelOf(values.bank_account_id) },
        createdBy
      ),
    {
      successMessage: "Voucher submitted for approval",
      invalidate: [voucherListKey],
      onSuccess: () => {
        formModal.closeModal();
        setPagination({ pageNumber: 1 });
      },
    }
  );

  const approveMutation = useMutation(
    (id: string) => voucherServices.decide(id, true, createdBy),
    {
      successMessage: "Voucher approved",
      invalidate: [voucherListKey, payableListKey],
    }
  );

  const rejectMutation = useMutation(
    (payload: { id: string; values: IVoucherRejectInput }) =>
      voucherServices.decide(payload.id, false, createdBy, payload.values.reason),
    {
      successMessage: "Voucher rejected — returned to the employee",
      invalidate: [voucherListKey, payableListKey],
      onSuccess: rejectModal.closeModal,
    }
  );

  const printedMutation = useMutation(
    (id: string) => voucherServices.markPrinted(id),
    { invalidate: [voucherListKey] }
  );

  const confirmApprove = (voucher: IVoucher) =>
    openConfirm({
      kind: "confirm",
      title: `Approve voucher for ${voucher.payee}?`,
      message: `Once approved, the ${formatMoney(
        voucher.amount
      )} voucher can be printed and can no longer be changed.`,
      okText: "Approve",
      onConfirm: () => approveMutation.mutate(voucher.id),
    });

  const print = (voucher: IVoucher) => {
    const branch = branches.find((item) => item.slug === voucher.branch);
    printVoucher(voucher, {
      name: branch?.legal_name || branchName(voucher.branch),
      address: branch?.address ?? null,
    });
    if (!voucher.printed) void printedMutation.mutate(voucher.id);
  };

  const fields: IFieldConfig<IVoucherInput>[] = [
    {
      name: "type",
      label: "Voucher type",
      type: "select",
      required: true,
      options: toOptions(voucherTypeValues, voucherTypeLabels),
    },
    {
      name: "kind",
      label: "Purpose",
      type: "select",
      required: true,
      options: toOptions(voucherKindValues, voucherKindLabels),
    },
    {
      name: "branch",
      label: "Branch",
      type: "select",
      required: true,
      options: branchOptions,
    },
    { name: "payee", label: "Payee", type: "text", required: true },
    {
      name: "amount",
      label: "Invoice amount",
      type: "amount",
      required: true,
      prefix: "₱",
      hint: "VAT inclusive.",
    },
    ...voucherBreakdownFields<IVoucherInput>(),
    {
      name: "supplier_id",
      label: "Supplier",
      type: "select",
      allowClear: true,
      options: supplierOptions,
      hidden: (values) => values.kind !== "purchase",
    },
    {
      name: "due_date",
      label: "Payable due date",
      type: "date",
      required: true,
      hidden: (values) => values.kind !== "purchase",
    },
    ...bankAccountFields<IVoucherInput>((values) => values.type === "check"),
    {
      name: "check_number",
      label: "Check number",
      type: "text",
      required: true,
      hidden: (values) => values.type !== "check",
    },
    {
      name: "check_due_date",
      label: "Check due date",
      type: "date",
      required: true,
      hidden: (values) => values.type !== "check",
    },
  ];

  const defaults: DefaultValues<IVoucherInput> = {
    ...voucherBreakdownDefaults,
    type: "cash",
    kind: "expense",
    branch: (scopeBranch ?? defaultBranch) as BranchSlug,
    payee: "",
    supplier_id: null,
    due_date: todayIso(),
    bank_id: null,
    bank_account_id: null,
    check_bank: "",
    check_number: "",
    check_due_date: todayIso(),
  };

  return {
    permissions,
    vouchers,
    totalCount: listQuery.data?.totalCount ?? 0,
    pagination,
    goToPage,
    sortKey,
    sortOptions,
    changeSort,
    loading: listQuery.isInitialLoading,
    refreshing: listQuery.isRefreshing,
    error: listQuery.error,
    retry: listQuery.refetch,
    branchName,
    formModal,
    fields,
    defaults,
    formSummary: voucherSummaryLines,
    deriveFormValues: deriveManualVoucherValues,
    createMutation,
    confirmApprove,
    rejectModal,
    rejectRow: rejectModal.modal.data,
    rejectSections,
    rejectDefaults: { reason: "" },
    rejectMutation,
    print,
  };
};
