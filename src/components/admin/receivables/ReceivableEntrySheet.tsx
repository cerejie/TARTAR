import { ExternalLink, Phone } from "lucide-react";
import { receivablesPath } from "../../../utils/route.utils";
import AppSheet from "../../common/app/AppSheet";
import DetailPanel from "../../common/app/DetailPanel";
import AppButton from "../../common/button/AppButton";
import ReceivableEntryDetail from "./ReceivableEntryDetail";

import type { IReceivable } from "../../../models/data/ledger/ledger.response";
import type { ICustomer } from "../../../models/data/party/party.response";

type IProps = {
  open: boolean;
  receivable: IReceivable | null;
  customer: ICustomer | null;
  phoneHref: string | null;
  split: boolean;
  onClose: () => void;
};

const ReceivableEntrySheet = ({
  open,
  receivable,
  customer,
  phoneHref,
  split,
  onClose,
}: IProps) => {
  const footer = (
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
  );

  const detail = receivable ? (
    <ReceivableEntryDetail receivable={receivable} customer={customer} />
  ) : null;

  if (split) {
    return (
      <DetailPanel
        open={open && !!receivable}
        title="Receivable"
        emptyText="Select a receivable to see its details"
        footer={footer}
        onClose={onClose}
      >
        {detail}
      </DetailPanel>
    );
  }

  return (
    <AppSheet
      open={open}
      kind="detail"
      title="Receivable"
      onClose={onClose}
      footer={footer}
    >
      {detail}
    </AppSheet>
  );
};

export default ReceivableEntrySheet;
