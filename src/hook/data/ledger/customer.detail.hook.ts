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
import type {
  ICustomerReceivableSummary,
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
import { scopedFilters } from "../../../utils/filter.utils";
import { usePermissions } from "../../account/account.permission.hook";
import { useLedgerFilters } from "../../common/filter.hook";
import { useModal } from "../../common/modal.hook";
import { useMutation } from "../../common/mutation.hook";
import { useQuery } from "../../common/query.hook";
import { useBranchListHook } from "../branch/branch.list.hook";
import { useBranchScopeHook } from "../branch/branch.scope.hook";
import { useUserListHook } from "../user/user.list.hook";
import { customerSummaryKey } from "./customer.ledger.hook";

export const useCustomerDetailHook = () => {
  const customer = useLedgerStore((state) => state.ledgerCustomer);
  const closeLedgerDetail = useLedgerStore((state) => state.closeLedgerDetail);
  const selection = useLedgerStore((state) => state.ledgerSelection);
  const setSelection = useLedgerStore((state) => state.setLedgerSelection);

  const paymentModal = useModal(customerPaymentModalKey);
  const infoModal = useModal(customerInfoModalKey);

  const createdBy = useAccountStore(selectUserId);
  const permissions = usePermissions();
  const { branchName } = useBranchListHook();
  const { branch: scopeBranch } = useBranchScopeHook();
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
    () => receivableServices.getCustomerLedger(customer!, effectiveFilters),
    { enabled: !!customer }
  );

  const summaryQuery = useQuery<ICustomerReceivableSummary[]>(
    customerSummaryKey,
    receivableServices.getCustomerSummaries
  );

  const lastPaymentQuery = useQuery<string | null>(
    scopedKey(receivableListKey, "last-payment", customer?.customerId),
    () => receivableServices.getCustomerLastPayment(customer?.customerId ?? null),
    { enabled: !!customer?.customerId }
  );

  const paymentsQuery = useQuery<ILedgerPayment[]>(
    scopedKey(paymentListKey, "receivable", key),
    () =>
      paymentServices.getList(
        "receivable",
        customer?.customerId
          ? { partyId: customer.customerId }
          : { partyName: customer?.customerName ?? "" }
      ),
    { enabled: !!customer }
  );

  const rows = listQuery.data ?? [];
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
        setSelection([]);
      },
    }
  );

  return {
    customer,
    permissions,
    rows,
    selection,
    selectedRows,
    setSelection,
    summary,
    summaryLoading: summaryQuery.loading,
    listLoading: listQuery.loading,
    lastPayment: lastPaymentQuery.data ?? null,
    lastPaymentLoading: lastPaymentQuery.loading,
    payments: paymentsQuery.data ?? [],
    branchName,
    userNameOf,
    paymentModal,
    infoModal,
    recordPaymentMutation,
    closeLedgerDetail,
  };
};
