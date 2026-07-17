import { Input, Modal } from 'antd'
import { SearchOutlined, UserOutlined } from '@ant-design/icons'
import type { ColumnsType } from 'antd/es/table'
import { DataTable } from '../DataTable'
import { NameCell } from '../TableDecor'
import { useQuery } from '../../hooks/useQuery'
import { useUiStore, selectModal } from '../../stores/ui.store'
import { receivablesService } from '../../services/ledger.service'
import type { CustomerReceivableSummary } from '../../models'
import { formatDate, formatMoney } from '../../utils/format'

/**
 * Customer Ledger picker — lists every customer that has receivable rows so the
 * user can open that customer's full ledger on the Receivables page. Balances
 * are computed by the service (never stored).
 */
export const CUSTOMER_LEDGER_MODAL = 'receivable-customer-ledger'

export function CustomerLedgerModal() {
  const modal = useUiStore(selectModal(CUSTOMER_LEDGER_MODAL))
  const closeModal = useUiStore((s) => s.closeModal)
  const setLedgerCustomer = useUiStore((s) => s.setLedgerCustomer)
  const search = useUiStore((s) => s.searches[CUSTOMER_LEDGER_MODAL] ?? '')
  const setSearch = useUiStore((s) => s.setSearch)

  // Keyed under "receivables:" so payments/deletes elsewhere invalidate it too.
  const list = useQuery(
    'receivables:customers',
    receivablesService.getCustomersWithReceivables,
    { enabled: modal.open },
  )
  const customers = (list.data ?? []).filter((c) =>
    c.customerName.toLowerCase().includes(search.trim().toLowerCase()),
  )

  const open = (customer: CustomerReceivableSummary) => {
    setLedgerCustomer({ customerId: customer.customerId, customerName: customer.customerName })
    closeModal(CUSTOMER_LEDGER_MODAL)
  }

  const columns: ColumnsType<CustomerReceivableSummary> = [
    {
      title: 'Customer',
      key: 'name',
      sorter: (a, b) => a.customerName.localeCompare(b.customerName),
      render: (_, c) => <NameCell icon={<UserOutlined />}>{c.customerName}</NameCell>,
    },
    {
      title: 'Outstanding balance',
      dataIndex: 'outstanding',
      align: 'right',
      sorter: (a, b) => a.outstanding - b.outstanding,
      render: (v: number) => formatMoney(v),
    },
    {
      title: 'Unpaid transactions',
      dataIndex: 'unpaidCount',
      align: 'right',
      sorter: (a, b) => a.unpaidCount - b.unpaidCount,
    },
    {
      title: 'Last transaction',
      dataIndex: 'lastTransactionAt',
      sorter: (a, b) => (a.lastTransactionAt ?? '').localeCompare(b.lastTransactionAt ?? ''),
      render: (v: string | null) => formatDate(v),
    },
  ]

  return (
    <Modal
      title="Customer Ledger"
      open={modal.open}
      onCancel={() => closeModal(CUSTOMER_LEDGER_MODAL)}
      footer={null}
      width={760}
    >
      <Input
        className="tartar-filterbar"
        prefix={<SearchOutlined />}
        placeholder="Search customer"
        allowClear
        value={search}
        onChange={(e) => setSearch(CUSTOMER_LEDGER_MODAL, e.target.value)}
      />
      <DataTable<CustomerReceivableSummary>
        columns={columns}
        data={customers}
        loading={list.loading}
        rowKey={(c) => c.customerId ?? c.customerName}
        pageSize={8}
        onRowClick={open}
        emptyText="No customers with receivables"
      />
    </Modal>
  )
}
