import { PrinterOutlined } from "@ant-design/icons";
import { Button, Segmented } from "antd";
import type { ReactNode } from "react";
import ContentView from "../../components/common/view/ContentView";
import CashFlowReport from "../../components/report/CashFlowReport";
import ExpensesReport from "../../components/report/ExpensesReport";
import LedgerReport from "../../components/report/LedgerReport";
import PeriodReport from "../../components/report/PeriodReport";
import { useReportHook } from "../../hook/data/report/report.hook";
import {
  reportTypeLabels,
  reportTypeValues,
  type ReportType,
} from "../../models/data/report/report.response";

const ReportsView = () => {
  const {
    type,
    setType,
    transactions,
    receivables,
    payables,
    expenseCategories,
    loading,
    print,
  } = useReportHook();

  const body = {
    receivables: (
      <LedgerReport
        rows={receivables}
        loading={loading}
        nameOf={(row) => row.customer_name}
        label="Customer"
      />
    ),
    payables: (
      <LedgerReport
        rows={payables}
        loading={loading}
        nameOf={(row) => row.supplier_name}
        label="Supplier"
      />
    ),
    expenses: (
      <ExpensesReport
        transactions={transactions}
        categories={expenseCategories}
        loading={loading}
      />
    ),
    cashflow: <CashFlowReport transactions={transactions} loading={loading} />,
  } as Partial<Record<ReportType, ReactNode>>;

  return (
    <ContentView
      actions={
        <Button icon={<PrinterOutlined />} onClick={print} disabled={loading}>
          Print report
        </Button>
      }
      toolbar={
        <Segmented
          value={type}
          onChange={(value) => setType(value as ReportType)}
          options={reportTypeValues.map((item) => ({
            label: reportTypeLabels[item],
            value: item,
          }))}
        />
      }
    >
      {body[type] ?? (
        <PeriodReport transactions={transactions} loading={loading} />
      )}
    </ContentView>
  );
};

export default ReportsView;
