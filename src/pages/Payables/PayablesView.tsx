import ContentView from "../../components/common/view/ContentView";
import LedgerSummaryCards from "../../components/ledger/cards/LedgerSummaryCards";
import LedgerStatusTabs from "../../components/ledger/menus/LedgerStatusTabs";
import LedgerViewTabs from "../../components/ledger/menus/LedgerViewTabs";
import RecordPaymentModal from "../../components/ledger/modal/RecordPaymentModal";
import LedgerPaymentsTable from "../../components/ledger/tables/LedgerPaymentsTable";
import LedgerRecordsSection from "../../components/ledger/views/LedgerRecordsSection";

const PayablesView = () => {
  return (
    <ContentView
      tabs={<LedgerStatusTabs scope="payables" />}
      toolbar={<LedgerViewTabs scope="payables" />}
    >
      <LedgerSummaryCards scope="payables" />
      <LedgerRecordsSection scope="payables" />
      <LedgerPaymentsTable kind="payable" />
      <RecordPaymentModal scope="payables" />
    </ContentView>
  );
};

export default PayablesView;
