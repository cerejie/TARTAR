import { useNavigate } from "react-router-dom";
import {
  customerLedgerModalKey,
  supplierLedgerModalKey,
} from "../../../keys/modal.keys";
import { notificationKindPaths } from "../../../models/data/dashboard/dashboard.response";
import { useLedgerStore } from "../../../store/data/ledger/ledger.store";
import { notificationBankOf, notificationGroups } from "../../../utils/notification.utils";
import { useModalActions } from "../../common/modal.hook";
import { useBankAccountListHook } from "../bank/bank.account.list.hook";

import type {
  IDueAlerts,
  INotificationRow,
} from "../../../models/data/dashboard/dashboard.response";

export const useNotificationListHook = (data: IDueAlerts, onOpen?: () => void) => {
  const navigate = useNavigate();
  const { openModal } = useModalActions();
  const setLedgerCustomer = useLedgerStore((state) => state.setLedgerCustomer);
  const setLedgerSupplier = useLedgerStore((state) => state.setLedgerSupplier);
  const { paymentLabelOf } = useBankAccountListHook();

  const openLedger = (row: INotificationRow) => {
    if (row.ledger === "receivable") {
      openModal(customerLedgerModalKey);
      setLedgerCustomer({ customerId: row.partyId, customerName: row.name });
      return;
    }

    openModal(supplierLedgerModalKey);
    setLedgerSupplier({ partyId: row.partyId, partyName: row.name });
  };

  return {
    groups: notificationGroups(data),
    bankOf: (row: INotificationRow) => notificationBankOf(row, paymentLabelOf),
    openItem: (row: INotificationRow) => {
      onOpen?.();
      openLedger(row);
      navigate(notificationKindPaths[row.ledger]);
    },
  };
};
