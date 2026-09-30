import {
  formIntro,
  formIntroItem,
  formIntroLabel,
  formIntroValue,
} from "../../../styles/form/form.styles";
import { formatDateTime } from "../../../utils/format.utils";

type IProps = {
  reason: string | null | undefined;
  rejectedBy: string;
  rejectedAt: string | null;
};

const RejectionIntro = ({ reason, rejectedBy, rejectedAt }: IProps) => (
  <div className={formIntro}>
    <div className={formIntroItem}>
      <span className={formIntroLabel}>Reason</span>
      <span className={formIntroValue}>{reason ?? "—"}</span>
    </div>
    <div className={formIntroItem}>
      <span className={formIntroLabel}>Rejected by</span>
      <span className={formIntroValue}>{rejectedBy}</span>
    </div>
    <div className={formIntroItem}>
      <span className={formIntroLabel}>Rejected on</span>
      <span className={formIntroValue}>{formatDateTime(rejectedAt)}</span>
    </div>
  </div>
);

export default RejectionIntro;
