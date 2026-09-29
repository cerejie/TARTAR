import type { ReactNode } from "react";
import { Eraser } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  ledgerStatusLabels,
  ledgerStatusValues,
  payableStatusLabels,
  paymentStatusLabels,
  paymentStatusValues,
  type PaymentKind,
} from "../../../enums/ledger.enum";
import {
  transactionTypeFilterValues,
  transactionTypeLabels,
} from "../../../enums/transaction.enum";
import { useLedgerFilters } from "../../../hook/common/filter.hook";
import type {
  ILedgerFilters,
  ILedgerFilterScope,
} from "../../../models/common/filter.model";
import { filterBar } from "../../../styles/filter/filter.styles";
import { activeFilterCount } from "../../../utils/filter.utils";
import DateRangeFilter from "./DateRangeFilter";
import FilterField from "./FilterField";
import FilterPopover from "./FilterPopover";
import FilterSelect from "./FilterSelect";
import SearchInput from "./SearchInput";

type ILedgerStatusFilter = NonNullable<ILedgerFilters["status"]>;

const statusFilterLabels: Record<ILedgerStatusFilter, string> = {
  ...payableStatusLabels,
  unpaid: "Unpaid",
  ...ledgerStatusLabels,
  overdue: "Overdue",
};

type IProps = {
  showSearch?: boolean;
  showStatus?: boolean;
  showOverdue?: boolean;
  statusValues?: readonly ILedgerStatusFilter[];
  showType?: boolean;
  showReference?: boolean;
  paymentKind?: PaymentKind;
  scope?: ILedgerFilterScope;
  layout?: "inline" | "popover";
};

const LedgerFilterBar = ({
  showSearch = false,
  showStatus = false,
  showOverdue = false,
  statusValues,
  showType = false,
  showReference = true,
  paymentKind,
  scope = "page",
  layout = "inline",
}: IProps) => {
  const { filters, setFilters, resetFilters } = useLedgerFilters(scope);

  const defaultStatusValues: readonly ILedgerStatusFilter[] = showOverdue
    ? ["unpaid", ...ledgerStatusValues, "overdue"]
    : ["unpaid", ...ledgerStatusValues];
  const statusFilterValues = statusValues ?? defaultStatusValues;

  const isPopover = layout === "popover";

  const labelled = (label: string, control: ReactNode) =>
    isPopover ? <FilterField label={label}>{control}</FilterField> : control;

  const fields = (
    <div className={filterBar({ layout: isPopover ? "stack" : "inline" })}>
      {showSearch ? (
        labelled(
          "Name",
          <SearchInput
            placeholder="Search name"
            value={filters.search}
            onChange={(search) => setFilters({ search })}
          />
        )
      ) : null}

      {labelled(
        "Date",
        <DateRangeFilter
          from={filters.dateFrom}
          to={filters.dateTo}
          onChange={(dateFrom, dateTo) => setFilters({ dateFrom, dateTo })}
        />
      )}

      {showStatus ? (
        labelled(
          "Status",
          <FilterSelect
            placeholder="Any status"
            value={filters.status}
            values={statusFilterValues}
            labels={statusFilterLabels}
            onChange={(status) => setFilters({ status })}
          />
        )
      ) : null}

      {paymentKind ? (
        labelled(
          "Payment status",
          <FilterSelect
            placeholder="Any status"
            value={filters.paymentStatus}
            values={paymentStatusValues}
            labels={paymentStatusLabels(paymentKind)}
            onChange={(paymentStatus) => setFilters({ paymentStatus })}
          />
        )
      ) : null}

      {showType ? (
        labelled(
          "Type",
          <FilterSelect
            placeholder="Any type"
            value={filters.type}
            values={transactionTypeFilterValues}
            labels={transactionTypeLabels}
            onChange={(type) => setFilters({ type })}
          />
        )
      ) : null}

      {showReference ? (
        labelled(
          "Reference no.",
          <SearchInput
            placeholder="Reference no."
            value={filters.referenceNumber}
            onChange={(referenceNumber) => setFilters({ referenceNumber })}
          />
        )
      ) : null}

      {isPopover ? null : (
        <Button variant="outline" onPress={resetFilters}>
          <Eraser />
          Clear
        </Button>
      )}
    </div>
  );

  if (!isPopover) return fields;

  return (
    <FilterPopover
      activeCount={activeFilterCount(filters)}
      onReset={resetFilters}
    >
      {fields}
    </FilterPopover>
  );
};

export default LedgerFilterBar;
