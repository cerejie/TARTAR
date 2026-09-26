import { Check, Plus, Printer, X } from "lucide-react";
import AppButton from "../../components/common/button/AppButton";
import SectionCard from "../../components/common/card/SectionCard";
import EntityFormModal from "../../components/common/form/EntityFormModal";
import RequirePermission from "../../components/common/guard/RequirePermission";
import StatusTag from "../../components/common/status/StatusTag";
import DataTable from "../../components/common/table/DataTable";
import { RowActions } from "../../components/common/table/TableDecor";
import ContentView from "../../components/common/view/ContentView";
import {
  voucherStatusColors,
  voucherStatusLabels,
  voucherTypeLabels,
  type VoucherStatus,
} from "../../enums/voucher.enum";
import { useVoucherListHook } from "../../hook/data/voucher/voucher.list.hook";
import type { IDataTableColumn } from "../../models/common/table.model";
import {
  voucherSchema,
  type IVoucherInput,
} from "../../models/data/voucher/voucher.request";
import {
  voucherPurpose,
  type IVoucher,
} from "../../models/data/voucher/voucher.response";
import {
  cellHint,
  stackedCell,
  tagRow,
} from "../../styles/table/table.styles";
import {
  formatDate,
  formatDateTime,
  formatMoney,
} from "../../utils/format.utils";

const VouchersView = () => {
  const {
    vouchers,
    loading,
    branchName,
    formModal,
    fields,
    defaults,
    createMutation,
    decideMutation,
    print,
  } = useVoucherListHook();

  const columns: IDataTableColumn<IVoucher>[] = [
    {
      title: "Voucher no.",
      dataIndex: "voucher_no",
      width: 190,
      render: (value: string | null) => value || "—",
    },
    {
      title: "Type",
      dataIndex: "type",
      render: (type: IVoucher["type"]) => voucherTypeLabels[type],
    },
    {
      title: "Category",
      dataIndex: "category",
      width: 100,
      render: (value: string) => <StatusTag label={value} />,
    },
    {
      title: "Purpose",
      key: "purpose",
      render: (_, voucher) => voucherPurpose(voucher),
    },
    { title: "Branch", dataIndex: "branch", render: branchName },
    { title: "Payee", dataIndex: "payee" },
    {
      title: "Amount",
      dataIndex: "amount",
      align: "right",
      render: (value: number) => formatMoney(value),
    },
    {
      title: "Check",
      key: "check",
      width: 180,
      render: (_, voucher) =>
        voucher.type === "check" && voucher.check_number ? (
          <span className={stackedCell}>
            <span>{voucher.check_number}</span>
            <span className={cellHint}>
              {[
                voucher.check_bank,
                voucher.check_due_date
                  ? `due ${formatDate(voucher.check_due_date)}`
                  : null,
              ]
                .filter(Boolean)
                .join(" · ")}
            </span>
          </span>
        ) : (
          "—"
        ),
    },
    {
      title: "Created",
      dataIndex: "created_at",
      width: 180,
      render: (value: string) => formatDateTime(value),
    },
    {
      title: "Status",
      dataIndex: "status",
      render: (status: VoucherStatus, voucher) => (
        <span className={tagRow}>
          <StatusTag color={voucherStatusColors[status]} label={voucherStatusLabels[status]} />
          {voucher.printed ? <StatusTag label="Printed" /> : null}
        </span>
      ),
    },
    {
      title: "",
      key: "actions",
      width: 240,
      render: (_, voucher) => (
        <RowActions>
          <RequirePermission can="approveVouchers" fallback={null}>
            {voucher.status === "pending" ? (
              <>
                <AppButton
                  variant="ghost"
                  size="sm"
                  onPress={() =>
                    void decideMutation.mutate({
                      id: voucher.id,
                      approve: true,
                    })
                  }
                >
                  <Check />
                  Approve
                </AppButton>
                <AppButton
                  variant="destructive"
                  size="sm"
                  onPress={() =>
                    void decideMutation.mutate({
                      id: voucher.id,
                      approve: false,
                    })
                  }
                >
                  <X />
                  Reject
                </AppButton>
              </>
            ) : null}
          </RequirePermission>
          <AppButton
            variant="outline"
            size="sm"
            disabled={voucher.status !== "approved"}
            onPress={() => print(voucher)}
          >
            <Printer />
            {voucher.status === "approved" ? "Print" : "Approve to print"}
          </AppButton>
        </RowActions>
      ),
    },
  ];

  return (
    <ContentView
      actions={
        <RequirePermission can="createManualVouchers" fallback={null}>
          <AppButton onPress={() => formModal.openModal()}>
            <Plus />
            Manual voucher
          </AppButton>
        </RequirePermission>
      }
    >
      <SectionCard
        title="All Vouchers"
        flush
      >
        <DataTable<IVoucher>
          columns={columns}
          data={vouchers}
          loading={loading}
          emptyText="No vouchers yet"
        />
      </SectionCard>

      <EntityFormModal<IVoucherInput>
        open={formModal.modal.visible}
        title="Manual voucher"
        fields={fields}
        schema={voucherSchema}
        defaultValues={defaults}
        submitting={createMutation.loading}
        submitText="Submit"
        onSubmit={(values) => void createMutation.mutate(values)}
        onClose={formModal.closeModal}
      />
    </ContentView>
  );
};

export default VouchersView;
