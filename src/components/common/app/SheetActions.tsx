import {
  sheetActions,
  sheetActionsRow,
} from "../../../styles/app/app.styles";
import AppButton from "../button/AppButton";
import RowActionMenu from "../table/RowActionMenu";

import type { IRowAction } from "../../../models/common/action.model";

type IProps = {
  actions: readonly IRowAction[];
};

const SheetActions = ({ actions }: IProps) => {
  const primary = actions.find(
    (action) => !action.danger && action.priority === "primary"
  );
  const secondary = actions.filter(
    (action) => action.priority === "secondary"
  );
  const overflow = [
    ...actions.filter((action) => !action.danger && action.priority === undefined),
    ...actions.filter((action) => action.danger && action.priority === undefined),
  ];
  const menu =
    overflow.length > 0 ? (
      <RowActionMenu actions={overflow} label="More actions" />
    ) : null;
  const primaryButton = primary ? (
    <AppButton disabled={primary.disabled} onPress={primary.onSelect}>
      {primary.icon}
      {primary.label}
    </AppButton>
  ) : null;

  if (secondary.length === 0) {
    return (
      <div className={sheetActions}>
        <div className={sheetActionsRow}>
          {primaryButton}
          {menu}
        </div>
      </div>
    );
  }

  return (
    <div className={sheetActions}>
      {primaryButton}
      <div className={sheetActionsRow}>
        {secondary.map((action) => (
          <AppButton
            key={action.key}
            variant={action.danger ? "destructive" : "outline"}
            disabled={action.disabled}
            onPress={action.onSelect}
          >
            {action.icon}
            {action.label}
          </AppButton>
        ))}
        {menu}
      </div>
    </div>
  );
};

export default SheetActions;
