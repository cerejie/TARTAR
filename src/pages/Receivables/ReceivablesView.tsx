import ContentView from "../../components/common/view/ContentView";
import CustomerLedgerModal from "../../components/ledger/CustomerLedgerModal";
import LedgerSummaryCards from "../../components/ledger/cards/LedgerSummaryCards";
import CustomerLedgerButton from "../../components/ledger/menus/CustomerLedgerButton";
import LedgerStatusTabs from "../../components/ledger/menus/LedgerStatusTabs";
import RecordPaymentModal from "../../components/ledger/modal/RecordPaymentModal";
import LedgerPaymentsTable from "../../components/ledger/tables/LedgerPaymentsTable";
import LedgerRecordsTable from "../../components/ledger/tables/LedgerRecordsTable";

const ReceivablesView = () => {
  return (
    <ContentView
      tabs={<LedgerStatusTabs scope="receivables" />}
      actions={<CustomerLedgerButton />}
    >
      <LedgerSummaryCards scope="receivables" />
      <LedgerRecordsTable scope="receivables" />
      <LedgerPaymentsTable kind="receivable" />
      <RecordPaymentModal scope="receivables" />
      <CustomerLedgerModal />
    </ContentView>
  );
};

export default ReceivablesView;
