import { dueStatusOf } from "../../../models/data/admin/admin.response";
import { ledgerBalance } from "../../../models/data/ledger/ledger.response";
import { formatDate, formatMoney } from "../../../utils/format.utils";
import DetailRows from "../../common/app/DetailRows";
import RecordHero from "../../common/app/RecordHero";
import StatusTag from "../../common/status/StatusTag";

import type { IDetailItem } from "../../../models/common/detail.model";
import type { IReceivable } from "../../../models/data/ledger/ledger.response";
import type { ICustomer } from "../../../models/data/party/party.response";

type IProps = {
  receivable: IReceivable;
  customer: ICustomer | null;
};

type IReceivableDetail = {
  receivable: IReceivable;
  customer: ICustomer | null;
};

const receivableItems: readonly IDetailItem<IReceivableDetail>[] = [
  { key: "dueDate", label: "Due date", render: ({ receivable }) => formatDate(receivable.due_date) },
  { key: "amount", label: "Amount", render: ({ receivable }) => formatMoney(receivable.amount) },
  { key: "paid", label: "Paid", render: ({ receivable }) => formatMoney(receivable.paid_amount) },
  { key: "reference", label: "Reference", render: ({ receivable }) => receivable.reference_number || "—" },
  { key: "branch", label: "Branch", render: ({ receivable }) => receivable.branch },
  { key: "contact", label: "Contact", render: ({ customer }) => customer?.contact ?? "—" },
  { key: "contactPerson", label: "Contact person", render: ({ customer }) => customer?.contact_person ?? "—" },
];

const ReceivableEntryDetail = ({ receivable, customer }: IProps) => {
  const due = dueStatusOf(receivable.due_date);

  return (
    <>
      <RecordHero
        name={receivable.customer_name}
        amount={ledgerBalance(receivable)}
        badge={<StatusTag label={due.label} color={due.color} />}
      />
      <DetailRows record={{ receivable, customer }} items={receivableItems} />
    </>
  );
};

export default ReceivableEntryDetail;
