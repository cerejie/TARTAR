import { ClearOutlined } from "@ant-design/icons";
import {
  Button,
  DatePicker,
  Flex,
  Input,
  InputNumber,
  Select,
  Tooltip,
} from "antd";
import dayjs from "dayjs";
import {
  ledgerStatusLabels,
  ledgerStatusValues,
} from "../../../enums/ledger.enum";
import { useBranchListHook } from "../../../hook/data/branch/branch.list.hook";
import { useBranchScopeHook } from "../../../hook/data/branch/branch.scope.hook";
import { useLedgerFilters } from "../../../hook/common/filter.hook";
import type { ILedgerFilterScope } from "../../../models/common/filter.model";
import {
  filterAmount,
  filterBar,
  filterBranch,
  filterReference,
  filterStatus,
} from "../../../styles/filter/filter.css";
import { toOptions } from "../../../utils/option.utils";

const { RangePicker } = DatePicker;

type IProps = {
  showBranch?: boolean;
  showStatus?: boolean;
  scope?: ILedgerFilterScope;
};

const LedgerFilterBar = ({
  showBranch = true,
  showStatus = false,
  scope = "page",
}: IProps) => {
  const { filters, setFilters, resetFilters } = useLedgerFilters(scope);
  const { branchOptions } = useBranchListHook();
  const { branch: scopeBranch } = useBranchScopeHook();

  return (
    <Flex className={`${filterBar}`} gap="small" wrap align="center">
      {showBranch ? (
        <Tooltip
          title={
            scopeBranch
              ? "Branch is set by the sidebar branch view"
              : undefined
          }
        >
          <Select
            className={`${filterBranch}`}
            placeholder="All branches"
            allowClear
            disabled={!!scopeBranch}
            value={scopeBranch ?? filters.branch}
            onChange={(branch) => setFilters({ branch })}
            options={branchOptions}
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

      <Button icon={<ClearOutlined />} onClick={resetFilters}>
        Clear
      </Button>
    </Flex>
  );
};

export default LedgerFilterBar;
