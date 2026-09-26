import type { ReactNode } from "react";
import type { ViewLayout } from "../../../models/common/view.model";
import {
  contentView,
  viewBody,
  viewFooter,
  viewMeta,
  viewToolbar,
  viewToolbarActions,
  viewToolbarStart,
} from "../../../styles/view/view.styles";
import BentoGrid from "./BentoGrid";

type IProps = {
  meta?: ReactNode;
  actions?: ReactNode;
  toolbar?: ReactNode;
  layout?: ViewLayout;
  footer?: ReactNode;
  children: ReactNode;
};

const ContentView = ({
  meta,
  actions,
  toolbar,
  layout = "stack",
  footer,
  children,
}: IProps) => {
  return (
    <div className={contentView}>
      {toolbar || meta || actions ? (
        <div className={viewToolbar}>
          {toolbar ? <div className={viewToolbarStart}>{toolbar}</div> : null}

          {meta || actions ? (
            <div className={viewToolbarActions}>
              {meta ? <span className={viewMeta}>{meta}</span> : null}
              {actions}
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
