import { Button, DatePicker, Flex, Input, InputNumber, Select, Tooltip } from 'antd'
import { ClearOutlined } from '@ant-design/icons'
import dayjs from 'dayjs'
import { useUiStore } from '../stores/ui.store'
import { useBranches } from '../hooks/useReferenceData'
import { useBranchScope } from '../hooks/useBranchScope'
import { labels, ledgerStatusValues, toOptions } from '../models'

const { RangePicker } = DatePicker

/**
 * Shared search/filter bar (build spec §15). Writes into `ui.store.filters`,
 * which the ledger pages read and feed to their list queries. Reused by the
 * Transactions, Receivables, and Payables pages so filtering behaves identically.
 */
interface LedgerFilterBarProps {
  /** Hide the branch selector on already branch-scoped views. */
  showBranch?: boolean
  /** Show the receivable/payable status filter (ledger views only). */
  showStatus?: boolean
  /**
   * Which filter slice to read/write. The customer-ledger pane lives in a modal
   * over a filtered page, so it gets its own slice to avoid cross-talk.
   */
  scope?: 'page' | 'customer-ledger'
}

export function LedgerFilterBar({
  showBranch = true,
  showStatus = false,
  scope = 'page',
}: LedgerFilterBarProps) {
  const scoped = scope === 'customer-ledger'
  const filters = useUiStore((s) => (scoped ? s.customerLedgerFilters : s.filters))
  const setFilters = useUiStore((s) => (scoped ? s.setCustomerLedgerFilters : s.setFilters))
  const resetFilters = useUiStore((s) => (scoped ? s.resetCustomerLedgerFilters : s.resetFilters))
  const { branches } = useBranches()
  const { branch: scopeBranch } = useBranchScope()

  return (
    <Flex className="tartar-filterbar" gap="small" wrap align="center">
      {showBranch ? (
        // While the sidebar branch view is active it owns the branch scope, so
        // the local select just mirrors it and locks (no conflicting filters).
        <Tooltip title={scopeBranch ? 'Branch is set by the sidebar branch view' : undefined}>
          <Select
            className="tartar-filter-branch"
            placeholder="All branches"
            allowClear
            disabled={!!scopeBranch}
            value={scopeBranch ?? filters.branch}
            onChange={(branch) => setFilters({ branch })}
            options={branches.map((b) => ({ value: b.slug, label: b.name }))}
          />
        </Tooltip>
      ) : null}

      <RangePicker
        value={
          filters.dateFrom && filters.dateTo
            ? [dayjs(filters.dateFrom), dayjs(filters.dateTo)]
            : null
        }
        onChange={(range) =>
          setFilters({
            dateFrom: range?.[0]?.format('YYYY-MM-DD'),
            dateTo: range?.[1]?.format('YYYY-MM-DD'),
          })
        }
      />

      {showStatus ? (
        <Select
          className="tartar-filter-status"
          placeholder="Any status"
          allowClear
          value={filters.status}
          onChange={(status) => setFilters({ status })}
          options={[
            ...toOptions(ledgerStatusValues, labels.ledgerStatus),
            { value: 'overdue', label: 'Overdue' },
          ]}
        />
      ) : null}

      <Input
        className="tartar-filter-ref"
        placeholder="Reference no."
        allowClear
        value={filters.referenceNumber}
        onChange={(e) => setFilters({ referenceNumber: e.target.value || undefined })}
      />

      <InputNumber
        className="tartar-filter-amount"
        placeholder="Min ₱"
        min={0}
        value={filters.amountMin}
        onChange={(amountMin) => setFilters({ amountMin: amountMin ?? undefined })}
      />
      <InputNumber
        className="tartar-filter-amount"
        placeholder="Max ₱"
        min={0}
        value={filters.amountMax}
        onChange={(amountMax) => setFilters({ amountMax: amountMax ?? undefined })}
      />

      <Button icon={<ClearOutlined />} onClick={resetFilters}>
        Clear
      </Button>
    </Flex>
  )
}
