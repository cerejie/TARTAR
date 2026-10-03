import { ExternalLink } from "lucide-react";
import AppSheet from "../../common/app/AppSheet";
import DetailPanel from "../../common/app/DetailPanel";
import AppButton from "../../common/button/AppButton";
import PayableEntryDetail from "./PayableEntryDetail";

import type { IAdminPayableEntry } from "../../../models/data/admin/admin.response";

type IProps = {
  open: boolean;
  entry: IAdminPayableEntry | null;
  branchLabel: string | null;
  openPath: string;
  split: boolean;
  onClose: () => void;
};

const PayableEntrySheet = ({
  open,
  entry,
  branchLabel,
  openPath,
  split,
  onClose,
}: IProps) => {
  const title = entry?.kind === "check" ? "Due check" : "Payable";
  const footer = (
    <AppButton href={openPath}>
      <ExternalLink />
      Open in TARTAR
    </AppButton>
  );
  const detail = entry ? (
    <PayableEntryDetail entry={entry} branchLabel={branchLabel ?? entry.record.branch} />
  ) : null;

  if (split) {
    return (
      <DetailPanel
        open={open && !!entry}
        title={title}
        emptyText="Select a payable to see its details"
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
      title={title}
      onClose={onClose}
      footer={footer}
    >
      {detail}
    </AppSheet>
  );
};

export default PayableEntrySheet;
