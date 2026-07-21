import { Button, Input, Modal, Tooltip } from 'antd'
import { IdcardOutlined, SearchOutlined, UserOutlined } from '@ant-design/icons'
import type { ColumnsType } from 'antd/es/table'
import { DataTable } from '../DataTable'
import { NameCell } from '../TableDecor'
import { RequirePermission } from '../RequirePermission'
import { CustomerLedgerView } from './CustomerLedgerView'
import {
  CUSTOMER_DETAILS_FORM,
  CUSTOMER_INFO_MODAL,
  CustomerDetailsModal,
  CustomerInfoTag,
  findCustomerRecord,
  ledgerId,
} from './CustomerDetails'
import { useQuery } from '../../hooks/useQuery'
import { useUiStore, selectModal } from '../../stores/ui.store'
import { receivablesService } from '../../services/ledger.service'
import { customersService } from '../../services/party.service'
import type { CustomerLedgerKey, CustomerReceivableSummary } from '../../models'
import { formatDate, formatMoney } from '../../utils/format'

/**
 * Customer Ledger modal — two panes sliding horizontally: the customer list
 * (everyone with receivable rows) and, once a customer is picked, that
 * customer's full ledger. "Back to customers" slides back. Balances are
 * computed by the service (never stored).
 */
export const CUSTOMER_LEDGER_MODAL = 'receivable-customer-ledger'

export function CustomerLedgerModal() {
  const modal = useUiStore(selectModal(CUSTOMER_LEDGER_MODAL))
  const closeModal = useUiStore((s) => s.closeModal)
  const detailOpen = useUiStore((s) => s.ledgerDetailOpen)
  const setLedgerCustomer = useUiStore((s) => s.setLedgerCustomer)
  const search = useUiStore((s) => s.searches[CUSTOMER_LEDGER_MODAL] ?? '')
  const setSearch = useUiStore((s) => s.setSearch)
  const openModal = useUiStore((s) => s.openModal)
  const detailsModal = useUiStore(selectModal(CUSTOMER_DETAILS_FORM))

  // Keyed under "receivables:" so payments/deletes elsewhere invalidate it too.
  const list = useQuery(
    'receivables:customers',
    receivablesService.getCustomersWithReceivables,
    { enabled: modal.open },
  )
  const customers = (list.data ?? []).filter((c) =>
    c.customerName.toLowerCase().includes(search.trim().toLowerCase()),
  )

  // Master records behind the ledger names — the source of the "information on
  // file?" indicator. Not every ledger name has one: a receivable may name a
  // walk-in as free text until someone fills the details in.
  const records = useQuery('customers', () => customersService.list(), { enabled: modal.open })
  const recordFor = (c: CustomerLedgerKey) => findCustomerRecord(records.data ?? [], c)
  const detailsTarget =
    (list.data ?? []).find((c) => ledgerId(c) === detailsModal.recordId) ?? null

  const close = () => {
    closeModal(CUSTOMER_LEDGER_MODAL)
    // The customer modals render inside this one but portal to the page body,
    // so they must be dismissed with it.
    closeModal(CUSTOMER_DETAILS_FORM)
    closeModal(CUSTOMER_INFO_MODAL)
    // Reopening always starts on the customer list.
    setLedgerCustomer(null)
  }

  const open = (customer: CustomerReceivableSummary) => {
    setLedgerCustomer({ customerId: customer.customerId, customerName: customer.customerName })
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
    {
      title: 'Information',
      key: 'info',
      width: 130,
      render: (_, c) => <CustomerInfoTag customer={recordFor(c)} />,
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 90,
      align: 'center',
      render: (_, c) => (
        <RequirePermission can="encodeTransactions" fallback={null}>
          <Tooltip title={recordFor(c) ? 'Edit customer details' : 'Fill in customer details'}>
            <Button
              className="tartar-icon-btn"
              icon={<IdcardOutlined />}
              aria-label={`Customer details for ${c.customerName}`}
              // The row itself opens the ledger, so the action must not bubble.
              onClick={(e) => {
                e.stopPropagation()
                openModal(CUSTOMER_DETAILS_FORM, ledgerId(c))
              }}
            />
          </Tooltip>
        </RequirePermission>
      ),
    },
  ]

  return (
    <Modal title="Customer Ledger" open={modal.open} onCancel={close} footer={null} width={1040}>
      <div className="tartar-slide-panes">
        <div className={`tartar-slide-track${detailOpen ? ' tartar-slide-detail' : ''}`}>
          <div className="tartar-slide-pane" aria-hidden={detailOpen}>
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
          </div>
          <div className="tartar-slide-pane" aria-hidden={!detailOpen}>
            <CustomerLedgerView />
          </div>
        </div>
      </div>

      <CustomerDetailsModal
        open={detailsModal.open}
        customer={detailsTarget}
        onClose={() => closeModal(CUSTOMER_DETAILS_FORM)}
      />
    </Modal>
  )
}
