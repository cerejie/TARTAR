import dayjs from "dayjs";
import type { DefaultValues, FieldValues } from "react-hook-form";
import type { ZodType } from "zod";
import {
  ledgerSortOptions,
  type PaymentKind,
} from "../../../enums/ledger.enum";
import {
  ledgerFormModalKey,
  ledgerPaymentModalKey,
} from "../../../keys/modal.keys";
import {
  customerListKey,
  ledgerPartyKey,
  ledgerSummaryKey,
  paymentListKey,
  scopedKey,
  supplierListKey,
} from "../../../keys/query.keys";
import {
  ledgerPaginationKey,
  ledgerSortKey,
} from "../../../keys/table.keys";
import type { IFieldSection } from "../../../models/common/field.model";
import type { ILedgerFilters } from "../../../models/common/filter.model";
import type {
  IPaginationRequest,
  IPaginationResponse,
} from "../../../models/common/pagination.model";
import type { IMutationResult } from "../../../models/common/query.model";
import {
  ledgerBalance,
  partyKeyOf,
  type ILedgerPartyKey,
  type ILedgerPartySummary,
  type ILedgerRow,
  type ILedgerSummary,
  type IPaymentTarget,
} from "../../../models/data/ledger/ledger.response";
import type { IPaymentFormInput } from "../../../models/data/payment/payment.request";
import paymentServices from "../../../services/data/payment.services";
import {
  selectUserId,
  useAccountStore,
} from "../../../store/data/account/account.store";
import { filterPeriodLabel, scopedFilters } from "../../../utils/filter.utils";
import { formatDate, formatMoney, todayIso } from "../../../utils/format.utils";
import { usePermissions } from "../../account/account.permission.hook";
import { useLedgerFilters } from "../../common/filter.hook";
import { useModal } from "../../common/modal.hook";
import { useMutation } from "../../common/mutation.hook";
import { usePagination } from "../../common/pagination.hook";
import { useQuery } from "../../common/query.hook";
import { useSortOption } from "../../common/sort.hook";
import { useBranchListHook } from "../branch/branch.list.hook";
import { useBranchScopeHook } from "../branch/branch.scope.hook";
import { useUserListHook } from "../user/user.list.hook";

export interface ILedgerServices<Row extends ILedgerRow, Input> {
  getList: (
    filters: ILedgerFilters,
    pagination: IPaginationRequest
  ) => Promise<IPaginationResponse<Row>>;
  getAll: (filters: ILedgerFilters) => Promise<Row[]>;
  getPartySummaries: () => Promise<ILedgerPartySummary[]>;
  getPartyLedger: (
    party: ILedgerPartyKey,
    filters: ILedgerFilters
  ) => Promise<Row[]>;
  create(values: Input, createdBy: string | null): Promise<IMutationResult>;
  remove(id: string): Promise<IMutationResult>;
}

export interface ILedgerListConfig<
  Row extends ILedgerRow,
  Input extends FieldValues,
> {
  scope: "receivables" | "payables";
  kind: PaymentKind;
  title: string;
  partyLabel: string;
  services: ILedgerServices<Row, Input>;
  schema: ZodType<Input>;
  sections: IFieldSection<Input>[];
  defaults: DefaultValues<Input>;
  partyOf(row: Row): ILedgerPartyKey;
  prepare(values: Input): Promise<Input>;
}

const dueSoonDays = 7;

const summarize = (rows: readonly ILedgerRow[]): ILedgerSummary => {
  const today = todayIso();
  const soonLimit = dayjs().add(dueSoonDays, "day").format("YYYY-MM-DD");
  const unpaid = rows.filter((row) => row.status !== "paid");
  const overdueRows = unpaid.filter((row) => row.due_date < today);
  const dueSoonRows = unpaid.filter(
    (row) => row.due_date >= today && row.due_date <= soonLimit
  );
  const total = (items: readonly ILedgerRow[]) =>
    items.reduce((sum, row) => sum + ledgerBalance(row), 0);

  return {
    outstanding: total(unpaid),
    overdue: total(overdueRows),
    overdueCount: overdueRows.length,
    dueSoon: total(dueSoonRows),
  };
};

const paymentRowLabel = (row: ILedgerRow, index: number) =>
  row.reference_number?.trim() || `Record ${index + 1}`;

const paymentRowHint = (row: ILedgerRow) =>
  `Due ${formatDate(row.due_date)} · Balance ${formatMoney(ledgerBalance(row))}`;

export const useLedgerListHook = <
  Row extends ILedgerRow,
  Input extends FieldValues,
>(
  config: ILedgerListConfig<Row, Input>
) => {
  const formModal = useModal(ledgerFormModalKey(config.scope));
  const paymentModal = useModal<IPaymentTarget>(
    ledgerPaymentModalKey(config.scope)
  );
  const { pagination, setPagination, goToPage } = usePagination(
    ledgerPaginationKey(config.scope)
  );
  const { sortOption, sortKey, sortOptions, changeSort } = useSortOption(
    ledgerSortKey(config.scope),
    ledgerSortOptions,
    () => setPagination({ pageNumber: 1 })
  );
  const permissions = usePermissions();
  const createdBy = useAccountStore(selectUserId);

  const { filters } = useLedgerFilters("ledger");
  const { branchName } = useBranchListHook();
  const { userNameOf } = useUserListHook();
  const { branch: scopeBranch } = useBranchScopeHook();

  const effectiveFilters = scopedFilters(filters, scopeBranch);
  const summaryFilters: ILedgerFilters = {
    ...effectiveFilters,
    status: undefined,
  };
  const invalidate = [
    config.scope,
    ledgerSummaryKey,
    ledgerPartyKey,
    paymentListKey,
    customerListKey,
    supplierListKey,
  ];

  const listQuery = useQuery<IPaginationResponse<Row>>(
    scopedKey(
      config.scope,
      JSON.stringify(effectiveFilters),
      pagination.pageNumber,
      pagination.pageSize,
      sortKey
    ),
    () =>
      config.services.getList(effectiveFilters, {
        ...pagination,
        sort: sortOption,
      })
  );

  const summaryQuery = useQuery<Row[]>(
    scopedKey(ledgerSummaryKey, config.scope, JSON.stringify(summaryFilters)),
    () => config.services.getAll(summaryFilters)
  );

  const partyQuery = useQuery<ILedgerPartySummary[]>(
    scopedKey(ledgerPartyKey, config.scope),
    config.services.getPartySummaries
  );

  const paymentTarget = paymentModal.modal.data;
  const partyLedgerQuery = useQuery<Row[]>(
    scopedKey(
      config.scope,
      "party-open",
      paymentTarget ? partyKeyOf(paymentTarget.party) : null
    ),
    () =>
      paymentTarget
        ? config.services.getPartyLedger(paymentTarget.party, {
            status: "unpaid",
          })
        : Promise.resolve([]),
    {
      enabled:
        paymentModal.modal.visible && !!paymentTarget && !paymentTarget.rows,
    }
  );

  const paymentRows: ILedgerRow[] =
    paymentTarget?.rows ?? partyLedgerQuery.data ?? [];

  const createMutation = useMutation(
    async (values: Input) =>
      config.services.create(await config.prepare(values), createdBy),
    {
      successMessage: `${config.title} recorded`,
      invalidate,
      onSuccess: () => {
        formModal.closeModal();
        setPagination({ pageNumber: 1 });
      },
    }
  );

  const removeMutation = useMutation(
    (id: string) => config.services.remove(id),
    {
      successMessage: `${config.title} deleted`,
      invalidate,
    }
  );

  const paymentMutation = useMutation(
    (values: IPaymentFormInput) =>
      paymentServices.record(
        config.kind,
        {
          partyId: paymentTarget?.party.partyId ?? null,
          partyName: paymentTarget?.party.partyName ?? "",
          paidAt: values.paid_at,
          referenceNumber: values.reference_number ?? null,
          allocations: paymentRows
            .map((row) => ({
              ledgerId: row.id,
              amount: values.amounts[row.id] ?? 0,
            }))
            .filter((allocation) => allocation.amount > 0),
        },
        createdBy
      ),
    {
      successMessage: "Payment recorded — pending verification",
      invalidate,
      onSuccess: paymentModal.closeModal,
    }
  );

  const paymentSections: IFieldSection<IPaymentFormInput>[] = [
    {
      key: "payment",
      title: "Payment",
      fields: [
        {
          name: "paid_at",
          label: "Date",
          type: "date",
          span: "half",
          required: true,
        },
        {
          name: "reference_number",
          label: "Reference no.",
          type: "text",
          span: "half",
        },
        ...paymentRows.map((row, index) => ({
          name: `amounts.${row.id}` as const,
          label: paymentRowLabel(row, index),
          hint: paymentRowHint(row),
          type: "amount" as const,
          prefix: "₱",
        })),
      ],
    },
  ];

  const paymentDefaults: DefaultValues<IPaymentFormInput> = {
    paid_at: todayIso(),
    reference_number: "",
    amounts: Object.fromEntries(
      paymentRows.map((row) => [row.id, ledgerBalance(row)])
    ),
  };

  const searchTerm = (filters.search ?? "").trim().toLowerCase();
  const parties = (partyQuery.data ?? []).filter((party) =>
    party.partyName.toLowerCase().includes(searchTerm)
  );

  const openPaymentFor = (row: Row) =>
    paymentModal.openModal({ party: config.partyOf(row), rows: [row] });
  const openPaymentForParty = (party: ILedgerPartyKey) =>
    paymentModal.openModal({ party });

  return {
    permissions,
    title: config.title,
    partyLabel: config.partyLabel,
    rows: listQuery.data?.data ?? [],
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
    summary: summarize(summaryQuery.data ?? []),
    summaryLoading: summaryQuery.isInitialLoading,
    summaryError: summaryQuery.error,
    retrySummary: summaryQuery.refetch,
    summaryPeriod: filterPeriodLabel(effectiveFilters),
    parties,
    partiesLoading: partyQuery.isInitialLoading,
    partiesRefreshing: partyQuery.isRefreshing,
    partiesError: partyQuery.error,
    retryParties: partyQuery.refetch,
    branchName,
    userNameOf,
    formModal,
    schema: config.schema,
    sections: config.sections,
    defaults: config.defaults,
    createMutation,
    removeMutation,
    paymentModal,
    paymentTarget,
    paymentRows,
    paymentRowsLoading: partyLedgerQuery.isInitialLoading,
    paymentSections,
    paymentDefaults,
    paymentMutation,
    openPaymentFor,
    openPaymentForParty,
  };
};
