import { useEffect } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Form, InputNumber, Modal, Typography } from 'antd'
import type { ColumnsType } from 'antd/es/table'
import { DataTable } from '../DataTable'
import { FormField, type FieldConfig } from '../form/FormField'
import type { RecordPaymentInput } from '../../services/payments.service'
import {
  paymentFormSchema,
  type CustomerLedgerKey,
  type PaymentDetailsInput,
  type Receivable,
} from '../../models'
import { formatDate, formatMoney, todayIso } from '../../utils/format'

/**
 * "Pay selected receivables" (client decision 6): the employee ticks the
 * receivables being settled and types how much of the payment goes to each —
 * partial amounts allowed, capped at each remaining balance. One atomic
 * payment record comes out, pending manager verification.
 */
interface PaymentAllocationModalProps {
  open: boolean
  customer: CustomerLedgerKey
  /** The selected, not-yet-paid receivables. */
  rows: Receivable[]
  submitting: boolean
  onSubmit: (input: RecordPaymentInput) => void
  onClose: () => void
}

type FormValues = PaymentDetailsInput & { amounts: Record<string, number> }

const remainingOf = (r: Receivable) => Number(r.amount) - Number(r.paid_amount)

export function PaymentAllocationModal({
  open,
  customer,
  rows,
  submitting,
  onSubmit,
  onClose,
}: PaymentAllocationModalProps) {
  // Every allocation defaults to the row's full remaining balance.
  const defaults: FormValues = {
    paid_at: todayIso(),
    reference_number: '',
    amounts: Object.fromEntries(rows.map((r) => [r.id, remainingOf(r)])),
  }

  // The schema guards the header; per-row amounts are clamped by the
  // InputNumber bounds and re-checked by the RPC (the DB is the real gate).
  const { control, handleSubmit, reset, watch } = useForm<FormValues>({
    resolver: zodResolver(paymentFormSchema as never) as never,
    defaultValues: defaults,
  })

  useEffect(() => {
    if (open) reset(defaults)
    // Defaults derive from `rows`, which only change while the modal is closed.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, reset])

  const amounts = watch('amounts') ?? {}
  const total = rows.reduce((sum, r) => sum + (Number(amounts[r.id]) || 0), 0)

  const submit = (values: FormValues) => {
    const allocations = rows
      .map((r) => ({ ledgerId: r.id, amount: Number(values.amounts[r.id]) || 0 }))
      .filter((a) => a.amount > 0)
    if (allocations.length === 0) return
    onSubmit({
      partyId: customer.customerId,
      partyName: customer.customerName,
      paidAt: values.paid_at,
      referenceNumber: values.reference_number?.trim() || null,
      allocations,
    })
  }

  const detailFields: FieldConfig<FormValues>[] = [
    { name: 'paid_at', label: 'Payment date', type: 'date' },
    { name: 'reference_number', label: 'Reference no. (OR/check)', type: 'text' },
  ]

  const columns: ColumnsType<Receivable> = [
    { title: 'Due date', dataIndex: 'due_date', width: 120, render: (v: string) => formatDate(v) },
    { title: 'Reference', dataIndex: 'reference_number', render: (v: string | null) => v || '—' },
    {
      title: 'Balance',
      key: 'balance',
      align: 'right',
      render: (_, r) => formatMoney(remainingOf(r)),
    },
    {
      title: 'Payment',
      key: 'payment',
      align: 'right',
      width: 160,
      render: (_, r) => (
        <Controller
          name={`amounts.${r.id}`}
          control={control}
          render={({ field }) => (
            <InputNumber
              {...field}
              prefix="₱"
              min={0}
              max={remainingOf(r)}
              aria-label={`Payment for ${r.reference_number ?? r.id}`}
            />
          )}
        />
      ),
    },
  ]

  return (
    <Modal
      title={`Record payment — ${customer.customerName}`}
      open={open}
      onCancel={onClose}
      onOk={handleSubmit(submit)}
      okText="Record payment"
      okButtonProps={{ disabled: total <= 0 }}
      confirmLoading={submitting}
      width={640}
      destroyOnHidden
      maskClosable={false}
    >
      <Form layout="vertical" className="tartar-entity-form">
        {detailFields.map((f) => (
          <FormField key={String(f.name)} config={f} control={control} />
        ))}
      </Form>

      <DataTable<Receivable>
        columns={columns}
        data={rows}
        pageSize={Math.max(rows.length, 1)}
        emptyText="No receivables selected"
      />

      <Typography.Paragraph className="tartar-payment-total">
        Total payment: <Typography.Text strong>{formatMoney(total)}</Typography.Text>
      </Typography.Paragraph>
    </Modal>
  )
}
