import {
  transactionSortOptions,
  type DisbursementKind,
} from "../../../enums/transaction.enum";
import {
  disbursementEditModalKey,
  disbursementFormModalKey,
  disbursementHistoryModalKey,
  periodPrintModalKey,
} from "../../../keys/modal.keys";
import {
  expenseCategoryListKey,
  expenseListKey,
  expenseSummaryKey,
  purchaseListKey,
  purchaseSummaryKey,
  scopedKey,
  supplierListKey,
  voucherListKey,
} from "../../../keys/query.keys";
import {
  disbursementPaginationKey,
  disbursementSortKey,
} from "../../../keys/table.keys";
import type { Path } from "react-hook-form";
import type { IFieldSection } from "../../../models/common/field.model";
import type { ILedgerFilters } from "../../../models/common/filter.model";
import type { IPaginationResponse } from "../../../models/common/pagination.model";
import type { IDateRange } from "../../../models/common/period.model";
import type { IDisbursementInput } from "../../../models/data/transaction/transaction.request";
import {
  sumCounted,
  type IDisbursement,
  type ITransactionAudit,
} from "../../../models/data/transaction/transaction.response";
import transactionServices from "../../../services/data/transaction.services";
import {
  selectUserId,
  useAccountStore,
} from "../../../store/data/account/account.store";
import { filterPeriodLabel, scopedFilters } from "../../../utils/filter.utils";
import { derivePaymentValues } from "../../../utils/payment.utils";
import { printReport } from "../../../utils/print.utils";
import { disbursementPrintDocument } from "../../../utils/report.utils";
import {
  deriveVoucherValues,
  voucherBreakdownFields,
  voucherSummaryLines,
} from "../../../utils/voucher.utils";
import { usePermissions } from "../../account/account.permission.hook";
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
import { useDisbursementFormHook } from "./disbursement.form.hook";
import { useFarmSectionListHook } from "../farm-section/farm.section.list.hook";
import { useUserListHook } from "../user/user.list.hook";

export const disbursementScopeOf = (kind: DisbursementKind) =>
  kind === "purchase" ? purchaseListKey : expenseListKey;

const deriveDisbursementValues = (
  changed: Path<IDisbursementInput>,
  values: IDisbursementInput
): Partial<IDisbursementInput> => ({
  ...deriveVoucherValues(changed, values),
  ...derivePaymentValues(changed, values),
});

const summaryKeyOf = (kind: DisbursementKind) =>
  kind === "purchase" ? purchaseSummaryKey : expenseSummaryKey;

export const isDisbursementLocked = (row: IDisbursement) =>
  !!row.voucher && (row.voucher.status === "approved" || row.voucher.printed);

export const isDisbursementRejected = (row: IDisbursement) =>
  row.voucher?.status === "rejected";

export const pendingVoucherCount = (rows: readonly IDisbursement[]) =>
  rows.filter((row) => row.voucher?.status === "pending").length;

export const sumDisbursements = (rows: readonly IDisbursement[]) =>
  sumCounted(rows);

export const useDisbursementListHook = (
  kind: DisbursementKind,
  title: string
) => {
  const scope = disbursementScopeOf(kind);
  const summaryScope = summaryKeyOf(kind);

  const formModal = useModal(disbursementFormModalKey(scope));
  const editModal = useModal<IDisbursement>(disbursementEditModalKey(scope));
  const historyModal = useModal<IDisbursement>(
    disbursementHistoryModalKey(scope)
  );

  const { pagination, setPagination, goToPage } = usePagination(
    disbursementPaginationKey(scope)
  );
  const { sortOption, sortKey, sortOptions, changeSort } = useSortOption(
    disbursementSortKey(scope),
    transactionSortOptions,
    () => setPagination({ pageNumber: 1 })
  );
  const permissions = usePermissions();
  const createdBy = useAccountStore(selectUserId);

  const { filters } = useLedgerFilters("page");
  const { branchOptions, branchName, defaultBranch } = useBranchListHook();
  const { farmSectionOptions } = useFarmSectionListHook();
  const { userById, userNameOf } = useUserListHook();
  const { paymentFields, paymentDefaultsOf, paymentLabelOf } =
    useBankAccountListHook();
  const { branch: scopeBranch, branchName: scopeName } = useBranchScopeHook();
  const printModalKey = periodPrintModalKey(scope);
  const printModal = useModal(printModalKey);
  const { payeeOptions, prepare } = useDisbursementFormHook(kind);

  const effectiveFilters = scopedFilters(filters, scopeBranch);
  const summaryFilters: ILedgerFilters = {
    ...effectiveFilters,
    voucherStatus: undefined,
  };
  const pageRequest = { ...pagination, sort: sortOption };

  const listQuery = useQuery<IPaginationResponse<IDisbursement>>(
    scopedKey(
      scope,
      JSON.stringify(effectiveFilters),
      pagination.pageNumber,
      pagination.pageSize,
      sortKey
    ),
    () =>
      transactionServices.getDisbursementList(kind, effectiveFilters, pageRequest)
  );

  const summaryQuery = useQuery<IDisbursement[]>(
    scopedKey(summaryScope, JSON.stringify(summaryFilters)),
    () => transactionServices.getDisbursementAll(kind, summaryFilters)
  );

  const rows = useWithPendingRows(
    listQuery.data?.data ?? [],
    (write) => transactionServices.pendingDisbursementOf(kind, write),
    {
      enabled: pagination.pageNumber === 1 && !effectiveFilters.voucherStatus,
      branch: scopeBranch,
    }
  );

  const editRow = editModal.modal.data;
  const editRejected = !!editRow && isDisbursementRejected(editRow);
  const historyRow = historyModal.modal.data;

  const auditQuery = useQuery<ITransactionAudit[]>(
    scopedKey(scope, "audit", historyRow?.id),
    () => transactionServices.getAudit(historyRow?.id as string),
    { enabled: historyModal.modal.visible && !!historyRow }
  );

  const invalidate = [
    scope,
    summaryScope,
    voucherListKey,
    supplierListKey,
    expenseCategoryListKey,
  ];

  const createMutation = useMutation(
    async (values: IDisbursementInput) =>
      transactionServices.createDisbursement(
        kind,
        await prepare(values),
        createdBy
      ),
    {
      successMessage: `${title} recorded — voucher pending approval`,
      invalidate,
      onSuccess: () => {
        formModal.closeModal();
        setPagination({ pageNumber: 1 });
      },
    }
  );

  const updateMutation = useMutation(
    async (payload: { id: string; values: IDisbursementInput }) =>
      transactionServices.updateDisbursement(
        payload.id,
        kind,
        await prepare(payload.values),
        editRow?.version ?? 0,
        editRow?.voucher?.status ?? null
      ),
    {
      successMessage: editRejected
        ? `${title} resubmitted — voucher pending approval`
        : `${title} updated`,
      invalidate,
      onSuccess: editModal.closeModal,
    }
  );

  const removeMutation = useMutation(
    (id: string) => transactionServices.remove(id),
    { successMessage: `${title} deleted`, invalidate }
  );

  const breakdownSection: IFieldSection<IDisbursementInput> = {
    key: "breakdown",
    title: "Voucher breakdown",
    fields: voucherBreakdownFields<IDisbursementInput>(),
  };

  const disbursementPaymentFields = paymentFields<IDisbursementInput>(
    "Paid from"
  ).map((field) =>
    field.name === "cash_account"
      ? { ...field, required: true, allowClear: false }
      : field
  );

  const printPeriod = async (range: IDateRange) => {
    const rows = await transactionServices.getDisbursementAll(
      kind,
      scopedFilters({ dateFrom: range.from, dateTo: range.to }, scopeBranch)
    );
    printReport(
      disbursementPrintDocument(kind, rows, range, scopeName ?? "All branches")
    );
  };

  return {
    permissions,
    rows,
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
    summaryRows: summaryQuery.data ?? [],
    summaryLoading: summaryQuery.isInitialLoading,
    summaryError: summaryQuery.error,
    retrySummary: summaryQuery.refetch,
    summaryPeriod: filterPeriodLabel(effectiveFilters),
    branchOptions,
    branchName,
    defaultBranch,
    farmSectionOptions,
    payeeOptions,
    userById,
    userNameOf,
    formModal,
    editModal,
    historyModal,
    editRow,
    editRejected,
    rejectedByName: userNameOf(editRow?.voucher?.approved_by ?? null),
    historyRow,
    audit: auditQuery.data ?? [],
    auditLoading: auditQuery.isInitialLoading,
    createMutation,
    updateMutation,
    removeMutation,
    breakdownSection,
    formSummary: voucherSummaryLines,
    disbursementPaymentFields,
    paymentDefaultsOf,
    paymentLabelOf,
    deriveFormValues: deriveDisbursementValues,
    printModalKey,
    openPrint: () => printModal.openModal(),
    printPeriod,
  };
};
