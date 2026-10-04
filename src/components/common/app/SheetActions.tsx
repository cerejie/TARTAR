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

const ActionButton = ({ action }: { action: IRowAction }) => (
  <AppButton
    variant={action.danger ? "destructive" : "outline"}
    onPress={action.onSelect}
  >
    {action.icon}
    {action.label}
  </AppButton>
);

const SheetActions = ({ actions }: IProps) => {
  const buttons = actions.filter(
    (action) => !action.disabled && action.priority !== undefined
  );
  const primary = buttons.find(
    (action) => !action.danger && action.priority === "primary"
  );
  const secondary = buttons.filter(
    (action) => action.priority === "secondary"
  );
  const rest = actions.filter(
    (action) => action !== primary && !secondary.includes(action)
  );
  const dangers = rest.filter((action) => action.danger && !action.disabled);
  const overflow = rest.filter((action) => !dangers.includes(action));
  const lead =
    primary === undefined && secondary.length === 0
      ? overflow.find((action) => !action.disabled)
      : undefined;
  const menuActions = overflow.filter((action) => action !== lead);
  const primaryButton = primary ? (
    <AppButton onPress={primary.onSelect}>
      {primary.icon}
      {primary.label}
    </AppButton>
  ) : null;
  const menu = (
    <RowActionMenu actions={menuActions} label="More actions" />
  );
  const dangerButtons = dangers.map((action) => (
    <ActionButton key={action.key} action={action} />
  ));

  if (secondary.length === 0) {
    return (
      <div className={sheetActions}>
        <div className={sheetActionsRow}>
          {primaryButton}
          {lead ? <ActionButton action={lead} /> : null}
          {menu}
        </div>
        {dangerButtons}
      </div>
    );
  }

  return (
    <div className={sheetActions}>
      {primaryButton}
      <div className={sheetActionsRow}>
        {secondary.map((action) => (
          <ActionButton key={action.key} action={action} />
        ))}
        {menu}
      </div>
      {dangerButtons}
    </div>
  );
};

export default SheetActions;
