import { transactionTypeLabels } from "../../../enums/transaction.enum";
import type {
  IDisbursement,
  ITransactionAudit,
} from "../../../models/data/transaction/transaction.response";
import {
  auditChanges,
  auditEmpty,
  auditEntry,
  auditField,
  auditList,
  auditMeta,
  auditWhen,
} from "../../../styles/disbursement/disbursement.styles";
import {
  formatDate,
  formatDateTime,
  formatMoney,
} from "../../../utils/format.utils";
import AppModal from "../../common/modal/AppModal";

type IProps = {
  open: boolean;
  row?: IDisbursement;
  audit: ITransactionAudit[];
  loading: boolean;
  userNameOf: (id: string | null) => string;
  onClose: () => void;
};

const DisbursementHistoryModal = ({
  open,
  row,
  audit,
  loading,
  userNameOf,
  onClose,
}: IProps) => {
  return (
    <AppModal
      title="Edit history"
      subtitle={
        row
          ? `${transactionTypeLabels[row.type]} · ${formatMoney(
              row.amount
            )} · ${formatDate(row.txn_date)}`
          : undefined
      }
      open={open}
      size="lg"
      onClose={onClose}
    >
      {audit.length === 0 && !loading ? (
        <p className={auditEmpty}>No edits recorded.</p>
      ) : null}

      <div className={auditList}>
        {audit.map((entry) => (
          <div key={entry.id} className={auditEntry}>
            <p className={auditMeta}>
              <span className={auditWhen}>{formatDateTime(entry.edited_at)}</span>{" "}
              by {userNameOf(entry.edited_by)}
            </p>
            <ul className={auditChanges}>
              {Object.entries(entry.changes).map(([field, change]) => (
                <li key={field}>
                  <code className={auditField}>{field.replaceAll("_", " ")}</code>{" "}
                  {String(change.old ?? "—")} → {String(change.new ?? "—")}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </AppModal>
  );
};

export default DisbursementHistoryModal;
