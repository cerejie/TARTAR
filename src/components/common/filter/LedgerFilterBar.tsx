import { ClearOutlined, SearchOutlined } from "@ant-design/icons";
import { Button, DatePicker, Flex, Input, Select } from "antd";
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
  filterReference,
  filterStatus,
  filterType,
} from "../../../styles/filter/filter.css";
import { toOptions } from "../../../utils/option.utils";

const { RangePicker } = DatePicker;

type IProps = {
  showStatus?: boolean;
  showType?: boolean;
  scope?: ILedgerFilterScope;
};

const LedgerFilterBar = ({
  showStatus = false,
  showType = false,
  scope = "page",
}: IProps) => {
  const { filters, setFilters, resetFilters } = useLedgerFilters(scope);

  return (
    <Flex className={`${filterBar}`} gap="small" wrap align="center">
      <RangePicker
        size="large"
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
          size="large"
          className={`${filterStatus}`}
          placeholder="Any status"
          allowClear
          value={filters.status}
          onChange={(status) => setFilters({ status })}
          options={[
            ...toOptions(ledgerStatusValues, ledgerStatusLabels),
            { value: "overdue", label: "Overdue" },
          ]}
        />
      ) : null}

      {showType ? (
        <Select
          size="large"
          className={`${filterType}`}
          placeholder="Any type"
          allowClear
          value={filters.type}
          onChange={(type) => setFilters({ type })}
          options={toOptions(transactionTypeValues, transactionTypeLabels)}
        />
      ) : null}

      <Input
        size="large"
        className={`${filterReference}`}
        placeholder="Reference no."
        prefix={<SearchOutlined />}
        allowClear
        value={filters.referenceNumber}
        onChange={(event) =>
          setFilters({ referenceNumber: event.target.value || undefined })
        }
      />

      <Button
        size="large"
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
