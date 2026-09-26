import type { ReactNode } from "react";
import { useProtectedTitleHook } from "../../../hook/layout/protected.hook";
import type { ViewLayout } from "../../../models/common/view.model";
import {
  contentView,
  viewBody,
  viewFooter,
  viewHead,
  viewHeadActions,
  viewMeta,
  viewTitle,
  viewToolbar,
  viewToolbarActions,
  viewToolbarStart,
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
        {tabs || actions ? (
          <div className={viewHeadActions}>
            {tabs}
            {actions}
          </div>
        ) : null}
      </div>

      {toolbar || meta ? (
        <div className={viewToolbar}>
          {toolbar ? <div className={viewToolbarStart}>{toolbar}</div> : null}
          {meta ? (
            <div className={viewToolbarActions}>
              <span className={viewMeta}>{meta}</span>
            </div>
          ) : null}
        </div>
      ) : null}

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
