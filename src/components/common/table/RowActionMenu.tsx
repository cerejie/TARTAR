import { Fragment } from "react";
import { EllipsisVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  rowActionItem,
  rowActionMenu,
  rowActionTrigger,
} from "../../../styles/table/table.styles";
import type { IRowAction } from "../../../models/common/action.model";

type IProps = {
  actions: readonly IRowAction[];
  label?: string;
};

const RowActionMenu = ({ actions, label = "Row actions" }: IProps) => {
  if (actions.length === 0) return null;

  const firstDangerIndex = actions.findIndex((action) => action.danger);

  return (
    <DropdownMenuTrigger>
      <Button
        variant="outline"
        size="icon-sm"
        className={rowActionTrigger}
        aria-label={label}
      >
        <EllipsisVertical />
      </Button>
      <DropdownMenu
        placement="bottom end"
        aria-label={label}
        className={rowActionMenu}
      >
        {actions.map((action, index) => (
          <Fragment key={action.key}>
            {index > 0 && index === firstDangerIndex ? (
              <DropdownMenuSeparator />
            ) : null}
            <DropdownMenuItem
              id={action.key}
              textValue={action.label}
              variant={action.danger ? "destructive" : "default"}
              isDisabled={action.disabled}
              onAction={action.onSelect}
              className={rowActionItem}
            >
              {action.icon}
              {action.label}
              {action.hint ? (
                <DropdownMenuShortcut>{action.hint}</DropdownMenuShortcut>
              ) : null}
            </DropdownMenuItem>
          </Fragment>
        ))}
      </DropdownMenu>
    </DropdownMenuTrigger>
  );
};

export default RowActionMenu;
