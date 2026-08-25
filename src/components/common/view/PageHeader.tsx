import { Flex, Typography } from "antd";
import type { ReactNode } from "react";
import {
  pageActions,
  pageHeader,
  pageTitle,
} from "../../../styles/view/common/common.view.css";

const { Title, Text } = Typography;

type IProps = {
  title: string;
  subtitle?: string;
  extra?: ReactNode;
};

const PageHeader = ({ title, subtitle, extra }: IProps) => {
  return (
    <Flex
      className={`${pageHeader}`}
      align="center"
      justify="space-between"
      gap="middle"
      wrap
    >
      <Flex vertical>
        <Title level={3} className={`${pageTitle}`}>
          {title}
        </Title>
        {subtitle ? <Text type="secondary">{subtitle}</Text> : null}
      </Flex>
      {extra ? <Flex className={`${pageActions}`}>{extra}</Flex> : null}
    </Flex>
  );
};

export default PageHeader;
