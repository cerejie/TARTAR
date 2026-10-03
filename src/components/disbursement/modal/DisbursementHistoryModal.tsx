import { transactionTypeLabels } from "../../../enums/transaction.enum";
import type {
  ITransaction,
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
import { auditChangeLines } from "../../../utils/audit.utils";
import {
  formatDate,
  formatDateTime,
  formatMoney,
} from "../../../utils/format.utils";
import AppModal from "../../common/modal/AppModal";

type IProps = {
  open: boolean;
  row?: ITransaction;
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
      title={
        row
          ? `Edit history · ${transactionTypeLabels[row.type]} · ${formatMoney(
              row.amount
            )} · ${formatDate(row.txn_date)}`
          : "Edit history"
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
              {auditChangeLines(entry.changes, userNameOf).map((line) => (
                <li key={line.field}>
                  <span className={auditField}>{line.label}:</span>{" "}
                  {line.summary}
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
