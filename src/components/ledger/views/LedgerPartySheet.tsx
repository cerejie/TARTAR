import AppSheet from "../../common/app/AppSheet";
import SheetActions from "../../common/app/SheetActions";
import ContextSwitch from "../../common/view/ContextSwitch";
import { ledgerPartyTabOptions } from "../../../enums/ledger.enum";
import { ledgerPane } from "../../../styles/ledger/ledger.styles";
import { hasEnabledAction } from "../../../utils/action.utils";

import type { ReactNode } from "react";
import type { LedgerPartyTab } from "../../../enums/ledger.enum";
import type { IRowAction } from "../../../models/common/action.model";

type IProps = {
  open: boolean;
  title: string;
  hero: ReactNode;
  tab: LedgerPartyTab;
  onTabChange: (tab: LedgerPartyTab) => void;
  records: ReactNode;
  payments: ReactNode;
  actions: readonly IRowAction[];
  onClose: () => void;
};

const LedgerPartySheet = ({
  open,
  title,
  hero,
  tab,
  onTabChange,
  records,
  payments,
  actions,
  onClose,
}: IProps) => (
  <AppSheet
    open={open}
    kind="flow"
    title={title}
    footer={hasEnabledAction(actions) ? <SheetActions actions={actions} /> : undefined}
    onClose={onClose}
  >
    <div className={ledgerPane}>
      {hero}
      <ContextSwitch
        label={`${title} sections`}
        value={tab}
        options={ledgerPartyTabOptions}
        onChange={onTabChange}
      />
      {tab === "records" ? records : payments}
    </div>
  </AppSheet>
);

export default LedgerPartySheet;
