import { zodResolver } from "@hookform/resolvers/zod";
import { Button, Flex, Form, InputNumber, Typography } from "antd";
import type { ColumnsType } from "antd/es/table";
import { useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import type { IFieldConfig } from "../../models/common/field.model";
import type { ICustomerLedgerKey } from "../../models/data/ledger/ledger.response";
import { ledgerBalance } from "../../models/data/ledger/ledger.response";
import type { IReceivable } from "../../models/data/ledger/ledger.response";
import {
  paymentFormSchema,
  type IPaymentFormInput,
  type IRecordPaymentInput,
} from "../../models/data/payment/payment.request";
import { entityForm } from "../../styles/form/form.css";
import { paymentTotal } from "../../styles/view/ledger/ledger.view.css";
import { formatDate, formatMoney, todayIso } from "../../utils/format.utils";
import FormField from "../common/form/FormField";
import AppModal from "../common/modal/AppModal";
import DataTable from "../common/table/DataTable";

const { Paragraph, Text } = Typography;

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

  const columns: ColumnsType<IReceivable> = [
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
        <Controller
          name={`amounts.${row.id}`}
          control={control}
          render={({ field }) => (
            <InputNumber
              {...field}
              prefix="₱"
              min={0}
              max={ledgerBalance(row)}
              aria-label={`Payment for ${row.reference_number ?? row.id}`}
            />
          )}
        />
      ),
    },
  ];

  return (
    <AppModal
      title="Record payment"
      subtitle={customer.customerName}
      open={open}
      size="lg"
      onClose={onClose}
      footer={
        <Flex justify="flex-end" gap={8}>
          <Button onClick={onClose}>Cancel</Button>
          <Button
            type="primary"
            disabled={total <= 0}
            loading={submitting}
            onClick={handleSubmit(submit)}
          >
            Record payment
          </Button>
        </Flex>
      }
    >
      <Form layout="vertical" className={`${entityForm}`}>
        {detailFields.map((field) => (
          <FormField key={field.name} config={field} control={control} />
        ))}
      </Form>

      <DataTable<IReceivable>
        columns={columns}
        data={rows}
        pageSize={Math.max(rows.length, 1)}
        emptyText="No receivables selected"
      />

      <Paragraph className={`${paymentTotal}`}>
        Total payment: <Text strong>{formatMoney(total)}</Text>
      </Paragraph>
    </AppModal>
  );
};

export default PaymentAllocationModal;
