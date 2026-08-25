import {
  CloudOutlined,
  CloudSyncOutlined,
  DisconnectOutlined,
} from "@ant-design/icons";
import { Badge, Tag, Tooltip } from "antd";
import { useSyncStatus } from "../../../hook/common/network.hook";
import { syncIndicator } from "../../../styles/status/status.css";

const SyncIndicator = () => {
  const { online, pending, flushing } = useSyncStatus();

  if (!online) {
    return (
      <Tooltip
        title={
          pending
            ? `${pending} change(s) will sync when back online`
            : "You are offline"
        }
      >
        <Tag
          className={`${syncIndicator}`}
          color="warning"
          icon={<DisconnectOutlined />}
        >
          Offline{pending ? ` · ${pending} pending` : ""}
        </Tag>
      </Tooltip>
    );
  }

  if (pending > 0 || flushing) {
    return (
      <Tooltip
        title={
          flushing
            ? "Syncing queued changes…"
            : `${pending} change(s) waiting to sync`
        }
      >
        <Tag
          className={`${syncIndicator}`}
          color="processing"
          icon={<CloudSyncOutlined spin={flushing} />}
        >
          {flushing ? "Syncing…" : `${pending} pending`}
        </Tag>
      </Tooltip>
    );
  }

  return (
    <Tooltip title="Online — all changes saved">
      <Tag
        className={`${syncIndicator}`}
        color="success"
        icon={<CloudOutlined />}
      >
        <Badge status="success" text="Online" />
      </Tag>
    </Tooltip>
  );
};

export default SyncIndicator;
