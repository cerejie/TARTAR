import { CircleAlert, FileWarning, Wallet } from "lucide-react";
import type { IDataTableColumn } from "../../models/common/table.model";
import {
  ledgerStatusColors,
  ledgerStatusLabels,
  type LedgerStatus,
} from "../../enums/ledger.enum";
import {
  isLedgerOverdue,
  ledgerBalance,
  type IPayable,
  type IReceivable,
} from "../../models/data/ledger/ledger.response";
import type { IReportState } from "../../models/data/report/report.response";
import StatusTag from "../common/status/StatusTag";
import { dataTableRowOverdue } from "../../styles/table/table.styles";
import { formatDate, formatMoney } from "../../utils/format.utils";
import { orderedLedger } from "../../utils/report.utils";
import StatCard from "../common/card/StatCard";
import BentoCell from "../common/view/BentoCell";
import BentoGrid from "../common/view/BentoGrid";
import ReportRowsTable from "./tables/ReportRowsTable";

type IProps<Row extends IReceivable | IPayable> = IReportState & {
  rows: Row[];
  nameOf: (row: Row) => string;
  branchNameOf: (slug: string) => string;
  label: string;
};

const LedgerReport = <Row extends IReceivable | IPayable>({
  rows,
  loading,
  refreshing,
  error,
  onRetry,
  nameOf,
  branchNameOf,
  label,
}: IProps<Row>) => {
  const outstanding = rows.reduce(
    (total, row) => total + ledgerBalance(row),
    0
  );
  const overdueRows = rows.filter(isLedgerOverdue);
  const overdueTotal = overdueRows.reduce(
    (total, row) => total + ledgerBalance(row),
    0
  );

  const columns: IDataTableColumn<Row>[] = [
    {
      title: "Due date",
      dataIndex: "due_date",
      render: (value: string) => formatDate(value),
    },
    { title: label, key: "name", render: (_, row) => nameOf(row) },
    {
      title: "Branch",
      dataIndex: "branch",
      render: (value: string) => branchNameOf(value),
    },
    {
      title: "Amount",
      dataIndex: "amount",
      align: "right",
      render: (value: number) => formatMoney(value),
    },
    {
      title: "Balance",
      mobile: "amount",
      key: "balance",
      align: "right",
      render: (_, row) => formatMoney(ledgerBalance(row)),
    },
    {
      title: "Status",
      mobile: "status",
      dataIndex: "status",
      render: (status: LedgerStatus, row) =>
        isLedgerOverdue(row) ? (
          <StatusTag color="negative" label="Overdue" />
        ) : (
          <StatusTag color={ledgerStatusColors[status]} label={ledgerStatusLabels[status]} />
        ),
    },
  ];

  return (
    <>
      <BentoGrid>
        <BentoCell span="third">
          <StatCard
            title="Total outstanding"
            value={outstanding}
            loading={loading}
            error={error}
            onRetry={onRetry}
            variant="brand"
            icon={<Wallet />}
          />
        </BentoCell>
        <BentoCell span="third">
          <StatCard
            title="Overdue balance"
            value={overdueTotal}
            loading={loading}
            error={error}
            onRetry={onRetry}
            variant="negative"
            icon={<CircleAlert />}
          />
        </BentoCell>
        <BentoCell span="third">
          <StatCard
            title="Overdue records"
            value={overdueRows.length}
            loading={loading}
            error={error}
            onRetry={onRetry}
            raw
            icon={<FileWarning />}
          />
        </BentoCell>
      </BentoGrid>

      <ReportRowsTable<Row>
        title={`Outstanding ${label}s`}
        columns={columns}
        rows={orderedLedger(rows)}
        loading={loading}
        refreshing={refreshing}
        error={error}
        onRetry={onRetry}
        emptyText="Nothing outstanding"
        rowClassName={(row) => (isLedgerOverdue(row) ? dataTableRowOverdue : "")}
      />
    </>
  );
};

export default LedgerReport;
