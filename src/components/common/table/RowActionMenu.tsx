import { EllipsisVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tooltip, TooltipTrigger } from "@/components/ui/tooltip";
import type { IRowAction } from "../../../models/common/action.model";

type IProps = {
  actions: readonly IRowAction[];
};

const RowActionMenu = ({ actions }: IProps) => {
  if (actions.length === 0) return null;

  if (actions.length === 1) {
    const [action] = actions;
    return (
      <TooltipTrigger>
        <Button
          variant={action.danger ? "destructive" : "outline"}
          size="icon-sm"
          isDisabled={action.disabled}
          aria-label={action.label}
          onPress={action.onSelect}
        >
          {action.icon}
        </Button>
        <Tooltip>{action.label}</Tooltip>
      </TooltipTrigger>
    );
  }

  return (
    <DropdownMenuTrigger>
      <Button variant="outline" size="icon-sm" aria-label="Row actions">
        <EllipsisVertical />
      </Button>
      <DropdownMenu placement="bottom end" aria-label="Row actions">
        {actions.map((action) => (
          <DropdownMenuItem
            key={action.key}
            id={action.key}
            textValue={action.label}
            variant={action.danger ? "destructive" : "default"}
            isDisabled={action.disabled}
            onAction={action.onSelect}
          >
            {action.icon}
            {action.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenu>
    </DropdownMenuTrigger>
  );
};

export default RowActionMenu;
