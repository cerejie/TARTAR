import type { IDataTableColumn } from "../../models/common/table.model";
import { useSupplierLedgerHook } from "../../hook/data/ledger/supplier.ledger.hook";
import type { ILedgerPartySummary } from "../../models/data/ledger/ledger.response";
import { partyKeyOf } from "../../models/data/ledger/ledger.response";
import {
  slidePane,
  slidePanes,
  slideTrack,
} from "../../styles/ledger/ledger.styles";
import { nowrapCell } from "../../styles/table/table.styles";
import { formatDate, formatMoney } from "../../utils/format.utils";
import SearchInput from "../common/filter/SearchInput";
import AppModal from "../common/modal/AppModal";
import AvatarCell from "../common/table/AvatarCell";
import DataTable from "../common/table/DataTable";
import SupplierLedgerView from "./SupplierLedgerView";

const SupplierLedgerModal = () => {
  const {
    ledgerModal,
    detailOpen,
    suppliers,
    loading,
    search,
    setSearch,
    openSupplier,
    close,
  } = useSupplierLedgerHook();

  const columns: IDataTableColumn<ILedgerPartySummary>[] = [
    {
      title: "Supplier",
      key: "name",
      skeleton: "avatar",
      sorter: (a, b) => a.partyName.localeCompare(b.partyName),
      render: (_, supplier) => <AvatarCell name={supplier.partyName} />,
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
      title: "Unpaid payables",
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
  ];

  return (
    <AppModal
      title="Supplier Ledger"
      open={ledgerModal.modal.visible}
      size="xl"
      onClose={close}
    >
      <div className={slidePanes}>
        <div className={slideTrack({ detail: detailOpen })}>
          <div className={slidePane} aria-hidden={detailOpen} inert={detailOpen}>
            <SearchInput
              placeholder="Search supplier"
              value={search}
              onChange={(value) => setSearch(value ?? "")}
            />
            <DataTable<ILedgerPartySummary>
              columns={columns}
              data={suppliers}
              loading={loading}
              rowKey={partyKeyOf}
              pageSize={5}
              onRowClick={openSupplier}
              emptyText="No suppliers with payables"
            />
          </div>
          <div className={slidePane} aria-hidden={!detailOpen} inert={!detailOpen}>
            <SupplierLedgerView />
          </div>
        </div>
      </div>
    </AppModal>
  );
};

export default SupplierLedgerModal;
