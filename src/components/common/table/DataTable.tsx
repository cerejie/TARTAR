import { Fragment, useId, type ReactNode } from "react";
import { ArrowDown, ArrowUp, ChevronRight, ChevronsUpDown, Inbox } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
} from "@/components/ui/empty";
import { Skeleton } from "@/components/ui/skeleton";
import { Spinner } from "@/components/ui/spinner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/utils/cn.utils";
import {
  rowExpansionPersistProps,
  useRowExpansion,
} from "../../../hook/common/expansion.hook";
import { usePagination } from "../../../hook/common/pagination.hook";
import { useSort } from "../../../hook/common/sort.hook";
import type { IDetailSection } from "../../../models/common/detail.model";
import type { IPaginationRequest } from "../../../models/common/pagination.model";
import type {
  IDataTableColumn,
  IDataTableSelection,
  ISortDirection,
} from "../../../models/common/table.model";
import {
  dataTableCell,
  dataTableEmpty,
  dataTableExpansionCell,
  dataTableGrid,
  dataTableHead,
  dataTableHeader,
  dataTableLoadingAnnounce,
  dataTableBodyRefreshing,
  dataTableRefreshSpinner,
  dataTableRoot,
  dataTableRow,
  dataTableRowClickable,
  dataTableRowExpanded,
  dataTableRowStatic,
  dataTableSelectionCell,
  dataTableSkeletonAvatar,
  dataTableSkeletonBar,
  dataTableSkeletonCircle,
  dataTableSkeletonName,
  dataTableSortIcon,
  dataTableSortLabel,
  dataTableStateCell,
  expandTrigger,
  leadCell,
} from "../../../styles/table/table.styles";
import ErrorState from "../status/ErrorState";
import RowDetailPanel from "./RowDetailPanel";
import TablePagination from "./TablePagination";

const skeletonRows = 5;

type IProps<T> = {
  columns: readonly IDataTableColumn<T>[];
  data: readonly T[];
  label?: string;
  loading?: boolean;
  refreshing?: boolean;
  error?: string | null;
  onRetry?: () => void;
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
  rowSelection?: IDataTableSelection<T>;
  rowClassName?: (row: T) => string;
};

const toCellContent = (value: unknown): ReactNode =>
  typeof value === "string" || typeof value === "number" ? value : null;

const columnId = <T,>(column: IDataTableColumn<T>, index: number) =>
  column.key ?? column.dataIndex ?? String(index);

const sortIcon = (direction: ISortDirection | undefined) => {
  if (direction === "ascending") return <ArrowUp className={dataTableSortIcon} />;
  if (direction === "descending") return <ArrowDown className={dataTableSortIcon} />;
  return <ChevronsUpDown className={dataTableSortIcon} />;
};

const skeletonCell = <T,>(column: IDataTableColumn<T>) =>
  column.skeleton === "avatar" ? (
    <span className={dataTableSkeletonAvatar}>
      <Skeleton className={dataTableSkeletonCircle} />
      <Skeleton className={dataTableSkeletonName} />
    </span>
  ) : (
    <Skeleton className={dataTableSkeletonBar({ align: column.align })} />
  );

const DataTable = <T extends object>({
  columns,
  data,
  label = "Records",
  loading,
  refreshing = false,
  error,
  onRetry,
  rowKey = "id" as keyof T,
  pageSize = 8,
  pagination,
  detachedPagination,
  totalCount = 0,
  onPageChange,
  onRowClick,
  expansionKey,
  detailSections,
  emptyText = "No records",
  rowSelection,
  rowClassName,
}: IProps<T>) => {
  const tableId = useId();
  const { expandedRow, collapsingRow, toggleRow, endCollapse } =
    useRowExpansion(expansionKey ?? tableId);
  const { sort, setSort } = useSort(tableId);
  const { pagination: clientPagination, setPagination: setClientPagination } =
    usePagination(tableId);

  const resolveRowKey =
    typeof rowKey === "function" ? rowKey : (row: T) => String(row[rowKey]);

  const isExpandable = Boolean(expansionKey && detailSections?.length);
  const columnCount = columns.length + (rowSelection ? 1 : 0);

  const activeSorter = sort
    ? columns.find((column, index) => columnId(column, index) === sort.column)?.sorter
    : undefined;
  const sortedRows =
    sort && activeSorter
      ? [...data].sort((left, right) =>
          sort.direction === "ascending"
            ? activeSorter(left, right)
            : activeSorter(right, left)
        )
      : data;

  const clientLastPage = Math.max(1, Math.ceil(sortedRows.length / pageSize));
  const clientPage = Math.min(clientPagination.pageNumber, clientLastPage);
  const rows = pagination
    ? sortedRows
    : sortedRows.slice((clientPage - 1) * pageSize, clientPage * pageSize);

  const disabledKeys = rowSelection?.getCheckboxProps
    ? rows
        .filter((row) => rowSelection.getCheckboxProps?.(row).disabled)
        .map(resolveRowKey)
    : [];

  const selectRows = (keys: "all" | Set<string | number>) => {
    if (!rowSelection) return;
    const selected =
      keys === "all"
        ? rows.map(resolveRowKey).filter((key) => !disabledKeys.includes(key))
        : [...keys].map(String);
    rowSelection.onChange(selected);
  };

  const renderLead = (key: string, content: ReactNode) => {
    const expanded = expandedRow === key;

    return (
      <span className={leadCell}>
        <Button
          variant="ghost"
          size="icon-xs"
          aria-label={expanded ? "Hide details" : "Show details"}
          aria-expanded={expanded}
          onPress={() => toggleRow(key)}
          {...rowExpansionPersistProps}
        >
          <ChevronRight className={expandTrigger({ open: expanded })} />
        </Button>
        {content}
      </span>
    );
  };

  const renderRow = (row: T, rowIndex: number) => {
    const key = resolveRowKey(row);
    const isOpen =
      isExpandable && (expandedRow === key || collapsingRow === key);

    return (
      <Fragment key={key}>
        <TableRow
          id={key}
          className={cn(
            dataTableRow,
            onRowClick && dataTableRowClickable,
            isOpen && dataTableRowExpanded,
            rowClassName?.(row)
          )}
          onAction={onRowClick ? () => onRowClick(row) : undefined}
        >
          {rowSelection ? (
            <TableCell className={cn(dataTableCell(), dataTableSelectionCell)}>
              <Checkbox slot="selection" />
            </TableCell>
          ) : null}
          {columns.map((column, index) => {
            const value = column.dataIndex ? row[column.dataIndex] : undefined;
            const content = column.render
              ? column.render(value, row, rowIndex)
              : toCellContent(value);

            return (
              <TableCell
                key={columnId(column, index)}
                className={cn(
                  dataTableCell({ align: column.align }),
                  column.className
                )}
              >
                {isExpandable && index === 0 ? renderLead(key, content) : content}
              </TableCell>
            );
          })}
        </TableRow>

        {isOpen && detailSections ? (
          <TableRow id={`${key}-detail`} className={cn(dataTableRow, dataTableRowStatic)}>
            <TableCell colSpan={columnCount} className={dataTableExpansionCell}>
              <RowDetailPanel<T>
                record={row}
                sections={detailSections}
                collapsing={collapsingRow === key}
                onCollapsed={() => endCollapse(key)}
              />
            </TableCell>
          </TableRow>
        ) : null}
      </Fragment>
    );
  };

  const renderBody = () => {
    if (loading) {
      return Array.from({ length: skeletonRows }, (_, rowIndex) => (
        <TableRow
          key={`skeleton-${rowIndex}`}
          id={`skeleton-${rowIndex}`}
          className={cn(dataTableRow, dataTableRowStatic)}
        >
          {rowSelection ? (
            <TableCell className={cn(dataTableCell(), dataTableSelectionCell)}>
              <Skeleton className={dataTableSkeletonCircle} />
            </TableCell>
          ) : null}
          {columns.map((column, cellIndex) => (
            <TableCell
              key={columnId(column, cellIndex)}
              className={dataTableCell({ align: column.align })}
            >
              {skeletonCell(column)}
            </TableCell>
          ))}
        </TableRow>
      ));
    }

    if (error && rows.length === 0) {
      return (
        <TableRow id="error" className={cn(dataTableRow, dataTableRowStatic)}>
          <TableCell colSpan={columnCount} className={dataTableStateCell}>
            <ErrorState
              title={`Could not load ${label.toLowerCase()}`}
              description={error}
              onAction={onRetry}
            />
          </TableCell>
        </TableRow>
      );
    }

    if (rows.length === 0) {
      return (
        <TableRow id="empty" className={cn(dataTableRow, dataTableRowStatic)}>
          <TableCell colSpan={columnCount} className={dataTableStateCell}>
            <Empty className={dataTableEmpty}>
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <Inbox />
                </EmptyMedia>
                <EmptyDescription>{emptyText}</EmptyDescription>
              </EmptyHeader>
            </Empty>
          </TableCell>
        </TableRow>
      );
    }

    return rows.map(renderRow);
  };

  return (
    <div className={dataTableRoot}>
      <Table
        aria-label={label}
        className={dataTableGrid}
        selectionMode={rowSelection ? "multiple" : "none"}
        selectedKeys={rowSelection ? rowSelection.selectedRowKeys : undefined}
        onSelectionChange={selectRows}
        disabledKeys={disabledKeys}
        disabledBehavior="selection"
        sortDescriptor={sort ?? undefined}
        onSortChange={(descriptor) =>
          setSort({ column: String(descriptor.column), direction: descriptor.direction })
        }
      >
        <TableHeader className={dataTableHeader}>
          {rowSelection ? (
            <TableHead className={cn(dataTableHead(), dataTableSelectionCell)}>
              <Checkbox slot="selection" />
            </TableHead>
          ) : null}
          {columns.map((column, index) => (
            <TableHead
              key={columnId(column, index)}
              id={columnId(column, index)}
              isRowHeader={index === 0}
              allowsSorting={Boolean(column.sorter)}
              className={dataTableHead({
                align: column.align,
                sortable: Boolean(column.sorter),
              })}
              style={column.width === undefined ? undefined : { width: column.width }}
            >
              {({ sortDirection }) => (
                <>
                  {column.sorter ? (
                    <span className={dataTableSortLabel}>
                      {column.title}
                      {sortIcon(sortDirection)}
                    </span>
                  ) : (
                    column.title
                  )}
                  {refreshing && index === columns.length - 1 ? (
                    <Spinner className={dataTableRefreshSpinner} />
                  ) : null}
                </>
              )}
            </TableHead>
          ))}
        </TableHeader>

        <TableBody
          aria-busy={loading || refreshing}
          className={refreshing ? dataTableBodyRefreshing : undefined}
        >
          {renderBody()}
        </TableBody>
      </Table>

      {loading || refreshing ? (
        <p role="status" className={dataTableLoadingAnnounce}>
          {loading ? "Loading" : "Refreshing"}
        </p>
      ) : null}

      {pagination && !detachedPagination ? (
        <TablePagination
          pagination={pagination}
          totalCount={totalCount}
          onPageChange={(pageNumber, size) => onPageChange?.(pageNumber, size)}
        />
      ) : null}

      {!pagination && sortedRows.length > pageSize ? (
        <TablePagination
          pagination={{ pageNumber: clientPage, pageSize }}
          totalCount={sortedRows.length}
          onPageChange={(pageNumber) => setClientPagination({ pageNumber })}
          showSizeChanger={false}
        />
      ) : null}
    </div>
  );
};

export default DataTable;
