import { RefreshCw } from "lucide-react";
import { usePullIndicator } from "../../../hook/common/pull.hook";
import { appPull, appPullBadge } from "../../../styles/app/app.styles";

const PullIndicator = () => {
  const { height, rotation, ready, refreshing, visible } = usePullIndicator();

  if (!visible) return null;

  return (
    <div className={appPull} style={{ height }} role="status" aria-live="polite">
      <span className={appPullBadge({ ready, refreshing })}>
        <RefreshCw
          aria-label={refreshing ? "Refreshing" : "Pull to refresh"}
          style={refreshing ? undefined : { rotate: `${rotation}deg` }}
        />
      </span>
    </div>
  );
};

export default PullIndicator;
