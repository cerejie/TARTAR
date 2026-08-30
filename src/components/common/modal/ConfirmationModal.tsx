import { DeleteFilled, ExclamationCircleFilled } from "@ant-design/icons";
import { Button, Flex } from "antd";
import type { ConfirmKind } from "../../../models/common/modal.model";
import {
  selectConfirm,
  selectConfirmRunning,
  useConfirmStore,
} from "../../../store/common/confirm.store";
import {
  confirmBody,
  confirmIcon,
  confirmIconTone,
  confirmMessage,
} from "../../../styles/modal/modal.css";
import AppModal from "./AppModal";

const defaultTitles: Record<ConfirmKind, string> = {
  confirm: "Confirm action?",
  delete: "Delete record?",
};

const defaultMessage = (kind: ConfirmKind, itemName?: string) => {
  const subject = itemName ? `"${itemName}"` : "this record";

  return kind === "delete"
    ? `Deleting ${subject} cannot be undone.`
    : `Are you sure you want to proceed with ${subject}?`;
};

const ConfirmationModal = () => {
  const confirm = useConfirmStore(selectConfirm);
  const running = useConfirmStore(selectConfirmRunning);
  const closeConfirm = useConfirmStore((state) => state.closeConfirm);
  const runConfirm = useConfirmStore((state) => state.runConfirm);

  const kind = confirm.kind ?? "confirm";

  return (
    <AppModal
      open={confirm.visible}
      size="sm"
      title={confirm.title ?? defaultTitles[kind]}
      onClose={closeConfirm}
      footer={
        <Flex justify="flex-end" gap="small">
          <Button onClick={closeConfirm} disabled={running}>
            {confirm.cancelText ?? "No"}
          </Button>
          <Button
            type="primary"
            danger={kind === "delete"}
            loading={running}
            onClick={() => void runConfirm()}
          >
            {confirm.okText ?? "Yes"}
          </Button>
        </Flex>
      }
    >
      <Flex className={`${confirmBody}`} align="flex-start" gap="middle">
        <span className={`${confirmIcon} ${confirmIconTone[kind]}`}>
          {kind === "delete" ? <DeleteFilled /> : <ExclamationCircleFilled />}
        </span>
        <span className={`${confirmMessage}`}>
          {confirm.message ?? defaultMessage(kind, confirm.itemName)}
        </span>
      </Flex>
    </AppModal>
  );
};

export default ConfirmationModal;
