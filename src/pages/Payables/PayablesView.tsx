import ContentView from "../../components/common/view/ContentView";
import SupplierLedgerModal from "../../components/ledger/SupplierLedgerModal";
import LedgerSummaryCards from "../../components/ledger/cards/LedgerSummaryCards";
import LedgerStatusTabs from "../../components/ledger/menus/LedgerStatusTabs";
import LedgerViewTabs from "../../components/ledger/menus/LedgerViewTabs";
import SupplierLedgerButton from "../../components/ledger/menus/SupplierLedgerButton";
import MarkPaidModal from "../../components/ledger/modal/MarkPaidModal";
import LedgerRecordsSection from "../../components/ledger/views/LedgerRecordsSection";

const PayablesView = () => {
  return (
    <ContentView
      tabs={<LedgerStatusTabs scope="payables" />}
      toolbar={<LedgerViewTabs />}
      actions={<SupplierLedgerButton />}
    >
      <LedgerSummaryCards scope="payables" />
      <LedgerRecordsSection scope="payables" />
      <SupplierLedgerModal />
      <MarkPaidModal />
    </ContentView>
  );
};

export default PayablesView;
