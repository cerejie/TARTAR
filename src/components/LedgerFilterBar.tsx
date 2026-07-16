import { Button, DatePicker, Flex, Input, InputNumber, Select } from 'antd'
import { ClearOutlined } from '@ant-design/icons'
import dayjs from 'dayjs'
import { useUiStore } from '../stores/ui.store'
import { useBranches } from '../hooks/useReferenceData'

const { RangePicker } = DatePicker

/**
 * Shared search/filter bar (build spec §15). Writes into `ui.store.filters`,
 * which the ledger pages read and feed to their list queries. Reused by the
 * Transactions, Receivables, and Payables pages so filtering behaves identically.
 */
interface LedgerFilterBarProps {
  /** Hide the branch selector on already branch-scoped views. */
  showBranch?: boolean
}

export function LedgerFilterBar({ showBranch = true }: LedgerFilterBarProps) {
  const filters = useUiStore((s) => s.filters)
  const setFilters = useUiStore((s) => s.setFilters)
  const resetFilters = useUiStore((s) => s.resetFilters)
  const { branches } = useBranches()

  return (
    <Flex className="tartar-filterbar" gap="small" wrap align="center">
      {showBranch ? (
        <Select
          className="tartar-filter-branch"
          placeholder="All branches"
          allowClear
          value={filters.branch}
          onChange={(branch) => setFilters({ branch })}
          options={branches.map((b) => ({ value: b.slug, label: b.name }))}
        />
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
