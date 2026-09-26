import type { ReactNode } from "react";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipTrigger } from "@/components/ui/tooltip";
import type { StatusColor } from "../../../models/common/view.model";
import { statusTag } from "../../../styles/status/status.styles";

type IProps = {
  label: ReactNode;
  color?: StatusColor;
  hint?: string;
};

const StatusTag = ({ label, color = "default", hint }: IProps) => {
  if (!hint) {
    return (
      <Badge variant="outline" className={statusTag({ color })}>
        {label}
      </Badge>
    );
  }

  return (
    <TooltipTrigger>
      <Badge variant="outline" tabIndex={0} className={statusTag({ color })}>
        {label}
      </Badge>
      <Tooltip>{hint}</Tooltip>
    </TooltipTrigger>
  );
};

export default StatusTag;
