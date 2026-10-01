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
import {
  Sheet,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Spinner } from "@/components/ui/spinner";
import { useIsMobile } from "@/hook/use-mobile";
import { cn } from "@/utils/cn.utils";
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
  confirmSheetFooter,
  confirmSheetHeader,
  confirmSheetMedia,
  drawerContent,
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
  const isMobile = useIsMobile();
  const confirm = useConfirmStore(selectConfirm);
  const running = useConfirmStore(selectConfirmRunning);
  const closeConfirm = useConfirmStore((state) => state.closeConfirm);
  const runConfirm = useConfirmStore((state) => state.runConfirm);

  const kind = confirm.kind ?? "confirm";
  const title = confirm.title ?? defaultTitles[kind];
  const message = confirm.message ?? defaultMessage(kind, confirm.itemName);
  const icon = kind === "delete" ? <Trash2 /> : <CircleAlert />;

  const handleOpenChange = (next: boolean) => {
    if (!next && !running) closeConfirm();
  };

  const okButton = (
    <Button
      className={confirmAction({ kind })}
      isDisabled={running}
      onPress={() => void runConfirm()}
    >
      {running ? <Spinner /> : null}
      {confirm.okText ?? defaultOkTexts[kind]}
    </Button>
  );

  if (isMobile) {
    return (
      <Sheet
        side="bottom"
        isOpen={confirm.visible}
        onOpenChange={handleOpenChange}
        isDismissable={!running}
        showCloseButton={false}
        className={drawerContent}
      >
        <SheetHeader className={confirmSheetHeader}>
          <span className={cn(confirmSheetMedia, confirmMedia({ kind }))} aria-hidden="true">
            {icon}
          </span>
          <SheetTitle>{title}</SheetTitle>
          <SheetDescription>{message}</SheetDescription>
        </SheetHeader>

        <SheetFooter className={confirmSheetFooter}>
          {okButton}
          <Button variant="outline" isDisabled={running} onPress={closeConfirm}>
            {confirm.cancelText ?? "Cancel"}
          </Button>
        </SheetFooter>
      </Sheet>
    );
  }

  return (
    <AlertDialog
      isOpen={confirm.visible}
      onOpenChange={handleOpenChange}
      className={confirmContent}
    >
      <AlertDialogHeader>
        <AlertDialogMedia className={confirmMedia({ kind })}>{icon}</AlertDialogMedia>
        <AlertDialogTitle>{title}</AlertDialogTitle>
        <AlertDialogDescription>{message}</AlertDialogDescription>
      </AlertDialogHeader>

      <AlertDialogFooter className={confirmFooter}>
        <AlertDialogCancel isDisabled={running}>
          {confirm.cancelText ?? "Cancel"}
        </AlertDialogCancel>
        {okButton}
      </AlertDialogFooter>
    </AlertDialog>
  );
};

export default ConfirmationModal;
