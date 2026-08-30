import { ArrowDownOutlined, ArrowUpOutlined } from "@ant-design/icons";
import { Flex } from "antd";
import { tone } from "../../../styles/common/tone.css";
import { statDelta } from "../../../styles/status/status.css";

type IProps = {
  current: number | undefined;
  previous: number | undefined;
  goodDirection: "up" | "down";
  label: string;
};

const StatDelta = ({ current, previous, goodDirection, label }: IProps) => {
  if (current === undefined || previous === undefined || previous === 0)
    return null;

  const percent = ((current - previous) / Math.abs(previous)) * 100;
  const isUp = percent >= 0;
  const isGood = isUp === (goodDirection === "up");

  return (
    <Flex
      component="span"
      className={`${statDelta} ${isGood ? tone.positive : tone.negative}`}
      align="center"
      gap={3}
      title={label}
    >
      {isUp ? <ArrowUpOutlined /> : <ArrowDownOutlined />}
      {Math.abs(percent).toFixed(1)}%
    </Flex>
  );
};

export default StatDelta;
