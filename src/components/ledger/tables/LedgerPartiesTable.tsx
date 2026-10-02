import { BookOpen, CircleDollarSign, IdCard } from "lucide-react";
import { searchEmptyHint } from "../../../models/common/table.model";
import type { IDataTableColumn } from "../../../models/common/table.model";
import FilterToolbar from "../../common/filter/FilterToolbar";
import SearchInput from "../../common/filter/SearchInput";
import AvatarCell from "../../common/table/AvatarCell";
import DataTable from "../../common/table/DataTable";
import RowActionMenu from "../../common/table/RowActionMenu";
import TablePanel from "../../common/table/TablePanel";
import CustomerDetailsModal from "../CustomerDetailsModal";
import { useLedgerFilters } from "../../../hook/common/filter.hook";
import { useModal } from "../../../hook/common/modal.hook";
import {
  useLedgerScopeHook,
  type LedgerScope,
} from "../../../hook/data/ledger/ledger.scope.hook";
import { useSupplierLedgerHook } from "../../../hook/data/ledger/supplier.ledger.hook";
import { customerDetailsModalKey } from "../../../keys/modal.keys";
import type { IRowAction } from "../../../models/common/action.model";
import type { ILedgerPartySummary } from "../../../models/data/ledger/ledger.response";
import { nowrapCell } from "../../../styles/table/table.styles";
import { ledgerFilterScopeOf } from "../../../utils/filter.utils";
import { formatDate, formatMoney } from "../../../utils/format.utils";

type IProps = {
  scope: LedgerScope;
};

const LedgerPartiesTable = ({ scope }: IProps) => {
  const {
    permissions,
    partyLabel,
    parties,
    partiesLoading,
    partiesRefreshing,
    partiesError,
    retryParties,
    openPaymentForParty,
  } = useLedgerScopeHook(scope);
  const { filters, setFilters } = useLedgerFilters(ledgerFilterScopeOf(scope));
  const detailsModal = useModal<ILedgerPartySummary>(customerDetailsModalKey);
  const { openSupplierLedger } = useSupplierLedgerHook();

  const supplierActionsOf = (party: ILedgerPartySummary): IRowAction[] => [
    {
      key: "ledger",
      label: "View ledger",
      icon: <BookOpen />,
      onSelect: () => openSupplierLedger(party),
    },
  ];

  const customerActionsOf = (party: ILedgerPartySummary): IRowAction[] =>
    permissions.encodeTransactions
      ? [
          {
            key: "payment",
            label: "Record payment",
            hint: party.unpaidCount === 0 ? "Nothing unpaid" : undefined,
            icon: <CircleDollarSign />,
            disabled: party.unpaidCount === 0,
            onSelect: () => openPaymentForParty(party),
          },
          {
            key: "details",
            label: "Customer details",
            icon: <IdCard />,
            onSelect: () => detailsModal.openModal(party),
          },
        ]
      : [];

  const actionsOf =
    scope === "payables" ? supplierActionsOf : customerActionsOf;

  const columns: IDataTableColumn<ILedgerPartySummary>[] = [
    {
      title: partyLabel,
      dataIndex: "partyName",
      skeleton: "avatar",
      render: (name: string) => <AvatarCell name={name} />,
    },
    {
      title: "Outstanding",
      mobile: "amount",
      dataIndex: "outstanding",
      align: "right",
      className: nowrapCell,
      render: (value: number) => formatMoney(value),
    },
    {
      title: "Unpaid records",
      dataIndex: "unpaidCount",
      align: "right",
      className: nowrapCell,
    },
    {
      title: "Last transaction",
      dataIndex: "lastTransactionAt",
      className: nowrapCell,
      render: (value: string | null) => (value ? formatDate(value) : "—"),
    },
    {
      title: "Action",
      key: "actions",
      align: "center",
      className: nowrapCell,
      render: (_, party) => <RowActionMenu actions={actionsOf(party)} />,
    },
  ];

  const detailsParty = detailsModal.modal.data;

  return (
    <>
      <TablePanel
        toolbar={
          <FilterToolbar>
            <SearchInput
              placeholder={`Search ${partyLabel.toLowerCase()}`}
              value={filters.search}
              onChange={(search) => setFilters({ search })}
            />
          </FilterToolbar>
        }
      >
        <DataTable<ILedgerPartySummary>
          columns={columns}
          data={parties}
          loading={partiesLoading}
          refreshing={partiesRefreshing}
          error={partiesError}
          onRetry={retryParties}
          rowKey={(party) => party.partyId ?? `name:${party.partyName}`}
          onRowClick={scope === "payables" ? openSupplierLedger : undefined}
          emptyText={`No ${partyLabel.toLowerCase()}s match the current search`}
          emptyHint={searchEmptyHint}
        />
      </TablePanel>

      {scope === "receivables" ? (
        <CustomerDetailsModal
          open={detailsModal.modal.visible}
          customer={
            detailsParty
              ? {
                  customerId: detailsParty.partyId,
                  customerName: detailsParty.partyName,
                }
              : null
          }
          onClose={detailsModal.closeModal}
        />
      ) : null}
    </>
  );
};

export default LedgerPartiesTable;
