import { RightOutlined } from "@ant-design/icons";
import { Table } from "antd";
import type { ColumnsType, ColumnType, TableProps } from "antd/es/table";
import type { ReactNode } from "react";
import {
  rowExpansionPersistProps,
  useRowExpansion,
} from "../../../hook/common/expansion.hook";
import type { IDetailSection } from "../../../models/common/detail.model";
import type { IPaginationRequest } from "../../../models/common/pagination.model";
import {
  expandTrigger,
  expandTriggerOpen,
  leadCell,
  leadHeader,
  rowClickable,
  rowExpanded,
  tableContainer,
} from "../../../styles/table/table.css";
import RowDetailPanel from "./RowDetailPanel";

type IProps<T> = {
  columns: ColumnsType<T>;
  data: T[];
  loading?: boolean;
  rowKey?: keyof T | ((row: T) => string);
  pageSize?: number;
  pagination?: IPaginationRequest;
  detachedPagination?: boolean;
  totalCount?: number;
  onPageChange?: (pageNumber: number, pageSize: number) => void;
  onRowClick?: (row: T) => void;
  expansionKey?: string;
  detailSections?: IDetailSection<T>[];
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
  detachedPagination,
  totalCount = 0,
  onPageChange,
  onRowClick,
  expansionKey,
  detailSections,
  emptyText,
  rowSelection,
  rowClassName,
}: IProps<T>) => {
  const { expandedRow, collapsingRow, toggleRow, endCollapse } =
    useRowExpansion(expansionKey ?? "");

  const resolveRowKey =
    typeof rowKey === "function" ? rowKey : (row: T) => String(row[rowKey]);

  const isExpandable = Boolean(expansionKey && detailSections?.length);

  const expandedRowKeys = [expandedRow, collapsingRow].filter(
    (rowKey): rowKey is string => rowKey !== null
  );

  const withExpandTrigger = ([lead, ...rest]: ColumnsType<T>): ColumnsType<T> => {
    if (!lead || "children" in lead) return columns;

    const renderLead = (lead as ColumnType<T>).render;
    const titleLead = (lead as ColumnType<T>).title;

    return [
      {
        ...lead,
        title:
          typeof titleLead === "function" ? (
            titleLead
          ) : (
            <span className={`${leadHeader}`}>{titleLead}</span>
          ),
        render: (value: unknown, row: T, index: number) => {
          const key = resolveRowKey(row);
          const expanded = expandedRow === key;

          return (
            <span className={`${leadCell}`}>
              <button
                type="button"
                aria-label={expanded ? "Hide details" : "Show details"}
                aria-expanded={expanded}
                className={
                  expanded
                    ? `${expandTrigger} ${expandTriggerOpen}`
                    : `${expandTrigger}`
                }
                onClick={(event) => {
                  event.stopPropagation();
                  toggleRow(key);
                }}
                {...rowExpansionPersistProps}
              >
                <RightOutlined />
              </button>
              {renderLead
                ? (renderLead(value, row, index) as ReactNode)
                : (value as ReactNode)}
            </span>
          );
        },
      },
      ...rest,
    ];
  };

  const attachedPager = pagination
    ? {
        current: pagination.pageNumber,
        pageSize: pagination.pageSize,
        total: totalCount,
        showSizeChanger: true,
        showLessItems: true,
        showTotal: (total: number) =>
          `${total} ${total === 1 ? "record" : "records"}`,
      }
    : { pageSize, showSizeChanger: false, hideOnSinglePage: true };

  const expandable: TableProps<T>["expandable"] =
    isExpandable && detailSections
      ? {
          showExpandColumn: false,
          expandedRowKeys,
          expandedRowRender: (row) => (
            <RowDetailPanel<T>
              record={row}
              sections={detailSections}
              collapsing={collapsingRow === resolveRowKey(row)}
              onCollapsed={() => endCollapse(resolveRowKey(row))}
            />
          ),
        }
      : undefined;

  const resolveRowClassName = (row: T) => {
    const base = rowClassName?.(row) ?? "";
    const open = isExpandable && expandedRowKeys.includes(resolveRowKey(row));
    return open ? `${base} ${rowExpanded}`.trim() : base;
  };

  return (
    <Table<T>
      className={`${tableContainer}`}
      columns={isExpandable ? withExpandTrigger(columns) : columns}
      dataSource={data}
      loading={loading}
      size="middle"
      tableLayout="auto"
      rowKey={resolveRowKey}
      rowSelection={rowSelection}
      rowClassName={resolveRowClassName}
      expandable={expandable}
      locale={emptyText ? { emptyText } : undefined}
      pagination={detachedPagination ? false : attachedPager}
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
