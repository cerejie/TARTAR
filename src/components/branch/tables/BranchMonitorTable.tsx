import type { IDataTableColumn } from "../../../models/common/table.model";
import AvatarCell from "../../common/table/AvatarCell";
import DataTable from "../../common/table/DataTable";
import TablePanel from "../../common/table/TablePanel";
import { useBranchManageHook } from "../../../hook/data/branch/branch.manage.hook";
import type { IBranchMonitorRow } from "../../../models/data/dashboard/dashboard.response";
import { nowrapCell } from "../../../styles/table/table.styles";
import { formatMoney } from "../../../utils/format.utils";

const moneyColumn = (
  title: string,
  dataIndex: keyof IBranchMonitorRow
): IDataTableColumn<IBranchMonitorRow> => ({
  title,
  dataIndex,
  align: "right",
  className: nowrapCell,
  render: (value: number) => formatMoney(value),
});

const columns: IDataTableColumn<IBranchMonitorRow>[] = [
  {
    title: "Branch",
    dataIndex: "branchName",
    skeleton: "avatar",
    render: (name: string) => <AvatarCell name={name} />,
  },
  moneyColumn("Cash balance", "cashBalance"),
  moneyColumn("Sales", "sales"),
  moneyColumn("Expenses", "expenses"),
  moneyColumn("Receivables", "receivables"),
  moneyColumn("Payables", "payables"),
];

const BranchMonitorTable = () => {
  const {
    monitorRows,
    monitorLoading,
    monitorRefreshing,
    monitorError,
    retryMonitor,
  } = useBranchManageHook();

  return (
    <TablePanel title="Branch monitoring">
      <DataTable<IBranchMonitorRow>
        columns={columns}
        data={monitorRows}
        loading={monitorLoading}
        refreshing={monitorRefreshing}
        error={monitorError}
        onRetry={retryMonitor}
        rowKey="branch"
        emptyText="No branch data"
      />
    </TablePanel>
  );
};

export default BranchMonitorTable;
