import { Card, Flex, Skeleton, Statistic } from "antd";
import type { ReactNode } from "react";
import { tone, type Tone } from "../../../styles/common/tone.css";
import {
  statCaption,
  statCard,
  statHead,
  statIcon,
  statValue,
} from "../../../styles/stat/stat.css";
import { formatMoney } from "../../../utils/format.utils";

type IProps = {
  title: string;
  value: number | string | null | undefined;
  loading?: boolean;
  raw?: boolean;
  prefix?: ReactNode;
  variant?: Tone;
  icon?: ReactNode;
  caption?: ReactNode;
};

const StatCard = ({
  title,
  value,
  loading,
  raw,
  prefix,
  variant = "default",
  icon,
  caption,
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
            value={raw ? value ?? "—" : formatMoney(value)}
          />
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
        </Flex>
        {caption ? (
          <Flex className={`${statCaption}`}>{caption}</Flex>
        ) : null}
      </Flex>
    </Card>
  );
};

export default StatCard;
