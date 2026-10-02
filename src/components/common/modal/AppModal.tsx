import type { ReactNode } from "react";
import {
  Dialog,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Sheet,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { cn } from "@/utils/cn.utils";
import AppButton from "../button/AppButton";
import { useIsCompact } from "../../../hook/common/breakpoint.hook";
import type { ModalSize, SheetKind } from "../../../models/common/view.model";
import {
  drawerBody,
  drawerContent,
  drawerFooter,
  drawerHeaderRuled,
  drawerKind,
  modalBody,
  modalContent,
  modalFooter,
  modalHeaderRuled,
  modalSize,
} from "../../../styles/modal/modal.styles";

type IProps = {
  open: boolean;
  title: string;
  size?: ModalSize;
  kind?: SheetKind;
  footer?: ReactNode;
  onClose: () => void;
  children: ReactNode;
};

const AppModal = ({
  open,
  title,
  size = "md",
  kind = "action",
  footer,
  onClose,
  children,
}: IProps) => {
  const isCompact = useIsCompact();

  const actions = footer ?? (
    <AppButton variant="outline" onPress={onClose}>
      Close
    </AppButton>
  );

  const handleOpenChange = (next: boolean) => {
    if (!next) onClose();
  };

  if (isCompact) {
    return (
      <Sheet
        side="bottom"
        isOpen={open}
        onOpenChange={handleOpenChange}
        className={cn(drawerContent, drawerKind({ kind }))}
      >
        <SheetHeader className={drawerHeaderRuled}>
          <SheetTitle>{title}</SheetTitle>
        </SheetHeader>

        <div className={drawerBody}>{children}</div>

        <SheetFooter className={drawerFooter}>{actions}</SheetFooter>
      </Sheet>
    );
  }

  return (
    <Dialog
      isOpen={open}
      onOpenChange={handleOpenChange}
      isDismissable={false}
      className={cn(modalContent, modalSize({ size }))}
    >
      <DialogHeader className={modalHeaderRuled}>
        <DialogTitle>{title}</DialogTitle>
      </DialogHeader>

      <div className={modalBody}>{children}</div>

      <DialogFooter className={modalFooter}>{actions}</DialogFooter>
    </Dialog>
  );
};

export default AppModal;
