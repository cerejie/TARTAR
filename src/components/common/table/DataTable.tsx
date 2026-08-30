import { Table } from "antd";
import type { ColumnsType, TableProps } from "antd/es/table";
import type { IPaginationRequest } from "../../../models/common/pagination.model";
import { rowClickable, tableContainer } from "../../../styles/table/table.css";

type IProps<T> = {
  columns: ColumnsType<T>;
  data: T[];
  loading?: boolean;
  rowKey?: keyof T | ((row: T) => string);
  pageSize?: number;
  pagination?: IPaginationRequest;
  totalCount?: number;
  onPageChange?: (pageNumber: number, pageSize: number) => void;
  onRowClick?: (row: T) => void;
  emptyText?: string;
  rowSelection?: TableProps<T>["rowSelection"];
  rowClassName?: (row: T) => string;
};

const DataTable = <T extends object>({
  columns,
  data,
  loading,
  rowKey = "id" as keyof T,
  pageSize = 15,
  pagination,
  totalCount = 0,
  onPageChange,
  onRowClick,
  emptyText,
  rowSelection,
  rowClassName,
}: IProps<T>) => {
  const pager = pagination
    ? {
        current: pagination.pageNumber,
        pageSize: pagination.pageSize,
        total: totalCount,
        showSizeChanger: true,
        showLessItems: true,
      }
    : { pageSize, showSizeChanger: false, hideOnSinglePage: true };

  return (
    <Table<T>
      className={`${tableContainer}`}
      columns={columns}
      dataSource={data}
      loading={loading}
      size="middle"
      rowKey={
        typeof rowKey === "function" ? rowKey : (row) => String(row[rowKey])
      }
      rowSelection={rowSelection}
      rowClassName={rowClassName}
      scroll={{ x: "max-content" }}
      locale={emptyText ? { emptyText } : undefined}
      pagination={pager}
      onChange={
        pagination
          ? (config) =>
              onPageChange?.(
                config.current ?? 1,
                config.pageSize ?? pagination.pageSize
              )
          : undefined
      }
      onRow={
        onRowClick
          ? (row) => ({
              onClick: () => onRowClick(row),
              className: `${rowClickable}`,
            })
          : undefined
      }
    />
  );
};

export default DataTable;
