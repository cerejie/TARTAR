import type { ReactNode } from "react";
import { ChevronRight } from "lucide-react";
import { Button as PressArea } from "react-aria-components";
import { Checkbox } from "@/components/ui/checkbox";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/utils/cn.utils";
import { focusedRowProps } from "../../../hook/common/focus.hook";
import { useModal } from "../../../hook/common/modal.hook";
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
  dataCard,
  dataCardAmount,
  dataCardChevron,
  dataCardField,
  dataCardFocused,
  dataCardFoot,
  dataCardGrid,
  dataCardHead,
  dataCardHeadChevron,
  dataCardHeading,
  dataCardLabel,
  dataCardList,
  dataCardListFrame,
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
  dataCardValue,
} from "../../../styles/table/table.styles";
import ErrorState from "../status/ErrorState";
import RefreshBar from "../status/RefreshBar";
import RecordDetailSheet from "./RecordDetailSheet";
import TableEmptyState from "./TableEmptyState";

const skeletonCards = 5;
const defaultCardMetaLimit = 2;
const emptyMark = "—";

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
  cardGrid?: boolean;
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
  emptyHint,
  cardGrid,
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
  const listClassName = cn(dataCardList, cardGrid && dataCardGrid);
  const sections = detailSections ?? [];
  const metaCount = columns.filter(
    (column, index) => mobileRoleOf(column, index) === "meta"
  ).length;
  const opensDetail =
    !onRowClick &&
    (sections.length > 0 || metaCount > cardMetaLimit || detailActions !== undefined);

  if (loading) {
    return (
      <ul className={listClassName} aria-busy>
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

  if (rows.length === 0) return <TableEmptyState text={emptyText} hint={emptyHint} />;

  const toggleSelection = (key: string, selected: boolean) => {
    if (!rowSelection) return;
    const others = rowSelection.selectedRowKeys.filter((item) => item !== key);
    rowSelection.onChange(selected ? [...others, key] : others);
  };

  const cardFieldsOf = (row: T, rowIndex: number): ICardFields => {
    const fieldsOf = (role: IColumnMobileRole): ICardField[] =>
      columns.flatMap((column, index) => {
        if (mobileRoleOf(column, index) !== role) return [];
        const content = renderContent(column, row, rowIndex);
        if (isEmptyContent(content)) return [];
        return [
          {
            id: columnId(column, index),
            title: column.title,
            content: column.cardPrefix ? (
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

  const renderCard = (row: T, rowIndex: number) => {
    const key = resolveRowKey(row);
    const { titles, subtitles, amounts, statuses, metas, actions } = cardFieldsOf(
      row,
      rowIndex
    );
    const cardMetas = opensDetail ? metas.slice(0, cardMetaLimit) : metas;

    const isSelected = rowSelection?.selectedRowKeys.includes(key) ?? false;
    const focused = isFocusedRow(key);
    const pressTitle = pressOf(row, key);
    const hasCardBody = statuses.length > 0 || cardMetas.length > 0;
    const headChevron = pressTitle !== undefined && !hasCardBody;
    const footChevron = pressTitle !== undefined && hasCardBody;
    const titleContent = titles.map((field) => (
      <span key={field.id}>{field.content}</span>
    ));

    return (
      <li
        key={key}
        className={cn(
          dataCard,
          isSelected && dataCardSelected,
          rowClassName?.(row),
          focused && dataCardFocused
        )}
        {...(focused ? focusedRowProps : {})}
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
            {pressTitle ? (
              <PressArea className={dataCardTitlePress} onPress={pressTitle}>
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

          {headChevron ? (
            <ChevronRight className={dataCardHeadChevron} aria-hidden="true" />
          ) : null}
        </div>

        {cardMetas.length > 0 ? (
          <dl className={dataCardMeta}>
            {cardMetas.map((field) => (
              <div key={field.id} className={dataCardField}>
                <dt className={dataCardLabel}>{field.title}</dt>
                <dd className={dataCardValue}>{field.content}</dd>
              </div>
            ))}
          </dl>
        ) : null}

        {statuses.length > 0 || footChevron ? (
          <div className={dataCardFoot}>
            <div className={dataCardTags}>
              {statuses.map((field) => (
                <span key={field.id}>{field.content}</span>
              ))}
            </div>

            {footChevron ? (
              <ChevronRight className={dataCardChevron} aria-hidden="true" />
            ) : null}
          </div>
        ) : null}
      </li>
    );
  };

  const detailIndex = rows.findIndex(
    (row) => resolveRowKey(row) === detailSheet.modal.data
  );
  const detailRow = detailIndex === -1 ? undefined : rows[detailIndex];

  return (
    <>
      <div className={dataCardListFrame}>
        {refreshing ? <RefreshBar placement="above" /> : null}
        <ul className={listClassName} aria-label={label} aria-busy={refreshing}>
          {rows.map(renderCard)}
        </ul>
      </div>

      {opensDetail ? (
        <RecordDetailSheet<T>
          open={detailSheet.modal.visible}
          title={detailRow && detailTitle ? detailTitle(detailRow) : "Details"}
          record={detailRow}
          fields={detailRow ? cardFieldsOf(detailRow, detailIndex) : undefined}
          sections={sections}
          actions={detailRow && detailActions ? detailActions(detailRow) : []}
          onClose={detailSheet.closeModal}
        />
      ) : null}
    </>
  );
};

export default DataTableCards;
