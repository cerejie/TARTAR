import type { ReactNode } from "react";
import {
  Dialog,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Sheet,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { useIsMobile } from "@/hook/use-mobile";
import { cn } from "@/utils/cn.utils";
import type { ModalSize } from "../../../models/common/view.model";
import {
  drawerBody,
  drawerContent,
  drawerFooter,
  modalBody,
  modalContent,
  modalSize,
} from "../../../styles/modal/modal.styles";

type IProps = {
  open: boolean;
  title: string;
  subtitle?: string;
  size?: ModalSize;
  footer?: ReactNode;
  onClose: () => void;
  children: ReactNode;
};

const AppModal = ({
  open,
  title,
  subtitle,
  size = "md",
  footer,
  onClose,
  children,
}: IProps) => {
  const isMobile = useIsMobile();

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
        <SheetHeader>
          <SheetTitle>{title}</SheetTitle>
          {subtitle ? <SheetDescription>{subtitle}</SheetDescription> : null}
        </SheetHeader>

        <div className={drawerBody}>{children}</div>

        {footer ? <SheetFooter className={drawerFooter}>{footer}</SheetFooter> : null}
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
      <DialogHeader>
        <DialogTitle>{title}</DialogTitle>
        {subtitle ? <DialogDescription>{subtitle}</DialogDescription> : null}
      </DialogHeader>

      <div className={modalBody}>{children}</div>

      {footer ? <DialogFooter>{footer}</DialogFooter> : null}
    </Dialog>
  );
};

export default AppModal;
