import type { IDataTableColumn } from "../../models/common/table.model";
import {
  cashInflowTypes,
  cashOutflowTypes,
} from "../../enums/transaction.enum";
import type { ICashFlowRow } from "../../models/data/report/report.response";
import type { ITransaction } from "../../models/data/transaction/transaction.response";
import { formatMoney } from "../../utils/format.utils";
import { cashFlowRows, sumBy } from "../../utils/report.utils";
import SectionCard from "../common/card/SectionCard";
import StatCard from "../common/card/StatCard";
import DataTable from "../common/table/DataTable";
import BentoCell from "../common/view/BentoCell";
import BentoGrid from "../common/view/BentoGrid";

const columns: IDataTableColumn<ICashFlowRow>[] = [
  { title: "Category", dataIndex: "label" },
  { title: "Direction", dataIndex: "direction" },
  {
    title: "Total",
    dataIndex: "total",
    align: "right",
    render: (value: number) => formatMoney(value),
  },
];

type IProps = {
  transactions: ITransaction[];
  loading: boolean;
};

const CashFlowReport = ({ transactions, loading }: IProps) => {
  const inflow = sumBy(transactions, (row) =>
    cashInflowTypes.includes(row.type)
  );
  const outflow = sumBy(transactions, (row) =>
    cashOutflowTypes.includes(row.type)
  );

  return (
    <>
      <BentoGrid>
        <BentoCell span="third">
          <StatCard
            title="Cash In"
            value={inflow}
            loading={loading}
            variant="positive"
          />
        </BentoCell>
        <BentoCell span="third">
          <StatCard
            title="Cash Out"
            value={outflow}
            loading={loading}
            variant="negative"
          />
        </BentoCell>
        <BentoCell span="third">
          <StatCard
            title="Net Cash Flow"
            value={inflow - outflow}
            loading={loading}
            variant="brand"
          />
        </BentoCell>
      </BentoGrid>

      <SectionCard
        title="Cash Flow by Category"
        subtitle="Inflows and outflows by transaction type"
        flush
      >
        <DataTable<ICashFlowRow>
          columns={columns}
          data={cashFlowRows(transactions)}
          loading={loading}
          rowKey="key"
        />
      </SectionCard>
    </>
  );
};

export default CashFlowReport;
