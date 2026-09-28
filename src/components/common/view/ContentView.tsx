import type { ReactNode } from "react";
import { Separator } from "@/components/ui/separator";
import { useProtectedTitleHook } from "../../../hook/layout/protected.hook";
import type { ViewLayout } from "../../../models/common/view.model";
import {
  contentView,
  viewBody,
  viewFooter,
  viewHead,
  viewHeadActions,
  viewHeadDivider,
  viewMeta,
  viewTabs,
  viewTitle,
  viewToolbar,
} from "../../../styles/view/view.styles";
import BentoGrid from "./BentoGrid";

type IProps = {
  meta?: ReactNode;
  tabs?: ReactNode;
  actions?: ReactNode;
  toolbar?: ReactNode;
  layout?: ViewLayout;
  footer?: ReactNode;
  children: ReactNode;
};

const ContentView = ({
  meta,
  tabs,
  actions,
  toolbar,
  layout = "stack",
  footer,
  children,
}: IProps) => {
  const { title } = useProtectedTitleHook();

  return (
    <div className={contentView}>
      <div className={viewHead}>
        <h1 className={viewTitle}>{title}</h1>
        {meta || tabs || actions ? (
          <div className={viewHeadActions}>
            {meta ? <span className={viewMeta}>{meta}</span> : null}
            {tabs ? (
              <div data-slot="view-tabs" className={viewTabs}>
                {tabs}
              </div>
            ) : null}
            {tabs && actions ? (
              <Separator orientation="vertical" className={viewHeadDivider} />
            ) : null}
            {actions}
          </div>
        ) : null}
      </div>

      {toolbar ? <div className={viewToolbar}>{toolbar}</div> : null}

      {layout === "bento" ? (
        <BentoGrid>{children}</BentoGrid>
      ) : (
        <div className={viewBody}>{children}</div>
      )}

      {footer ? <div className={viewFooter}>{footer}</div> : null}
    </div>
  );
};

export default ContentView;
