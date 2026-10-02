import type { ReactNode } from "react";
import { Printer } from "lucide-react";
import AppButton from "../../components/common/button/AppButton";
import ContentView from "../../components/common/view/ContentView";
import ContextSwitch from "../../components/common/view/ContextSwitch";
import BranchSummaryReport from "../../components/report/BranchSummaryReport";
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
import { segmentOptionsOf } from "../../utils/segment.utils";

const ReportsView = () => {
  const {
    type,
    setType,
    transactions,
    receivables,
    payables,
    expenseCategories,
    branchNameOf,
    loading,
    refreshing,
    error,
    retry,
    print,
    summaryRows,
    summaryTotals,
    summaryRange,
    summaryMonth,
    summaryMonths,
    summaryMonthLabels,
    setSummaryMonth,
    setSummaryRange,
  } = useReportHook();

  const state: IReportState = { loading, refreshing, error, onRetry: retry };

  const body = {
    summary: (
      <BranchSummaryReport
        rows={summaryRows}
        totals={summaryTotals}
        range={summaryRange}
        month={summaryMonth}
        months={summaryMonths}
        monthLabels={summaryMonthLabels}
        onMonthChange={setSummaryMonth}
        onRangeChange={setSummaryRange}
        {...state}
      />
    ),
    receivables: (
      <LedgerReport
        rows={receivables}
        {...state}
        nameOf={(row) => row.customer_name}
        branchNameOf={branchNameOf}
        label="Customer"
      />
    ),
    payables: (
      <LedgerReport
        rows={payables}
        {...state}
        nameOf={(row) => row.supplier_name}
        branchNameOf={branchNameOf}
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
        <AppButton onPress={print} disabled={loading}>
          <Printer />
          Print report
        </AppButton>
      }
      tabs={
        <ContextSwitch
          label="Report type"
          value={type}
          options={segmentOptionsOf(reportTypeValues, reportTypeLabels)}
          onChange={setType}
        />
      }
    >
      {body[type] ?? (
        <PeriodReport
          transactions={transactions}
          branchNameOf={branchNameOf}
          {...state}
        />
      )}
    </ContentView>
  );
};

export default ReportsView;
