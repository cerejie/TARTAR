import type { ReactNode } from "react";
import { Badge } from "@/components/ui/badge";
import type { StatusColor } from "../../../models/common/view.model";
import { statusTag } from "../../../styles/status/status.styles";

type IProps = {
  label: ReactNode;
  color?: StatusColor;
};

const StatusTag = ({ label, color = "default" }: IProps) => (
  <Badge variant="outline" className={statusTag({ color })}>
    {label}
  </Badge>
);

export default StatusTag;
