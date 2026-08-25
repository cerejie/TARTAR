import { Card, Flex, Typography } from "antd";
import type { ReactNode } from "react";
import {
  card,
  cardBody,
  cardExtra,
  cardFlush,
  cardHead,
  cardSubtitle,
  cardTitle,
} from "../../../styles/card/card.css";

const { Title, Text } = Typography;

type IProps = {
  title: string;
  subtitle?: string;
  extra?: ReactNode;
  flush?: boolean;
  children: ReactNode;
};

const SectionCard = ({ title, subtitle, extra, flush, children }: IProps) => {
  return (
    <Card
      className={`${card} ${flush ? cardFlush : ""}`}
      variant="borderless"
      classNames={{ header: `${cardHead}`, body: `${cardBody}` }}
      title={
        <Flex vertical>
          <Title level={4} className={`${cardTitle}`}>
            {title}
          </Title>
          {subtitle ? (
            <Text type="secondary" className={`${cardSubtitle}`}>
              {subtitle}
            </Text>
          ) : null}
        </Flex>
      }
      extra={
        extra ? <Flex className={`${cardExtra}`}>{extra}</Flex> : undefined
      }
    >
      {children}
    </Card>
  );
};

export default SectionCard;
