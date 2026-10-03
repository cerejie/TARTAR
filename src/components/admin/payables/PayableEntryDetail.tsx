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
  branchLabel: string;
};

type IEntryDetail<T> = {
  record: T;
  branchLabel: string;
};

const checkItems: readonly IDetailItem<IEntryDetail<IVoucher>>[] = [
  { key: "checkDate", label: "Check date", render: ({ record }) => formatDate(record.check_due_date) },
  { key: "bank", label: "Bank", render: ({ record }) => record.check_bank },
  { key: "checkNumber", label: "Check no.", render: ({ record }) => record.check_number },
  { key: "voucherNumber", label: "Voucher no.", render: ({ record }) => record.voucher_no },
  { key: "branch", label: "Branch", render: ({ branchLabel }) => branchLabel },
];

const payableItems: readonly IDetailItem<IEntryDetail<IPayable>>[] = [
  { key: "dueDate", label: "Due date", render: ({ record }) => formatDate(record.due_date) },
  { key: "amount", label: "Amount", render: ({ record }) => formatMoney(record.amount) },
  { key: "paid", label: "Paid", render: ({ record }) => formatMoney(record.paid_amount) },
  { key: "reference", label: "Reference", render: ({ record }) => record.reference_number },
  { key: "branch", label: "Branch", render: ({ branchLabel }) => branchLabel },
];

const PayableEntryDetail = ({ entry, branchLabel }: IProps) => {
  if (entry.kind === "check") {
    const due = dueStatusOf(checkDueDateOf(entry.record));

    return (
      <>
        <RecordHero
          name={entry.record.payee}
          amount={Number(entry.record.amount)}
          badge={<StatusTag label={due.label} color={due.color} />}
        />
        <DetailRows record={{ record: entry.record, branchLabel }} items={checkItems} />
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
      <DetailRows record={{ record: entry.record, branchLabel }} items={payableItems} />
    </>
  );
};

export default PayableEntryDetail;
