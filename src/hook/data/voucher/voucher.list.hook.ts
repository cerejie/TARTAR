import type { DefaultValues, Path } from "react-hook-form";
import {
  voucherKindLabels,
  voucherKindValues,
  voucherSortOptions,
  voucherTypeLabels,
  voucherTypeValues,
} from "../../../enums/voucher.enum";
import {
  voucherEditModalKey,
  voucherFormModalKey,
  voucherReasonModalKey,
  voucherRejectModalKey,
  voucherSourceModalKey,
} from "../../../keys/modal.keys";
import {
  payableListKey,
  scopedKey,
  supplierListKey,
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
import type { ILedgerFilters } from "../../../models/common/filter.model";
import type {
  IPaginationRequest,
  IPaginationResponse,
} from "../../../models/common/pagination.model";
import type { IQuerySpec } from "../../../models/common/query.model";
import type { ISortOption } from "../../../models/common/table.model";
import type { BranchSlug } from "../../../models/data/branch/branch.response";
import type {
  IVoucherInput,
  IVoucherRejectInput,
} from "../../../models/data/voucher/voucher.request";
import {
  voucherDisbursementKind,
  type IVoucher,
} from "../../../models/data/voucher/voucher.response";
import { supplierServices } from "../../../services/data/party.services";
import voucherServices from "../../../services/data/voucher.services";
import {
  selectUserId,
  useAccountStore,
} from "../../../store/data/account/account.store";
import {
  datasetFiltersOf,
  datasetSourcesOf,
  derivedPage,
  matchesLedgerFilters,
  withOfflineDerive,
} from "../../../utils/dataset.utils";
import {
  scopedFilters,
  voucherFilterColumns,
} from "../../../utils/filter.utils";
import { formatMoney, todayIso } from "../../../utils/format.utils";
import { toOptions } from "../../../utils/option.utils";
import { resolveParty } from "../../../utils/party.utils";
import { derivePaymentValues } from "../../../utils/payment.utils";
import { printVoucher } from "../../../utils/print.utils";
import {
  deriveVoucherValues,
  isOwnOpenVoucher,
  voucherBreakdownDefaults,
  voucherBreakdownOf,
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
import { usePushOffer } from "../../common/push.hook";
import { useQuery } from "../../common/query.hook";
import { useSortOption } from "../../common/sort.hook";
import { useBankAccountListHook } from "../bank/bank.account.list.hook";
import { useBranchListHook } from "../branch/branch.list.hook";
import { useBranchScopeHook } from "../branch/branch.scope.hook";
import { useSupplierListHook } from "../party/supplier.list.hook";
import { useUserListHook } from "../user/user.list.hook";

const deriveKindVatValues = (
  changed: Path<IVoucherInput>,
  values: IVoucherInput
): Partial<IVoucherInput> | null => {
  if (changed !== "kind") return null;

  if (values.kind !== "purchase") {
    return { vatable: false, withholding: "none", ewt_amount: 0, less_return: null };
  }

  return { vatable: true, ...deriveVoucherValues("vatable", { ...values, vatable: true }) };
};

const isPurchaseVoucher = (values: IVoucherInput): boolean =>
  values.kind === "purchase";

const isParticularsField = (field: IFieldConfig<IVoucherInput>): boolean =>
  field.name === "particulars";

const particularsFields = (): IFieldConfig<IVoucherInput>[] =>
  voucherBreakdownFields<IVoucherInput>().filter(isParticularsField);

const purchaseOnlyBreakdownFields = (): IFieldConfig<IVoucherInput>[] =>
  voucherBreakdownFields<IVoucherInput>()
    .filter((field) => !isParticularsField(field))
    .map((field) => ({
      ...field,
      hidden: (values) =>
        !isPurchaseVoucher(values) || (field.hidden?.(values) ?? false),
    }));

const deriveManualVoucherValues = (
  changed: Path<IVoucherInput>,
  values: IVoucherInput
): Partial<IVoucherInput> => ({
  ...deriveVoucherValues(changed, values),
  ...deriveKindVatValues(changed, values),
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

const asApproved = (voucher: IVoucher): IVoucher => ({
  ...voucher,
  status: "approved",
});

const voucherDatasetKeyOf = (filters: ILedgerFilters) =>
  scopedKey(voucherListKey, "dataset", JSON.stringify(filters));

const matchesVoucherFilters = (filters: ILedgerFilters) => (row: IVoucher) =>
  matchesLedgerFilters(row, filters, voucherFilterColumns) &&
  (!filters.voucherStatus || row.status === filters.voucherStatus);

export const voucherDatasetQueryOf = (
  branch: string | null
): IQuerySpec<IVoucher[]> => {
  const filters = scopedFilters({}, branch);

  return [voucherDatasetKeyOf(filters), () => voucherServices.getAll(filters)];
};

export const voucherListQueryOf = (
  filters: ILedgerFilters,
  pagination: IPaginationRequest,
  sortOption: ISortOption | undefined
): IQuerySpec<IPaginationResponse<IVoucher>> => [
  scopedKey(
    voucherListKey,
    JSON.stringify(filters),
    pagination.pageNumber,
    pagination.pageSize,
    sortOption?.key
  ),
  withOfflineDerive(
    () => voucherServices.getList(filters, { ...pagination, sort: sortOption }),
    derivedPage(
      datasetSourcesOf(voucherDatasetKeyOf, [datasetFiltersOf(filters)]),
      filters,
      matchesVoucherFilters(filters),
      sortOption,
      pagination
    )
  ),
];

export const useVoucherListHook = () => {
  const formModal = useModal(voucherFormModalKey);
  const editModal = useModal<IVoucher>(voucherEditModalKey);
  const rejectModal = useModal<IVoucher>(voucherRejectModalKey);
  const sourceModal = useModal<IVoucher>(voucherSourceModalKey);
  const reasonModal = useModal<IVoucher>(voucherReasonModalKey);
  const createdBy = useAccountStore(selectUserId);
  const offerPush = usePushOffer();
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
  const { suppliers, supplierOptions } = useSupplierListHook();
  const { userNameOf } = useUserListHook();
  const { accountLabelOf, accountDefaultsOfLabel, bankAccountFields } =
    useBankAccountListHook();
  const { branch: scopeBranch } = useBranchScopeHook();

  const effectiveFilters = scopedFilters(filters, scopeBranch);

  const listQuery = useQuery(
    ...voucherListQueryOf(effectiveFilters, pagination, sortOption),
    { keepPrevious: true }
  );

  const vouchers = useWithPendingRows(
    listQuery.data?.data ?? [],
    (write) => {
      const pending = voucherServices.pendingOf(write);
      return pending && permissions.isManager ? asApproved(pending) : pending;
    },
    {
      enabled:
        pagination.pageNumber === 1 &&
        (!effectiveFilters.voucherStatus ||
          effectiveFilters.voucherStatus === "pending"),
      branch: scopeBranch,
    }
  );

  const withPayee = async (values: IVoucherInput): Promise<IVoucherInput> => {
    if (values.kind !== "purchase") return { ...values, supplier_id: null };

    const supplier = await resolveParty(
      suppliers,
      values.payee,
      supplierServices.create
    );
    return { ...values, supplier_id: supplier.id, payee: supplier.name };
  };

  const createMutation = useMutation(
    async (values: IVoucherInput) => {
      const prepared = await withPayee(values);
      return voucherServices.create(
        { ...prepared, check_bank: accountLabelOf(prepared.bank_account_id) },
        createdBy
      );
    },
    {
      successMessage: permissions.isManager
        ? "Voucher saved — approved"
        : "Voucher submitted for approval",
      invalidate: [voucherListKey, supplierListKey],
      onSuccess: () => {
        formModal.closeModal();
        setPagination({ pageNumber: 1 });
        offerPush();
      },
    }
  );

  const updateMutation = useMutation(
    async (payload: { id: string; values: IVoucherInput }) => {
      const prepared = await withPayee(payload.values);
      return voucherServices.update(payload.id, {
        ...prepared,
        check_bank: accountLabelOf(prepared.bank_account_id),
      });
    },
    {
      successMessage: "Voucher updated",
      invalidate: [voucherListKey, payableListKey, supplierListKey],
      onSuccess: editModal.closeModal,
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

  const sections: IFieldSection<IVoucherInput>[] = [
    {
      key: "voucher",
      title: "Voucher",
      fields: [
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
        {
          name: "payee",
          label: "Payee",
          type: "creatable",
          required: true,
          options: supplierOptions,
        },
        {
          name: "amount",
          label: "Invoice amount",
          type: "amount",
          required: true,
          prefix: "₱",
          hint: "Invoice total as billed.",
        },
        {
          name: "due_date",
          label: "Payable due date",
          type: "date",
          required: true,
          hidden: (values) => values.kind !== "purchase",
        },
        ...particularsFields(),
      ],
    },
    {
      key: "payment",
      title: "Payment",
      fields: [
        ...bankAccountFields<IVoucherInput>((values) => values.type === "check"),
        {
          name: "check_number",
          label: "Check number",
          type: "text",
          required: true,
          hidden: (values) => values.type !== "check",
        },
        {
          name: "check_number",
          label: "Check number",
          type: "text",
          hint: "Optional",
          hidden: (values) =>
            values.type === "check" || values.kind !== "purchase",
        },
        {
          name: "check_due_date",
          label: "Check due date",
          type: "date",
          required: true,
          hidden: (values) => values.type !== "check",
        },
      ],
    },
    {
      key: "breakdown",
      title: "Voucher breakdown",
      fields: purchaseOnlyBreakdownFields(),
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

  const editDefaultsOf = (voucher: IVoucher): DefaultValues<IVoucherInput> => ({
    ...voucherBreakdownOf(voucher),
    ...accountDefaultsOfLabel(voucher.check_bank),
    type: voucher.type,
    kind: voucherDisbursementKind(voucher),
    branch: voucher.branch as BranchSlug,
    payee: voucher.payee,
    amount: Number(voucher.gross_amount ?? voucher.amount),
    supplier_id: voucher.supplier_id,
    due_date: voucher.due_date ?? todayIso(),
    check_bank: voucher.check_bank ?? "",
    check_number: voucher.check_number ?? "",
    check_due_date: voucher.check_due_date ?? todayIso(),
  });

  const editRow = editModal.modal.data;

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
    userNameOf,
    formModal,
    sections,
    defaults,
    formSummary: voucherSummaryLines,
    deriveFormValues: deriveManualVoucherValues,
    createMutation,
    editModal,
    editRow,
    editDefaultsOf,
    updateMutation,
    confirmApprove,
    rejectModal,
    rejectRow: rejectModal.modal.data,
    rejectSections,
    rejectDefaults: { reason: "" },
    rejectMutation,
    print,
    sourceModal,
    reasonModal,
    isOwnOpen: (voucher: IVoucher) =>
      isOwnOpenVoucher(voucher, createdBy, permissions.isManager),
  };
};
