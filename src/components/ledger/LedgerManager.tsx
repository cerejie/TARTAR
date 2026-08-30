import {
  DeleteOutlined,
  DollarOutlined,
  PlusOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { Button, Popconfirm, Space, Tag, Tooltip } from "antd";
import type { ColumnsType } from "antd/es/table";
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
import { iconButton, rowOverdue } from "../../styles/table/table.css";
import { formatDate, formatMoney } from "../../utils/format.utils";
import SectionCard from "../common/card/SectionCard";
import LedgerFilterBar from "../common/filter/LedgerFilterBar";
import EntityFormModal from "../common/form/EntityFormModal";
import RequirePermission from "../common/guard/RequirePermission";
import DataTable from "../common/table/DataTable";
import { NameCell, RowActions } from "../common/table/TableDecor";
import ContentView from "../common/view/ContentView";
import PaymentsPanel from "../payment/PaymentsPanel";

type IProps<Row extends ILedgerRow, Input extends FieldValues> =
  ILedgerManagerConfig<Row, Input> & {
    subtitle: string;
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

  const columns: ColumnsType<Row> = [
    {
      title: "Due date",
      dataIndex: "due_date",
      width: 190,
      render: (value: string, row) => (
        <Space>
          {formatDate(value)}
          {isLedgerOverdue(row) ? <Tag color="red">Overdue</Tag> : null}
        </Space>
      ),
    },
    {
      title: props.partyLabel,
      key: "name",
      render: (_, row) => (
        <NameCell icon={<UserOutlined />}>{props.nameOf(row)}</NameCell>
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
        <Tag color={ledgerStatusColors[status]}>
          {ledgerStatusLabels[status]}
        </Tag>
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
          <Tooltip
            title={row.status === "paid" ? "Fully paid" : "Record payment"}
          >
            <span>
              <Button
                className={`${iconButton}`}
                icon={<DollarOutlined />}
                aria-label="Record payment"
                disabled={row.status === "paid"}
                onClick={() => settleModal.openModal(row.id)}
              />
            </span>
          </Tooltip>
          <RequirePermission can="isManager" fallback={null}>
            <Popconfirm
              title="Delete this record?"
              onConfirm={() => void removeMutation.mutate(row.id)}
            >
              <Tooltip title="Delete record">
                <Button
                  className={`${iconButton}`}
                  danger
                  icon={<DeleteOutlined />}
                  aria-label="Delete record"
                />
              </Tooltip>
            </Popconfirm>
          </RequirePermission>
        </RowActions>
      ),
    },
  ];

  return (
    <ContentView
      title={props.title}
      subtitle={props.subtitle}
      actions={
        <Space>
          {props.headerActions}
          <RequirePermission can="encodeTransactions" fallback={null}>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => formModal.openModal()}
            >
              Add {props.partyLabel.toLowerCase()} record
            </Button>
          </RequirePermission>
        </Space>
      }
    >
      <LedgerFilterBar />

      <SectionCard
        title={`All ${props.title}`}
        subtitle="Matching the current filters"
        flush
      >
        <DataTable<Row>
          columns={columns}
          data={rows}
          loading={loading}
          emptyText="No records match the filters"
          rowClassName={(row) => (isLedgerOverdue(row) ? `${rowOverdue}` : "")}
        />
      </SectionCard>

      <PaymentsPanel
        kind={props.scope === "receivables" ? "receivable" : "payable"}
      />

      <EntityFormModal<Input>
        open={formModal.modal.open}
        title={`Add ${props.title.toLowerCase()} record`}
        fields={props.fields}
        schema={props.schema}
        defaultValues={props.defaults}
        submitting={createMutation.loading}
        onSubmit={(values) => void createMutation.mutate(values)}
        onClose={formModal.closeModal}
      />

      <EntityFormModal<ISettlementInput>
        open={settleModal.modal.open}
        title="Record payment"
        fields={[
          { name: "amount", label: "Payment amount", type: "number", prefix: "₱" },
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
