import { Table } from "antd";
import type { ColumnsType, TableProps } from "antd/es/table";
import { rowClickable, tableContainer } from "../../../styles/table/table.css";

type IProps<T> = {
  columns: ColumnsType<T>;
  data: T[];
  loading?: boolean;
  rowKey?: keyof T | ((row: T) => string);
  pageSize?: number;
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
  onRowClick,
  emptyText,
  rowSelection,
  rowClassName,
}: IProps<T>) => {
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
      pagination={{ pageSize, showSizeChanger: false, hideOnSinglePage: true }}
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
