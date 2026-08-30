import { Flex } from "antd";
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
} from "../../../styles/view/content/content.view.css";
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
    <div className={`${contentView}`}>
      {toolbar || meta || actions ? (
        <Flex className={`${viewToolbar}`} align="center" gap="small" wrap>
          {toolbar ? (
            <Flex
              className={`${viewToolbarStart}`}
              align="center"
              gap="small"
              wrap
            >
              {toolbar}
            </Flex>
          ) : null}

          {meta || actions ? (
            <Flex
              className={`${viewToolbarActions}`}
              align="center"
              gap="small"
            >
              {meta ? <span className={`${viewMeta}`}>{meta}</span> : null}
              {actions}
            </Flex>
          ) : null}
        </Flex>
      ) : null}

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
