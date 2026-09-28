import { ExternalLink } from "lucide-react";
import { ledgerBalance } from "../../../models/data/ledger/ledger.response";
import { formatDate, formatMoney } from "../../../utils/format.utils";
import AppSheet from "../../common/app/AppSheet";
import AppButton from "../../common/button/AppButton";
import DetailGrid from "../../common/modal/DetailGrid";

import type { IDetailItem } from "../../../models/common/detail.model";
import type { IAdminPayableEntry } from "../../../models/data/admin/admin.response";
import type { IPayable } from "../../../models/data/ledger/ledger.response";
import type { IVoucher } from "../../../models/data/voucher/voucher.response";

type IProps = {
  open: boolean;
  entry: IAdminPayableEntry | null;
  openPath: string;
  onClose: () => void;
};

const checkItems: readonly IDetailItem<IVoucher>[] = [
  { key: "payee", label: "Payee", render: (check) => check.payee, span: 2 },
  { key: "amount", label: "Amount", render: (check) => formatMoney(check.amount) },
  { key: "checkDate", label: "Check date", render: (check) => formatDate(check.check_due_date) },
  { key: "bank", label: "Bank", render: (check) => check.check_bank ?? "—" },
  { key: "checkNumber", label: "Check no.", render: (check) => check.check_number ?? "—" },
  { key: "voucherNumber", label: "Voucher no.", render: (check) => check.voucher_no ?? "—" },
  { key: "branch", label: "Branch", render: (check) => check.branch },
];

const payableItems: readonly IDetailItem<IPayable>[] = [
  { key: "supplier", label: "Supplier", render: (payable) => payable.supplier_name, span: 2 },
  { key: "balance", label: "Balance", render: (payable) => formatMoney(ledgerBalance(payable)) },
  { key: "dueDate", label: "Due date", render: (payable) => formatDate(payable.due_date) },
  { key: "amount", label: "Amount", render: (payable) => formatMoney(payable.amount) },
  { key: "paid", label: "Paid", render: (payable) => formatMoney(payable.paid_amount) },
  { key: "reference", label: "Reference", render: (payable) => payable.reference_number ?? "—" },
  { key: "branch", label: "Branch", render: (payable) => payable.branch },
];

const PayableEntrySheet = ({ open, entry, openPath, onClose }: IProps) => {
  const renderDetails = () => {
    if (!entry) return null;
    if (entry.kind === "check")
      return <DetailGrid record={entry.record} items={checkItems} />;
    return <DetailGrid record={entry.record} items={payableItems} />;
  };

  return (
    <AppSheet
      open={open}
      title={entry?.kind === "check" ? "Due check" : "Payable"}
      onClose={onClose}
      footer={
        <AppButton href={openPath}>
          <ExternalLink />
          Open in TARTAR
        </AppButton>
      }
    >
      {renderDetails()}
    </AppSheet>
  );
};

export default PayableEntrySheet;
