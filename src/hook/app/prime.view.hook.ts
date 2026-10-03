import {
  ledgerSortOptions,
  ledgerStatusFilterValues,
  payableStatusValues,
  paymentSortOptions,
  type PaymentKind,
} from "../../enums/ledger.enum";
import { saleStatusValues } from "../../enums/sale.enum";
import {
  transactionSortOptions,
  type DisbursementKind,
} from "../../enums/transaction.enum";
import {
  voucherSortOptions,
  voucherStatusValues,
} from "../../enums/voucher.enum";
import { branchAdminListKey } from "../../keys/query.keys";
import { IPaginationFormValue } from "../../models/common/pagination.model";
import {
  overviewPeriodValues,
  salesPeriodValues,
} from "../../models/data/dashboard/dashboard.response";
import {
  reportTypeValues,
  transactionReportTypes,
} from "../../models/data/report/report.response";
import {
  payableServices,
  receivableServices,
} from "../../services/data/ledger.services";
import referenceServices from "../../services/data/reference.services";
import { defaultFiltersOf } from "../../store/common/filter.store";
import {
  ledgerFilterScopeOf,
  pageFiltersOf,
  paymentFilterScopeOf,
  scopedFilters,
} from "../../utils/filter.utils";
import {
  adminChecksQueryOf,
  adminOverviewQueryOf,
} from "../data/admin/admin.home.hook";
import { branchMonitorQueryOf } from "../data/branch/branch.manage.hook";
import {
  dashboardAlertsQueryOf,
  dashboardProfitQueryOf,
  dashboardReviewsQueryOf,
  dashboardSalesQueryOf,
  dashboardSummaryQueryOf,
} from "../data/dashboard/dashboard.hook";
import {
  disbursementListQueryOf,
  disbursementSummaryQueryOf,
} from "../data/disbursement/disbursement.list.hook";
import { customerSummaryKey } from "../data/ledger/customer.ledger.hook";
import {
  ledgerListQueryOf,
  ledgerPartyQueryOf,
  ledgerSummaryQueryOf,
} from "../data/ledger/ledger.list.hook";
import { supplierSummaryKey } from "../data/ledger/supplier.ledger.hook";
import { paymentListQueryOf } from "../data/payment/payment.list.hook";
import {
  reportPayableQueryOf,
  reportReceivableQueryOf,
  reportTransactionQueryOf,
} from "../data/report/report.hook";
import {
  currentMonthRange,
  reportSummaryQueryOf,
} from "../data/report/report.summary.hook";
import {
  saleListQueryOf,
  saleSummaryQueryOf,
} from "../data/sale/sale.list.hook";
import {
  transactionListQueryOf,
  transactionSummaryQueryOf,
} from "../data/transaction/transaction.list.hook";
import { voucherListQueryOf } from "../data/voucher/voucher.list.hook";
import type { IPermissions } from "../../models/common/permission.model";
import type { IQuerySpec } from "../../models/common/query.model";
import type { IBranch } from "../../models/data/branch/branch.response";

type IViewScope = {
  permissions: IPermissions;
  branch: string | null;
  branches: IBranch[];
};

const firstPage = new IPaginationFormValue();

const transactionSort = transactionSortOptions.at(0);

const withAllTab = <T>(statuses: readonly T[]): (T | undefined)[] => [
  undefined,
  ...statuses,
];

const dashboardQueriesOf = (branch: string | null): IQuerySpec[] => [
  dashboardSummaryQueryOf(branch),
  dashboardAlertsQueryOf(branch),
  dashboardReviewsQueryOf(branch),
  dashboardProfitQueryOf(branch),
  adminChecksQueryOf(branch),
  ...salesPeriodValues.map((period) => dashboardSalesQueryOf(branch, period)),
  ...overviewPeriodValues.map((period) => adminOverviewQueryOf(branch, period)),
];

const transactionQueriesOf = (branch: string | null): IQuerySpec[] => {
  const filters = pageFiltersOf(defaultFiltersOf("page"), branch);

  return [
    transactionListQueryOf(filters, firstPage, transactionSort),
    transactionSummaryQueryOf(filters),
  ];
};

const saleQueriesOf = (branch: string | null): IQuerySpec[] => [
  saleSummaryQueryOf(pageFiltersOf(defaultFiltersOf("page"), branch)),
  ...withAllTab(saleStatusValues).map((saleStatus) =>
    saleListQueryOf(
      pageFiltersOf(
        { ...defaultFiltersOf("page"), saleStatus },
        branch,
        "saleStatus"
      ),
      firstPage,
      transactionSort
    )
  ),
];

const disbursementQueriesOf = (
  kind: DisbursementKind,
  branch: string | null
): IQuerySpec[] => [
  disbursementSummaryQueryOf(
    kind,
    pageFiltersOf(defaultFiltersOf("page"), branch)
  ),
  ...withAllTab(voucherStatusValues).map((voucherStatus) =>
    disbursementListQueryOf(
      kind,
      pageFiltersOf(
        { ...defaultFiltersOf("page"), voucherStatus },
        branch,
        "voucherStatus"
      ),
      firstPage,
      transactionSort
    )
  ),
];

const voucherQueriesOf = (branch: string | null): IQuerySpec[] =>
  withAllTab(voucherStatusValues).map((voucherStatus) =>
    voucherListQueryOf(
      scopedFilters({ ...defaultFiltersOf("vouchers"), voucherStatus }, branch),
      firstPage,
      voucherSortOptions.at(0)
    )
  );

const paymentQueryOf = (kind: PaymentKind, branch: string | null): IQuerySpec =>
  paymentListQueryOf(
    kind,
    scopedFilters(defaultFiltersOf(paymentFilterScopeOf(kind)), branch),
    firstPage,
    paymentSortOptions.at(0)
  );

const receivableQueriesOf = (branch: string | null): IQuerySpec[] => {
  const defaults = defaultFiltersOf(ledgerFilterScopeOf("receivables"));

  return [
    ledgerSummaryQueryOf(
      "receivables",
      receivableServices,
      scopedFilters({ ...defaults, status: undefined }, branch)
    ),
    ledgerPartyQueryOf("receivables", receivableServices, branch),
    paymentQueryOf("receivable", branch),
    [customerSummaryKey, receivableServices.getCustomerSummaries],
    ...withAllTab(ledgerStatusFilterValues).map((status) =>
      ledgerListQueryOf(
        "receivables",
        receivableServices,
        scopedFilters({ ...defaults, status }, branch),
        firstPage,
        ledgerSortOptions.at(0)
      )
    ),
  ];
};

const payableQueriesOf = (branch: string | null): IQuerySpec[] => {
  const defaults = defaultFiltersOf(ledgerFilterScopeOf("payables"));

  return [
    ledgerSummaryQueryOf(
      "payables",
      payableServices,
      scopedFilters({ ...defaults, status: undefined }, branch)
    ),
    ledgerPartyQueryOf("payables", payableServices, branch),
    paymentQueryOf("payable", branch),
    [supplierSummaryKey, payableServices.getPartySummaries],
    ...withAllTab(payableStatusValues).map((status) =>
      ledgerListQueryOf(
        "payables",
        payableServices,
        scopedFilters({ ...defaults, status }, branch),
        firstPage,
        ledgerSortOptions.at(0)
      )
    ),
  ];
};

const reportQueriesOf = (branch: string | null): IQuerySpec[] => [
  reportSummaryQueryOf(currentMonthRange(), branch),
  reportReceivableQueryOf(branch),
  reportPayableQueryOf(branch),
  ...reportTypeValues
    .filter((type) => transactionReportTypes.includes(type))
    .map((type) => reportTransactionQueryOf(type, branch)),
];

const branchQueriesOf = (
  branch: string | null,
  branches: IBranch[]
): IQuerySpec[] => {
  const monitored = branch
    ? branches.filter((item) => item.slug === branch)
    : branches;

  return [
    [branchAdminListKey, referenceServices.getAllBranches],
    ...(monitored.length > 0 ? [branchMonitorQueryOf(monitored)] : []),
  ];
};

export const viewQueriesOf = ({
  permissions,
  branch,
  branches,
}: IViewScope): IQuerySpec[] => [
  ...(permissions.viewDashboard ? dashboardQueriesOf(branch) : []),
  ...(permissions.viewReminders
    ? [
        ...transactionQueriesOf(branch),
        ...saleQueriesOf(branch),
        ...disbursementQueriesOf("purchase", branch),
        ...disbursementQueriesOf("expense", branch),
        ...receivableQueriesOf(branch),
        ...payableQueriesOf(branch),
      ]
    : []),
  ...(permissions.createVouchers ? voucherQueriesOf(branch) : []),
  ...(permissions.viewIncomeExpenses ? reportQueriesOf(branch) : []),
  ...(permissions.viewBranchMonitoring
    ? branchQueriesOf(branch, branches)
    : []),
];
