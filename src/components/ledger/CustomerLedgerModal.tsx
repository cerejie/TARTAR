import { IdcardOutlined, SearchOutlined, UserOutlined } from "@ant-design/icons";
import { Button, Flex, Input, Tooltip } from "antd";
import type { ColumnsType } from "antd/es/table";
import { useCustomerLedgerHook } from "../../hook/data/ledger/customer.ledger.hook";
import type { ICustomerReceivableSummary } from "../../models/data/ledger/ledger.response";
import { ledgerKeyOf } from "../../models/data/ledger/ledger.response";
import { filterBar } from "../../styles/filter/filter.css";
import { iconButton } from "../../styles/table/table.css";
import {
  slideDetail,
  slidePane,
  slidePanes,
  slideTrack,
} from "../../styles/view/ledger/ledger.view.css";
import { formatDate, formatMoney } from "../../utils/format.utils";
import RequirePermission from "../common/guard/RequirePermission";
import AppModal from "../common/modal/AppModal";
import DataTable from "../common/table/DataTable";
import { NameCell } from "../common/table/TableDecor";
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

  const columns: ColumnsType<ICustomerReceivableSummary> = [
    {
      title: "Customer",
      key: "name",
      sorter: (a, b) => a.customerName.localeCompare(b.customerName),
      render: (_, customer) => (
        <NameCell icon={<UserOutlined />}>{customer.customerName}</NameCell>
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
          <Tooltip
            title={
              recordFor(customer)
                ? "Edit customer details"
                : "Fill in customer details"
            }
          >
            <Button
              className={`${iconButton}`}
              icon={<IdcardOutlined />}
              aria-label={`Customer details for ${customer.customerName}`}
              onClick={(event) => {
                event.stopPropagation();
                detailsModal.openModal(customer);
              }}
            />
          </Tooltip>
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
      <Flex className={`${slidePanes}`} vertical>
        <Flex
          className={`${slideTrack} ${detailOpen ? slideDetail : ""}`}
          align="flex-start"
        >
          <Flex vertical className={`${slidePane}`} aria-hidden={detailOpen}>
            <Input
              className={`${filterBar}`}
              prefix={<SearchOutlined />}
              placeholder="Search customer"
              allowClear
              value={search}
              onChange={(event) => setSearch(event.target.value)}
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
          </Flex>
          <Flex vertical className={`${slidePane}`} aria-hidden={!detailOpen}>
            <CustomerLedgerView />
          </Flex>
        </Flex>
      </Flex>

      <CustomerDetailsModal
        open={detailsModal.modal.visible}
        customer={detailsTarget}
        onClose={detailsModal.closeModal}
      />
    </AppModal>
  );
};

export default CustomerLedgerModal;
