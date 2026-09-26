import type { ReactNode } from "react";
import { Printer } from "lucide-react";
import AppButton from "../../components/common/button/AppButton";
import ContentView from "../../components/common/view/ContentView";
import ViewSwitch from "../../components/common/view/ViewSwitch";
import CashFlowReport from "../../components/report/CashFlowReport";
import ExpensesReport from "../../components/report/ExpensesReport";
import LedgerReport from "../../components/report/LedgerReport";
import PeriodReport from "../../components/report/PeriodReport";
import { useReportHook } from "../../hook/data/report/report.hook";
import {
  reportTypeLabels,
  reportTypeValues,
  type IReportState,
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
    refreshing,
    error,
    retry,
    print,
  } = useReportHook();

  const state: IReportState = { loading, refreshing, error, onRetry: retry };

  const body = {
    receivables: (
      <LedgerReport
        rows={receivables}
        {...state}
        nameOf={(row) => row.customer_name}
        label="Customer"
      />
    ),
    payables: (
      <LedgerReport
        rows={payables}
        {...state}
        nameOf={(row) => row.supplier_name}
        label="Supplier"
      />
    ),
    expenses: (
      <ExpensesReport
        transactions={transactions}
        categories={expenseCategories}
        {...state}
      />
    ),
    cashflow: <CashFlowReport transactions={transactions} {...state} />,
  } as Partial<Record<ReportType, ReactNode>>;

  return (
    <ContentView
      actions={
        <AppButton variant="outline" onPress={print} disabled={loading}>
          <Printer />
          Print report
        </AppButton>
      }
      tabs={
        <ViewSwitch
          value={type}
          values={reportTypeValues}
          labels={reportTypeLabels}
          onChange={setType}
        />
      }
    >
      {body[type] ?? (
        <PeriodReport transactions={transactions} {...state} />
      )}
    </ContentView>
  );
};

export default ReportsView;
