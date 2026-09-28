import type { ReactNode } from "react";
import {
  Sheet,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { cn } from "@/utils/cn.utils";
import { useIsDesktop } from "../../../hook/common/breakpoint.hook";
import {
  appSheetBody,
  appSheetContent,
  appSheetSide,
} from "../../../styles/app/app.styles";
import {
  drawerContent,
  drawerFooter,
  drawerHeaderRuled,
} from "../../../styles/modal/modal.styles";

type IProps = {
  open: boolean;
  title: string;
  description?: string;
  footer?: ReactNode;
  onClose: () => void;
  children: ReactNode;
};

const AppSheet = ({
  open,
  title,
  description,
  footer,
  onClose,
  children,
}: IProps) => {
  const isDesktop = useIsDesktop();

  const handleOpenChange = (next: boolean) => {
    if (!next) onClose();
  };

  return (
    <Sheet
      side={isDesktop ? "right" : "bottom"}
      isOpen={open}
      onOpenChange={handleOpenChange}
      className={cn(appSheetContent, isDesktop ? appSheetSide : drawerContent)}
    >
      <SheetHeader className={drawerHeaderRuled}>
        <SheetTitle>{title}</SheetTitle>
        {description ? <SheetDescription>{description}</SheetDescription> : null}
      </SheetHeader>

      <div className={appSheetBody}>{children}</div>

      {footer ? <SheetFooter className={drawerFooter}>{footer}</SheetFooter> : null}
    </Sheet>
  );
};

export default AppSheet;
