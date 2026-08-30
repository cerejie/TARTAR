import type { ReactNode } from "react";
import type { ViewLayout } from "../../../models/common/view.model";
import {
  contentView,
  viewBody,
  viewFooter,
  viewToolbar,
} from "../../../styles/view/content/content.view.css";
import BentoGrid from "./BentoGrid";
import PageHeader from "./PageHeader";

type IProps = {
  title: string;
  subtitle?: string;
  meta?: ReactNode;
  actions?: ReactNode;
  toolbar?: ReactNode;
  layout?: ViewLayout;
  footer?: ReactNode;
  children: ReactNode;
};

const ContentView = ({
  title,
  subtitle,
  meta,
  actions,
  toolbar,
  layout = "stack",
  footer,
  children,
}: IProps) => {
  return (
    <div className={`${contentView}`}>
      <PageHeader
        title={title}
        subtitle={subtitle}
        meta={meta}
        actions={actions}
      />

      {toolbar ? <div className={`${viewToolbar}`}>{toolbar}</div> : null}

      {layout === "bento" ? (
        <BentoGrid>{children}</BentoGrid>
      ) : (
        <div className={`${viewBody}`}>{children}</div>
      )}

      {footer ? <div className={`${viewFooter}`}>{footer}</div> : null}
    </div>
  );
};

export default ContentView;
