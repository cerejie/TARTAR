import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useId } from "react";
import { useForm } from "react-hook-form";
import type { IFieldConfig } from "../../models/common/field.model";
import type { IDataTableColumn } from "../../models/common/table.model";
import type { ICustomerLedgerKey } from "../../models/data/ledger/ledger.response";
import { ledgerBalance } from "../../models/data/ledger/ledger.response";
import type { IReceivable } from "../../models/data/ledger/ledger.response";
import {
  paymentFormSchema,
  type IPaymentFormInput,
  type IRecordPaymentInput,
} from "../../models/data/payment/payment.request";
import { entityForm } from "../../styles/form/form.styles";
import {
  paymentTotal,
  paymentTotalValue,
} from "../../styles/ledger/ledger.styles";
import { formatDate, formatMoney, todayIso } from "../../utils/format.utils";
import AppButton from "../common/button/AppButton";
import FormField from "../common/form/FormField";
import AppModal from "../common/modal/AppModal";
import DataTable from "../common/table/DataTable";

const detailFields: IFieldConfig<IPaymentFormInput>[] = [
  { name: "paid_at", label: "Payment date", type: "date" },
  { name: "reference_number", label: "Reference no. (OR/check)", type: "text" },
];

type IProps = {
  open: boolean;
  customer: ICustomerLedgerKey;
  rows: IReceivable[];
  submitting: boolean;
  onSubmit: (values: IRecordPaymentInput) => void;
  onClose: () => void;
};

const PaymentAllocationModal = ({
  open,
  customer,
  rows,
  submitting,
  onSubmit,
  onClose,
}: IProps) => {
  const formId = useId();

  const defaults: IPaymentFormInput = {
    paid_at: todayIso(),
    reference_number: "",
    amounts: Object.fromEntries(
      rows.map((row) => [row.id, ledgerBalance(row)])
    ),
  };

  const { control, handleSubmit, reset, watch } = useForm<IPaymentFormInput>({
    resolver: zodResolver(paymentFormSchema as never) as never,
    defaultValues: defaults,
  });

  useEffect(() => {
    if (open) reset(defaults);
  }, [open, reset]);

  const amounts = watch("amounts") ?? {};
  const total = rows.reduce(
    (sum, row) => sum + (Number(amounts[row.id]) || 0),
    0
  );

  const submit = (values: IPaymentFormInput) => {
    const allocations = rows
      .map((row) => ({
        ledgerId: row.id,
        amount: Number(values.amounts[row.id]) || 0,
      }))
      .filter((allocation) => allocation.amount > 0);

    if (allocations.length === 0) return;

    onSubmit({
      partyId: customer.customerId,
      partyName: customer.customerName,
      paidAt: values.paid_at,
      referenceNumber: values.reference_number?.trim() || null,
      allocations,
    });
  };

  const columns: IDataTableColumn<IReceivable>[] = [
    {
      title: "Due date",
      dataIndex: "due_date",
      width: 120,
      render: (value: string) => formatDate(value),
    },
    {
      title: "Reference",
      dataIndex: "reference_number",
      render: (value: string | null) => value || "—",
    },
    {
      title: "Balance",
      key: "balance",
      align: "right",
      render: (_, row) => formatMoney(ledgerBalance(row)),
    },
    {
      title: "Payment",
      key: "payment",
      align: "right",
      width: 160,
      render: (_, row) => (
        <FormField<IPaymentFormInput>
          control={control}
          config={{
            name: `amounts.${row.id}`,
            label: `Payment for ${row.reference_number ?? row.id}`,
            type: "amount",
            prefix: "₱",
            max: ledgerBalance(row),
            hideLabel: true,
          }}
        />
      ),
    },
  ];

  return (
    <AppModal
      title={`Record payment · ${customer.customerName}`}
      open={open}
      size="lg"
      onClose={onClose}
      footer={
        <>
          <AppButton variant="outline" disabled={submitting} onPress={onClose}>
            Cancel
          </AppButton>
          <AppButton
            type="submit"
            form={formId}
            disabled={total <= 0}
            loading={submitting}
          >
            Record payment
          </AppButton>
        </>
      }
    >
      <form
        id={formId}
        noValidate
        className={entityForm}
        onSubmit={handleSubmit(submit)}
      >
        {detailFields.map((field) => (
          <FormField key={field.name} config={field} control={control} />
        ))}

        <DataTable<IReceivable>
          columns={columns}
          data={rows}
          pageSize={Math.max(rows.length, 1)}
          emptyText="No receivables selected"
        />

        <p className={paymentTotal}>
          Total payment:{" "}
          <strong className={paymentTotalValue}>{formatMoney(total)}</strong>
        </p>
      </form>
    </AppModal>
  );
};

export default PaymentAllocationModal;
