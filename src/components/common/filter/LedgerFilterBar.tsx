import { ClearOutlined } from "@ant-design/icons";
import { Button, DatePicker, Flex, Select } from "antd";
import dayjs from "dayjs";
import {
  ledgerStatusLabels,
  ledgerStatusValues,
} from "../../../enums/ledger.enum";
import {
  transactionTypeLabels,
  transactionTypeValues,
} from "../../../enums/transaction.enum";
import { useLedgerFilters } from "../../../hook/common/filter.hook";
import type { ILedgerFilterScope } from "../../../models/common/filter.model";
import {
  filterBar,
  filterClear,
  filterStatus,
  filterType,
} from "../../../styles/filter/filter.css";
import SearchInput from "./SearchInput";
import { toOptions } from "../../../utils/option.utils";

const { RangePicker } = DatePicker;

type IProps = {
  showSearch?: boolean;
  showStatus?: boolean;
  showOverdue?: boolean;
  showType?: boolean;
  scope?: ILedgerFilterScope;
};

const LedgerFilterBar = ({
  showSearch = false,
  showStatus = false,
  showOverdue = false,
  showType = false,
  scope = "page",
}: IProps) => {
  const { filters, setFilters, resetFilters } = useLedgerFilters(scope);

  return (
    <Flex className={`${filterBar}`} gap="small" wrap align="center">
      {showSearch ? (
        <SearchInput
          placeholder="Search name"
          value={filters.search}
          onChange={(search) => setFilters({ search })}
        />
      ) : null}

      <RangePicker
        size="middle"
        value={
          filters.dateFrom && filters.dateTo
            ? [dayjs(filters.dateFrom), dayjs(filters.dateTo)]
            : null
        }
        onChange={(range) =>
          setFilters({
            dateFrom: range?.[0]?.format("YYYY-MM-DD"),
            dateTo: range?.[1]?.format("YYYY-MM-DD"),
          })
        }
      />

      {showStatus ? (
        <Select
          size="middle"
          className={`${filterStatus}`}
          placeholder="Any status"
          allowClear
          value={filters.status}
          onChange={(status) => setFilters({ status })}
          options={[
            ...toOptions(ledgerStatusValues, ledgerStatusLabels),
            ...(showOverdue ? [{ value: "overdue", label: "Overdue" }] : []),
          ]}
        />
      ) : null}

      {showType ? (
        <Select
          size="middle"
          className={`${filterType}`}
          placeholder="Any type"
          allowClear
          value={filters.type}
          onChange={(type) => setFilters({ type })}
          options={toOptions(transactionTypeValues, transactionTypeLabels)}
        />
      ) : null}

      <SearchInput
        placeholder="Reference no."
        value={filters.referenceNumber}
        onChange={(referenceNumber) => setFilters({ referenceNumber })}
      />

      <Button
        size="middle"
        className={`${filterClear}`}
        icon={<ClearOutlined />}
        onClick={resetFilters}
      >
        Clear
      </Button>
    </Flex>
  );
};

export default LedgerFilterBar;
