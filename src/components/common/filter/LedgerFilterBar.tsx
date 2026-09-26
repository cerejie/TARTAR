import { Eraser } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  ledgerStatusLabels,
  ledgerStatusValues,
  paymentStatusLabels,
  paymentStatusValues,
  type PaymentKind,
} from "../../../enums/ledger.enum";
import {
  transactionTypeLabels,
  transactionTypeValues,
} from "../../../enums/transaction.enum";
import { useLedgerFilters } from "../../../hook/common/filter.hook";
import type {
  ILedgerFilters,
  ILedgerFilterScope,
} from "../../../models/common/filter.model";
import { filterBar } from "../../../styles/filter/filter.styles";
import DateRangeFilter from "./DateRangeFilter";
import FilterSelect from "./FilterSelect";
import SearchInput from "./SearchInput";

type ILedgerStatusFilter = NonNullable<ILedgerFilters["status"]>;

const statusFilterLabels: Record<ILedgerStatusFilter, string> = {
  unpaid: "Unpaid",
  ...ledgerStatusLabels,
  overdue: "Overdue",
};

type IProps = {
  showSearch?: boolean;
  showStatus?: boolean;
  showOverdue?: boolean;
  showType?: boolean;
  paymentKind?: PaymentKind;
  scope?: ILedgerFilterScope;
};

const LedgerFilterBar = ({
  showSearch = false,
  showStatus = false,
  showOverdue = false,
  showType = false,
  paymentKind,
  scope = "page",
}: IProps) => {
  const { filters, setFilters, resetFilters } = useLedgerFilters(scope);

  const statusFilterValues: readonly ILedgerStatusFilter[] = showOverdue
    ? ["unpaid", ...ledgerStatusValues, "overdue"]
    : ["unpaid", ...ledgerStatusValues];

  return (
    <div className={filterBar}>
      {showSearch ? (
        <SearchInput
          placeholder="Search name"
          value={filters.search}
          onChange={(search) => setFilters({ search })}
        />
      ) : null}

      <DateRangeFilter
        from={filters.dateFrom}
        to={filters.dateTo}
        onChange={(dateFrom, dateTo) => setFilters({ dateFrom, dateTo })}
      />

      {showStatus ? (
        <FilterSelect
          placeholder="Any status"
          value={filters.status}
          values={statusFilterValues}
          labels={statusFilterLabels}
          onChange={(status) => setFilters({ status })}
        />
      ) : null}

      {paymentKind ? (
        <FilterSelect
          placeholder="Any status"
          value={filters.paymentStatus}
          values={paymentStatusValues}
          labels={paymentStatusLabels(paymentKind)}
          onChange={(paymentStatus) => setFilters({ paymentStatus })}
        />
      ) : null}

      {showType ? (
        <FilterSelect
          placeholder="Any type"
          value={filters.type}
          values={transactionTypeValues}
          labels={transactionTypeLabels}
          onChange={(type) => setFilters({ type })}
        />
      ) : null}

      <SearchInput
        placeholder="Reference no."
        value={filters.referenceNumber}
        onChange={(referenceNumber) => setFilters({ referenceNumber })}
      />

      <Button variant="outline" onPress={resetFilters}>
        <Eraser />
        Clear
      </Button>
    </div>
  );
};

export default LedgerFilterBar;
