import { ExternalLink, Phone } from "lucide-react";
import { ledgerBalance } from "../../../models/data/ledger/ledger.response";
import { formatDate, formatMoney } from "../../../utils/format.utils";
import { receivablesPath } from "../../../utils/route.utils";
import AppSheet from "../../common/app/AppSheet";
import AppButton from "../../common/button/AppButton";
import DetailGrid from "../../common/modal/DetailGrid";

import type { IDetailItem } from "../../../models/common/detail.model";
import type { IReceivable } from "../../../models/data/ledger/ledger.response";
import type { ICustomer } from "../../../models/data/party/party.response";

type IProps = {
  open: boolean;
  receivable: IReceivable | null;
  customer: ICustomer | null;
  phoneHref: string | null;
  onClose: () => void;
};

type IReceivableDetail = {
  receivable: IReceivable;
  customer: ICustomer | null;
};

const receivableItems: readonly IDetailItem<IReceivableDetail>[] = [
  { key: "customer", label: "Customer", render: ({ receivable }) => receivable.customer_name, span: 2 },
  { key: "balance", label: "Balance", render: ({ receivable }) => formatMoney(ledgerBalance(receivable)) },
  { key: "dueDate", label: "Due date", render: ({ receivable }) => formatDate(receivable.due_date) },
  { key: "amount", label: "Amount", render: ({ receivable }) => formatMoney(receivable.amount) },
  { key: "paid", label: "Paid", render: ({ receivable }) => formatMoney(receivable.paid_amount) },
  { key: "reference", label: "Reference", render: ({ receivable }) => receivable.reference_number ?? "—" },
  { key: "branch", label: "Branch", render: ({ receivable }) => receivable.branch },
  { key: "contact", label: "Contact", render: ({ customer }) => customer?.contact ?? "—" },
  { key: "contactPerson", label: "Contact person", render: ({ customer }) => customer?.contact_person ?? "—" },
];

const ReceivableEntrySheet = ({ open, receivable, customer, phoneHref, onClose }: IProps) => {
  return (
    <AppSheet
      open={open}
      title="Receivable"
      onClose={onClose}
      footer={
        <>
          {phoneHref ? (
            <AppButton href={phoneHref} variant="outline">
              <Phone />
              Call customer
            </AppButton>
          ) : null}
          <AppButton href={receivablesPath}>
            <ExternalLink />
            Open in TARTAR
          </AppButton>
        </>
      }
    >
      {receivable ? (
        <DetailGrid record={{ receivable, customer }} items={receivableItems} />
      ) : null}
    </AppSheet>
  );
};

export default ReceivableEntrySheet;
