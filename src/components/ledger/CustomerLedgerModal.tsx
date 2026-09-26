import { IdCard } from "lucide-react";
import type { IDataTableColumn } from "../../models/common/table.model";
import { useCustomerLedgerHook } from "../../hook/data/ledger/customer.ledger.hook";
import type { ICustomerReceivableSummary } from "../../models/data/ledger/ledger.response";
import { ledgerKeyOf } from "../../models/data/ledger/ledger.response";
import {
  slidePane,
  slidePanes,
  slideTrack,
} from "../../styles/ledger/ledger.styles";
import { formatDate, formatMoney } from "../../utils/format.utils";
import AppButton from "../common/button/AppButton";
import SearchInput from "../common/filter/SearchInput";
import RequirePermission from "../common/guard/RequirePermission";
import AppModal from "../common/modal/AppModal";
import AvatarCell from "../common/table/AvatarCell";
import DataTable from "../common/table/DataTable";
import CustomerDetailsModal from "./CustomerDetailsModal";
import CustomerInfoTag from "./CustomerInfoTag";
import CustomerLedgerView from "./CustomerLedgerView";

const CustomerLedgerModal = () => {
  const {
    ledgerModal,
    detailsModal,
    detailsTarget,
    detailOpen,
    customers,
    loading,
    search,
    setSearch,
    recordFor,
    openCustomer,
    close,
  } = useCustomerLedgerHook();

  const columns: IDataTableColumn<ICustomerReceivableSummary>[] = [
    {
      title: "Customer",
      key: "name",
      skeleton: "avatar",
      sorter: (a, b) => a.customerName.localeCompare(b.customerName),
      render: (_, customer) => (
        <AvatarCell name={customer.customerName} />
      ),
    },
    {
      title: "Outstanding balance",
      dataIndex: "outstanding",
      align: "right",
      sorter: (a, b) => a.outstanding - b.outstanding,
      render: (value: number) => formatMoney(value),
    },
    {
      title: "Unpaid transactions",
      dataIndex: "unpaidCount",
      align: "right",
      sorter: (a, b) => a.unpaidCount - b.unpaidCount,
    },
    {
      title: "Last transaction",
      dataIndex: "lastTransactionAt",
      sorter: (a, b) =>
        (a.lastTransactionAt ?? "").localeCompare(b.lastTransactionAt ?? ""),
      render: (value: string | null) => formatDate(value),
    },
    {
      title: "Information",
      key: "info",
      width: 130,
      render: (_, customer) => (
        <CustomerInfoTag customer={recordFor(customer)} />
      ),
    },
    {
      title: "Actions",
      key: "actions",
      width: 90,
      align: "center",
      render: (_, customer) => (
        <RequirePermission can="encodeTransactions" fallback={null}>
          <AppButton
            variant="outline"
            size="icon-sm"
            aria-label={`Customer details for ${customer.customerName}`}
            tooltip={
              recordFor(customer)
                ? "Edit customer details"
                : "Fill in customer details"
            }
            onPress={() => detailsModal.openModal(customer)}
          >
            <IdCard />
          </AppButton>
        </RequirePermission>
      ),
    },
  ];

  return (
    <AppModal
      title="Customer Ledger"
      subtitle="Outstanding receivables by customer"
      open={ledgerModal.modal.visible}
      size="xl"
      onClose={close}
    >
      <div className={slidePanes}>
        <div className={slideTrack({ detail: detailOpen })}>
          <div className={slidePane} aria-hidden={detailOpen} inert={detailOpen}>
            <SearchInput
              placeholder="Search customer"
              value={search}
              onChange={(value) => setSearch(value ?? "")}
            />
            <DataTable<ICustomerReceivableSummary>
              columns={columns}
              data={customers}
              loading={loading}
              rowKey={ledgerKeyOf}
              pageSize={8}
              onRowClick={(customer) =>
                openCustomer({
                  customerId: customer.customerId,
                  customerName: customer.customerName,
                })
              }
              emptyText="No customers with receivables"
            />
          </div>
          <div className={slidePane} aria-hidden={!detailOpen} inert={!detailOpen}>
            <CustomerLedgerView />
          </div>
        </div>
      </div>

      <CustomerDetailsModal
        open={detailsModal.modal.visible}
        customer={detailsTarget}
        onClose={detailsModal.closeModal}
      />
    </AppModal>
  );
};

export default CustomerLedgerModal;
