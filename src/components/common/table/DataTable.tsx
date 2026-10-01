import { Fragment, useId, type ReactNode } from "react";
import { ArrowDown, ArrowUp, ChevronRight, ChevronsUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
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
import { useIsMobile } from "@/hook/use-mobile";
import { cn } from "@/utils/cn.utils";
import {
  rowExpansionPersistProps,
  useRowExpansion,
} from "../../../hook/common/expansion.hook";
import { usePagination } from "../../../hook/common/pagination.hook";
import { usePendingIds } from "../../../hook/common/pending.hook";
import { useSort } from "../../../hook/common/sort.hook";
import type { IDetailSection } from "../../../models/common/detail.model";
import {
  grownPageSize,
  type IPaginationRequest,
} from "../../../models/common/pagination.model";
import type {
  IDataTableColumn,
  IDataTableSelection,
  ISortDirection,
} from "../../../models/common/table.model";
import {
  dataTableCell,
  dataTableCollapse,
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
  dataTableRowPending,
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
import StatusTag from "../status/StatusTag";
import { rowDetailSheetModalKey } from "../../../keys/modal.keys";
import DataTableCards from "./DataTableCards";
import LoadMoreSentinel from "./LoadMoreSentinel";
import RowDetailPanel from "./RowDetailPanel";
import TableEmptyState from "./TableEmptyState";
import TablePagination from "./TablePagination";

const skeletonRows = 5;
const actionsColumnKey = "actions";

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
  detailTitle?: (row: T) => string;
  emptyText?: string;
  rowSelection?: IDataTableSelection<T>;
  rowClassName?: (row: T) => string;
  pendingKeysOf?: (row: T) => readonly (string | null | undefined)[];
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
  detailTitle,
  emptyText = "No records",
  rowSelection,
  rowClassName,
  pendingKeysOf,
}: IProps<T>) => {
  const tableId = useId();
  const isMobile = useIsMobile();
  const expansion = useRowExpansion(expansionKey ?? tableId);
  const { expandedRow, collapsingRow, toggleRow, endCollapse } = expansion;
  const { sort, setSort } = useSort(tableId);
  const { pagination: clientPagination, setPagination: setClientPagination } =
    usePagination(tableId);

  const pendingIds = usePendingIds();

  const resolveRowKey =
    typeof rowKey === "function" ? rowKey : (row: T) => String(row[rowKey]);

  const isPendingRow = (row: T) =>
    [resolveRowKey(row), ...(pendingKeysOf?.(row) ?? [])].some(
      (key) => !!key && pendingIds.has(key)
    );

  const rowClassOf = (row: T) =>
    cn(rowClassName?.(row), isPendingRow(row) && dataTableRowPending);

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

  const renderContent = (column: IDataTableColumn<T>, row: T, rowIndex: number) => {
    if (column.key === actionsColumnKey && isPendingRow(row)) {
      return (
        <StatusTag
          label="Pending sync"
          color="warning"
          hint="Saved on this device. It syncs when you are back online."
        />
      );
    }
    const value = column.dataIndex ? row[column.dataIndex] : undefined;
    return column.render ? column.render(value, row, rowIndex) : toCellContent(value);
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
            rowClassOf(row)
          )}
          onAction={onRowClick ? () => onRowClick(row) : undefined}
        >
          {rowSelection ? (
            <TableCell className={cn(dataTableCell(), dataTableSelectionCell)}>
              <Checkbox slot="selection" />
            </TableCell>
          ) : null}
          {columns.map((column, index) => {
            const content = renderContent(column, row, rowIndex);

            return (
              <TableCell
                key={columnId(column, index)}
                className={cn(
                  dataTableCell({ align: column.align }),
                  dataTableCollapse({ collapse: column.collapse }),
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
              className={cn(
                dataTableCell({ align: column.align }),
                dataTableCollapse({ collapse: column.collapse })
              )}
            >
              {skeletonCell(column)}
            </TableCell>
          ))}
        </TableRow>
      ));
    }

    if (error && rows.length === 0) {
      return (
        <TableRow key="error" id="error" className={cn(dataTableRow, dataTableRowStatic)}>
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
        <TableRow key="empty" id="empty" className={cn(dataTableRow, dataTableRowStatic)}>
          <TableCell colSpan={columnCount} className={dataTableStateCell}>
            <TableEmptyState text={emptyText} />
          </TableCell>
        </TableRow>
      );
    }

    return rows.map(renderRow);
  };

  const renderTable = () => (
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
            className={cn(
              dataTableHead({
                align: column.align,
                sortable: Boolean(column.sorter),
              }),
              dataTableCollapse({ collapse: column.collapse })
            )}
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
  );

  return (
    <div className={dataTableRoot}>
      {isMobile ? (
        <DataTableCards<T>
          columns={columns}
          rows={rows}
          label={label}
          loading={loading}
          refreshing={refreshing}
          error={error}
          onRetry={onRetry}
          emptyText={emptyText}
          resolveRowKey={resolveRowKey}
          renderContent={renderContent}
          columnId={columnId}
          onRowClick={onRowClick}
          rowClassName={rowClassOf}
          rowSelection={rowSelection}
          detailSheetKey={rowDetailSheetModalKey(expansionKey ?? tableId)}
          detailSections={isExpandable ? detailSections : undefined}
          detailTitle={detailTitle}
        />
      ) : (
        renderTable()
      )}

      {loading || refreshing ? (
        <p role="status" className={dataTableLoadingAnnounce}>
          {loading ? "Loading" : "Refreshing"}
        </p>
      ) : null}

      {isMobile && pagination && onPageChange && !loading && rows.length > 0 ? (
        <LoadMoreSentinel
          loadedCount={rows.length}
          totalCount={totalCount}
          loading={refreshing}
          error={error}
          onRetry={onRetry}
          onLoadMore={() => onPageChange(1, grownPageSize(pagination))}
        />
      ) : null}

      {!isMobile && pagination && !detachedPagination ? (
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
          visibleOnPhone
        />
      ) : null}
    </div>
  );
};

export default DataTable;
