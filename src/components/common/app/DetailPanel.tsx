import type { ReactNode } from "react";
import { MousePointerClick, X } from "lucide-react";
import {
  detailPanel,
  detailPanelBody,
  detailPanelFooter,
  detailPanelHead,
  detailPanelTitle,
} from "../../../styles/app/app.styles";
import AppButton from "../button/AppButton";
import EmptyState from "../status/EmptyState";

type IProps = {
  open: boolean;
  title: string;
  emptyText: string;
  footer?: ReactNode;
  onClose: () => void;
  children: ReactNode;
};

const DetailPanel = ({ open, title, emptyText, footer, onClose, children }: IProps) => {
  if (!open) {
    return (
      <aside className={detailPanel} aria-label={title}>
        <EmptyState icon={<MousePointerClick />} description={emptyText} />
      </aside>
    );
  }

  return (
    <aside className={detailPanel} aria-label={title}>
      <header className={detailPanelHead}>
        <h2 className={detailPanelTitle}>{title}</h2>
        <AppButton variant="ghost" size="icon-sm" aria-label="Close" tooltip="Close" onPress={onClose}>
          <X />
        </AppButton>
      </header>
      <div className={detailPanelBody}>{children}</div>
      {footer ? <footer className={detailPanelFooter}>{footer}</footer> : null}
    </aside>
  );
};

export default DetailPanel;
