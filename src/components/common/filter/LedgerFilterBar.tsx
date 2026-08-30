import { ClearOutlined } from "@ant-design/icons";
import { Button, DatePicker, Flex, Input, InputNumber, Select } from "antd";
import dayjs from "dayjs";
import {
  ledgerStatusLabels,
  ledgerStatusValues,
} from "../../../enums/ledger.enum";
import { useLedgerFilters } from "../../../hook/common/filter.hook";
import type { ILedgerFilterScope } from "../../../models/common/filter.model";
import {
  filterAmount,
  filterBar,
  filterClear,
  filterReference,
  filterStatus,
} from "../../../styles/filter/filter.css";
import { toOptions } from "../../../utils/option.utils";

const { RangePicker } = DatePicker;

type IProps = {
  showStatus?: boolean;
  scope?: ILedgerFilterScope;
};

const LedgerFilterBar = ({ showStatus = false, scope = "page" }: IProps) => {
  const { filters, setFilters, resetFilters } = useLedgerFilters(scope);

  return (
    <Flex className={`${filterBar}`} gap="small" wrap align="center">
      <RangePicker
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

      <Input
        className={`${filterReference}`}
        placeholder="Reference no."
        allowClear
        value={filters.referenceNumber}
        onChange={(event) =>
          setFilters({ referenceNumber: event.target.value || undefined })
        }
      />

      <InputNumber
        className={`${filterAmount}`}
        placeholder="Min ₱"
        min={0}
        value={filters.amountMin}
        onChange={(amountMin) => setFilters({ amountMin: amountMin ?? undefined })}
      />
      <InputNumber
        className={`${filterAmount}`}
        placeholder="Max ₱"
        min={0}
        value={filters.amountMax}
        onChange={(amountMax) => setFilters({ amountMax: amountMax ?? undefined })}
      />

      <Button
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
