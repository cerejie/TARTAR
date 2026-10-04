import { ChevronRight } from "lucide-react";
import { Fragment } from "react";
import { Button as PressArea } from "react-aria-components";
import { Checkbox } from "@/components/ui/checkbox";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/utils/cn.utils";
import { focusedRowProps } from "../../../hook/common/focus.hook";
import { useModal } from "../../../hook/common/modal.hook";
import type { ReactNode } from "react";
import type { IRowAction } from "../../../models/common/action.model";
import type { IDetailSection } from "../../../models/common/detail.model";
import type {
  ICardField,
  ICardFields,
  IColumnMobileRole,
  IDataTableColumn,
  IDataTableSelection,
} from "../../../models/common/table.model";
import {
  dataList,
  dataListAmount,
  dataListChevron,
  dataListFrame,
  dataListMain,
  dataListRaised,
  dataListRow,
  dataListRowFocused,
  dataListRowSelected,
  dataListSecondary,
  dataListSecondaryItem,
  dataListSeparator,
  dataListSkeletonAmount,
  dataListSkeletonMain,
  dataListSkeletonMeta,
  dataListSkeletonTitle,
  dataListTags,
  dataListTitle,
  dataListTitlePress,
  dataListTrail,
} from "../../../styles/table/table.styles";
import ErrorState from "../status/ErrorState";
import RefreshBar from "../status/RefreshBar";
import RecordDetailSheet from "./RecordDetailSheet";
import TableEmptyState from "./TableEmptyState";

const skeletonRows = 5;
const defaultCardMetaLimit = 2;
const emptyMark = "—";
const secondarySeparator = "·";

const isEmptyContent = (content: ReactNode) =>
  content === null || content === undefined || content === "" || content === emptyMark;

type IProps<T> = {
  columns: readonly IDataTableColumn<T>[];
  rows: readonly T[];
  label: string;
  loading?: boolean;
  refreshing: boolean;
  error?: string | null;
  onRetry?: () => void;
  emptyText: string;
  emptyHint?: string;
  cardMetaLimit?: number;
  resolveRowKey: (row: T) => string;
  renderContent: (column: IDataTableColumn<T>, row: T, rowIndex: number) => ReactNode;
  columnId: (column: IDataTableColumn<T>, index: number) => string;
  onRowClick?: (row: T) => void;
  rowClassName?: (row: T) => string;
  isFocusedRow: (key: string) => boolean;
  rowSelection?: IDataTableSelection<T>;
  detailSheetKey: string;
  detailSections?: IDetailSection<T>[];
  detailTitle?: (row: T) => string;
  detailActions?: (row: T) => readonly IRowAction[];
};

const mobileRoleOf = <T,>(column: IDataTableColumn<T>, index: number): IColumnMobileRole => {
  if (column.mobile) return column.mobile;
  if (column.key === "actions") return "actions";
  return index === 0 ? "title" : "meta";
};

const SkeletonRow = () => (
  <li className={dataListRow}>
    <span className={dataListSkeletonMain}>
      <Skeleton className={dataListSkeletonTitle} />
      <Skeleton className={dataListSkeletonMeta} />
    </span>
    <Skeleton className={dataListSkeletonAmount} />
  </li>
);

const DataTableList = <T,>({
  columns,
  rows,
  label,
  loading,
  refreshing,
  error,
  onRetry,
  emptyText,
  emptyHint,
  cardMetaLimit = defaultCardMetaLimit,
  resolveRowKey,
  renderContent,
  columnId,
  onRowClick,
  rowClassName,
  isFocusedRow,
  rowSelection,
  detailSheetKey,
  detailSections,
  detailTitle,
  detailActions,
}: IProps<T>) => {
  const detailSheet = useModal<string>(detailSheetKey);
  const sections = detailSections ?? [];
  const metaCount = columns.filter(
    (column, index) => mobileRoleOf(column, index) === "meta"
  ).length;
  const opensDetail =
    !onRowClick &&
    (sections.length > 0 || metaCount > cardMetaLimit || detailActions !== undefined);

  if (loading) {
    return (
      <ul className={dataList} aria-busy>
        {Array.from({ length: skeletonRows }, (_, index) => (
          <SkeletonRow key={index} />
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

  if (rows.length === 0) return <TableEmptyState text={emptyText} hint={emptyHint} />;

  const toggleSelection = (key: string, selected: boolean) => {
    if (!rowSelection) return;
    const others = rowSelection.selectedRowKeys.filter((item) => item !== key);
    rowSelection.onChange(selected ? [...others, key] : others);
  };

  const cardFieldsOf = (row: T, rowIndex: number, labelledMetas = false): ICardFields => {
    const fieldsOf = (role: IColumnMobileRole): ICardField[] =>
      columns.flatMap((column, index) => {
        if (mobileRoleOf(column, index) !== role) return [];
        if (!labelledMetas && column.listHidden) return [];
        const content =
          !labelledMetas && column.listRender
            ? column.listRender(row)
            : renderContent(column, row, rowIndex);
        if (isEmptyContent(content)) return [];
        const showsPrefix = column.cardPrefix !== undefined && !(labelledMetas && role === "meta");
        return [
          {
            id: columnId(column, index),
            title: column.title,
            content: showsPrefix ? (
              <>
                {column.cardPrefix} {content}
              </>
            ) : (
              content
            ),
          },
        ];
      });

    return {
      titles: fieldsOf("title"),
      subtitles: fieldsOf("subtitle"),
      amounts: fieldsOf("amount"),
      statuses: fieldsOf("status"),
      metas: fieldsOf("meta"),
      actions: fieldsOf("actions"),
    };
  };

  const pressOf = (row: T, key: string) => {
    if (onRowClick) return () => onRowClick(row);
    if (opensDetail) return () => detailSheet.openModal(key);
    return undefined;
  };

  const renderRow = (row: T, rowIndex: number) => {
    const key = resolveRowKey(row);
    const { titles, subtitles, amounts, statuses, metas, actions } = cardFieldsOf(
      row,
      rowIndex
    );
    const rowMetas = opensDetail ? metas.slice(0, cardMetaLimit) : metas;
    const rowActions = opensDetail && detailActions ? [] : actions;
    const secondaries = [...subtitles, ...rowMetas];

    const isSelected = rowSelection?.selectedRowKeys.includes(key) ?? false;
    const focused = isFocusedRow(key);
    const pressTitle = pressOf(row, key);
    const titleContent = titles.map((field) => (
      <span key={field.id}>{field.content}</span>
    ));

    return (
      <li
        key={key}
        className={cn(
          dataListRow,
          isSelected && dataListRowSelected,
          rowClassName?.(row),
          focused && dataListRowFocused
        )}
        {...(focused ? focusedRowProps : {})}
      >
        {rowSelection ? (
          <Checkbox
            aria-label="Select row"
            className={dataListRaised}
            isSelected={isSelected}
            isDisabled={rowSelection.getCheckboxProps?.(row).disabled}
            onChange={(selected) => toggleSelection(key, selected)}
          />
        ) : null}

        <div className={dataListMain}>
          {pressTitle ? (
            <PressArea className={dataListTitlePress} onPress={pressTitle}>
              {titleContent}
            </PressArea>
          ) : (
            <span className={dataListTitle}>{titleContent}</span>
          )}
          {secondaries.length > 0 ? (
            <span className={dataListSecondary}>
              {secondaries.map((field, index) => (
                <Fragment key={field.id}>
                  {index > 0 ? (
                    <span className={dataListSeparator} aria-hidden="true">
                      {secondarySeparator}
                    </span>
                  ) : null}
                  <span className={dataListSecondaryItem}>{field.content}</span>
                </Fragment>
              ))}
            </span>
          ) : null}
        </div>

        {amounts.length > 0 || statuses.length > 0 ? (
          <div className={dataListTrail}>
            {amounts.length > 0 ? (
              <span className={dataListAmount}>
                {amounts.map((field) => (
                  <span key={field.id}>{field.content}</span>
                ))}
              </span>
            ) : null}
            {statuses.length > 0 ? (
              <span className={dataListTags}>
                {statuses.map((field) => (
                  <span key={field.id}>{field.content}</span>
                ))}
              </span>
            ) : null}
          </div>
        ) : null}

        {rowActions.map((field) => (
          <span key={field.id} className={dataListRaised}>
            {field.content}
          </span>
        ))}

        {pressTitle ? <ChevronRight className={dataListChevron} aria-hidden="true" /> : null}
      </li>
    );
  };

  const detailIndex = rows.findIndex(
    (row) => resolveRowKey(row) === detailSheet.modal.data
  );
  const detailRow = detailIndex === -1 ? undefined : rows[detailIndex];

  return (
    <>
      <div className={dataListFrame}>
        {refreshing ? <RefreshBar placement="above" /> : null}
        <ul className={dataList} aria-label={label} aria-busy={refreshing}>
          {rows.map(renderRow)}
        </ul>
      </div>

      {opensDetail ? (
        <RecordDetailSheet<T>
          open={detailSheet.modal.visible}
          title={detailRow && detailTitle ? detailTitle(detailRow) : "Details"}
          record={detailRow}
          fields={detailRow ? cardFieldsOf(detailRow, detailIndex, true) : undefined}
          sections={sections}
          actions={detailRow && detailActions ? detailActions(detailRow) : []}
          onClose={detailSheet.closeModal}
        />
      ) : null}
    </>
  );
};

export default DataTableList;
