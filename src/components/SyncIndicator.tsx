import { Badge, Tag, Tooltip } from 'antd'
import { CloudOutlined, CloudSyncOutlined, DisconnectOutlined } from '@ant-design/icons'
import { useSyncStatus } from '../hooks/useNetwork'

/**
 * Offline/online indicator + pending-sync count (build spec §2). Sits in the
 * app header. Three states: online & synced, syncing/queued, and offline.
 */
export function SyncIndicator() {
  const { online, pending, flushing } = useSyncStatus()

  if (!online) {
    return (
      <Tooltip title={pending ? `${pending} change(s) will sync when back online` : 'You are offline'}>
        <Tag className="tartar-sync" color="warning" icon={<DisconnectOutlined />}>
          Offline{pending ? ` · ${pending} pending` : ''}
        </Tag>
      </Tooltip>
    )
  }

  if (pending > 0 || flushing) {
    return (
      <Tooltip title={flushing ? 'Syncing queued changes…' : `${pending} change(s) waiting to sync`}>
        <Tag className="tartar-sync" color="processing" icon={<CloudSyncOutlined spin={flushing} />}>
          {flushing ? 'Syncing…' : `${pending} pending`}
        </Tag>
      </Tooltip>
    )
  }

  return (
    <Tooltip title="Online — all changes saved">
      <Tag className="tartar-sync" color="success" icon={<CloudOutlined />}>
        <Badge status="success" text="Online" />
      </Tag>
    </Tooltip>
  )
}
