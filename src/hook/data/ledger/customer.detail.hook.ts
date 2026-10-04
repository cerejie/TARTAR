import {
  customerInfoModalKey,
  customerPaymentModalKey,
} from "../../../keys/modal.keys";
import {
  paymentListKey,
  receivableListKey,
  scopedKey,
} from "../../../keys/query.keys";
import type { IRecordPaymentInput } from "../../../models/data/payment/payment.request";
import type { IQueryFetcher } from "../../../models/common/query.model";
import type {
  ICustomerLedgerKey,
  ICustomerReceivableSummary,
  ILedgerPartyKey,
  IReceivable,
} from "../../../models/data/ledger/ledger.response";
import { ledgerKeyOf } from "../../../models/data/ledger/ledger.response";
import type { ILedgerPayment } from "../../../models/data/payment/payment.response";
import { receivableServices } from "../../../services/data/ledger.services";
import paymentServices from "../../../services/data/payment.services";
import {
  selectUserId,
  useAccountStore,
} from "../../../store/data/account/account.store";
import { useLedgerStore } from "../../../store/data/ledger/ledger.store";
import {
  datasetSourcesOf,
  derivedRows,
  withOfflineDerive,
} from "../../../utils/dataset.utils";
import { scopedFilters } from "../../../utils/filter.utils";
import { usePermissions } from "../../account/account.permission.hook";
import { useLedgerFilters } from "../../common/filter.hook";
import { useModal } from "../../common/modal.hook";
import { useMutation } from "../../common/mutation.hook";
import { useQuery } from "../../common/query.hook";
import { useBranchListHook } from "../branch/branch.list.hook";
import { useBranchScopeHook } from "../branch/branch.scope.hook";
import {
  partyPaymentsFetcherOf,
  paymentDatasetKeyOf,
} from "../payment/payment.list.hook";
import { transactionSummaryQueryOf } from "../transaction/transaction.list.hook";
import { useUserListHook } from "../user/user.list.hook";
import { customerSummaryKey } from "./customer.ledger.hook";
import { partyLedgerFetcherOf } from "./ledger.list.hook";

const partyOf = (customer: ICustomerLedgerKey): ILedgerPartyKey => ({
  partyId: customer.customerId,
  partyName: customer.customerName,
});

const isVerifiedPaymentOf =
  (customerId: string) =>
  (payment: ILedgerPayment): boolean =>
    payment.customer_id === customerId && payment.status === "verified";

const lastPaymentFetcherOf = (
  customerId: string | null
): IQueryFetcher<string | null> =>
  withOfflineDerive(
    () => receivableServices.getCustomerLastPayment(customerId),
    (read) => {
      if (!customerId) return null;

      const payments = derivedRows(
        datasetSourcesOf(paymentDatasetKeyOf("receivable"), []),
        {},
        isVerifiedPaymentOf(customerId)
      )(read);
      const transactions = transactionSummaryQueryOf({ customerId })[1].offline?.(read);
      if (!payments || !transactions) return undefined;

      const paymentDates = [
        ...payments.map((payment) => payment.paid_at),
        ...transactions
          .filter((transaction) => transaction.type !== "sale")
          .map((transaction) => transaction.txn_date),
      ];

      return paymentDates.sort().at(-1) ?? null;
    }
  );

export const useCustomerDetailHook = () => {
  const customer = useLedgerStore((state) => state.ledgerCustomer);
  const closeLedgerDetail = useLedgerStore((state) => state.closeLedgerDetail);
  const detailOpen = useLedgerStore((state) => state.ledgerDetailOpen);
  const selection = useLedgerStore((state) => state.ledgerSelection);
  const setSelection = useLedgerStore((state) => state.setLedgerSelection);
  const selecting = useLedgerStore((state) => state.ledgerSelecting);
  const setSelecting = useLedgerStore((state) => state.setLedgerSelecting);
  const partyTab = useLedgerStore((state) => state.ledgerPartyTab);
  const setPartyTab = useLedgerStore((state) => state.setLedgerPartyTab);

  const paymentModal = useModal(customerPaymentModalKey);
  const infoModal = useModal(customerInfoModalKey);

  const createdBy = useAccountStore(selectUserId);
  const permissions = usePermissions();
  const { branchName } = useBranchListHook();
  const { branch: scopeBranch, printScope } = useBranchScopeHook();
  const { userNameOf } = useUserListHook();
  const { filters } = useLedgerFilters("customer-ledger");

  const key = customer ? ledgerKeyOf(customer) : "";
  const effectiveFilters = scopedFilters(filters, scopeBranch);

  const listQuery = useQuery<IReceivable[]>(
    scopedKey(
      receivableListKey,
      "ledger",
      key,
      JSON.stringify(effectiveFilters)
    ),
    customer
      ? partyLedgerFetcherOf(
          "receivables",
          () => receivableServices.getCustomerLedger(customer, effectiveFilters),
          partyOf(customer),
          effectiveFilters
        )
      : () => Promise.resolve([]),
    { enabled: !!customer }
  );

  const summaryQuery = useQuery<ICustomerReceivableSummary[]>(
    customerSummaryKey,
    receivableServices.getCustomerSummaries
  );

  const lastPaymentQuery = useQuery<string | null>(
    scopedKey(receivableListKey, "last-payment", customer?.customerId),
    lastPaymentFetcherOf(customer?.customerId ?? null),
    { enabled: !!customer?.customerId }
  );

  const paymentsQuery = useQuery<ILedgerPayment[]>(
    scopedKey(paymentListKey, "receivable", key),
    customer
      ? partyPaymentsFetcherOf("receivable", partyOf(customer))
      : () => Promise.resolve([]),
    { enabled: !!customer }
  );

  const rows = listQuery.data ?? [];
  const hasUnpaidRows = rows.some((row) => row.status !== "paid");
  const selectedRows = rows.filter(
    (row) => selection.includes(row.id) && row.status !== "paid"
  );

  const summary = (summaryQuery.data ?? []).find(
    (item) => ledgerKeyOf(item) === key
  );

  const recordPaymentMutation = useMutation(
    (values: IRecordPaymentInput) =>
      paymentServices.record("receivable", values, createdBy),
    {
      successMessage: permissions.isManager
        ? "Payment recorded"
        : "Payment recorded — pending verification",
      invalidate: [receivableListKey, paymentListKey],
      onSuccess: () => {
        paymentModal.closeModal();
        setSelecting(false);
        setSelection([]);
      },
    }
  );

  return {
    customer,
    detailOpen,
    permissions,
    rows,
    selection,
    selectedRows,
    setSelection,
    selecting,
    setSelecting,
    partyTab,
    setPartyTab,
    hasUnpaidRows,
    summary,
    summaryLoading: summaryQuery.loading,
    listLoading: listQuery.loading,
    lastPayment: lastPaymentQuery.data ?? null,
    lastPaymentLoading: lastPaymentQuery.loading,
    payments: paymentsQuery.data ?? [],
    branchName,
    printScope,
    userNameOf,
    paymentModal,
    infoModal,
    recordPaymentMutation,
    closeLedgerDetail,
  };
};
