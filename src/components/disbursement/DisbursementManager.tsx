import {
  DeleteOutlined,
  EditOutlined,
  HistoryOutlined,
  PlusOutlined,
} from "@ant-design/icons";
import { Button, Flex, Modal, Popconfirm, Space, Tag, Tooltip, Typography } from "antd";
import type { ColumnsType } from "antd/es/table";
import type { DisbursementKind } from "../../enums/transaction.enum";
import { transactionTypeLabels } from "../../enums/transaction.enum";
import {
  voucherStatusColors,
  voucherStatusLabels,
} from "../../enums/voucher.enum";
import {
  isDisbursementLocked,
  useDisbursementManagerHook,
} from "../../hook/data/disbursement/disbursement.manage.hook";
import type { IDisbursementInput } from "../../models/data/transaction/transaction.request";
import type { IDisbursement } from "../../models/data/transaction/transaction.response";
import { iconButton } from "../../styles/table/table.css";
import {
  auditChanges,
  auditEntry,
} from "../../styles/view/ledger/ledger.view.css";
import {
  formatDate,
  formatDateTime,
  formatMoney,
} from "../../utils/format.utils";
import SectionCard from "../common/card/SectionCard";
import LedgerFilterBar from "../common/filter/LedgerFilterBar";
import EntityFormModal from "../common/form/EntityFormModal";
import RequirePermission from "../common/guard/RequirePermission";
import DataTable from "../common/table/DataTable";
import { RowActions } from "../common/table/TableDecor";
import PageHeader from "../common/view/PageHeader";

const { Text, Paragraph } = Typography;

type IProps = {
  kind: DisbursementKind;
  title: string;
  subtitle: string;
};

const DisbursementManager = ({ kind, title, subtitle }: IProps) => {
  const {
    permissions,
    rows,
    loading,
    branchName,
    expenseCategoryLabelOf,
    userNameOf,
    formModal,
    editModal,
    historyModal,
    editRow,
    historyRow,
    audit,
    auditLoading,
    schema,
    fields,
    createDefaults,
    editDefaults,
    createMutation,
    updateMutation,
    removeMutation,
  } = useDisbursementManagerHook(kind, title);

  const singular = title.toLowerCase().replace(/s$/, "");

  const columns: ColumnsType<IDisbursement> = [
    {
      title: "Date",
      dataIndex: "txn_date",
      width: 120,
      render: (value: string) => formatDate(value),
    },
    { title: "Branch", dataIndex: "branch", render: branchName },
    {
      title: "Payee",
      key: "payee",
      render: (_, row) => row.voucher?.payee ?? row.supplier?.name ?? "—",
    },
    ...(kind === "expense"
      ? [
          {
            title: "Expense type",
            dataIndex: "expense_type",
            render: (value: IDisbursement["expense_type"]) =>
              expenseCategoryLabelOf(value),
          },
        ]
      : []),
    {
      title: "Amount",
      dataIndex: "amount",
      align: "right",
      render: (value: number) => formatMoney(value),
    },
    ...(kind === "purchase"
      ? [
          {
            title: "Due date",
            dataIndex: "due_date",
            width: 130,
            render: (value: string | null) =>
              value ? formatDate(value) : "Paid",
          },
          {
            title: "Reference",
            dataIndex: "reference_number",
            render: (value: string | null) => value || "—",
          },
        ]
      : []),
    {
      title: "Voucher no.",
      key: "voucher_no",
      width: 190,
      render: (_, row) => row.voucher?.voucher_no ?? "—",
    },
    {
      title: "Voucher status",
      key: "voucher_status",
      render: (_, row) =>
        row.voucher ? (
          <Space>
            <Tag color={voucherStatusColors[row.voucher.status]}>
              {voucherStatusLabels[row.voucher.status]}
            </Tag>
            {row.voucher.printed ? <Tag>Printed</Tag> : null}
          </Space>
        ) : (
          <Tag>Syncing</Tag>
        ),
    },
    ...(permissions.isManager
      ? [
          {
            title: "User",
            key: "user",
            render: (_: unknown, row: IDisbursement) =>
              userNameOf(row.created_by),
          },
        ]
      : []),
    {
      title: "Actions",
      key: "actions",
      width: 150,
      align: "center",
      render: (_, row) => (
        <RowActions>
          <RequirePermission can="encodeTransactions" fallback={null}>
            <Tooltip
              title={
                isDisbursementLocked(row)
                  ? "Locked — voucher approved/printed"
                  : "Edit"
              }
            >
              <span>
                <Button
                  className={`${iconButton}`}
                  icon={<EditOutlined />}
                  aria-label="Edit record"
                  disabled={isDisbursementLocked(row)}
                  onClick={() => editModal.openModal(row.id)}
                />
              </span>
            </Tooltip>
          </RequirePermission>
          <Tooltip title="Edit history">
            <Button
              className={`${iconButton}`}
              icon={<HistoryOutlined />}
              aria-label="Edit history"
              onClick={() => historyModal.openModal(row.id)}
            />
          </Tooltip>
          <RequirePermission can="isManager" fallback={null}>
            {isDisbursementLocked(row) ? null : (
              <Popconfirm
                title="Delete this record and its voucher?"
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
            )}
          </RequirePermission>
        </RowActions>
      ),
    },
  ];

  return (
    <>
      <PageHeader
        title={title}
        subtitle={subtitle}
        extra={
          <RequirePermission can="encodeTransactions" fallback={null}>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => formModal.openModal()}
            >
              Record {singular}
            </Button>
          </RequirePermission>
        }
      />

      <LedgerFilterBar />

      <SectionCard
        title={`All ${title}`}
        subtitle="Each record carries its auto-generated voucher"
        flush
      >
        <DataTable<IDisbursement>
          columns={columns}
          data={rows}
          loading={loading}
          emptyText="No records match the filters"
        />
      </SectionCard>

      <EntityFormModal<IDisbursementInput>
        open={formModal.modal.open}
        title={`Record ${singular}`}
        fields={fields}
        schema={schema}
        defaultValues={createDefaults}
        submitting={createMutation.loading}
        submitText="Record"
        onSubmit={(values) => void createMutation.mutate(values)}
        onClose={formModal.closeModal}
      />

      {editDefaults ? (
        <EntityFormModal<IDisbursementInput>
          open={editModal.modal.open}
          title={`Edit ${singular}`}
          fields={fields}
          schema={schema}
          defaultValues={editDefaults}
          submitting={updateMutation.loading}
          onSubmit={(values) => {
            if (editRow)
              void updateMutation.mutate({ id: editRow.id, values });
          }}
          onClose={editModal.closeModal}
        />
      ) : null}

      <Modal
        title="Edit history"
        open={historyModal.modal.open}
        onCancel={historyModal.closeModal}
        footer={null}
        width={640}
      >
        {historyRow ? (
          <Paragraph type="secondary">
            {transactionTypeLabels[historyRow.type]} ·{" "}
            {formatMoney(historyRow.amount)} · {formatDate(historyRow.txn_date)}
          </Paragraph>
        ) : null}

        {audit.length === 0 && !auditLoading ? (
          <Text type="secondary">No edits recorded.</Text>
        ) : null}

        {audit.map((entry) => (
          <Flex vertical key={entry.id} className={`${auditEntry}`}>
            <Text>
              <Text strong>{formatDateTime(entry.edited_at)}</Text>{" "}
              <Text type="secondary">by {userNameOf(entry.edited_by)}</Text>
            </Text>
            <ul className={`${auditChanges}`}>
              {Object.entries(entry.changes).map(([field, change]) => (
                <li key={field}>
                  <Text code>{field.replaceAll("_", " ")}</Text>{" "}
                  {String(change.old ?? "—")} → {String(change.new ?? "—")}
                </li>
              ))}
            </ul>
          </Flex>
        ))}
      </Modal>
    </>
  );
};

export default DisbursementManager;
