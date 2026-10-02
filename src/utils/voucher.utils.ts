import {
  voucherLineLabels,
  voucherLineValues,
  withholdingLabels,
  withholdingRates,
  withholdingValues,
  withholdingOfRate,
  type VoucherLine,
} from "../enums/voucher.enum";
import type { IDetailItem } from "../models/common/detail.model";
import type {
  IFieldConfig,
  IFormSummaryLine,
} from "../models/common/field.model";
import type { IVoucherBreakdownInput } from "../models/data/voucher/voucher.request";
import {
  voucherDisbursementKind,
  type IVoucher,
} from "../models/data/voucher/voucher.response";
import { formatMoney, toAmount } from "./format.utils";
import { toOptions } from "./option.utils";

const vatDivisor = 1.12;

export interface IVoucherTotalsInput {
  invoice: number;
  ewtRate: number;
  lessReturn: number;
  vatable: boolean;
  ewtOverride?: number | null;
}

export type IVoucherTotals = Record<VoucherLine, number>;

export const isVatableVoucher = (voucher: IVoucher): boolean =>
  voucherDisbursementKind(voucher) === "purchase" && voucher.vatable !== false;

export const isOwnOpenVoucher = (
  voucher: Pick<IVoucher, "status" | "printed" | "created_by">,
  userId: string | null,
  isManager: boolean
): boolean =>
  isManager &&
  voucher.status === "approved" &&
  !voucher.printed &&
  !!userId &&
  voucher.created_by === userId;

const toCentavos = (value: number): number =>
  Math.round((value + Number.EPSILON) * 100) / 100;

export const computeVoucherTotals = ({
  invoice,
  ewtRate,
  lessReturn,
  vatable,
  ewtOverride,
}: IVoucherTotalsInput): IVoucherTotals => {
  const netOfReturn = invoice - lessReturn;
  const amountBeforeVat = toCentavos(netOfReturn / (vatable ? vatDivisor : 1));
  const ewt = toCentavos(ewtOverride ?? amountBeforeVat * ewtRate);

  return {
    invoice: toCentavos(invoice),
    lessReturn: toCentavos(lessReturn),
    amountBeforeVat,
    vat: toCentavos(netOfReturn - amountBeforeVat),
    ewt,
    amountToPay: toCentavos(invoice - ewt - lessReturn),
  };
};

const autoTotalsInputOf = (
  values: IVoucherBreakdownInput
): IVoucherTotalsInput => ({
  invoice: toAmount(values.amount) ?? 0,
  ewtRate: withholdingRates[values.withholding ?? "none"],
  lessReturn: toAmount(values.less_return) ?? 0,
  vatable: values.vatable,
});

export const breakdownTotalsOf = (
  values: IVoucherBreakdownInput
): IVoucherTotals =>
  computeVoucherTotals({
    ...autoTotalsInputOf(values),
    ewtOverride: values.withholding === "none" ? 0 : toAmount(values.ewt_amount),
  });

export const voucherTotalsOf = (
  voucher: IVoucher | null | undefined
): IVoucherTotals | null => {
  if (!voucher || voucher.gross_amount === null) return null;

  return computeVoucherTotals({
    invoice: Number(voucher.gross_amount),
    ewtRate: Number(voucher.ewt_rate),
    lessReturn: Number(voucher.less_return),
    vatable: isVatableVoucher(voucher),
    ewtOverride: Number(voucher.ewt_amount),
  });
};

const vatLines: ReadonlySet<VoucherLine> = new Set(["amountBeforeVat", "vat"]);

const isVatLineHidden = (line: VoucherLine, vatable: boolean): boolean =>
  !vatable && vatLines.has(line);

export const voucherSummaryLines = (
  values: IVoucherBreakdownInput
): IFormSummaryLine[] => {
  const totals = breakdownTotalsOf(values);

  return voucherLineValues
    .filter((line) => !isVatLineHidden(line, values.vatable))
    .map((line) => ({
      key: line,
      label: voucherLineLabels[line],
      value: formatMoney(totals[line]),
      emphasis: line === "amountToPay",
    }));
};

const recalculatedFields: ReadonlySet<string> = new Set([
  "amount",
  "withholding",
  "less_return",
  "vatable",
]);

export const deriveVoucherValues = (
  changed: string,
  values: IVoucherBreakdownInput
): Partial<IVoucherBreakdownInput> | null => {
  if (!recalculatedFields.has(changed)) return null;

  return { ewt_amount: computeVoucherTotals(autoTotalsInputOf(values)).ewt };
};

const vatableField: IFieldConfig<IVoucherBreakdownInput> = {
  name: "vatable",
  label: "VAT-registered invoice",
  type: "checkbox",
  hint: "Leave unchecked for a non-VAT invoice — no VAT is taken out before withholding.",
};

const breakdownFields: IFieldConfig<IVoucherBreakdownInput>[] = [
  vatableField,
  {
    name: "withholding",
    label: "Withholding tax",
    type: "select",
    span: "half",
    required: true,
    options: toOptions(withholdingValues, withholdingLabels),
  },
  {
    name: "ewt_amount",
    label: "Withholding amount",
    type: "amount",
    span: "half",
    prefix: "₱",
    hint: "Calculated automatically — edit if the supplier's differs.",
    hidden: (values) => values.withholding === "none",
  },
  {
    name: "less_return",
    label: "Less return",
    type: "amount",
    span: "half",
    prefix: "₱",
  },
  { name: "particulars", label: "Particulars", type: "textarea" },
];

export const voucherBreakdownFields = <
  TValues extends IVoucherBreakdownInput,
>(): IFieldConfig<TValues>[] =>
  breakdownFields as unknown as IFieldConfig<TValues>[];

export const voucherBreakdownDefaults: IVoucherBreakdownInput = {
  vatable: false,
  withholding: "none",
  ewt_amount: 0,
  less_return: null,
  particulars: "",
};

export const voucherBreakdownOf = (
  voucher: IVoucher | null | undefined
): IVoucherBreakdownInput =>
  voucher
    ? {
        vatable: isVatableVoucher(voucher),
        withholding: withholdingOfRate(voucher.ewt_rate),
        ewt_amount: Number(voucher.ewt_amount),
        less_return: Number(voucher.less_return) || null,
        particulars: voucher.particulars ?? "",
      }
    : voucherBreakdownDefaults;

export const voucherBreakdownItems = <TRecord>(
  voucherOf: (record: TRecord) => IVoucher | null | undefined
): IDetailItem<TRecord>[] => [
  {
    key: "particulars",
    label: "Particulars",
    render: (record) => voucherOf(record)?.particulars || "—",
  },
  ...voucherLineValues.map((line) => ({
    key: line,
    label: voucherLineLabels[line],
    hidden: (record: TRecord) => {
      const voucher = voucherOf(record);
      return voucher ? isVatLineHidden(line, isVatableVoucher(voucher)) : false;
    },
    render: (record: TRecord) => {
      const voucher = voucherOf(record);
      const totals = voucherTotalsOf(voucher);
      if (totals) return formatMoney(totals[line]);
      return voucher && line === "amountToPay" ? formatMoney(voucher.amount) : "—";
    },
  })),
];
