import { Link } from "react-aria-components";
import {
  quickAction,
  quickActionIcon,
  quickActionLabel,
  quickActions,
} from "../../styles/dashboard/dashboard.styles";

import type { IRoute } from "../../models/common/route.model";

type IProps = {
  actions: readonly IRoute[];
};

const QuickActions = ({ actions }: IProps) => {
  if (!actions.length) return null;

  return (
    <nav aria-label="Quick actions" className={quickActions}>
      {actions.map(({ key, path, label, icon: Icon }) => (
        <Link key={key} href={path} className={quickAction}>
          <span className={quickActionIcon} aria-hidden="true">
            {Icon ? <Icon /> : null}
          </span>
          <span className={quickActionLabel}>{label}</span>
        </Link>
      ))}
    </nav>
  );
};

export default QuickActions;
