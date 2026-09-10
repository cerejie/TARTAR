import { Flex, Typography } from "antd";
import { transactionTypeLabels } from "../../../enums/transaction.enum";
import type {
  IDisbursement,
  ITransactionAudit,
} from "../../../models/data/transaction/transaction.response";
import {
  auditChanges,
  auditEntry,
} from "../../../styles/view/ledger/ledger.view.css";
import {
  formatDate,
  formatDateTime,
  formatMoney,
} from "../../../utils/format.utils";
import AppModal from "../../common/modal/AppModal";

const { Text } = Typography;

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
        <Text type="secondary">No edits recorded.</Text>
      ) : null}

      {audit.map((entry) => (
        <Flex vertical key={entry.id} className={`${auditEntry}`}>
          <Text>
            <Text strong>{formatDateTime(entry.edited_at)}</Text>{" "}
            <Text type="secondary">by {userNameOf(entry.edited_by)}</Text>
          </Text>
          <ul className={`${auditChanges}`}>
            {Object.entries(entry.changes).map(([field, change]) => (
              <li key={field}>
                <Text code>{field.replaceAll("_", " ")}</Text>{" "}
                {String(change.old ?? "—")} → {String(change.new ?? "—")}
              </li>
            ))}
          </ul>
        </Flex>
      ))}
    </AppModal>
  );
};

export default DisbursementHistoryModal;
