import { IdCard } from "lucide-react";
import type { IRowAction } from "../../models/common/action.model";
import type { IDataTableColumn } from "../../models/common/table.model";
import { useCustomerLedgerHook } from "../../hook/data/ledger/customer.ledger.hook";
import type { ICustomerReceivableSummary } from "../../models/data/ledger/ledger.response";
import { ledgerKeyOf } from "../../models/data/ledger/ledger.response";
import {
  ledgerPane,
  slidePane,
  slidePanes,
  slideTrack,
} from "../../styles/ledger/ledger.styles";
import { nowrapCell } from "../../styles/table/table.styles";
import { formatDate, formatMoney } from "../../utils/format.utils";
import { useIsCompact } from "../../hook/common/breakpoint.hook";
import SearchInput from "../common/filter/SearchInput";
import RequirePermission from "../common/guard/RequirePermission";
import AppModal from "../common/modal/AppModal";
import DataTable from "../common/table/DataTable";
import NameCell from "../common/table/NameCell";
import RowActionMenu from "../common/table/RowActionMenu";
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
  const isCompact = useIsCompact();

  const actionsOf = (customer: ICustomerReceivableSummary): IRowAction[] => [
    {
      key: "details",
      label: recordFor(customer)
        ? "Edit customer details"
        : "Fill in customer details",
      icon: <IdCard />,
      onSelect: () => detailsModal.openModal(customer),
    },
  ];

  const columns: IDataTableColumn<ICustomerReceivableSummary>[] = [
    {
      title: "Customer",
      key: "name",
      sorter: (a, b) => a.customerName.localeCompare(b.customerName),
      render: (_, customer) => (
        <NameCell name={customer.customerName} />
      ),
    },
    {
      title: "Outstanding balance",
      mobile: "amount",
      dataIndex: "outstanding",
      align: "right",
      className: nowrapCell,
      sorter: (a, b) => a.outstanding - b.outstanding,
      render: (value: number) => formatMoney(value),
    },
    {
      title: "Unpaid transactions",
      mobile: "hidden",
      dataIndex: "unpaidCount",
      align: "right",
      sorter: (a, b) => a.unpaidCount - b.unpaidCount,
    },
    {
      title: "Last transaction",
      mobile: "hidden",
      dataIndex: "lastTransactionAt",
      sorter: (a, b) =>
        (a.lastTransactionAt ?? "").localeCompare(b.lastTransactionAt ?? ""),
      render: (value: string | null) => formatDate(value),
    },
    {
      title: "Information",
      mobile: "status",
      key: "info",
      width: 130,
      render: (_, customer) => (
        <CustomerInfoTag customer={recordFor(customer)} />
      ),
    },
    {
      title: "Action",
      key: "actions",
      align: "center",
      className: nowrapCell,
      render: (_, customer) => (
        <RequirePermission can="encodeTransactions" fallback={null}>
          <RowActionMenu actions={actionsOf(customer)} />
        </RequirePermission>
      ),
    },
  ];

  const partyList = (
    <>
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
        pageSize={5}
        onRowClick={(customer) =>
          openCustomer({
            customerId: customer.customerId,
            customerName: customer.customerName,
          })
        }
        emptyText="No customers with receivables"
      />
    </>
  );

  return (
    <AppModal
      title="Customer Ledger"
      open={ledgerModal.modal.visible}
      size="xl"
      onClose={close}
    >
      {isCompact ? (
        <>
          <div className={ledgerPane}>{partyList}</div>
          <CustomerLedgerView />
        </>
      ) : (
        <div className={slidePanes}>
          <div className={slideTrack({ detail: detailOpen })}>
            <div className={slidePane} aria-hidden={detailOpen} inert={detailOpen}>
              {partyList}
            </div>
            <div className={slidePane} aria-hidden={!detailOpen} inert={!detailOpen}>
              <CustomerLedgerView />
            </div>
          </div>
        </div>
      )}

      <CustomerDetailsModal
        open={detailsModal.modal.visible}
        customer={detailsTarget}
        onClose={detailsModal.closeModal}
      />
    </AppModal>
  );
};

export default CustomerLedgerModal;
