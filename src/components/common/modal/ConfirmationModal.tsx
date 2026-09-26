import { CircleAlert, Trash2 } from "lucide-react";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogMedia,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import type { ConfirmKind } from "../../../models/common/modal.model";
import {
  selectConfirm,
  selectConfirmRunning,
  useConfirmStore,
} from "../../../store/common/confirm.store";
import {
  confirmAction,
  confirmContent,
  confirmFooter,
  confirmMedia,
} from "../../../styles/modal/modal.styles";

const defaultTitles: Record<ConfirmKind, string> = {
  confirm: "Confirm action?",
  delete: "Delete record?",
};

const defaultOkTexts: Record<ConfirmKind, string> = {
  confirm: "Confirm",
  delete: "Delete",
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

  const handleOpenChange = (next: boolean) => {
    if (!next && !running) closeConfirm();
  };

  return (
    <AlertDialog
      isOpen={confirm.visible}
      onOpenChange={handleOpenChange}
      className={confirmContent}
    >
      <AlertDialogHeader>
        <AlertDialogMedia className={confirmMedia({ kind })}>
          {kind === "delete" ? <Trash2 /> : <CircleAlert />}
        </AlertDialogMedia>
        <AlertDialogTitle>{confirm.title ?? defaultTitles[kind]}</AlertDialogTitle>
        <AlertDialogDescription>
          {confirm.message ?? defaultMessage(kind, confirm.itemName)}
        </AlertDialogDescription>
      </AlertDialogHeader>

      <AlertDialogFooter className={confirmFooter}>
        <AlertDialogCancel isDisabled={running}>
          {confirm.cancelText ?? "Cancel"}
        </AlertDialogCancel>
        <Button
          className={confirmAction({ kind })}
          isDisabled={running}
          onPress={() => void runConfirm()}
        >
          {running ? <Spinner /> : null}
          {confirm.okText ?? defaultOkTexts[kind]}
        </Button>
      </AlertDialogFooter>
    </AlertDialog>
  );
};

export default ConfirmationModal;
