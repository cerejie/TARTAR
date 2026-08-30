import { MoreOutlined } from "@ant-design/icons";
import {
  Button,
  Card,
  Dropdown,
  Flex,
  Skeleton,
  Statistic,
  type MenuProps,
} from "antd";
import type { ReactNode } from "react";
import { tone, type Tone } from "../../../styles/common/tone.css";
import {
  statAside,
  statCaption,
  statCard,
  statChipRow,
  statHead,
  statIcon,
  statMenu,
  statValue,
} from "../../../styles/stat/stat.css";
import { formatMoney } from "../../../utils/format.utils";

type IProps = {
  title: string;
  value: number | string | null | undefined;
  loading?: boolean;
  raw?: boolean;
  prefix?: ReactNode;
  unit?: string;
  variant?: Tone;
  icon?: ReactNode;
  chip?: ReactNode;
  caption?: ReactNode;
  menu?: MenuProps;
  children?: ReactNode;
};

const StatCard = ({
  title,
  value,
  loading,
  raw,
  prefix,
  unit,
  variant = "default",
  icon,
  chip,
  caption,
  menu,
  children,
}: IProps) => {
  if (loading) {
    return (
      <Card className={`${statCard}`} size="small">
        <Skeleton active paragraph={false} title={{ width: "80%" }} />
      </Card>
    );
  }

  return (
    <Card className={`${statCard}`} size="small">
      <Flex vertical>
        <Flex
          className={`${statHead}`}
          align="flex-start"
          justify="space-between"
          gap={8}
        >
          <Statistic
            className={`${statValue} ${tone[variant]}`}
            title={title}
            prefix={prefix}
            suffix={unit}
            value={raw ? value ?? "—" : formatMoney(value)}
          />
          {icon || menu ? (
            <Flex className={`${statAside}`} align="center">
              {icon ? (
                <Flex
                  component="span"
                  className={`${statIcon} ${tone[variant]}`}
                  align="center"
                  justify="center"
                >
                  {icon}
                </Flex>
              ) : null}
              {menu ? (
                <Dropdown
                  menu={menu}
                  trigger={["click"]}
                  placement="bottomRight"
                >
                  <Button
                    type="text"
                    className={`${statMenu}`}
                    aria-label={`${title} options`}
                    icon={<MoreOutlined />}
                  />
                </Dropdown>
              ) : null}
            </Flex>
          ) : null}
        </Flex>

        {chip ? <Flex className={`${statChipRow}`}>{chip}</Flex> : null}
        {caption ? <Flex className={`${statCaption}`}>{caption}</Flex> : null}
        {children}
      </Flex>
    </Card>
  );
};

export default StatCard;
