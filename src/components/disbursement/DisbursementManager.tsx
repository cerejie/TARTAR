import {
  DeleteOutlined,
  EditOutlined,
  HistoryOutlined,
  PlusOutlined,
} from "@ant-design/icons";
import { Button, Flex, Space, Tag, Tooltip, Typography } from "antd";
import { useConfirm } from "../../hook/common/confirmation.hook";
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
import FilterToolbar from "../common/filter/FilterToolbar";
import LedgerFilterBar from "../common/filter/LedgerFilterBar";
import EntityFormModal from "../common/form/EntityFormModal";
import RequirePermission from "../common/guard/RequirePermission";
import AppModal from "../common/modal/AppModal";
import DataTable from "../common/table/DataTable";
import { RowActions } from "../common/table/TableDecor";
import ContentView from "../common/view/ContentView";

const { Text } = Typography;

type IProps = {
  kind: DisbursementKind;
  title: string;
};

const DisbursementManager = ({ kind, title }: IProps) => {
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

  const openConfirm = useConfirm();

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
                  onClick={() => editModal.openModal(row)}
                />
              </span>
            </Tooltip>
          </RequirePermission>
          <Tooltip title="Edit history">
            <Button
              className={`${iconButton}`}
              icon={<HistoryOutlined />}
              aria-label="Edit history"
              onClick={() => historyModal.openModal(row)}
            />
          </Tooltip>
          <RequirePermission can="isManager" fallback={null}>
            {isDisbursementLocked(row) ? null : (
              <Tooltip title="Delete record">
                <Button
                  className={`${iconButton}`}
                  danger
                  icon={<DeleteOutlined />}
                  aria-label="Delete record"
                  onClick={() =>
                    openConfirm({
                      kind: "delete",
                      title: `Delete ${title.toLowerCase()}?`,
                      message:
                        "This deletes the record and its voucher, and cannot be undone.",
                      onConfirm: () => removeMutation.mutate(row.id),
                    })
                  }
                />
              </Tooltip>
            )}
          </RequirePermission>
        </RowActions>
      ),
    },
  ];

  return (
    <ContentView>
      <FilterToolbar
        actions={
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
      >
        <LedgerFilterBar />
      </FilterToolbar>

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
        open={formModal.modal.visible}
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
          open={editModal.modal.visible}
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

      <AppModal
        title="Edit history"
        subtitle={
          historyRow
            ? `${transactionTypeLabels[historyRow.type]} · ${formatMoney(
                historyRow.amount
              )} · ${formatDate(historyRow.txn_date)}`
            : undefined
        }
        open={historyModal.modal.visible}
        size="lg"
        onClose={historyModal.closeModal}
      >
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
      </AppModal>
    </ContentView>
  );
};

export default DisbursementManager;
