import {
  sheetActions,
  sheetActionsDanger,
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
    (action) => !action.danger && action.priority === "secondary"
  );
  const tertiary = actions.filter(
    (action) => !action.danger && action.priority === undefined
  );
  const destructive = actions.filter((action) => action.danger);
  const hasRow = secondary.length + tertiary.length + destructive.length > 0;

  return (
    <div className={sheetActions}>
      {primary ? (
        <AppButton disabled={primary.disabled} onPress={primary.onSelect}>
          {primary.icon}
          {primary.label}
        </AppButton>
      ) : null}

      {hasRow ? (
        <div className={sheetActionsRow}>
          {secondary.map((action) => (
            <AppButton
              key={action.key}
              variant="outline"
              disabled={action.disabled}
              onPress={action.onSelect}
            >
              {action.icon}
              {action.label}
            </AppButton>
          ))}

          <RowActionMenu actions={tertiary} label="More actions" />

          {destructive.length > 0 ? (
            <div className={sheetActionsDanger}>
              {destructive.map((action) => (
                <AppButton
                  key={action.key}
                  variant="destructive"
                  disabled={action.disabled}
                  onPress={action.onSelect}
                >
                  {action.icon}
                  {action.label}
                </AppButton>
              ))}
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
};

export default SheetActions;
