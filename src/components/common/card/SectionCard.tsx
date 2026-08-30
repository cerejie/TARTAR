import { MoreOutlined } from "@ant-design/icons";
import { Button, Card, Dropdown, Flex, Typography, type MenuProps } from "antd";
import type { ReactNode } from "react";
import type { CardTone } from "../../../models/common/view.model";
import {
  card,
  cardBody,
  cardDense,
  cardExtra,
  cardFlush,
  cardFooter,
  cardHead,
  cardMenu,
  cardSubtitle,
  cardTitle,
  cardTone,
} from "../../../styles/card/card.css";

const { Title, Text } = Typography;

type IProps = {
  title?: string;
  subtitle?: string;
  extra?: ReactNode;
  menu?: MenuProps;
  tone?: CardTone;
  flush?: boolean;
  dense?: boolean;
  footer?: ReactNode;
  children: ReactNode;
};

const SectionCard = ({
  title,
  subtitle,
  extra,
  menu,
  tone = "surface",
  flush,
  dense,
  footer,
  children,
}: IProps) => {
  const aside =
    extra || menu ? (
      <Flex className={`${cardExtra}`} align="center">
        {extra}
        {menu ? (
          <Dropdown menu={menu} trigger={["click"]} placement="bottomRight">
            <Button
              type="text"
              className={`${cardMenu}`}
              aria-label={title ? `${title} options` : "Card options"}
              icon={<MoreOutlined />}
            />
          </Dropdown>
        ) : null}
      </Flex>
    ) : undefined;

  /** No title and no subtitle means no head at all — one less nested box. */
  const heading =
    title || subtitle ? (
      <Flex vertical>
        {title ? (
          <Title level={4} className={`${cardTitle}`}>
            {title}
          </Title>
        ) : null}
        {subtitle ? (
          <Text type="secondary" className={`${cardSubtitle}`}>
            {subtitle}
          </Text>
        ) : null}
      </Flex>
    ) : undefined;

  return (
    <Card
      className={[
        card,
        cardTone[tone],
        flush ? cardFlush : "",
        dense ? cardDense : "",
      ].join(" ")}
      variant="borderless"
      classNames={{ header: `${cardHead}`, body: `${cardBody}` }}
      title={heading}
      extra={aside}
    >
      {children}
      {footer ? <div className={`${cardFooter}`}>{footer}</div> : null}
    </Card>
  );
};

export default SectionCard;
