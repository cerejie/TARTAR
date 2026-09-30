import { Scale } from "lucide-react";
import type { IDataTableColumn } from "../../../models/common/table.model";
import AvatarCell from "../../common/table/AvatarCell";
import DataTable from "../../common/table/DataTable";
import TablePanel from "../../common/table/TablePanel";
import { useBranchManageHook } from "../../../hook/data/branch/branch.manage.hook";
import { branchMonitorExpansionKey } from "../../../keys/table.keys";
import type { IDetailSection } from "../../../models/common/detail.model";
import type { IBranchMonitorRow } from "../../../models/data/dashboard/dashboard.response";
import { nowrapCell } from "../../../styles/table/table.styles";
import { formatMoney } from "../../../utils/format.utils";

const moneyColumn = (
  title: string,
  dataIndex: keyof IBranchMonitorRow,
  collapse?: IDataTableColumn<IBranchMonitorRow>["collapse"]
): IDataTableColumn<IBranchMonitorRow> => ({
  title,
  dataIndex,
  collapse,
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
  moneyColumn("Receivables", "receivables", "xl"),
  moneyColumn("Payables", "payables", "xl"),
];

const detailSections: IDetailSection<IBranchMonitorRow>[] = [
  {
    key: "ledger",
    title: "Ledger",
    icon: <Scale />,
    items: [
      {
        key: "receivables",
        label: "Receivables",
        render: (row) => formatMoney(row.receivables),
      },
      {
        key: "payables",
        label: "Payables",
        render: (row) => formatMoney(row.payables),
      },
    ],
  },
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
        expansionKey={branchMonitorExpansionKey}
        detailSections={detailSections}
        emptyText="No branch data"
      />
    </TablePanel>
  );
};

export default BranchMonitorTable;
