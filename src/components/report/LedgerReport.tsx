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
import StatusTag from "../common/status/StatusTag";
import { dataTableRowOverdue } from "../../styles/table/table.styles";
import { formatDate, formatMoney } from "../../utils/format.utils";
import { orderedLedger } from "../../utils/report.utils";
import SectionCard from "../common/card/SectionCard";
import StatCard from "../common/card/StatCard";
import DataTable from "../common/table/DataTable";
import BentoCell from "../common/view/BentoCell";
import BentoGrid from "../common/view/BentoGrid";

type IProps<Row extends IReceivable | IPayable> = {
  rows: Row[];
  loading: boolean;
  nameOf: (row: Row) => string;
  label: string;
};

const LedgerReport = <Row extends IReceivable | IPayable>({
  rows,
  loading,
  nameOf,
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
    { title: "Branch", dataIndex: "branch" },
    {
      title: "Amount",
      dataIndex: "amount",
      align: "right",
      render: (value: number) => formatMoney(value),
    },
    {
      title: "Balance",
      key: "balance",
      align: "right",
      render: (_, row) => formatMoney(ledgerBalance(row)),
    },
    {
      title: "Status",
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
            variant="brand"
          />
        </BentoCell>
        <BentoCell span="third">
          <StatCard
            title="Overdue balance"
            value={overdueTotal}
            loading={loading}
            variant="negative"
          />
        </BentoCell>
        <BentoCell span="third">
          <StatCard
            title="Overdue records"
            value={overdueRows.length}
            loading={loading}
            raw
          />
        </BentoCell>
      </BentoGrid>

      <SectionCard
        title={`Outstanding ${label}s`}
        subtitle="Overdue items first, highlighted in red"
        flush
      >
        <DataTable<Row>
          columns={columns}
          data={orderedLedger(rows)}
          loading={loading}
          emptyText="Nothing outstanding"
          rowClassName={(row) => (isLedgerOverdue(row) ? dataTableRowOverdue : "")}
        />
      </SectionCard>
    </>
  );
};

export default LedgerReport;
