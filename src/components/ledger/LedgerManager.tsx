import { CircleDollarSign, Plus, Trash2, User } from "lucide-react";
import StatusTag from "../common/status/StatusTag";
import { useConfirm } from "../../hook/common/confirmation.hook";
import type { IDataTableColumn } from "../../models/common/table.model";
import type { ReactNode } from "react";
import type { DefaultValues, FieldValues } from "react-hook-form";
import type { ZodType } from "zod";
import {
  ledgerStatusColors,
  ledgerStatusLabels,
  type LedgerStatus,
} from "../../enums/ledger.enum";
import {
  useLedgerManagerHook,
  type ILedgerManagerConfig,
} from "../../hook/data/ledger/ledger.manage.hook";
import type { IFieldConfig } from "../../models/common/field.model";
import {
  isLedgerOverdue,
  ledgerBalance,
  type ILedgerRow,
} from "../../models/data/ledger/ledger.response";
import {
  settlementSchema,
  type ISettlementInput,
} from "../../models/data/ledger/ledger.request";
import {
  dataTableRowOverdue,
  tagRow,
} from "../../styles/table/table.styles";
import { formatDate, formatMoney } from "../../utils/format.utils";
import AppButton from "../common/button/AppButton";
import SectionCard from "../common/card/SectionCard";
import FilterToolbar from "../common/filter/FilterToolbar";
import LedgerFilterBar from "../common/filter/LedgerFilterBar";
import EntityFormModal from "../common/form/EntityFormModal";
import RequirePermission from "../common/guard/RequirePermission";
import DataTable from "../common/table/DataTable";
import { NameCell, RowActions } from "../common/table/TableDecor";
import ContentView from "../common/view/ContentView";
import PaymentsPanel from "../payment/PaymentsPanel";

type IProps<Row extends ILedgerRow, Input extends FieldValues> =
  ILedgerManagerConfig<Row, Input> & {
    partyLabel: string;
    nameOf: (row: Row) => string;
    schema: ZodType<Input>;
    fields: IFieldConfig<Input>[];
    defaults: DefaultValues<Input>;
    headerActions?: ReactNode;
  };

const LedgerManager = <Row extends ILedgerRow, Input extends FieldValues>(
  props: IProps<Row, Input>
) => {
  const {
    rows,
    loading,
    branchName,
    formModal,
    settleModal,
    settleRow,
    createMutation,
    settleMutation,
    removeMutation,
  } = useLedgerManagerHook<Row, Input>(props);

  const openConfirm = useConfirm();

  const columns: IDataTableColumn<Row>[] = [
    {
      title: "Due date",
      dataIndex: "due_date",
      width: 190,
      render: (value: string, row) => (
        <span className={tagRow}>
          {formatDate(value)}
          {isLedgerOverdue(row) ? <StatusTag color="negative" label="Overdue" /> : null}
        </span>
      ),
    },
    {
      title: props.partyLabel,
      key: "name",
      render: (_, row) => (
        <NameCell icon={<User />}>{props.nameOf(row)}</NameCell>
      ),
    },
    { title: "Branch", dataIndex: "branch", render: branchName },
    {
      title: "Amount",
      dataIndex: "amount",
      align: "right",
      render: (value: number) => formatMoney(value),
    },
    {
      title: "Paid",
      dataIndex: "paid_amount",
      align: "right",
      render: (value: number) => formatMoney(value),
    },
    {
      title: "Balance",
      key: "balance",
      align: "right",
      render: (_, row) => formatMoney(ledgerBalance(row)),
    },
    {
      title: "Status",
      dataIndex: "status",
      render: (status: LedgerStatus) => (
        <StatusTag color={ledgerStatusColors[status]} label={ledgerStatusLabels[status]} />
      ),
    },
    {
      title: "Reference",
      dataIndex: "reference_number",
      render: (value: string | null) => value || "—",
    },
    {
      title: "Actions",
      key: "actions",
      width: 120,
      align: "center",
      render: (_, row) => (
        <RowActions>
          <AppButton
            variant="outline"
            size="icon-sm"
            aria-label={row.status === "paid" ? "Fully paid" : "Record payment"}
            tooltip={row.status === "paid" ? "Fully paid" : "Record payment"}
            disabled={row.status === "paid"}
            onPress={() => settleModal.openModal(row)}
          >
            <CircleDollarSign />
          </AppButton>
          <RequirePermission can="isManager" fallback={null}>
            <AppButton
              variant="destructive"
              size="icon-sm"
              aria-label="Delete record"
              tooltip="Delete record"
              onPress={() =>
                openConfirm({
                  kind: "delete",
                  title: "Delete record?",
                  onConfirm: () => removeMutation.mutate(row.id),
                })
              }
            >
              <Trash2 />
            </AppButton>
          </RequirePermission>
        </RowActions>
      ),
    },
  ];

  return (
    <ContentView>
      <FilterToolbar
        actions={
          <>
            {props.headerActions}
            <RequirePermission can="encodeTransactions" fallback={null}>
              <AppButton onPress={() => formModal.openModal()}>
                <Plus />
                Add {props.partyLabel.toLowerCase()} record
              </AppButton>
            </RequirePermission>
          </>
        }
      >
        <LedgerFilterBar />
      </FilterToolbar>

      <SectionCard
        title={`All ${props.title}`}
        flush
      >
        <DataTable<Row>
          columns={columns}
          data={rows}
          loading={loading}
          emptyText="No records match the filters"
          rowClassName={(row) => (isLedgerOverdue(row) ? dataTableRowOverdue : "")}
        />
      </SectionCard>

      <PaymentsPanel
        kind={props.scope === "receivables" ? "receivable" : "payable"}
      />

      <EntityFormModal<Input>
        open={formModal.modal.visible}
        title={`Add ${props.title.toLowerCase()} record`}
        fields={props.fields}
        schema={props.schema}
        defaultValues={props.defaults}
        submitting={createMutation.loading}
        onSubmit={(values) => void createMutation.mutate(values)}
        onClose={formModal.closeModal}
      />

      <EntityFormModal<ISettlementInput>
        open={settleModal.modal.visible}
        title="Record payment"
        fields={[
          { name: "amount", label: "Payment amount", type: "amount", prefix: "₱" },
        ]}
        schema={settlementSchema}
        defaultValues={{ amount: undefined as unknown as number }}
        submitting={settleMutation.loading}
        submitText="Record payment"
        onSubmit={(values) => {
          if (settleRow)
            void settleMutation.mutate({ row: settleRow, amount: values.amount });
        }}
        onClose={settleModal.closeModal}
      />
    </ContentView>
  );
};

export default LedgerManager;
