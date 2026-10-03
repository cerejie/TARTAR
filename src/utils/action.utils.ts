import type { IRowAction } from "../models/common/action.model";

export const hasEnabledAction = (actions: readonly IRowAction[]) =>
  actions.some((action) => !action.disabled);
