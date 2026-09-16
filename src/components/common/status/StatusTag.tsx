import { Tag } from "antd";
import type { ReactNode } from "react";
import { statusTag } from "../../../styles/status/status.css";
import type { StatusColor } from "../../../models/common/view.model";

const tagPresets: Record<StatusColor, string | undefined> = {
  default: undefined,
  positive: "green",
  negative: "red",
  warning: "gold",
  info: "blue",
  brand: "lime",
};

type IProps = {
  label: ReactNode;
  color?: StatusColor;
};

const StatusTag = ({ label, color = "default" }: IProps) => (
  <Tag className={`${statusTag}`} color={tagPresets[color]} variant="outlined">
    {label}
  </Tag>
);

export default StatusTag;
