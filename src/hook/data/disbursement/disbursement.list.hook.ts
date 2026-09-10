import type { DisbursementKind } from "../../../enums/transaction.enum";
import {
  disbursementEditModalKey,
  disbursementFormModalKey,
  disbursementHistoryModalKey,
} from "../../../keys/modal.keys";
import {
  expenseListKey,
  expenseSummaryKey,
  purchaseListKey,
  purchaseSummaryKey,
  scopedKey,
  voucherListKey,
} from "../../../keys/query.keys";
import { disbursementPaginationKey } from "../../../keys/table.keys";
import type { IPaginationResponse } from "../../../models/common/pagination.model";
import type { IDisbursementInput } from "../../../models/data/transaction/transaction.request";
import type {
  IDisbursement,
  ITransactionAudit,
} from "../../../models/data/transaction/transaction.response";
import transactionServices from "../../../services/data/transaction.services";
import {
  selectUserId,
  useAccountStore,
} from "../../../store/data/account/account.store";
import { filterPeriodLabel, scopedFilters } from "../../../utils/filter.utils";
import { usePermissions } from "../../account/account.permission.hook";
import { useLedgerFilters } from "../../common/filter.hook";
import { useModal } from "../../common/modal.hook";
import { useMutation } from "../../common/mutation.hook";
import { usePagination } from "../../common/pagination.hook";
import { useQuery } from "../../common/query.hook";
import { useBranchListHook } from "../branch/branch.list.hook";
import { useBranchScopeHook } from "../branch/branch.scope.hook";
import { useFarmSectionListHook } from "../farm-section/farm.section.list.hook";
import { useSupplierListHook } from "../party/supplier.list.hook";
import { useUserListHook } from "../user/user.list.hook";

const listKeyOf = (kind: DisbursementKind) =>
  kind === "purchase" ? purchaseListKey : expenseListKey;

const summaryKeyOf = (kind: DisbursementKind) =>
  kind === "purchase" ? purchaseSummaryKey : expenseSummaryKey;

export const isDisbursementLocked = (row: IDisbursement) =>
  !!row.voucher && (row.voucher.status !== "pending" || row.voucher.printed);

export const pendingVoucherCount = (rows: readonly IDisbursement[]) =>
  rows.filter((row) => row.voucher?.status === "pending").length;

export const sumDisbursements = (rows: readonly IDisbursement[]) =>
  rows.reduce((total, row) => total + row.amount, 0);

export const useDisbursementListHook = (
  kind: DisbursementKind,
  title: string
) => {
  const scope = listKeyOf(kind);
  const summaryScope = summaryKeyOf(kind);

  const formModal = useModal(disbursementFormModalKey(scope));
  const editModal = useModal<IDisbursement>(disbursementEditModalKey(scope));
  const historyModal = useModal<IDisbursement>(
    disbursementHistoryModalKey(scope)
  );

  const { pagination, setPagination, goToPage } = usePagination(
    disbursementPaginationKey(scope)
  );
  const permissions = usePermissions();
  const createdBy = useAccountStore(selectUserId);

  const { filters } = useLedgerFilters("page");
  const { branchOptions, branchName, defaultBranch } = useBranchListHook();
  const { farmSectionOptions } = useFarmSectionListHook();
  const { supplierOptions } = useSupplierListHook();
  const { userById, userNameOf } = useUserListHook();
  const { branch: scopeBranch } = useBranchScopeHook();

  const effectiveFilters = scopedFilters(filters, scopeBranch);

  const listQuery = useQuery<IPaginationResponse<IDisbursement>>(
    scopedKey(
      scope,
      JSON.stringify(effectiveFilters),
      pagination.pageNumber,
      pagination.pageSize
    ),
    () =>
      transactionServices.getDisbursementList(kind, effectiveFilters, pagination)
  );

  const summaryQuery = useQuery<IDisbursement[]>(
    scopedKey(summaryScope, JSON.stringify(effectiveFilters)),
    () => transactionServices.getDisbursementAll(kind, effectiveFilters)
  );

  const editRow = editModal.modal.data;
  const historyRow = historyModal.modal.data;

  const auditQuery = useQuery<ITransactionAudit[]>(
    scopedKey(scope, "audit", historyRow?.id),
    () => transactionServices.getAudit(historyRow?.id as string),
    { enabled: historyModal.modal.visible && !!historyRow }
  );

  const invalidate = [scope, summaryScope, voucherListKey];

  const createMutation = useMutation(
    (values: IDisbursementInput) =>
      transactionServices.createDisbursement(kind, values, createdBy),
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
    (payload: { id: string; values: IDisbursementInput }) =>
      transactionServices.updateDisbursement(payload.id, kind, payload.values),
    {
      successMessage: `${title} updated`,
      invalidate,
      onSuccess: editModal.closeModal,
    }
  );

  const removeMutation = useMutation(
    (id: string) => transactionServices.remove(id),
    { successMessage: `${title} deleted`, invalidate }
  );

  return {
    permissions,
    rows: listQuery.data?.data ?? [],
    totalCount: listQuery.data?.totalCount ?? 0,
    pagination,
    goToPage,
    loading: listQuery.loading,
    summaryRows: summaryQuery.data ?? [],
    summaryLoading: summaryQuery.loading,
    summaryPeriod: filterPeriodLabel(effectiveFilters),
    branchOptions,
    branchName,
    defaultBranch,
    farmSectionOptions,
    supplierOptions,
    userById,
    userNameOf,
    formModal,
    editModal,
    historyModal,
    editRow,
    historyRow,
    audit: auditQuery.data ?? [],
    auditLoading: auditQuery.loading,
    createMutation,
    updateMutation,
    removeMutation,
  };
};
