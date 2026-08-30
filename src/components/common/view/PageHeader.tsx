import { Flex, Typography } from "antd";
import type { ReactNode } from "react";
import {
  pageActions,
  pageAside,
  pageHeader,
  pageHeading,
  pageMeta,
  pageSubtitle,
  pageTitle,
} from "../../../styles/view/common/common.view.css";

const { Title } = Typography;

type IProps = {
  title: string;
  subtitle?: string;
  meta?: ReactNode;
  actions?: ReactNode;
};

const PageHeader = ({ title, subtitle, meta, actions }: IProps) => {
  return (
    <Flex
      className={`${pageHeader}`}
      align="flex-end"
      justify="space-between"
      wrap
    >
      <Flex vertical className={`${pageHeading}`}>
        <Title level={3} className={`${pageTitle}`}>
          {title}
        </Title>
        {subtitle ? (
          <span className={`${pageSubtitle}`}>{subtitle}</span>
        ) : null}
      </Flex>

      {meta || actions ? (
        <Flex className={`${pageAside}`} align="center">
          {meta ? <span className={`${pageMeta}`}>{meta}</span> : null}
          {actions ? (
            <Flex className={`${pageActions}`}>{actions}</Flex>
          ) : null}
        </Flex>
      ) : null}
    </Flex>
  );
};

export default PageHeader;
