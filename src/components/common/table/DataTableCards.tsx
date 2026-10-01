import type { ReactNode } from "react";
import { ChevronRight } from "lucide-react";
import { Button as PressArea } from "react-aria-components";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/utils/cn.utils";
import {
  rowExpansionPersistProps,
  type useRowExpansion,
} from "../../../hook/common/expansion.hook";
import type { IDetailSection } from "../../../models/common/detail.model";
import type {
  IColumnMobileRole,
  IDataTableColumn,
  IDataTableSelection,
} from "../../../models/common/table.model";
import {
  dataCard,
  dataCardAmount,
  dataCardDetail,
  dataCardField,
  dataCardFoot,
  dataCardHead,
  dataCardHeading,
  dataCardLabel,
  dataCardList,
  dataCardMeta,
  dataCardRaised,
  dataCardSelected,
  dataCardSkeletonAmount,
  dataCardSkeletonHead,
  dataCardSkeletonMeta,
  dataCardSkeletonTitle,
  dataCardSubtitle,
  dataCardTags,
  dataCardTitle,
  dataCardTitlePress,
  dataCardToggle,
  dataCardValue,
  dataTableBodyRefreshing,
  expandTrigger,
} from "../../../styles/table/table.styles";
import ErrorState from "../status/ErrorState";
import RowDetailPanel from "./RowDetailPanel";
import TableEmptyState from "./TableEmptyState";

const skeletonCards = 5;

type IRenderedField = {
  id: string;
  title: ReactNode;
  content: ReactNode;
};

type IProps<T> = {
  columns: readonly IDataTableColumn<T>[];
  rows: readonly T[];
  label: string;
  loading?: boolean;
  refreshing: boolean;
  error?: string | null;
  onRetry?: () => void;
  emptyText: string;
  resolveRowKey: (row: T) => string;
  renderContent: (column: IDataTableColumn<T>, row: T, rowIndex: number) => ReactNode;
  columnId: (column: IDataTableColumn<T>, index: number) => string;
  onRowClick?: (row: T) => void;
  rowClassName?: (row: T) => string;
  rowSelection?: IDataTableSelection<T>;
  expansion?: ReturnType<typeof useRowExpansion>;
  detailSections?: IDetailSection<T>[];
};

const mobileRoleOf = <T,>(column: IDataTableColumn<T>, index: number): IColumnMobileRole => {
  if (column.mobile) return column.mobile;
  if (column.key === "actions") return "actions";
  return index === 0 ? "title" : "meta";
};

const SkeletonCard = () => (
  <li className={dataCard}>
    <span className={dataCardSkeletonHead}>
      <Skeleton className={dataCardSkeletonTitle} />
      <Skeleton className={dataCardSkeletonAmount} />
    </span>
    <Skeleton className={dataCardSkeletonMeta} />
  </li>
);

const DataTableCards = <T,>({
  columns,
  rows,
  label,
  loading,
  refreshing,
  error,
  onRetry,
  emptyText,
  resolveRowKey,
  renderContent,
  columnId,
  onRowClick,
  rowClassName,
  rowSelection,
  expansion,
  detailSections,
}: IProps<T>) => {
  if (loading) {
    return (
      <ul className={dataCardList} aria-busy>
        {Array.from({ length: skeletonCards }, (_, index) => (
          <SkeletonCard key={index} />
        ))}
      </ul>
    );
  }

  if (error && rows.length === 0) {
    return (
      <ErrorState
        title={`Could not load ${label.toLowerCase()}`}
        description={error}
        onAction={onRetry}
      />
    );
  }

  if (rows.length === 0) return <TableEmptyState text={emptyText} />;

  const toggleSelection = (key: string, selected: boolean) => {
    if (!rowSelection) return;
    const others = rowSelection.selectedRowKeys.filter((item) => item !== key);
    rowSelection.onChange(selected ? [...others, key] : others);
  };

  const renderCard = (row: T, rowIndex: number) => {
    const key = resolveRowKey(row);
    const fieldsOf = (role: IColumnMobileRole): IRenderedField[] =>
      columns.flatMap((column, index) =>
        mobileRoleOf(column, index) === role
          ? [
              {
                id: columnId(column, index),
                title: column.title,
                content: renderContent(column, row, rowIndex),
              },
            ]
          : []
      );

    const titles = fieldsOf("title");
    const subtitles = fieldsOf("subtitle");
    const amounts = fieldsOf("amount");
    const statuses = fieldsOf("status");
    const metas = fieldsOf("meta");
    const actions = fieldsOf("actions");

    const isSelected = rowSelection?.selectedRowKeys.includes(key) ?? false;
    const isExpanded = expansion?.expandedRow === key;
    const isOpen = isExpanded || expansion?.collapsingRow === key;
    const titleContent = titles.map((field) => (
      <span key={field.id}>{field.content}</span>
    ));

    return (
      <li
        key={key}
        className={cn(dataCard, isSelected && dataCardSelected, rowClassName?.(row))}
      >
        <div className={dataCardHead}>
          {rowSelection ? (
            <Checkbox
              aria-label="Select row"
              className={dataCardRaised}
              isSelected={isSelected}
              isDisabled={rowSelection.getCheckboxProps?.(row).disabled}
              onChange={(selected) => toggleSelection(key, selected)}
            />
          ) : null}

          <div className={dataCardHeading}>
            {onRowClick ? (
              <PressArea className={dataCardTitlePress} onPress={() => onRowClick(row)}>
                {titleContent}
              </PressArea>
            ) : (
              <span className={dataCardTitle}>{titleContent}</span>
            )}
            {subtitles.map((field) => (
              <span key={field.id} className={dataCardSubtitle}>
                {field.content}
              </span>
            ))}
          </div>

          {amounts.length > 0 ? (
            <div className={dataCardAmount}>
              {amounts.map((field) => (
                <span key={field.id}>{field.content}</span>
              ))}
            </div>
          ) : null}

          {actions.map((field) => (
            <span key={field.id} className={dataCardRaised}>
              {field.content}
            </span>
          ))}
        </div>

        {metas.length > 0 ? (
          <dl className={dataCardMeta}>
            {metas.map((field) => (
              <div key={field.id} className={dataCardField}>
                <dt className={dataCardLabel}>{field.title}</dt>
                <dd className={dataCardValue}>{field.content}</dd>
              </div>
            ))}
          </dl>
        ) : null}

        {statuses.length > 0 || (expansion && detailSections) ? (
          <div className={dataCardFoot}>
            <div className={dataCardTags}>
              {statuses.map((field) => (
                <span key={field.id}>{field.content}</span>
              ))}
            </div>

            {expansion && detailSections ? (
              <Button
                variant="secondary"
                size="icon-sm"
                className={dataCardToggle}
                aria-label={isExpanded ? "Hide details" : "Show details"}
                aria-expanded={isExpanded}
                onPress={() => expansion.toggleRow(key)}
                {...rowExpansionPersistProps}
              >
                <ChevronRight className={expandTrigger({ open: isExpanded })} />
              </Button>
            ) : null}
          </div>
        ) : null}

        {isOpen && expansion && detailSections ? (
          <div className={dataCardDetail}>
            <RowDetailPanel<T>
              record={row}
              sections={detailSections}
              collapsing={expansion.collapsingRow === key}
              onCollapsed={() => expansion.endCollapse(key)}
            />
          </div>
        ) : null}
      </li>
    );
  };

  return (
    <ul
      className={cn(dataCardList, refreshing && dataTableBodyRefreshing)}
      aria-label={label}
      aria-busy={refreshing}
    >
      {rows.map(renderCard)}
    </ul>
  );
};

export default DataTableCards;
