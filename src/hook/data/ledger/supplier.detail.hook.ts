import { payableMarkPaidModalKey } from "../../../keys/modal.keys";
import {
  payableListKey,
  paymentListKey,
  scopedKey,
} from "../../../keys/query.keys";
import { partyKeyOf } from "../../../models/data/ledger/ledger.response";
import { payableServices } from "../../../services/data/ledger.services";
import paymentServices from "../../../services/data/payment.services";
import { useLedgerStore } from "../../../store/data/ledger/ledger.store";
import { scopedFilters } from "../../../utils/filter.utils";
import { usePermissions } from "../../account/account.permission.hook";
import { useLedgerFilters } from "../../common/filter.hook";
import { useModal } from "../../common/modal.hook";
import { useQuery } from "../../common/query.hook";
import { useBranchListHook } from "../branch/branch.list.hook";
import { useBranchScopeHook } from "../branch/branch.scope.hook";
import { useUserListHook } from "../user/user.list.hook";
import { supplierSummaryKey } from "./supplier.ledger.hook";
import type {
  ILedgerPartySummary,
  IPayable,
} from "../../../models/data/ledger/ledger.response";
import type { ILedgerPayment } from "../../../models/data/payment/payment.response";

export const useSupplierDetailHook = () => {
  const supplier = useLedgerStore((state) => state.ledgerSupplier);
  const closeSupplierDetail = useLedgerStore(
    (state) => state.closeSupplierDetail
  );

  const markPaidModal = useModal<IPayable>(payableMarkPaidModalKey);
  const permissions = usePermissions();
  const { branchName } = useBranchListHook();
  const { branch: scopeBranch } = useBranchScopeHook();
  const { userNameOf } = useUserListHook();
  const { filters } = useLedgerFilters("supplier-ledger");

  const key = supplier ? partyKeyOf(supplier) : "";
  const effectiveFilters = scopedFilters(filters, scopeBranch);

  const listQuery = useQuery<IPayable[]>(
    scopedKey(payableListKey, "ledger", key, JSON.stringify(effectiveFilters)),
    () =>
      supplier
        ? payableServices.getPartyLedger(supplier, effectiveFilters)
        : Promise.resolve([]),
    { enabled: !!supplier }
  );

  const summaryQuery = useQuery<ILedgerPartySummary[]>(
    supplierSummaryKey,
    payableServices.getPartySummaries,
    { enabled: !!supplier }
  );

  const paymentsQuery = useQuery<ILedgerPayment[]>(
    scopedKey(paymentListKey, "payable", key),
    () =>
      paymentServices.getAll(
        "payable",
        supplier?.partyId
          ? { partyId: supplier.partyId }
          : { partyName: supplier?.partyName ?? "" }
      ),
    { enabled: !!supplier }
  );

  const payments = paymentsQuery.data ?? [];
  const lastPayment =
    payments.find((payment) => payment.status !== "rejected")?.paid_at ?? null;
  const summary = (summaryQuery.data ?? []).find(
    (item) => partyKeyOf(item) === key
  );

  return {
    supplier,
    permissions,
    rows: listQuery.data ?? [],
    listLoading: listQuery.loading,
    summary,
    summaryLoading: summaryQuery.loading,
    lastPayment,
    lastPaymentLoading: paymentsQuery.loading,
    payments,
    branchName,
    userNameOf,
    openMarkPaid: markPaidModal.openModal,
    closeSupplierDetail,
  };
};
