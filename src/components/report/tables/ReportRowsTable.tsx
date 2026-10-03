import { ListTree } from "lucide-react";
import { useIsCompact } from "../../../hook/common/breakpoint.hook";
import { useModal } from "../../../hook/common/modal.hook";
import { reportRowsSheetModalKey } from "../../../keys/modal.keys";
import AppSheet from "../../common/app/AppSheet";
import AppButton from "../../common/button/AppButton";
import DataTable from "../../common/table/DataTable";
import TablePanel from "../../common/table/TablePanel";

import type { IDataTableColumn } from "../../../models/common/table.model";
import type { IReportState } from "../../../models/data/report/report.response";

const reportKeyRowLimit = 5;

type IProps<T> = IReportState & {
  title: string;
  columns: readonly IDataTableColumn<T>[];
  rows: readonly T[];
  rowKey?: keyof T;
  emptyText?: string;
  cardMetaLimit?: number;
  rowClassName?: (row: T) => string;
};

const ReportRowsTable = <T extends object>({
  title,
  columns,
  rows,
  rowKey,
  emptyText,
  cardMetaLimit,
  rowClassName,
  loading,
  refreshing,
  error,
  onRetry,
}: IProps<T>) => {
  const isCompact = useIsCompact();
  const sheet = useModal(reportRowsSheetModalKey);
  const showsKeyRows = isCompact && rows.length > reportKeyRowLimit;

  const tableProps = {
    columns,
    label: title,
    loading,
    refreshing,
    error,
    onRetry,
    rowKey,
    emptyText,
    cardMetaLimit,
    rowClassName,
  };

  return (
    <>
      <TablePanel
        title={title}
        footer={
          showsKeyRows ? (
            <AppButton variant="outline" onPress={() => sheet.openModal()}>
              <ListTree />
              View all {rows.length}
            </AppButton>
          ) : null
        }
      >
        <DataTable<T>
          {...tableProps}
          data={showsKeyRows ? rows.slice(0, reportKeyRowLimit) : rows}
        />
      </TablePanel>

      {showsKeyRows ? (
        <AppSheet
          open={sheet.modal.visible}
          title={title}
          kind="flow"
          onClose={sheet.closeModal}
        >
          <DataTable<T> {...tableProps} data={rows} />
        </AppSheet>
      ) : null}
    </>
  );
};

export default ReportRowsTable;
