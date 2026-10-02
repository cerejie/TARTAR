import type { ReactNode } from "react";
import { useModal } from "../../../hook/common/modal.hook";
import { accountPanelSheetModalKey } from "../../../keys/modal.keys";
import { accountPanelTitles } from "../../../models/data/account/account.response";
import AppSheet from "../../common/app/AppSheet";

import type { AccountPanel } from "../../../models/data/account/account.response";

type IProps = {
  panel: AccountPanel;
  description?: string;
  children: ReactNode;
};

const AccountPanelSheet = ({ panel, description, children }: IProps) => {
  const { modal, closeModal } = useModal(accountPanelSheetModalKey(panel));

  return (
    <AppSheet
      open={modal.visible}
      title={accountPanelTitles[panel]}
      description={description}
      onClose={closeModal}
    >
      {children}
    </AppSheet>
  );
};

export default AccountPanelSheet;
