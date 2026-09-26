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
import { useIsMobile } from "@/hook/use-mobile";
import { cn } from "@/utils/cn.utils";
import AppButton from "../button/AppButton";
import type { ModalSize } from "../../../models/common/view.model";
import {
  drawerBody,
  drawerContent,
  drawerFooter,
  drawerHeaderRuled,
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
  footer?: ReactNode;
  onClose: () => void;
  children: ReactNode;
};

const AppModal = ({
  open,
  title,
  size = "md",
  footer,
  onClose,
  children,
}: IProps) => {
  const isMobile = useIsMobile();

  const actions = footer ?? (
    <AppButton variant="outline" onPress={onClose}>
      Close
    </AppButton>
  );

  const handleOpenChange = (next: boolean) => {
    if (!next) onClose();
  };

  if (isMobile) {
    return (
      <Sheet
        side="bottom"
        isOpen={open}
        onOpenChange={handleOpenChange}
        className={drawerContent}
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
