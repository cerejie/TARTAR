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
  ledgerSummaryQueryOf,
} from "../data/ledger/ledger.list.hook";
import { supplierSummaryKey } from "../data/ledger/supplier.ledger.hook";
import {
  paymentDatasetQueryOf,
  paymentListQueryOf,
} from "../data/payment/payment.list.hook";
import {
  reportCustomerPaymentQueryOf,
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
  transactionAuditDatasetQueryOf,
  transactionListQueryOf,
  transactionSummaryQueryOf,
} from "../data/transaction/transaction.list.hook";
import {
  voucherDatasetQueryOf,
  voucherListQueryOf,
} from "../data/voucher/voucher.list.hook";
import type { IPermissions } from "../../models/common/permission.model";
import type { IQuerySpec } from "../../models/common/query.model";
import type { IBranch } from "../../models/data/branch/branch.response";

type IViewScope = {
  permissions: IPermissions;
  branch: string | null;
  branches: IBranch[];
  canScope: boolean;
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

const ledgerDatasetFiltersOf = (
  scope: "receivables" | "payables",
  branch: string | null
) =>
  scopedFilters(
    { ...defaultFiltersOf(ledgerFilterScopeOf(scope)), status: undefined },
    branch
  );

const datasetQueriesOf = (
  permissions: IPermissions,
  branch: string | null
): IQuerySpec[] => {
  const pageFilters = pageFiltersOf(defaultFiltersOf("page"), branch);

  return [
    ...(permissions.viewReminders
      ? [
          transactionSummaryQueryOf(pageFilters),
          saleSummaryQueryOf(pageFilters),
          disbursementSummaryQueryOf("purchase", pageFilters),
          disbursementSummaryQueryOf("expense", pageFilters),
          ledgerSummaryQueryOf(
            "receivables",
            receivableServices,
            ledgerDatasetFiltersOf("receivables", branch)
          ),
          ledgerSummaryQueryOf(
            "payables",
            payableServices,
            ledgerDatasetFiltersOf("payables", branch)
          ),
          paymentDatasetQueryOf("receivable", branch),
          paymentDatasetQueryOf("payable", branch),
        ]
      : []),
    ...(permissions.createVouchers ? [voucherDatasetQueryOf(branch)] : []),
  ];
};

const transactionQueriesOf = (branch: string | null): IQuerySpec[] => [
  transactionListQueryOf(
    pageFiltersOf(defaultFiltersOf("page"), branch),
    firstPage,
    transactionSort
  ),
];

const saleQueriesOf = (branch: string | null): IQuerySpec[] =>
  withAllTab(saleStatusValues).map((saleStatus) =>
    saleListQueryOf(
      pageFiltersOf(
        { ...defaultFiltersOf("page"), saleStatus },
        branch,
        "saleStatus"
      ),
      firstPage,
      transactionSort
    )
  );

const disbursementQueriesOf = (
  kind: DisbursementKind,
  branch: string | null
): IQuerySpec[] =>
  withAllTab(voucherStatusValues).map((voucherStatus) =>
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
  );

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
  reportCustomerPaymentQueryOf("cashflow", branch),
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

const otherScopeQueriesOf = ({
  permissions,
  branch,
  branches,
  canScope,
}: IViewScope): IQuerySpec[] => {
  if (!canScope) return [];

  const otherScopes = [null, ...branches.map((item) => item.slug)].filter(
    (scope) => scope !== branch
  );

  return [
    ...(branch === null ? [] : datasetQueriesOf(permissions, null)),
    ...(permissions.viewDashboard ? otherScopes.flatMap(dashboardQueriesOf) : []),
  ];
};

const activeScopeQueriesOf = ({
  permissions,
  branch,
  branches,
}: IViewScope): IQuerySpec[] => [
  ...(permissions.viewDashboard ? dashboardQueriesOf(branch) : []),
  ...datasetQueriesOf(permissions, branch),
  ...(permissions.viewReminders
    ? [
        transactionAuditDatasetQueryOf(),
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

export const viewQueriesOf = (scope: IViewScope): IQuerySpec[] => [
  ...activeScopeQueriesOf(scope),
  ...otherScopeQueriesOf(scope),
];
