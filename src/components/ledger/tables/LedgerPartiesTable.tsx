import { DollarOutlined, IdcardOutlined, UserOutlined } from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";
import FilterToolbar from "../../common/filter/FilterToolbar";
import SearchInput from "../../common/filter/SearchInput";
import DataTable from "../../common/table/DataTable";
import RowActionMenu from "../../common/table/RowActionMenu";
import { NameCell } from "../../common/table/TableDecor";
import TablePanel from "../../common/table/TablePanel";
import CustomerDetailsModal from "../CustomerDetailsModal";
import { useLedgerFilters } from "../../../hook/common/filter.hook";
import { useModal } from "../../../hook/common/modal.hook";
import {
  useLedgerScopeHook,
  type LedgerScope,
} from "../../../hook/data/ledger/ledger.scope.hook";
import { customerDetailsModalKey } from "../../../keys/modal.keys";
import type { IRowAction } from "../../../models/common/action.model";
import type { ILedgerPartySummary } from "../../../models/data/ledger/ledger.response";
import { nowrapCell } from "../../../styles/table/table.css";
import { formatDate, formatMoney } from "../../../utils/format.utils";

type IProps = {
  scope: LedgerScope;
};

const LedgerPartiesTable = ({ scope }: IProps) => {
  const { partyLabel, parties, partiesLoading, openPaymentForParty } =
    useLedgerScopeHook(scope);
  const { filters, setFilters } = useLedgerFilters("ledger");
  const detailsModal = useModal<ILedgerPartySummary>(customerDetailsModalKey);

  const actionsOf = (party: ILedgerPartySummary): IRowAction[] => [
    {
      key: "payment",
      label:
        party.unpaidCount === 0
          ? "Record payment — nothing unpaid"
          : "Record payment",
      icon: <DollarOutlined />,
      disabled: party.unpaidCount === 0,
      onSelect: () => openPaymentForParty(party),
    },
    ...(scope === "receivables"
      ? [
          {
            key: "details",
            label: "Customer details",
            icon: <IdcardOutlined />,
            onSelect: () => detailsModal.openModal(party),
          },
        ]
      : []),
  ];

  const columns: ColumnsType<ILedgerPartySummary> = [
    {
      title: partyLabel,
      dataIndex: "partyName",
      render: (name: string) => (
        <NameCell icon={<UserOutlined />}>{name}</NameCell>
      ),
    },
    {
      title: "Outstanding",
      dataIndex: "outstanding",
      align: "right",
      className: `${nowrapCell}`,
      render: (value: number) => formatMoney(value),
    },
    {
      title: "Unpaid records",
      dataIndex: "unpaidCount",
      align: "right",
      className: `${nowrapCell}`,
    },
    {
      title: "Last transaction",
      dataIndex: "lastTransactionAt",
      className: `${nowrapCell}`,
      render: (value: string | null) => (value ? formatDate(value) : "—"),
    },
    {
      title: "Action",
      key: "actions",
      align: "center",
      className: `${nowrapCell}`,
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
          rowKey={(party) => party.partyId ?? `name:${party.partyName}`}
          emptyText={`No ${partyLabel.toLowerCase()}s match the current search`}
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
