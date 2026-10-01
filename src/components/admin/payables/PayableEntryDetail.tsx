import {
  checkDueDateOf,
  dueStatusOf,
} from "../../../models/data/admin/admin.response";
import { ledgerBalance } from "../../../models/data/ledger/ledger.response";
import { formatDate, formatMoney } from "../../../utils/format.utils";
import DetailRows from "../../common/app/DetailRows";
import RecordHero from "../../common/app/RecordHero";
import StatusTag from "../../common/status/StatusTag";

import type { IDetailItem } from "../../../models/common/detail.model";
import type { IAdminPayableEntry } from "../../../models/data/admin/admin.response";
import type { IPayable } from "../../../models/data/ledger/ledger.response";
import type { IVoucher } from "../../../models/data/voucher/voucher.response";

type IProps = {
  entry: IAdminPayableEntry;
};

const checkItems: readonly IDetailItem<IVoucher>[] = [
  { key: "checkDate", label: "Check date", render: (check) => formatDate(check.check_due_date) },
  { key: "bank", label: "Bank", render: (check) => check.check_bank ?? "—" },
  { key: "checkNumber", label: "Check no.", render: (check) => check.check_number ?? "—" },
  { key: "voucherNumber", label: "Voucher no.", render: (check) => check.voucher_no ?? "—" },
  { key: "branch", label: "Branch", render: (check) => check.branch },
];

const payableItems: readonly IDetailItem<IPayable>[] = [
  { key: "dueDate", label: "Due date", render: (payable) => formatDate(payable.due_date) },
  { key: "amount", label: "Amount", render: (payable) => formatMoney(payable.amount) },
  { key: "paid", label: "Paid", render: (payable) => formatMoney(payable.paid_amount) },
  { key: "reference", label: "Reference", render: (payable) => payable.reference_number || "—" },
  { key: "branch", label: "Branch", render: (payable) => payable.branch },
];

const PayableEntryDetail = ({ entry }: IProps) => {
  if (entry.kind === "check") {
    const due = dueStatusOf(checkDueDateOf(entry.record));

    return (
      <>
        <RecordHero
          name={entry.record.payee}
          amount={Number(entry.record.amount)}
          badge={<StatusTag label={due.label} color={due.color} />}
        />
        <DetailRows record={entry.record} items={checkItems} />
      </>
    );
  }

  const due = dueStatusOf(entry.record.due_date);

  return (
    <>
      <RecordHero
        name={entry.record.supplier_name}
        amount={ledgerBalance(entry.record)}
        badge={<StatusTag label={due.label} color={due.color} />}
      />
      <DetailRows record={entry.record} items={payableItems} />
    </>
  );
};

export default PayableEntryDetail;
