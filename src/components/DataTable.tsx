import { Table } from 'antd'
import type { ColumnsType } from 'antd/es/table'

/**
 * Thin wrapper over antd Table with the app's shared defaults (row key, compact
 * size, sensible pagination, horizontal scroll). Every list view uses this so
 * tables look and behave identically (build spec §3).
 */
interface DataTableProps<T> {
  columns: ColumnsType<T>
  data: T[]
  loading?: boolean
  rowKey?: keyof T | ((row: T) => string)
  pageSize?: number
  /** Optional per-row click (e.g. open detail). */
  onRowClick?: (row: T) => void
  emptyText?: string
}

export function DataTable<T extends object>({
  columns,
  data,
  loading,
  rowKey = 'id' as keyof T,
  pageSize = 15,
  onRowClick,
  emptyText,
}: DataTableProps<T>) {
  return (
    <Table<T>
      className="tartar-table"
      columns={columns}
      dataSource={data}
      loading={loading}
      size="middle"
      rowKey={typeof rowKey === 'function' ? rowKey : (row) => String(row[rowKey])}
      scroll={{ x: 'max-content' }}
      locale={emptyText ? { emptyText } : undefined}
      pagination={{ pageSize, showSizeChanger: false, hideOnSinglePage: true }}
      onRow={
        onRowClick
          ? (row) => ({ onClick: () => onRowClick(row), className: 'tartar-row-clickable' })
          : undefined
      }
    />
  )
}
